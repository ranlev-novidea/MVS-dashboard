const https = require('https');

const JIRA_CLOUD_ID = process.env.JIRA_CLOUD_ID;
const JIRA_EMAIL = process.env.JIRA_EMAIL;
const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN;

console.log('Testing Jira authentication...');
console.log('Cloud ID:', JIRA_CLOUD_ID);
console.log('Email:', JIRA_EMAIL);
console.log('Token exists:', !!JIRA_API_TOKEN);

const auth = Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString('base64');
console.log('Auth header:', `Basic ${auth.substring(0, 20)}...`);

const options = {
  hostname: 'api.atlassian.com',
  path: `/ex/jira/${JIRA_CLOUD_ID}/rest/api/3/myself`,
  method: 'GET',
  headers: {
    'Authorization': `Basic ${auth}`,
    'Accept': 'application/json'
  }
};

https.get(options, (res) => {
  console.log('Status:', res.statusCode);
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('Response:', data);
  });
}).on('error', (e) => {
  console.error('Error:', e.message);
});
