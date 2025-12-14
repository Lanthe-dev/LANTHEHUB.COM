// Cloudflare Pages Function to handle contact form submissions
export async function onRequestPost(context) {
  try {
    const formData = await context.request.json();
    
    // Your email configuration
    const TO_EMAIL = "ghostspider729@gmail.com"; // CHANGE THIS to your actual email
    const FROM_EMAIL = "contact@lanthehub.com";
    
    // Create email content
    const emailContent = `
New Contact Form Submission from LantheHub.com

Name: ${formData.name}
Email: ${formData.email}
Subject: ${formData.subject}

Message:
${formData.message}

---
Sent from: ${context.request.headers.get('CF-Connecting-IP')}
Time: ${new Date().toISOString()}
    `.trim();

    // Send email using Cloudflare Email Workers (requires Email Routing setup)
    // For now, we'll return success and log the data
    // You'll need to set up Cloudflare Email Routing for actual email delivery
    
    console.log('Form submission:', formData);
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Message received! I\'ll get back to you soon.' 
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Failed to send message. Please try again.' 
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
}
