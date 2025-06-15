
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// M-Pesa API endpoints - PRODUCTION
const MPESA_BASE_URL = "https://api.safaricom.co.ke";
const TOKEN_URL = `${MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`;
const REGISTER_URL = `${MPESA_BASE_URL}/mpesa/c2b/v1/registerurl`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔧 Starting M-Pesa URL registration process...');

    // Get M-Pesa credentials from environment
    const consumerKey = Deno.env.get('MPESA_CONSUMER_KEY')?.trim();
    const consumerSecret = Deno.env.get('MPESA_CONSUMER_SECRET')?.trim();
    const shortcode = Deno.env.get('MPESA_SHORTCODE')?.trim();

    if (!consumerKey || !consumerSecret || !shortcode) {
      console.error('❌ Missing M-Pesa configuration for URL registration');
      return new Response(
        JSON.stringify({ error: 'M-Pesa configuration missing' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('📋 Using shortcode for registration:', shortcode);

    // Step 1: Get OAuth token
    const auth = btoa(`${consumerKey}:${consumerSecret}`);
    
    console.log('🔑 Requesting OAuth token...');
    const tokenResponse = await fetch(TOKEN_URL, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
    });

    if (!tokenResponse.ok) {
      const tokenError = await tokenResponse.text();
      console.error('❌ Token request failed:', tokenError);
      throw new Error(`Failed to get OAuth token: ${tokenResponse.status}`);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      console.error('❌ No access token received:', tokenData);
      throw new Error('Failed to obtain access token');
    }

    console.log('✅ OAuth token obtained successfully');

    // Step 2: Register callback URLs
    const callbackUrl = 'https://vpqjobkdwrbdxnvwnuke.supabase.co/functions/v1/mpesa-callback';
    const validationUrl = 'https://vpqjobkdwrbdxnvwnuke.supabase.co/functions/v1/mpesa-callback'; // Same URL for both

    const registrationPayload = {
      ShortCode: shortcode,
      ResponseType: "Completed", // or "Cancelled" - "Completed" only sends successful transactions
      ConfirmationURL: callbackUrl,
      ValidationURL: validationUrl
    };

    console.log('📝 Registration payload:', {
      ...registrationPayload,
      ConfirmationURL: callbackUrl,
      ValidationURL: validationUrl
    });

    console.log('📡 Sending URL registration request...');
    const registerResponse = await fetch(REGISTER_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registrationPayload),
    });

    const registerData = await registerResponse.json();
    
    console.log('📱 M-Pesa URL registration response:', registerData);

    if (!registerResponse.ok || registerData.errorCode) {
      console.error('❌ URL registration failed:', registerData);
      return new Response(
        JSON.stringify({ 
          error: 'URL registration failed',
          details: registerData.errorMessage || registerData.ResponseDescription || 'Unknown error',
          errorCode: registerData.errorCode,
          response: registerData
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('✅ M-Pesa callback URLs registered successfully!');

    // Success response
    const response = {
      success: true,
      message: 'Callback URLs registered successfully',
      responseCode: registerData.ResponseCode,
      responseDescription: registerData.ResponseDescription,
      registeredUrls: {
        confirmationUrl: callbackUrl,
        validationUrl: validationUrl
      },
      shortcode: shortcode
    };

    console.log('🎯 Registration completed successfully:', response);

    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ Error in M-Pesa URL registration:', error);
    
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
