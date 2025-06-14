
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

    // Check if this is a successful transaction
    const isSuccessful = (ResultCode === 0 || ResultCode === '0');
    
    console.log('Transaction result:', {
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

    // Only process successful transactions
    if (isSuccessful && orderId !== 'unknown') {
      console.log('Processing successful transaction for order:', orderId);

      // First, record the successful transaction
      const insertData = {
        order_id: orderId,
        phone_number: phoneNumber,
        amount: amount,
        checkout_request_id: CheckoutRequestID || `callback_${Date.now()}`,
        merchant_request_id: MerchantRequestID || null,
        response_code: ResultCode?.toString() || '0',
        response_description: ResultDesc || 'Success',
        status: 'completed',
        customer_message: ResultDesc || 'Payment successful',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('Recording successful transaction:', insertData);

      const { data: transactionResult, error: transactionError } = await supabase
        .from('mpesa_transactions')
        .upsert(insertData, { 
          onConflict: 'checkout_request_id',
          ignoreDuplicates: false 
        })
        .select();

      if (transactionError) {
        console.error('Error recording transaction:', transactionError);
      } else {
        console.log('Transaction recorded successfully:', transactionResult);
      }

      // Now update the order status to paid
      console.log('Updating order status to paid for order:', orderId);
      
      const { data: orderUpdateResult, error: orderUpdateError } = await supabase
        .from('orders')
        .update({ 
          status: 'paid',
          transaction_id: transactionId || CheckoutRequestID || `callback_${Date.now()}`
        })
        .eq('id', orderId)
        .select();

      if (orderUpdateError) {
        console.error('Error updating order status:', orderUpdateError);
      } else {
        console.log('Order status updated successfully:', orderUpdateResult);
      }

    } else if (!isSuccessful) {
      console.log('Transaction failed, recording failed transaction');
      
      // Record failed transaction
      const failedData = {
        order_id: orderId !== 'unknown' ? orderId : `unknown_${Date.now()}`,
        phone_number: phoneNumber !== 'unknown' ? phoneNumber : 'unknown',
        amount: amount || 0,
        checkout_request_id: CheckoutRequestID || `failed_${Date.now()}`,
        merchant_request_id: MerchantRequestID || null,
        response_code: ResultCode?.toString() || '1',
        response_description: ResultDesc || 'Transaction failed',
        status: 'failed',
        customer_message: ResultDesc || 'Payment failed',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error: failedTransactionError } = await supabase
        .from('mpesa_transactions')
        .upsert(failedData, { 
          onConflict: 'checkout_request_id',
          ignoreDuplicates: false 
        });

      if (failedTransactionError) {
        console.error('Error recording failed transaction:', failedTransactionError);
      } else {
        console.log('Failed transaction recorded');
      }
    }

    console.log('Callback processing completed');

    return new Response('OK', { 
      status: 200,
      headers: corsHeaders
    });

  } catch (error) {
    console.error('Error processing M-Pesa callback:', error);
    console.error('Error stack:', error.stack);
    
    // Always return 200 OK to M-Pesa to avoid retries
    return new Response('OK', { 
      status: 200,
      headers: corsHeaders
    });
  }
});
