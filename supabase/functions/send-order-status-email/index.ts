
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OrderProduct {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface EmailData {
  orderId: string;
  userEmail: string;
  userName: string;
  products: OrderProduct[];
  totalPrice: number;
  customerPhone: string;
  deliveryLocation: string;
  newStatus: string;
  oldStatus: string;
}

const generateStatusUpdateEmailHTML = (orderData: EmailData) => {
  const { orderId, userName, products, totalPrice, customerPhone, deliveryLocation, newStatus, oldStatus } = orderData;
  
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          emoji: '⏳',
          title: 'Order Received',
          message: 'Your order has been received and is being processed.',
          color: '#f59e0b'
        };
      case 'shipped':
        return {
          emoji: '🚚',
          title: 'Order Shipped',
          message: 'Great news! Your order is on its way to you.',
          color: '#8b5cf6'
        };
      case 'delivered':
        return {
          emoji: '✅',
          title: 'Order Delivered',
          message: 'Your order has been successfully delivered. Thank you for shopping with us!',
          color: '#10b981'
        };
      case 'cancelled':
        return {
          emoji: '❌',
          title: 'Order Cancelled',
          message: 'Your order has been cancelled. If you have any questions, please contact our support team.',
          color: '#ef4444'
        };
      default:
        return {
          emoji: '📦',
          title: 'Order Updated',
          message: 'Your order status has been updated.',
          color: '#6b7280'
        };
    }
  };

  const statusInfo = getStatusInfo(newStatus);
  const productRows = products.map(product => `
    <tr style="border-bottom: 1px solid #eee;">
      <td style="padding: 12px; text-align: left;">${product.name}</td>
      <td style="padding: 12px; text-align: center;">${product.quantity}</td>
      <td style="padding: 12px; text-align: right;">KSh ${(product.price * product.quantity).toLocaleString()}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Status Update</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, ${statusInfo.color}, #f97316); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">${statusInfo.emoji} ${statusInfo.title}</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Hello ${userName}!</p>
      </div>
      
      <div style="background: white; border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px; padding: 30px;">
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
          <h2 style="color: ${statusInfo.color}; margin: 0 0 15px 0; font-size: 20px;">Order Status Update</h2>
          <p style="margin: 10px 0; font-size: 16px;">${statusInfo.message}</p>
          <div style="background: white; padding: 15px; border-radius: 6px; margin-top: 15px;">
            <p style="margin: 5px 0;"><strong>Order ID:</strong> ${orderId.slice(0, 8)}...</p>
            <p style="margin: 5px 0;"><strong>Status:</strong> ${oldStatus} → <span style="color: ${statusInfo.color}; font-weight: bold;">${newStatus}</span></p>
            <p style="margin: 5px 0;"><strong>Phone:</strong> ${customerPhone}</p>
            ${deliveryLocation ? `<p style="margin: 5px 0;"><strong>Delivery Address:</strong> ${deliveryLocation}</p>` : ''}
          </div>
        </div>

        <h3 style="color: ${statusInfo.color}; margin: 25px 0 15px 0;">Order Summary</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
          <thead>
            <tr style="background: #f8f9fa;">
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid ${statusInfo.color};">Product</th>
              <th style="padding: 12px; text-align: center; border-bottom: 2px solid ${statusInfo.color};">Qty</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid ${statusInfo.color};">Total</th>
            </tr>
          </thead>
          <tbody>
            ${productRows}
          </tbody>
        </table>

        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: right;">
          <h3 style="color: ${statusInfo.color}; margin: 0; font-size: 24px;">Total: KSh ${totalPrice.toLocaleString()}</h3>
        </div>

        ${newStatus === 'shipped' ? `
        <div style="margin-top: 30px; padding: 20px; background: #e7f3ff; border-radius: 8px; border-left: 4px solid #2196f3;">
          <h4 style="color: #1976d2; margin: 0 0 10px 0;">Tracking Information</h4>
          <p style="margin: 5px 0;">📦 Your order is now on its way!</p>
          <p style="margin: 5px 0;">🚚 Expected delivery within 2-3 business days</p>
          <p style="margin: 5px 0;">📞 We'll call you at ${customerPhone} for delivery coordination</p>
        </div>
        ` : ''}

        ${newStatus === 'delivered' ? `
        <div style="margin-top: 30px; padding: 20px; background: #f0fdf4; border-radius: 8px; border-left: 4px solid #10b981;">
          <h4 style="color: #059669; margin: 0 0 10px 0;">Thank You!</h4>
          <p style="margin: 5px 0;">🎉 We hope you love your purchase!</p>
          <p style="margin: 5px 0;">⭐ Don't forget to leave a review</p>
          <p style="margin: 5px 0;">🛍️ Visit us again for more amazing products</p>
        </div>
        ` : ''}

        ${newStatus === 'cancelled' ? `
        <div style="margin-top: 30px; padding: 20px; background: #fef2f2; border-radius: 8px; border-left: 4px solid #ef4444;">
          <h4 style="color: #dc2626; margin: 0 0 10px 0;">Need Help?</h4>
          <p style="margin: 5px 0;">💬 Contact our support team if you have any questions</p>
          <p style="margin: 5px 0;">🔄 You can place a new order anytime</p>
          <p style="margin: 5px 0;">📞 Call us at ${customerPhone} for assistance</p>
        </div>
        ` : ''}

        <div style="margin-top: 25px; text-align: center; padding: 20px; background: #f8f9fa; border-radius: 8px;">
          <p style="margin: 0 0 10px 0; color: #666;">Need help with your order?</p>
          <a href="https://wa.me/254773482210" style="display: inline-block; background: #25d366; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Contact Support on WhatsApp
          </a>
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 20px; color: #666; font-size: 14px;">
        <p>Thank you for choosing Elso Atelier! 💖</p>
      </div>
    </body>
    </html>
  `;
};

serve(async (req) => {
  // Always log that the function was called with timestamp
  const timestamp = new Date().toISOString();
  console.log('🔥🔥🔥 EMAIL FUNCTION CALLED! 🔥🔥🔥');
  console.log('📅 Timestamp:', timestamp);
  console.log('🌐 Request method:', req.method);
  console.log('📍 Request URL:', req.url);
  console.log('📋 Request headers:', Object.fromEntries(req.headers.entries()));

  if (req.method === 'OPTIONS') {
    console.log('✅ Handling OPTIONS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('📧 Processing order status update email request...');
    
    const requestBody = await req.text();
    console.log('📦 Raw request body received:', requestBody);
    
    if (!requestBody || requestBody.trim() === '') {
      console.error('❌ Empty request body received');
      throw new Error('Request body is empty');
    }
    
    const { orderId, newStatus, oldStatus } = JSON.parse(requestBody);
    console.log('📧 Parsed request data:');
    console.log('  Order ID:', orderId);
    console.log('  Status change:', oldStatus, '→', newStatus);

    // Check if RESEND_API_KEY is available
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error('❌ RESEND_API_KEY environment variable is not set');
      throw new Error('Email service not configured - RESEND_API_KEY missing');
    }
    console.log('✅ RESEND_API_KEY is configured');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Supabase configuration missing');
      console.error('  SUPABASE_URL present:', !!supabaseUrl);
      console.error('  SUPABASE_SERVICE_ROLE_KEY present:', !!supabaseKey);
      throw new Error('Supabase configuration missing');
    }
    
    console.log('✅ Supabase configuration found');
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch order details with user profile (using registered email from profiles)
    console.log('📋 Fetching order details with user profile for order:', orderId);
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        profiles!inner(email, full_name)
      `)
      .eq('id', orderId)
      .single();

    if (orderError) {
      console.error('❌ Error fetching order:', orderError);
      console.error('  Error message:', orderError.message);
      console.error('  Error details:', orderError.details);
      console.error('  Error hint:', orderError.hint);
      throw new Error(`Order fetch failed: ${orderError.message}`);
    }
    
    if (!order) {
      console.error('❌ Order not found for ID:', orderId);
      throw new Error('Order not found');
    }

    console.log('✅ Order data fetched successfully');
    console.log('📧 Customer email (from profiles):', order.profiles.email);
    console.log('👤 Customer name:', order.profiles.full_name);
    console.log('📦 Order products count:', order.products?.length || 0);
    console.log('💰 Order total:', order.total_price);

    // Prepare email data
    const emailData: EmailData = {
      orderId: order.id,
      userEmail: order.profiles.email, // Using registered email from profiles table
      userName: order.profiles.full_name || 'Valued Customer',
      products: order.products,
      totalPrice: order.total_price,
      customerPhone: order.customer_phone,
      deliveryLocation: order.delivery_location,
      newStatus,
      oldStatus,
    };

    console.log('📝 Email data prepared for:', emailData.userEmail);

    // Generate email HTML
    console.log('🎨 Generating email HTML content...');
    const emailHTML = generateStatusUpdateEmailHTML(emailData);

    // Determine subject based on status
    const getEmailSubject = (status: string, orderIdShort: string) => {
      switch (status) {
        case 'pending':
          return `Order Received - #${orderIdShort}`;
        case 'shipped':
          return `Order Shipped - #${orderIdShort}`;
        case 'delivered':
          return `Order Delivered - #${orderIdShort}`;
        case 'cancelled':
          return `Order Cancelled - #${orderIdShort}`;
        default:
          return `Order Update - #${orderIdShort}`;
      }
    };

    const emailSubject = getEmailSubject(newStatus, orderId.slice(0, 8));
    console.log('📧 Email subject:', emailSubject);

    // Send email using Resend with verified domain
    console.log('📤 Sending email via Resend...');
    console.log('  From: Elso Atelier <team@elso-atelier.com>');
    console.log('  To:', emailData.userEmail);
    console.log('  Subject:', emailSubject);
    
    const emailResponse = await resend.emails.send({
      from: "Elso Atelier <team@elso-atelier.com>",
      to: [emailData.userEmail],
      subject: emailSubject,
      html: emailHTML,
    });

    console.log('✅ Order status update email sent successfully!');
    console.log('📬 Email response:', emailResponse);
    console.log('📧 Email ID:', emailResponse.data?.id || 'unknown');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Order status update email sent successfully',
        emailId: emailResponse.data?.id || 'unknown',
        status: `${oldStatus} → ${newStatus}`,
        recipient: emailData.userEmail,
        timestamp: timestamp
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error('❌ Error sending order status update email:', error);
    console.error('🔍 Error name:', error.name);
    console.error('💬 Error message:', error.message);
    console.error('📚 Error stack:', error.stack);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        errorName: error.name,
        timestamp: timestamp,
        details: 'Check function logs for more details. Ensure RESEND_API_KEY is set and domain is verified at resend.com/domains'
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
