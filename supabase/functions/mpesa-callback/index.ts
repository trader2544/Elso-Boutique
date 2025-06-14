
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

    // Update the existing transaction record
    if (CheckoutRequestID) {
      console.log('Updating transaction record for CheckoutRequestID:', CheckoutRequestID);
      
      const updateData = {
        response_code: ResultCode?.toString() || '1',
        response_description: ResultDesc || 'Transaction processed',
        status: isSuccessful ? 'completed' : 'failed',
        customer_message: ResultDesc || 'Transaction processed',
        updated_at: new Date().toISOString()
      };

      // Add additional data if this is a successful transaction
      if (isSuccessful && orderId !== 'unknown') {
        updateData.order_id = orderId;
        if (amount > 0) updateData.amount = amount;
        if (phoneNumber !== 'unknown') updateData.phone_number = phoneNumber;
      }

      console.log('Update data:', updateData);

      const { data: updateResult, error: updateError } = await supabase
        .from('mpesa_transactions')
        .update(updateData)
        .eq('checkout_request_id', CheckoutRequestID)
        .select();

      if (updateError) {
        console.error('Error updating transaction:', updateError);
        
        // If update failed and this is a successful transaction, try to insert a new record
        if (isSuccessful && orderId !== 'unknown') {
          console.log('Update failed, attempting to insert new record for successful transaction...');
          
          const insertData = {
            order_id: orderId,
            phone_number: phoneNumber,
            amount: amount,
            checkout_request_id: CheckoutRequestID,
            merchant_request_id: MerchantRequestID || null,
            response_code: ResultCode?.toString() || '0',
            response_description: ResultDesc || 'Success',
            status: 'completed',
            customer_message: ResultDesc || 'Payment successful',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          const { data: insertResult, error: insertError } = await supabase
            .from('mpesa_transactions')
            .insert(insertData)
            .select();

          if (insertError) {
            console.error('Error inserting transaction record:', insertError);
          } else {
            console.log('Transaction record inserted successfully:', insertResult);
          }
        }
      } else {
        console.log('Transaction updated successfully:', updateResult);
      }
    } else if (isSuccessful && orderId !== 'unknown') {
      // If no CheckoutRequestID but successful transaction, insert new record
      console.log('No CheckoutRequestID found, inserting new successful transaction record...');
      
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

      const { data: insertResult, error: insertError } = await supabase
        .from('mpesa_transactions')
        .insert(insertData)
        .select();

      if (insertError) {
        console.error('Error inserting transaction record:', insertError);
      } else {
        console.log('Transaction record inserted successfully:', insertResult);
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
