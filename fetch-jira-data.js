const fs = require('fs');
const https = require('https');

const JIRA_CLOUD_ID = process.env.JIRA_CLOUD_ID;
const JIRA_EMAIL = process.env.JIRA_EMAIL;
const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN;

if (!JIRA_CLOUD_ID || !JIRA_EMAIL || !JIRA_API_TOKEN) {
  console.error('Error: JIRA_CLOUD_ID, JIRA_EMAIL and JIRA_API_TOKEN environment variables are required');
  process.exit(1);
}

const auth = Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString('base64');

function makeRequest(hostname, path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: hostname,
      path: path,
      method: method,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    };

    if (body) {
      options.headers['Content-Length'] = Buffer.byteLength(body);
    }

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        console.log(`API Response Status: ${res.statusCode}`);
        if (res.statusCode === 200) {
          try {
            const parsed = JSON.parse(data);
            console.log('Raw response keys:', Object.keys(parsed));
            console.log('Full response:', JSON.stringify(parsed, null, 2));
            resolve(parsed);
          } catch (e) {
            reject(new Error(`Failed to parse JSON: ${e.message}`));
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function fetchJiraData() {
  console.log('Fetching Jira data...');
  
  try {
    //const jql = `project = MVS AND sprint in (openSprints())`;
    const jql = `project = MVS AND sprint in (openSprints()) AND status in ("Queue", "In Development", "Failed QA", "Pause")`;
    console.log(`Using JQL: ${jql}`);
    
    const searchBody = JSON.stringify({
      jql: jql,
      fields: ['summary', 'status', 'timeoriginalestimate', 'assignee', 'parent', 'priority'],
      maxResults: 50
    });

    console.log('Making API request...');
    const response = await makeRequest(
      'novidea.atlassian.net',
      '/rest/api/3/search/jql',
      'POST',
      searchBody
    );

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

fetchJiraData();
