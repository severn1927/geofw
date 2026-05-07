require('dotenv').config();

const express = require('express');
const path = require('path');
const https = require('https');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3001;
const CLIENT_ID = process.env.GITHUB_CLIENT_ID || '';
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || '';

// 校验必要的环境变量
if (!CLIENT_ID) {
  console.error('[ERROR] GITHUB_CLIENT_ID 未配置！请在 .env 文件中设置');
}
if (!CLIENT_SECRET) {
  console.error('[ERROR] GITHUB_CLIENT_SECRET 未配置！请在 .env 文件中设置');
}
if (CLIENT_ID) {
  console.log('[OK] GITHUB_CLIENT_ID 已加载: ' + CLIENT_ID.substring(0, 6) + '...');
}

// 静态文件服务（CMS页面）
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// CORS 支持和请求日志
app.use((req, res, next) => {
  const origin = req.get('origin');
  if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  console.log('[' + new Date().toISOString() + '] ' + req.method + ' ' + req.url);
  next();
});

// GET /auth - CMS打开此页面发起GitHub授权
// 直接重定向到GitHub授权页面
app.get('/auth', (req, res) => {
  if (!CLIENT_ID) {
    return res.status(500).send('服务器错误：GITHUB_CLIENT_ID 未配置');
  }

  const origin = req.get('origin') || req.protocol + '://' + req.get('host');
  const redirectUri = origin + '/callback';
  const state = crypto.randomBytes(16).toString('hex');

  const githubUrl = 'https://github.com/login/oauth/authorize?' + new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: redirectUri,
    scope: 'repo user',
    state: state,
  }).toString();

  console.log('[GET /auth] 重定向到 GitHub: ' + githubUrl);
  res.redirect(githubUrl);
});

// GET /callback - GitHub授权后回调此页面
// 用code换取access_token，然后返回HTML页面通过postMessage将token传给CMS
app.get('/callback', (req, res) => {
  const code = req.query.code;
  console.log('[GET /callback] 收到code: ' + (code ? code.substring(0, 8) + '...' : '无'));

  if (!code) {
    return res.status(400).send('缺少授权码(code)');
  }

  const postData = JSON.stringify({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    code: code,
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
        console.log('[GET /callback] GitHub响应: ' + JSON.stringify(data));

        if (data.error) {
          console.error('[GET /callback] 错误: ' + data.error + ' - ' + (data.error_description || ''));
          // 即使失败也要返回HTML，通过postMessage通知CMS
          return res.send(generateCallbackPage('error', { error: data.error, error_description: data.error_description }));
        }

        // 成功获取token，通过postMessage传给CMS主窗口
        res.send(generateCallbackPage('success', {
          token: data.access_token,
          provider: 'github',
        }));
      } catch (e) {
        console.error('[GET /callback] 解析错误: ' + e.message);
        res.send(generateCallbackPage('error', { error: 'parse_error', error_description: e.message }));
      }
    });
  });

  githubReq.on('error', (e) => {
    console.error('[GET /callback] 请求失败: ' + e.message);
    res.send(generateCallbackPage('error', { error: 'request_failed', error_description: e.message }));
  });

  githubReq.write(postData);
  githubReq.end();
});

// 生成回调页面的HTML（通过postMessage与CMS主窗口通信）
function generateCallbackPage(message, content) {
  const contentStr = JSON.stringify(content);
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>认证中...</title></head>
<body>
<script>
(function() {
  console.log('[Callback] Sending postMessage: authorization:github:${message}:${contentStr}');

  // 通知主窗口：正在认证中（握手）
  window.opener.postMessage('authorizing:github', '*');

  // 通知主窗口：认证结果（包含token）
  window.opener.postMessage('authorization:github:${message}:${contentStr}', '*');

  // 关闭弹窗
  setTimeout(function() {
    window.close();
  }, 100);
})();
</script>
<p>认证完成，正在返回...</p>
</body>
</html>`;
}

app.listen(PORT, () => {
  console.log('========================================');
  console.log('[CMS] Decap CMS OAuth 代理服务器已启动');
  console.log('[CMS] 端口: ' + PORT);
  console.log('[CMS] Client ID: ' + (CLIENT_ID ? CLIENT_ID.substring(0, 6) + '...' : '未设置'));
  console.log('========================================');
});
