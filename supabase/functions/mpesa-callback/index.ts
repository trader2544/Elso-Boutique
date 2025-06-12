
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

    // Determine order status based on result code
    let orderStatus = 'pending';
    if (ResultCode === 0) {
      orderStatus = 'paid';
    } else {
      orderStatus = 'cancelled';
    }

    console.log('Processing payment callback:', {
      orderId,
      ResultCode,
      ResultDesc,
      transactionId,
      amount,
      phoneNumber,
      orderStatus
    });

    if (orderId) {
      // Update order status in database
      const { error } = await supabase
        .from('orders')
        .update({
          status: orderStatus,
          transaction_id: transactionId,
          customer_phone: phoneNumber || undefined
        })
        .eq('id', orderId);

      if (error) {
        console.error('Error updating order:', error);
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
