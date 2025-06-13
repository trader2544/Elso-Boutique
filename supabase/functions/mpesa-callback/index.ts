
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

    console.log('Processing payment callback:', {
      orderId,
      ResultCode,
      ResultDesc,
      transactionId,
      amount,
      phoneNumber
    });

    if (orderId) {
      if (ResultCode === 0) {
        // Payment successful - update order to paid status
        const { error: updateError } = await supabase
          .from('orders')
          .update({
            status: 'paid',
            transaction_id: transactionId,
            customer_phone: phoneNumber || undefined
          })
          .eq('id', orderId);

        if (updateError) {
          console.error('Error updating order to paid:', updateError);
        } else {
          console.log(`Order ${orderId} successfully updated to paid status`);
        }
      } else {
        // Payment failed - delete the order as we only store successful payments
        console.log(`Payment failed for order ${orderId} with result code: ${ResultCode}`);
        
        const { error: deleteError } = await supabase
          .from('orders')
          .delete()
          .eq('id', orderId);

        if (deleteError) {
          console.error('Error deleting failed order:', deleteError);
        } else {
          console.log(`Failed order ${orderId} deleted successfully`);
        }

        // Also update status to cancelled for any realtime listeners before deletion
        await supabase
          .from('orders')
          .update({ status: 'cancelled' })
          .eq('id', orderId);
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
