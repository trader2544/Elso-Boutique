
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
    const { stkCallback } = Body;

    if (!stkCallback) {
      console.error('Invalid callback structure');
      return new Response('Invalid callback', { status: 400 });
    }

    const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = stkCallback;

    console.log('Processing callback with ResultCode:', ResultCode);

    // Extract order ID from account reference
    let orderId = null;
    if (CallbackMetadata?.Item) {
      const accountRefItem = CallbackMetadata.Item.find((item: any) => item.Name === 'AccountReference');
      if (accountRefItem?.Value) {
        orderId = accountRefItem.Value.replace('ORDER_', '');
        console.log('Extracted order ID:', orderId);
      }
    }

    let transactionId = null;
    let amount = null;
    let phoneNumber = null;

    if (CallbackMetadata?.Item) {
      const receiptItem = CallbackMetadata.Item.find((item: any) => item.Name === 'MpesaReceiptNumber');
      const amountItem = CallbackMetadata.Item.find((item: any) => item.Name === 'Amount');
      const phoneItem = CallbackMetadata.Item.find((item: any) => item.Name === 'PhoneNumber');
      
      transactionId = receiptItem?.Value;
      amount = amountItem?.Value;
      phoneNumber = phoneItem?.Value;
    }

    // Determine transaction status based on result code
    let transactionStatus = 'pending';
    
    if (ResultCode === 0) {
      transactionStatus = 'completed';
      console.log('Payment successful - M-Pesa transaction will be marked as completed');
    } else {
      transactionStatus = 'failed';
      console.log('Payment failed with result code:', ResultCode);
    }

    console.log('Processing payment callback:', {
      orderId,
      ResultCode,
      ResultDesc,
      transactionId,
      amount,
      phoneNumber,
      transactionStatus
    });

    // Insert/update M-Pesa transaction record - this should trigger our database trigger
    if (CheckoutRequestID) {
      console.log('Inserting/updating M-Pesa transaction record...');
      const { data: transactionData, error: transactionError } = await supabase
        .from('mpesa_transactions')
        .upsert({
          order_id: orderId || 'unknown',
          phone_number: phoneNumber || 'unknown',
          amount: amount ? parseFloat(amount) : 0,
          checkout_request_id: CheckoutRequestID,
          merchant_request_id: stkCallback.MerchantRequestID,
          response_code: ResultCode.toString(),
          response_description: ResultDesc,
          status: transactionStatus,
          customer_message: ResultDesc
        }, {
          onConflict: 'checkout_request_id'
        });

      if (transactionError) {
        console.error('Error inserting/updating M-Pesa transaction:', transactionError);
      } else {
        console.log('M-Pesa transaction recorded successfully. Database trigger should handle order status update.');
        
        // Let's also verify the order was updated by checking it
        if (ResultCode === 0 && orderId) {
          console.log('Verifying order status after transaction insert...');
          
          // Wait a moment for the trigger to execute
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const { data: orderCheck, error: orderCheckError } = await supabase
            .from('orders')
            .select('id, status, transaction_id')
            .eq('id', orderId)
            .single();

          if (orderCheckError) {
            console.error('Error checking order status:', orderCheckError);
          } else {
            console.log('Order status after trigger execution:', orderCheck);
            
            // If the trigger didn't work, let's manually update the order as fallback
            if (orderCheck.status !== 'paid') {
              console.log('Trigger did not update order status, manually updating...');
              const { error: manualUpdateError } = await supabase
                .from('orders')
                .update({
                  status: 'paid',
                  transaction_id: transactionId
                })
                .eq('id', orderId);

              if (manualUpdateError) {
                console.error('Error manually updating order:', manualUpdateError);
              } else {
                console.log('Order manually updated to paid status');
              }
            } else {
              console.log('Order status successfully updated by trigger');
            }
          }
        }
      }
    }

    return new Response('OK', { 
      status: 200,
      headers: corsHeaders
    });

  } catch (error) {
    console.error('Error processing M-Pesa callback:', error);
    return new Response('Error', { 
      status: 500,
      headers: corsHeaders
    });
  }
});
