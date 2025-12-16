export async function onRequestPost(context) {
  try {
    const formData = await context.request.json();
    
    const TO_EMAIL = "ghostspider729@gmail.com";
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
