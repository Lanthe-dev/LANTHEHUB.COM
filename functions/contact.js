export async function onRequestPost(context) {
  try {
    const formData = await context.request.json();
    
    const TO_EMAIL = "contact@lanthehub.com";
    const FROM_EMAIL = "contact@lanthehub.com";
    
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
    
    // Send email via MailChannels
    const emailResponse = await fetch('https://api.mailchannels.net/tx/v1/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: TO_EMAIL }],
            dkim_domain: 'lanthehub.com',
            dkim_selector: 'mailchannels',
          }
        ],
        from: {
          email: FROM_EMAIL,
          name: 'LantheHub Contact Form'
        },
        reply_to: {
          email: formData.email,
          name: formData.name
        },
        subject: `Contact Form: ${formData.subject}`,
        content: [
          {
            type: 'text/plain',
            value: emailContent
          }
        ]
      })
    });

    if (!emailResponse.ok) {
      throw new Error(`MailChannels API error: ${emailResponse.status}`);
    }

    console.log('Email sent successfully:', formData);
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Message received! I\'ll get back to you soon.' 
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });
    
  } catch (error) {
    console.error('Contact form error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Failed to send message. Please try again.' 
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
}
