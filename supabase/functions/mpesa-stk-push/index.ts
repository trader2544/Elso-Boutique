
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// M-Pesa API endpoints - CHANGED TO PRODUCTION
const MPESA_BASE_URL = "https://api.safaricom.co.ke"; // Production URL
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

    console.log('🚀 Processing LIVE STK Push for:', {
      amount,
      phoneNumber: formattedPhone,
      orderId,
      shortcode,
      tillNumber
    });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check for recent pending transactions for this phone number (only check last 1 minute for retries)
    const oneMinuteAgo = new Date(Date.now() - 1 * 60 * 1000).toISOString();
    const { data: recentTransactions } = await supabase
      .from('mpesa_transactions')
      .select('*')
      .eq('phone_number', formattedPhone)
      .eq('status', 'pending')
      .gte('created_at', oneMinuteAgo);

    if (recentTransactions && recentTransactions.length > 0) {
      console.log('❌ Recent pending transaction found for this phone number, blocking duplicate request');
      console.log('🕐 Recent transactions:', recentTransactions);
      return new Response(
        JSON.stringify({ 
          error: 'Transaction in progress',
          details: 'Please wait for the current transaction to complete before initiating a new one.',
          errorCode: '500.001.1001'
        }),
        { 
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

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

    console.log('✅ OAuth token obtained successfully for LIVE environment');

    // Step 2: Generate password and timestamp
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    const password = btoa(`${shortcode}${passkey}${timestamp}`);

    // Step 3: Make STK Push request with correct callback URL
    const callbackUrl = `https://vpqjobkdwrbdxnvwnuke.supabase.co/functions/v1/mpesa-callback`;
    
    const stkPushPayload = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerBuyGoodsOnline",
      Amount: Math.ceil(amount),
      PartyA: formattedPhone,
      PartyB: tillNumber,
      PhoneNumber: formattedPhone,
      CallBackURL: callbackUrl,
      AccountReference: `ORDER_${orderId}`,
      TransactionDesc: `Payment for order ${orderId.slice(-8)}`
    };

    console.log('📱 LIVE STK Push payload:', {
      ...stkPushPayload,
      Password: '[HIDDEN]',
      CallBackURL: callbackUrl
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
    
    console.log('📱 M-Pesa LIVE STK Push response:', stkData);

    if (!stkResponse.ok || stkData.errorCode) {
      console.error('❌ LIVE STK Push failed:', stkData);
      
      // Handle specific M-Pesa errors with user-friendly messages
      let errorMessage = 'STK Push failed';
      if (stkData.errorCode === '500.001.1001') {
        errorMessage = 'A transaction is already in progress for this number. Please wait a few minutes and try again.';
      } else if (stkData.errorMessage) {
        errorMessage = stkData.errorMessage;
      } else if (stkData.ResponseDescription) {
        errorMessage = stkData.ResponseDescription;
      }
      
      return new Response(
        JSON.stringify({ 
          error: 'STK Push failed',
          details: errorMessage,
          errorCode: stkData.errorCode
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Step 4: Record the STK push request (NOT a successful transaction yet)
    console.log('💾 Recording LIVE STK push request as PENDING in database...');
    
    const transactionData = {
      order_id: orderId,
      phone_number: formattedPhone,
      amount: Math.ceil(amount),
      checkout_request_id: stkData.CheckoutRequestID,
      merchant_request_id: stkData.MerchantRequestID || null,
      response_code: stkData.ResponseCode || '0',
      response_description: stkData.ResponseDescription || 'STK Push sent',
      status: 'pending', // Always pending until callback confirms
      customer_message: stkData.CustomerMessage || 'STK Push sent successfully',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('💾 LIVE STK push data to insert:', transactionData);

    const { data: transactionResult, error: transactionError } = await supabase
      .from('mpesa_transactions')
      .insert(transactionData)
      .select();

    if (transactionError) {
      console.error('❌ Error inserting LIVE STK push record:', transactionError);
      // Continue even if we can't record the transaction - the callback will handle it
    } else {
      console.log('✅ LIVE STK push request recorded successfully:', transactionResult);
    }

    // 🚨 CRITICAL: DO NOT UPDATE ORDER STATUS HERE 
    // Order status should ONLY be updated when callback confirms payment
    console.log('⚠️ IMPORTANT: Order status will remain PENDING until payment is confirmed via LIVE callback');
    console.log('🔗 Callback URL configured:', callbackUrl);

    // Success response
    const response = {
      success: true,
      message: 'LIVE STK Push sent successfully',
      checkoutRequestID: stkData.CheckoutRequestID,
      merchantRequestID: stkData.MerchantRequestID,
      responseCode: stkData.ResponseCode,
      responseDescription: stkData.ResponseDescription,
      customerMessage: stkData.CustomerMessage,
      callbackUrl: callbackUrl
    };

    console.log('🎯 LIVE STK Push sent successfully, waiting for payment confirmation via callback:', response);

    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ Error in LIVE STK Push:', error);
    
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
