
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
      return new Response('Invalid callback - no Body', { status: 400 });
    }

    const { stkCallback } = Body;

    if (!stkCallback) {
      console.error('Invalid callback structure - no stkCallback');
      return new Response('Invalid callback - no stkCallback', { status: 400 });
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

    if (CallbackMetadata?.Item && Array.isArray(CallbackMetadata.Item)) {
      console.log('Processing CallbackMetadata items:', CallbackMetadata.Item);
      
      for (const item of CallbackMetadata.Item) {
        if (item.Name === 'AccountReference' && item.Value) {
          orderId = item.Value.toString().replace('ORDER_', '');
          console.log('Extracted order ID:', orderId);
        } else if (item.Name === 'MpesaReceiptNumber' && item.Value) {
          transactionId = item.Value.toString();
          console.log('Extracted transaction ID:', transactionId);
        } else if (item.Name === 'Amount' && item.Value) {
          amount = parseFloat(item.Value.toString()) || 0;
          console.log('Extracted amount:', amount);
        } else if (item.Name === 'PhoneNumber' && item.Value) {
          phoneNumber = item.Value.toString();
          console.log('Extracted phone number:', phoneNumber);
        }
      }
    } else {
      console.log('No CallbackMetadata or items found');
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

    console.log('Final transaction data to insert:', {
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
      console.log('Inserting/updating M-Pesa transaction record...');
      
      const transactionData = {
        order_id: orderId,
        phone_number: phoneNumber,
        amount: amount,
        checkout_request_id: CheckoutRequestID,
        merchant_request_id: MerchantRequestID || null,
        response_code: ResultCode?.toString() || null,
        response_description: ResultDesc || null,
        status: transactionStatus,
        customer_message: ResultDesc || null
      };

      console.log('About to upsert transaction data:', transactionData);

      const { data: transactionResult, error: transactionError } = await supabase
        .from('mpesa_transactions')
        .upsert(transactionData, {
          onConflict: 'checkout_request_id'
        })
        .select();

      if (transactionError) {
        console.error('Error inserting/updating M-Pesa transaction:', transactionError);
        console.error('Transaction error details:', JSON.stringify(transactionError, null, 2));
      } else {
        console.log('M-Pesa transaction recorded successfully:', transactionResult);
        
        // If successful payment, verify the order was updated
        if (transactionStatus === 'completed' && orderId !== 'unknown') {
          console.log('Verifying order status after successful payment...');
          
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
            
            // If the trigger didn't work, manually update the order as fallback
            if (orderCheck && orderCheck.status !== 'paid') {
              console.log('Trigger did not update order status, manually updating...');
              const { error: manualUpdateError } = await supabase
                .from('orders')
                .update({
                  status: 'paid',
                  transaction_id: transactionId || CheckoutRequestID
                })
                .eq('id', orderId);

              if (manualUpdateError) {
                console.error('Error manually updating order:', manualUpdateError);
              } else {
                console.log('Order manually updated to paid status');
              }
            } else {
              console.log('Order status successfully updated by trigger or already paid');
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
    return new Response('Error', { 
      status: 500,
      headers: corsHeaders
    });
  }
});
