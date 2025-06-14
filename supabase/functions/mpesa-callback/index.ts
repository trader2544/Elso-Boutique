
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
      // Still return success to avoid M-Pesa retries
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

    // Extract data from callback metadata
    let orderId = 'unknown';
    let transactionId = null;
    let amount = 0;
    let phoneNumber = 'unknown';

    // First, try to get order ID from existing transaction record
    if (CheckoutRequestID) {
      console.log('Looking for existing transaction with checkout request ID:', CheckoutRequestID);
      
      const { data: existingTransaction, error: fetchError } = await supabase
        .from('mpesa_transactions')
        .select('order_id, phone_number, amount')
        .eq('checkout_request_id', CheckoutRequestID)
        .single();

      if (!fetchError && existingTransaction) {
        console.log('Found existing transaction:', existingTransaction);
        orderId = existingTransaction.order_id;
        phoneNumber = existingTransaction.phone_number;
        amount = existingTransaction.amount;
      } else {
        console.log('No existing transaction found, extracting from callback metadata');
      }
    }

    // Extract additional data from callback metadata if available
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
          amount = parseFloat(item.Value.toString()) || amount;
          console.log('Extracted amount from metadata:', amount);
        } else if (item.Name === 'PhoneNumber' && item.Value) {
          phoneNumber = item.Value.toString();
          console.log('Extracted phone number from metadata:', phoneNumber);
        }
      }
    }

    // Determine transaction status based on result code
    let transactionStatus = 'pending';
    
    if (ResultCode === 0 || ResultCode === '0') {
      transactionStatus = 'completed';
      console.log('Payment successful - marking as completed');
    } else {
      transactionStatus = 'failed';
      console.log('Payment failed with result code:', ResultCode);
    }

    console.log('Final transaction data to upsert:', {
      orderId,
      phoneNumber,
      amount,
      CheckoutRequestID,
      MerchantRequestID,
      ResultCode: ResultCode?.toString(),
      ResultDesc,
      transactionStatus,
      transactionId
    });

    // Insert/update M-Pesa transaction record
    if (CheckoutRequestID) {
      console.log('Upserting M-Pesa transaction record...');
      
      const transactionData = {
        order_id: orderId,
        phone_number: phoneNumber,
        amount: amount,
        checkout_request_id: CheckoutRequestID,
        merchant_request_id: MerchantRequestID || null,
        response_code: ResultCode?.toString() || null,
        response_description: ResultDesc || null,
        status: transactionStatus,
        customer_message: ResultDesc || null,
        updated_at: new Date().toISOString()
      };

      console.log('About to upsert transaction data:', transactionData);

      const { data: transactionResult, error: transactionError } = await supabase
        .from('mpesa_transactions')
        .upsert(transactionData, {
          onConflict: 'checkout_request_id'
        })
        .select();

      if (transactionError) {
        console.error('Error upserting M-Pesa transaction:', transactionError);
        console.error('Transaction error details:', JSON.stringify(transactionError, null, 2));
        
        // Try inserting instead of upserting in case of conflict issues
        console.log('Trying to insert as new record...');
        const { data: insertResult, error: insertError } = await supabase
          .from('mpesa_transactions')
          .insert(transactionData)
          .select();

        if (insertError) {
          console.error('Insert also failed:', insertError);
        } else {
          console.log('Transaction inserted successfully:', insertResult);
        }
      } else {
        console.log('M-Pesa transaction upserted successfully:', transactionResult);
      }

      // The database trigger will automatically update the order status
      // Let's verify it worked by checking the order status after a brief delay
      if (transactionStatus === 'completed' && orderId !== 'unknown') {
        console.log('Payment successful - trigger should update order status automatically');
        
        // Wait a moment for the trigger to execute
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const { data: orderCheck, error: orderCheckError } = await supabase
          .from('orders')
          .select('id, status, transaction_id')
          .eq('id', orderId)
          .single();

        if (orderCheckError) {
          console.error('Error checking order status:', orderCheckError);
        } else {
          console.log('Order status after trigger execution:', orderCheck);
          
          // If the trigger didn't work, manually update the order
          if (orderCheck && orderCheck.status !== 'paid') {
            console.log('Trigger did not update order, updating manually...');
            const { error: updateError } = await supabase
              .from('orders')
              .update({ 
                status: 'paid',
                transaction_id: transactionId || CheckoutRequestID 
              })
              .eq('id', orderId);

            if (updateError) {
              console.error('Manual order update failed:', updateError);
            } else {
              console.log('Order status updated manually to paid');
            }
          }
        }
      }
    } else {
      console.error('No CheckoutRequestID found in callback data');
    }

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
