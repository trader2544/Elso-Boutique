
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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
      orderId
    });

    // For demo purposes, we'll simulate a successful payment
    // In a real implementation, you would:
    // 1. Get M-Pesa credentials from Supabase secrets
    // 2. Generate access token from M-Pesa API
    // 3. Make STK Push request to M-Pesa
    // 4. Return the response

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate successful response
    const response = {
      success: true,
      message: 'STK Push sent successfully',
      checkoutRequestID: `ws_CO_${Date.now()}`,
      responseCode: '0',
      responseDescription: 'Success. Request accepted for processing',
      customerMessage: 'Success. Request accepted for processing'
    };

    console.log('STK Push response:', response);

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
