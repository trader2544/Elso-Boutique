import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const callbackData = await req.json();
    console.log('M-Pesa callback received:', JSON.stringify(callbackData, null, 2));

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { Body } = callbackData;
    
    if (!Body) {
      console.error('Invalid callback structure - no Body');
      return new Response('OK', { 
        status: 200,
        headers: corsHeaders
      });
    }

    const { stkCallback } = Body;

    if (!stkCallback) {
      console.error('Invalid callback structure - no stkCallback');
      return new Response('OK', { 
        status: 200,
        headers: corsHeaders
      });
    }

    const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata, MerchantRequestID } = stkCallback;

    console.log('Processing callback with:', {
      CheckoutRequestID,
      ResultCode,
      ResultDesc,
      MerchantRequestID
    });

    // Check if this is a successful transaction (ResultCode 0 means success)
    const isSuccessful = (ResultCode === 0 || ResultCode === '0');
    
    console.log('Payment result:', {
      isSuccessful,
      ResultCode,
      ResultDesc
    });

    // Extract data from callback metadata
    let orderId = 'unknown';
    let transactionId = null;
    let amount = 0;
    let phoneNumber = 'unknown';

    if (CallbackMetadata?.Item && Array.isArray(CallbackMetadata.Item)) {
      console.log('Processing CallbackMetadata items:', CallbackMetadata.Item);
      
      for (const item of CallbackMetadata.Item) {
        if (item.Name === 'AccountReference' && item.Value) {
          orderId = item.Value.toString().replace('ORDER_', '');
          console.log('Extracted order ID from metadata:', orderId);
        } else if (item.Name === 'MpesaReceiptNumber' && item.Value) {
          transactionId = item.Value.toString();
          console.log('Extracted transaction ID:', transactionId);
        } else if (item.Name === 'Amount' && item.Value) {
          amount = parseFloat(item.Value.toString()) || 0;
          console.log('Extracted amount from metadata:', amount);
        } else if (item.Name === 'PhoneNumber' && item.Value) {
          phoneNumber = item.Value.toString();
          console.log('Extracted phone number from metadata:', phoneNumber);
        }
      }
    }

    // Update the transaction record with the callback result
    const updateData = {
      merchant_request_id: MerchantRequestID || null,
      response_code: ResultCode?.toString() || '1',
      response_description: ResultDesc || 'Payment failed',
      status: isSuccessful ? 'completed' : 'failed',
      customer_message: ResultDesc || (isSuccessful ? 'Payment successful' : 'Payment failed'),
      updated_at: new Date().toISOString()
    };

    if (isSuccessful && transactionId) {
      updateData.merchant_request_id = transactionId;
    }

    console.log('Updating transaction with callback data:', updateData);

    const { data: transactionResult, error: transactionError } = await supabase
      .from('mpesa_transactions')
      .update(updateData)
      .eq('checkout_request_id', CheckoutRequestID)
      .select();

    if (transactionError) {
      console.error('Error updating transaction:', transactionError);
    } else {
      console.log('Transaction updated successfully:', transactionResult);
    }

    // CRITICAL: ONLY update order status to 'paid' if payment was actually successful
    // This is the ONLY place where orders should be marked as paid
    if (isSuccessful && orderId !== 'unknown') {
      console.log('🎉 PAYMENT CONFIRMED SUCCESSFUL - Updating order status to PAID for order:', orderId);
      
      // First check current order status to log the change
      const { data: currentOrder } = await supabase
        .from('orders')
        .select('status')
        .eq('id', orderId)
        .single();
      
      console.log('Current order status before update:', currentOrder?.status);
      
      const { data: orderUpdateResult, error: orderUpdateError } = await supabase
        .from('orders')
        .update({ 
          status: 'paid',
          transaction_id: transactionId || CheckoutRequestID || `callback_${Date.now()}`
        })
        .eq('id', orderId)
        .select();

      if (orderUpdateError) {
        console.error('❌ ERROR updating order status to paid:', orderUpdateError);
      } else {
        console.log('✅ ORDER STATUS SUCCESSFULLY UPDATED TO PAID:', orderUpdateResult);
      }

    } else if (!isSuccessful) {
      console.log('❌ Payment failed or cancelled - order status remains pending. Result:', ResultDesc);
      
      // Keep order status as pending for failed payments so user can retry
      if (orderId !== 'unknown') {
        console.log('Ensuring order status remains pending for retry for order:', orderId);
        
        const { data: orderUpdateResult, error: orderUpdateError } = await supabase
          .from('orders')
          .update({ 
            status: 'pending' // Keep as pending so user can retry payment
          })
          .eq('id', orderId)
          .select();

        if (orderUpdateError) {
          console.error('Error ensuring order status remains pending:', orderUpdateError);
        } else {
          console.log('Order status kept as pending for retry:', orderUpdateResult);
        }
      }
    } else {
      console.log('⚠️ Payment callback processed but no order ID found or payment not successful');
    }

    console.log('Callback processing completed');

    return new Response('OK', { 
      status: 200,
      headers: corsHeaders
    });

  } catch (error) {
    console.error('❌ Error processing M-Pesa callback:', error);
    console.error('Error stack:', error.stack);
    
    // Always return 200 OK to M-Pesa to avoid retries
    return new Response('OK', { 
      status: 200,
      headers: corsHeaders
    });
  }
});
