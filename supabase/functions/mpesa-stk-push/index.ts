
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// M-Pesa API endpoints
const MPESA_BASE_URL = "https://sandbox.safaricom.co.ke"; // Use https://api.safaricom.co.ke for production
const TOKEN_URL = `${MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`;
const STK_PUSH_URL = `${MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { amount, phoneNumber, orderId } = await req.json();

    if (!amount || !phoneNumber || !orderId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get M-Pesa credentials from Supabase secrets - trim whitespace
    const consumerKey = Deno.env.get('MPESA_CONSUMER_KEY')?.trim();
    const consumerSecret = Deno.env.get('MPESA_CONSUMER_SECRET')?.trim();
    const shortcode = Deno.env.get('MPESA_SHORTCODE')?.trim();
    const passkey = Deno.env.get('MPESA_PASSKEY')?.trim();
    const tillNumber = Deno.env.get('MPESA_TILL_NUMBER')?.trim();

    if (!consumerKey || !consumerSecret || !shortcode || !passkey || !tillNumber) {
      console.error('Missing M-Pesa configuration');
      return new Response(
        JSON.stringify({ error: 'M-Pesa configuration missing' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Format phone number (remove + and country code if present)
    let formattedPhone = phoneNumber.replace(/\D/g, '');
    if (formattedPhone.startsWith('254')) {
      formattedPhone = formattedPhone;
    } else if (formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.substring(1);
    } else if (formattedPhone.startsWith('7') || formattedPhone.startsWith('1')) {
      formattedPhone = '254' + formattedPhone;
    }

    console.log('Processing STK Push for:', {
      amount,
      phoneNumber: formattedPhone,
      orderId,
      shortcode,
      tillNumber
    });

    // Step 1: Get OAuth token
    const auth = btoa(`${consumerKey}:${consumerSecret}`);
    
    const tokenResponse = await fetch(TOKEN_URL, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
    });

    if (!tokenResponse.ok) {
      const tokenError = await tokenResponse.text();
      console.error('Token request failed:', tokenError);
      throw new Error(`Failed to get OAuth token: ${tokenResponse.status}`);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      console.error('No access token received:', tokenData);
      throw new Error('Failed to obtain access token');
    }

    console.log('OAuth token obtained successfully');

    // Step 2: Generate password and timestamp
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    const password = btoa(`${shortcode}${passkey}${timestamp}`);

    // Step 3: Make STK Push request
    const stkPushPayload = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerBuyGoodsOnline",
      Amount: Math.ceil(amount),
      PartyA: formattedPhone,
      PartyB: tillNumber,
      PhoneNumber: formattedPhone,
      CallBackURL: `https://vpqjobkdwrbdxnvwnuke.supabase.co/functions/v1/mpesa-callback`,
      AccountReference: `ORDER_${orderId}`,
      TransactionDesc: `Payment for order ${orderId.slice(-8)}`
    };

    console.log('STK Push payload:', {
      ...stkPushPayload,
      Password: '[HIDDEN]'
    });

    const stkResponse = await fetch(STK_PUSH_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(stkPushPayload),
    });

    const stkData = await stkResponse.json();
    
    console.log('M-Pesa STK Push response:', stkData);

    if (!stkResponse.ok || stkData.errorCode) {
      console.error('STK Push failed:', stkData);
      return new Response(
        JSON.stringify({ 
          error: 'STK Push failed',
          details: stkData.errorMessage || stkData.ResponseDescription || 'Unknown error'
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Step 4: Record the pending transaction in database
    console.log('Recording pending transaction in database...');
    
    const transactionData = {
      order_id: orderId,
      phone_number: formattedPhone,
      amount: Math.ceil(amount),
      checkout_request_id: stkData.CheckoutRequestID,
      merchant_request_id: stkData.MerchantRequestID || null,
      response_code: stkData.ResponseCode || '0',
      response_description: stkData.ResponseDescription || 'STK Push sent',
      status: 'pending', // Start as pending
      customer_message: stkData.CustomerMessage || 'STK Push sent successfully',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('Transaction data to insert:', transactionData);

    const { data: transactionResult, error: transactionError } = await supabase
      .from('mpesa_transactions')
      .insert(transactionData)
      .select();

    if (transactionError) {
      console.error('Error inserting pending transaction:', transactionError);
      // Continue even if we can't record the transaction - the callback will handle it
    } else {
      console.log('Pending transaction recorded successfully:', transactionResult);
    }

    // Success response
    const response = {
      success: true,
      message: 'STK Push sent successfully',
      checkoutRequestID: stkData.CheckoutRequestID,
      merchantRequestID: stkData.MerchantRequestID,
      responseCode: stkData.ResponseCode,
      responseDescription: stkData.ResponseDescription,
      customerMessage: stkData.CustomerMessage
    };

    console.log('STK Push successful, transaction recorded as pending, waiting for callback:', response);

    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in STK Push:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
