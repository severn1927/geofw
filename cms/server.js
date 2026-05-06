const express = require('express');
const path = require('path');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3001;

// Environment variables
const CLIENT_ID = process.env.GITHUB_CLIENT_ID || '';
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || '';
const SITE_URL = process.env.SITE_URL || 'https://www.geofw.cn';

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.warn('WARNING: GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET must be set as environment variables.');
}

// Serve static files (Decap CMS frontend)
app.use(express.static(path.join(__dirname, 'public')));

// OAuth callback endpoint
app.get('/api/auth', (req, res) => {
  const code = req.query.code;
  const provider = req.query.provider || 'github';

  if (!code) {
    return res.status(400).send('Missing code parameter');
  }

  const postData = JSON.stringify({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    code,
  });

  const options = {
    hostname: 'github.com',
    path: '/login/oauth/access_token',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
    },
  };

  const githubReq = https.request(options, (githubRes) => {
    let body = '';
    githubRes.on('data', (chunk) => (body += chunk));
    githubRes.on('end', () => {
      try {
        const data = JSON.parse(body);
        if (data.error) {
          console.error('GitHub OAuth error:', data.error, data.error_description);
          return res.status(400).json(data);
        }
        // Redirect back to CMS with token
        res.redirect(`/?provider=${provider}&access_token=${data.access_token}`);
      } catch (e) {
        console.error('Failed to parse GitHub response:', body);
        res.status(500).send('Auth failed');
      }
    });
  });

  githubReq.on('error', (e) => {
    console.error('GitHub OAuth request failed:', e.message);
    res.status(500).send('Failed to connect to GitHub');
  });

  githubReq.write(postData);
  githubReq.end();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'geofw-cms' });
});

app.listen(PORT, () => {
  console.log(`Geofw CMS server running on port ${PORT}`);
  console.log(`GitHub Client ID: ${CLIENT_ID ? CLIENT_ID.slice(0, 8) + '...' : 'NOT SET'}`);
});
