// Cloudflare Pages Function for Decap CMS GitHub OAuth proxy
// This proxies the GitHub OAuth token exchange to avoid CORS issues

export async function onRequestGet(context: any) {
  const url = new URL(context.request.url);
  const code = url.searchParams.get('code');
  const provider = url.searchParams.get('provider') || 'github';

  if (!code) {
    return new Response('Missing code parameter', { status: 400 });
  }

  try {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: context.env.GITHUB_CLIENT_ID || '',
        client_secret: context.env.GITHUB_CLIENT_SECRET || '',
        code,
      }),
    });

    const data = await response.json();

    if (data.error) {
      return new Response(
        JSON.stringify({ error: data.error, error_description: data.error_description }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Redirect back to Decap CMS with the token
    return new Response(null, {
      status: 302,
      headers: {
        'Location': `/?provider=${provider}&access_token=${data.access_token}`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
