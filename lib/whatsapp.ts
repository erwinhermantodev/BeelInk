export async function sendWhatsAppInvoice(buyerPhone: string, invoiceLink: string) {
  const token = process.env.META_WHATSAPP_TOKEN;
  const phoneNumberId = process.env.META_WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    console.warn('Meta WhatsApp API credentials not configured');
    return null;
  }

  // Format the phone number: remove non-digits and map leading 0 to 62
  let formattedPhone = buyerPhone.replace(/\D/g, '');
  if (formattedPhone.startsWith('0')) {
    formattedPhone = '62' + formattedPhone.slice(1);
  }

  // Fallback check in case formatting results in empty string
  if (!formattedPhone) {
    console.error('Invalid phone number format:', buyerPhone);
    return null;
  }

  const url = `https://graph.facebook.com/v25.0/${phoneNumberId}/messages`;
  const body = {
    messaging_product: 'whatsapp',
    to: formattedPhone,
    type: 'template',
    template: {
      name: 'general',
      language: { code: 'en' },
      components: [
        {
          type: 'body',
          parameters: [
            {
              type: 'text',
              text: `Ini link untuk pembyaran invoice anda ${invoiceLink}`
            }
          ]
        }
      ]
    }
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    
    const data = await res.json();
    if (!res.ok) {
      console.error('WhatsApp API Error:', data);
    } else {
      console.log('WhatsApp message sent successfully:', data);
    }
    return data;
  } catch (error) {
    console.error('Failed to send WhatsApp message:', error);
    return null;
  }
}
