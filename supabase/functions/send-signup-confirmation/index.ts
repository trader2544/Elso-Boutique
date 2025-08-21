import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailData {
  email: string;
  fullName: string;
  confirmationUrl: string;
}

const generateSignupEmailHTML = (emailData: EmailData) => {
  const { email, fullName, confirmationUrl } = emailData;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to ELSO Boutique</title>
    </head>
    <body style="font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f8f9fa;">
      
      <!-- Header with gradient background -->
      <div style="background: linear-gradient(135deg, #ec4899, #f97316); padding: 40px 20px; text-align: center; border-radius: 0;">
        <img src="https://elso-boutique.com/lovable-uploads/348f1448-0870-4006-b782-dfb9a8d5927f.png" alt="ELSO Boutique" style="height: 60px; margin-bottom: 20px;">
        <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold;">Welcome to ELSO Boutique! 🎉</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 18px;">Your fashion journey starts here</p>
      </div>

      <!-- Main content -->
      <div style="background: white; padding: 40px 30px; border-left: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #ec4899; margin: 0 0 15px 0; font-size: 24px;">Hello ${fullName || 'Fashion Lover'}! 💖</h2>
          <p style="margin: 0; font-size: 16px; color: #6b7280;">Thank you for joining our exclusive fashion community.</p>
        </div>

        <!-- Confirmation section -->
        <div style="background: linear-gradient(135deg, #fdf2f8, #fef3c7); padding: 30px; border-radius: 12px; margin: 25px 0; text-align: center; border: 1px solid #f3e8ff;">
          <h3 style="color: #7c2d12; margin: 0 0 20px 0; font-size: 20px;">📧 Confirm Your Email Address</h3>
          <p style="margin: 0 0 25px 0; color: #374151; font-size: 16px;">
            To complete your registration and start shopping our premium collection, please confirm your email address by clicking the button below:
          </p>
          
          <a href="${confirmationUrl}" style="display: inline-block; background: linear-gradient(135deg, #ec4899, #f97316); color: white; padding: 16px 32px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(236, 72, 153, 0.3); transition: all 0.3s ease;">
            ✨ Confirm My Email ✨
          </a>
          
          <p style="margin: 20px 0 0 0; font-size: 14px; color: #6b7280;">
            This link will expire in 24 hours for security reasons.
          </p>
        </div>

        <!-- What's next section -->
        <div style="background: #f0fdf4; padding: 25px; border-radius: 10px; border-left: 4px solid #10b981; margin: 30px 0;">
          <h4 style="color: #065f46; margin: 0 0 15px 0; font-size: 18px;">🛍️ What's Next?</h4>
          <ul style="margin: 0; padding-left: 20px; color: #374151;">
            <li style="margin-bottom: 8px;">Browse our premium collection of fashion items</li>
            <li style="margin-bottom: 8px;">Enjoy exclusive member discounts and early access to new arrivals</li>
            <li style="margin-bottom: 8px;">Get personalized style recommendations</li>
            <li style="margin-bottom: 8px;">Free shipping on orders over KSh 5,000</li>
          </ul>
        </div>

        <!-- Features showcase -->
        <div style="display: flex; flex-wrap: wrap; gap: 20px; margin: 30px 0; justify-content: space-around;">
          <div style="text-align: center; flex: 1; min-width: 150px;">
            <div style="background: #fef3c7; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px; font-size: 24px;">👗</div>
            <h5 style="margin: 0 0 5px 0; color: #ec4899;">Premium Fashion</h5>
            <p style="margin: 0; font-size: 12px; color: #6b7280;">Curated styles</p>
          </div>
          <div style="text-align: center; flex: 1; min-width: 150px;">
            <div style="background: #dbeafe; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px; font-size: 24px;">🚚</div>
            <h5 style="margin: 0 0 5px 0; color: #ec4899;">Fast Delivery</h5>
            <p style="margin: 0; font-size: 12px; color: #6b7280;">Quick & secure</p>
          </div>
          <div style="text-align: center; flex: 1; min-width: 150px;">
            <div style="background: #f3e8ff; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px; font-size: 24px;">💎</div>
            <h5 style="margin: 0 0 5px 0; color: #ec4899;">Quality Guarantee</h5>
            <p style="margin: 0; font-size: 12px; color: #6b7280;">Premium quality</p>
          </div>
        </div>

        <!-- Alternative confirmation method -->
        <div style="border-top: 1px solid #e5e7eb; padding-top: 25px; margin-top: 30px;">
          <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280; text-align: center;">
            <strong>Can't click the button?</strong> Copy and paste this link into your browser:
          </p>
          <div style="background: #f9fafb; padding: 15px; border-radius: 6px; word-break: break-all; font-family: 'Courier New', monospace; font-size: 12px; border: 1px solid #e5e7eb; text-align: center;">
            ${confirmationUrl}
          </div>
        </div>

        <!-- Contact support -->
        <div style="margin-top: 30px; text-align: center; padding: 20px; background: #f8f9fa; border-radius: 8px;">
          <p style="margin: 0 0 15px 0; color: #666; font-size: 14px;">Need help or have questions?</p>
          <a href="https://wa.me/254773482210" style="display: inline-block; background: #25d366; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px;">
            💬 Contact Support on WhatsApp
          </a>
        </div>
      </div>
      
      <!-- Footer -->
      <div style="background: #374151; color: white; padding: 30px 20px; text-align: center; border-radius: 0;">
        <div style="margin-bottom: 20px;">
          <h3 style="margin: 0 0 10px 0; font-size: 18px;">ELSO Boutique</h3>
          <p style="margin: 0; opacity: 0.8; font-size: 14px;">Premium Fashion & Style • Kisumu, Kenya</p>
        </div>
        
        <div style="border-top: 1px solid #4b5563; padding-top: 20px; margin-top: 20px;">
          <p style="margin: 0; font-size: 12px; opacity: 0.7;">
            You're receiving this email because you signed up for an account at ELSO Boutique.<br>
            If you didn't create an account, please ignore this email.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { record, old_record } = await req.json();
    console.log('🎉 New user signup detected:', record.email);

    // Check if this is a new user signup (not an existing user update)
    if (old_record) {
      console.log('⏭️ Skipping - this is a user update, not a new signup');
      return new Response(
        JSON.stringify({ success: true, message: 'Skipped - user update' }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    // Only send welcome email for new signups
    if (!record.email_confirmed_at) {
      console.log('📧 Sending welcome email to:', record.email);

      // Generate confirmation URL (you might want to customize this based on your setup)
      const confirmationUrl = `${Deno.env.get('SUPABASE_URL')}/auth/v1/verify?token=${record.confirmation_token}&type=signup&redirect_to=https://elso-boutique.com/`;

      const emailData: EmailData = {
        email: record.email,
        fullName: record.raw_user_meta_data?.full_name || '',
        confirmationUrl: confirmationUrl,
      };

      // Generate email HTML
      const emailHTML = generateSignupEmailHTML(emailData);

      // Send email using Resend
      const emailResponse = await resend.emails.send({
        from: "ELSO Boutique <team@elso-boutique.com>",
        to: [emailData.email],
        subject: "Welcome to ELSO Boutique - Confirm Your Email ✨",
        html: emailHTML,
      });

      console.log('✅ Welcome email sent successfully:', emailResponse);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Welcome email sent successfully',
          emailId: emailResponse.data?.id || 'unknown'
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    } else {
      console.log('⏭️ Email already confirmed, skipping welcome email');
      return new Response(
        JSON.stringify({ success: true, message: 'Email already confirmed' }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }
  } catch (error: any) {
    console.error('❌ Error sending welcome email:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        details: 'Please check that your domain is verified at resend.com/domains'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
});
