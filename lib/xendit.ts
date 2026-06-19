export async function createXenditInvoice(invoiceData: {
  id: string;
  amount: number;
  payerEmail?: string;
  description: string;
  buyerName: string;
  buyerPhone?: string;
}) {
  const apiKey = process.env.XENDIT_DEV_API_KEY;
  if (!apiKey) {
    throw new Error('Missing XENDIT_DEV_API_KEY env key');
  }
  
  const authHeader = Buffer.from(`${apiKey}:`).toString('base64');
  const rootDomain = process.env.ROOT_DOMAIN || 'localhost:3000';
  const protocol = rootDomain.startsWith('localhost') ? 'http' : 'https';
  const callbackUrl = `${protocol}://${rootDomain}/api/xendit/webhook`;

  const response = await fetch('https://api.xendit.co/v2/invoices', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${authHeader}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      external_id: invoiceData.id,
      amount: invoiceData.amount,
      description: invoiceData.description,
      customer: {
        given_names: invoiceData.buyerName,
        mobile_number: invoiceData.buyerPhone || undefined,
      },
      invoice_duration: 86400, // 24 Hours
      success_redirect_url: `${protocol}://${rootDomain}/nota/${invoiceData.id}?status=success`,
      failure_redirect_url: `${protocol}://${rootDomain}/nota/${invoiceData.id}?status=failed`,
      callback_virtual_account_payments_url: callbackUrl,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Xendit API error: ${response.statusText} - ${errorText}`);
  }

  return response.json();
}
