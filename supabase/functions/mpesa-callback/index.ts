
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

    // Extract order ID from account reference
    let orderId = null;
    if (CallbackMetadata?.Item) {
      const accountRefItem = CallbackMetadata.Item.find((item: any) => item.Name === 'AccountReference');
      if (accountRefItem?.Value) {
        orderId = accountRefItem.Value.replace('ORDER_', '');
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
    let orderStatus = 'pending';
    if (ResultCode === 0) {
      transactionStatus = 'completed';
      orderStatus = 'paid';
    } else {
      transactionStatus = 'failed';
      orderStatus = 'cancelled';
    }

    console.log('Processing payment callback:', {
      orderId,
      ResultCode,
      ResultDesc,
      transactionId,
      amount,
      phoneNumber,
      transactionStatus,
      orderStatus
    });

    // Insert or update M-Pesa transaction record
    if (orderId && phoneNumber && amount) {
      const { error: transactionError } = await supabase
        .from('mpesa_transactions')
        .upsert({
          order_id: orderId,
          phone_number: phoneNumber,
          amount: parseFloat(amount),
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
        console.log(`M-Pesa transaction recorded with status: ${transactionStatus}`);
      }
    }

    // Update order status in database
    if (orderId) {
      const { error: orderError } = await supabase
        .from('orders')
        .update({
          status: orderStatus,
          transaction_id: transactionId,
          customer_phone: phoneNumber || undefined
        })
        .eq('id', orderId);

      if (orderError) {
        console.error('Error updating order:', orderError);
      } else {
        console.log(`Order ${orderId} updated with status: ${orderStatus}`);
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
