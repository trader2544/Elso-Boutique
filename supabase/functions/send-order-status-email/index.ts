
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
  
  const productRows = products.map(product => `
    <tr style="border-bottom: 1px solid #eee;">
      <td style="padding: 12px; text-align: left;">${product.name}</td>
      <td style="padding: 12px; text-align: center;">${product.quantity}</td>
      <td style="padding: 12px; text-align: right;">KSh ${(product.price * product.quantity).toLocaleString()}</td>
    </tr>
  `).join('');

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'paid':
        return {
          title: 'Payment Confirmed! 🎉',
          message: 'Your payment has been confirmed and your order is now being processed.',
          color: '#10b981'
        };
      case 'shipped':
        return {
          title: 'Order Shipped! 📦',
          message: 'Great news! Your order has been shipped and is on its way to you.',
          color: '#3b82f6'
        };
      case 'delivered':
        return {
          title: 'Order Delivered! ✅',
          message: 'Your order has been successfully delivered. Thank you for shopping with us!',
          color: '#059669'
        };
      case 'cancelled':
        return {
          title: 'Order Cancelled ❌',
          message: 'Your order has been cancelled. If you have any questions, please contact our support.',
          color: '#dc2626'
        };
      default:
        return {
          title: 'Order Status Updated',
          message: `Your order status has been updated to ${status}.`,
          color: '#6b7280'
        };
    }
  };

  const statusInfo = getStatusMessage(newStatus);

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
        <h1 style="margin: 0; font-size: 28px;">${statusInfo.title}</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Hello ${userName}!</p>
      </div>
      
      <div style="background: white; border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px; padding: 30px;">
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
          <h2 style="color: ${statusInfo.color}; margin: 0 0 15px 0; font-size: 20px;">Status Update</h2>
          <p style="margin: 10px 0; font-size: 16px;">${statusInfo.message}</p>
          <p style="margin: 5px 0;"><strong>Order ID:</strong> ${orderId.slice(0, 8)}...</p>
          <p style="margin: 5px 0;"><strong>Status:</strong> ${oldStatus.charAt(0).toUpperCase() + oldStatus.slice(1)} → <span style="color: ${statusInfo.color}; font-weight: bold;">${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}</span></p>
          <p style="margin: 5px 0;"><strong>Phone:</strong> ${customerPhone}</p>
          <p style="margin: 5px 0;"><strong>Delivery Address:</strong> ${deliveryLocation}</p>
        </div>

        <h3 style="color: ${statusInfo.color}; margin: 25px 0 15px 0;">Order Details</h3>
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

        ${newStatus === 'paid' ? `
        <div style="margin-top: 30px; padding: 20px; background: #dcfdf7; border-radius: 8px; border-left: 4px solid #10b981;">
          <h4 style="color: #065f46; margin: 0 0 10px 0;">What's Next?</h4>
          <p style="margin: 5px 0;">✅ Your payment has been confirmed</p>
          <p style="margin: 5px 0;">📦 Your order is now being prepared for shipment</p>
          <p style="margin: 5px 0;">📞 We'll contact you at ${customerPhone} with shipping updates</p>
        </div>
        ` : ''}

        ${newStatus === 'shipped' ? `
        <div style="margin-top: 30px; padding: 20px; background: #dbeafe; border-radius: 8px; border-left: 4px solid #3b82f6;">
          <h4 style="color: #1e40af; margin: 0 0 10px 0;">Shipping Information</h4>
          <p style="margin: 5px 0;">📦 Your order is on its way to: ${deliveryLocation}</p>
          <p style="margin: 5px 0;">📞 Our delivery team will contact you at ${customerPhone}</p>
          <p style="margin: 5px 0;">⏰ Expected delivery within 1-3 business days</p>
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
        <p>Thank you for choosing us! 💖</p>
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
    const { orderId, newStatus, oldStatus } = await req.json();
    console.log('📧 Sending order status update email for order:', orderId, 'Status:', oldStatus, '->', newStatus);

    // Check if RESEND_API_KEY is available
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error('❌ RESEND_API_KEY is not set');
      throw new Error('Email service not configured');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch order details with user profile
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        profiles!inner(email, full_name)
      `)
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      console.error('❌ Error fetching order:', orderError);
      throw new Error('Order not found');
    }

    console.log('📋 Order data fetched for status update email:', order);

    // Only send emails for certain status changes
    const emailableStatuses = ['paid', 'shipped', 'delivered', 'cancelled'];
    if (!emailableStatuses.includes(newStatus)) {
      console.log('⏭️ Skipping email for status:', newStatus);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Status updated but no email sent for this status type'
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    // Prepare email data
    const emailData: EmailData = {
      orderId: order.id,
      userEmail: order.profiles.email,
      userName: order.profiles.full_name || 'Valued Customer',
      products: order.products,
      totalPrice: order.total_price,
      customerPhone: order.customer_phone,
      deliveryLocation: order.delivery_location,
      newStatus,
      oldStatus,
    };

    // Generate email HTML
    const emailHTML = generateStatusUpdateEmailHTML(emailData);

    // Send email using Resend with verified domain
    const emailResponse = await resend.emails.send({
      from: "Elso Atelier <team@elso-atelier.com>",
      to: [emailData.userEmail],
      subject: `Order Status Update - ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)} - #${orderId.slice(0, 8)}`,
      html: emailHTML,
    });

    console.log('✅ Order status update email sent successfully:', emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Order status update email sent successfully',
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
  } catch (error: any) {
    console.error('❌ Error sending order status update email:', error);
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
