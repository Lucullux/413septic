export default async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  const apiKey = process.env.MAILCHIMP_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Server misconfiguration' }), { status: 500 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request' }), { status: 400 });
  }

  const { EMAIL, HOUSESIZE, LASTPUMP, TOWN } = body;
  if (!EMAIL || !HOUSESIZE) {
    return new Response(JSON.stringify({ error: 'Email and household size are required.' }), { status: 400 });
  }

  // Datacenter is the part before .api.mailchimp.com — pulled from the API key suffix
  const dc = apiKey.split('-')[1]; // e.g. "us11"
  const listId = '61c593d395';

  const mcResponse = await fetch(
    `https://${dc}.api.mailchimp.com/3.0/lists/${listId}/members`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email_address: EMAIL,
        status: 'subscribed',
        merge_fields: {
          HOUSESIZE,
          LASTPUMP: LASTPUMP || '',
          TOWN: TOWN || '',
        },
      }),
    }
  );

  const data = await mcResponse.json();

  // 400 with title "Member Exists" means already subscribed — treat as success
  if (mcResponse.ok || data.title === 'Member Exists') {
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  }

  return new Response(
    JSON.stringify({ error: data.detail ?? 'Subscription failed. Please try again.' }),
    { status: 400 }
  );
};

export const config = { path: '/api/subscribe' };
