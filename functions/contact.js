// Handle CORS preflight
export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function onRequest(context) {
  if (context.request.method === 'OPTIONS') {
    return onRequestOptions();
  }
  if (context.request.method === 'POST') {
    return onRequestPost(context);
  }
  return new Response('Method not allowed', { status: 405 });
}

export async function onRequestPost(context) {
  try {
    let formData;
    try {
      formData = await context.request.json();
    } catch (parseErr) {
      console.error('Parse error:', parseErr);
      return new Response(JSON.stringify({ 
        success: false, 
        message: `JSON parse error: ${parseErr.message}` 
      }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        status: 400
      });
    }
    
    console.log('Form data:', { name: formData.name, email: formData.email });
    
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
    
    console.log('Sending email...');
    
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

    console.log('MailChannels response status:', emailResponse.status);

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('MailChannels error:', errorText);
      throw new Error(`MailChannels API error: ${emailResponse.status} - ${errorText}`);
    }

    console.log('Email sent successfully');
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Message received! I\'ll get back to you soon.' 
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      status: 200
    });
    
  } catch (error) {
    console.error('Contact form error:', error.message, error.stack);
    return new Response(JSON.stringify({ 
      success: false, 
      message: error.message || 'Unknown error'
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      status: 500
    });
  }
}
