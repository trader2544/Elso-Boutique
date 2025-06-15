
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Log all incoming requests for debugging
  console.log('🔔 CALLBACK REQUEST RECEIVED:');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', Object.fromEntries(req.headers.entries()));

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Log the raw request body for debugging
    const rawBody = await req.text();
    console.log('📥 RAW CALLBACK BODY:', rawBody);

    if (!rawBody) {
      console.log('⚠️ Empty callback body received');
      return new Response('OK', { 
        status: 200,
        headers: corsHeaders
      });
    }

    let callbackData;
    try {
      callbackData = JSON.parse(rawBody);
    } catch (parseError) {
      console.error('❌ Failed to parse callback JSON:', parseError);
      console.log('Raw body was:', rawBody);
      return new Response('OK', { 
        status: 200,
        headers: corsHeaders
      });
    }

    console.log('🔔 LIVE M-Pesa callback received:', JSON.stringify(callbackData, null, 2));

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Handle different callback structures that Safaricom might send
    let stkCallback;
    
    if (callbackData.Body?.stkCallback) {
      stkCallback = callbackData.Body.stkCallback;
    } else if (callbackData.stkCallback) {
      stkCallback = callbackData.stkCallback;
    } else if (callbackData.Body) {
      stkCallback = callbackData.Body;
    } else {
      stkCallback = callbackData;
    }

    console.log('📱 Extracted stkCallback:', JSON.stringify(stkCallback, null, 2));

    if (!stkCallback) {
      console.error('❌ Invalid LIVE callback structure - no stkCallback found');
      console.log('Available keys in callbackData:', Object.keys(callbackData));
      return new Response('OK', { 
        status: 200,
        headers: corsHeaders
      });
    }

    const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata, MerchantRequestID } = stkCallback;

    console.log('📱 Processing LIVE M-Pesa callback:', {
      CheckoutRequestID,
      ResultCode,
      ResultDesc,
      MerchantRequestID
    });

    if (!CheckoutRequestID) {
      console.error('❌ No CheckoutRequestID found in callback');
      return new Response('OK', { 
        status: 200,
        headers: corsHeaders
      });
    }

    // Check if this is a successful transaction (ResultCode 0 means success)
    const isSuccessful = (ResultCode === 0 || ResultCode === '0');
    
    console.log('💰 LIVE Payment result analysis:', {
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
      console.log('🔍 Processing LIVE CallbackMetadata items:', CallbackMetadata.Item);
      
      for (const item of CallbackMetadata.Item) {
        console.log('📋 Processing LIVE metadata item:', item);
        
        if (item.Name === 'AccountReference' && item.Value) {
          // Extract order ID from AccountReference (format: ORDER_uuid)
          const accountRef = item.Value.toString();
          if (accountRef.startsWith('ORDER_')) {
            orderId = accountRef.replace('ORDER_', '');
          } else {
            orderId = accountRef;
          }
          console.log('🆔 Extracted LIVE order ID from AccountReference:', orderId);
        } else if (item.Name === 'MpesaReceiptNumber' && item.Value) {
          transactionId = item.Value.toString();
          console.log('🧾 Extracted LIVE M-Pesa receipt number:', transactionId);
        } else if (item.Name === 'Amount' && item.Value) {
          amount = parseFloat(item.Value.toString()) || 0;
          console.log('💵 Extracted LIVE amount:', amount);
        } else if (item.Name === 'PhoneNumber' && item.Value) {
          phoneNumber = item.Value.toString();
          console.log('📞 Extracted LIVE phone number:', phoneNumber);
        }
      }
    } else {
      console.log('⚠️ No LIVE CallbackMetadata items found - payment might have failed');
    }

    // Prepare transaction update data
    const updateData = {
      merchant_request_id: MerchantRequestID || null,
      response_code: ResultCode?.toString() || '1',
      response_description: ResultDesc || 'Payment failed',
      status: isSuccessful ? 'completed' : 'failed',
      customer_message: ResultDesc || (isSuccessful ? 'Payment successful' : 'Payment failed'),
      updated_at: new Date().toISOString()
    };

    if (isSuccessful && transactionId) {
      updateData.transaction_id = transactionId;
    }

    console.log('💾 Updating LIVE M-Pesa transaction with callback data:', updateData);

    // Update the transaction record
    const { data: transactionResult, error: transactionError } = await supabase
      .from('mpesa_transactions')
      .update(updateData)
      .eq('checkout_request_id', CheckoutRequestID)
      .select();

    if (transactionError) {
      console.error('❌ Error updating LIVE M-Pesa transaction:', transactionError);
    } else {
      console.log('✅ LIVE M-Pesa transaction updated successfully:', transactionResult);
    }

    // 🚨 CRITICAL: ONLY update order status to 'paid' if payment was actually successful
    if (isSuccessful && orderId !== 'unknown') {
      console.log('🎉 LIVE PAYMENT CONFIRMED SUCCESSFUL - Updating order status to PAID for order:', orderId);
      
      // Check if order exists first
      const { data: existingOrder } = await supabase
        .from('orders')
        .select('id, status')
        .eq('id', orderId)
        .single();
      
      if (!existingOrder) {
        console.error('❌ LIVE Order not found with ID:', orderId);
      } else {
        console.log('📋 Current LIVE order status before update:', existingOrder.status);
        
        // Update order to paid status
        const { data: orderUpdateResult, error: orderUpdateError } = await supabase
          .from('orders')
          .update({ 
            status: 'paid',
            transaction_id: transactionId || CheckoutRequestID || `mpesa_live_${Date.now()}`
          })
          .eq('id', orderId)
          .select();

        if (orderUpdateError) {
          console.error('❌ ERROR updating LIVE order status to paid:', orderUpdateError);
        } else {
          console.log('✅ LIVE ORDER STATUS SUCCESSFULLY UPDATED TO PAID:', orderUpdateResult);
          console.log('🔔 LIVE Order update should trigger real-time notification to frontend');
        }
      }

    } else if (!isSuccessful) {
      console.log('❌ LIVE Payment failed or was cancelled - keeping order as pending for retry');
      console.log('📝 LIVE Result details:', {
        ResultCode,
        ResultDesc,
        orderId
      });
      
      // Optionally update order with failure info but keep status as pending for retry
      if (orderId !== 'unknown') {
        const { error: orderNoteError } = await supabase
          .from('orders')
          .update({ 
            // Keep status as pending so user can retry
            transaction_id: `failed_live_${CheckoutRequestID || Date.now()}`
          })
          .eq('id', orderId);

        if (orderNoteError) {
          console.error('Error updating LIVE order with failure info:', orderNoteError);
        }
      }
    } else {
      console.log('⚠️ LIVE Payment callback processed but conditions not met for order update');
      console.log('🔍 LIVE Debug info:', {
        isSuccessful,
        orderId,
        hasOrderId: orderId !== 'unknown'
      });
    }

    console.log('✅ LIVE M-Pesa callback processing completed successfully');

    return new Response('OK', { 
      status: 200,
      headers: corsHeaders
    });

  } catch (error) {
    console.error('❌ CRITICAL ERROR processing LIVE M-Pesa callback:', error);
    console.error('📊 Error details:', {
      message: error.message,
      stack: error.stack
    });
    
    // Always return 200 OK to M-Pesa to avoid retries for malformed requests
    return new Response('OK', { 
      status: 200,
      headers: corsHeaders
    });
  }
});
