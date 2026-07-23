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
            resolve(JSON.parse(data));
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
    // Simple test query
    const jql = `project = MVS`;
    console.log(`Using JQL: ${jql}`);
    
    const searchBody = JSON.stringify({
      jql: jql,
      fields: ['summary', 'status', 'timeoriginalestimate', 'assignee', 'parent', 'priority'],
      maxResults: 50
    });

    console.log('Making API request...');
    const ticketsResponse = await makeRequest(
      'novidea.atlassian.net',
      '/rest/api/3/search/jql',
      'POST',
      searchBody
    );

    console.log(`Total issues found: ${ticketsResponse.total}`);
    console.log(`Issues in response: ${ticketsResponse.issues ? ticketsResponse.issues.length : 0}`);

    if (!ticketsResponse.issues || ticketsResponse.issues.length === 0) {
      console.log('No issues found!');
      fs.writeFileSync('data.json', JSON.stringify({
        lastUpdated: new Date().toISOString(),
        totalTickets: 0,
        tickets: []
      }, null, 2));
      return;
    }

    // Rest of the code...
    const tickets = ticketsResponse.issues.map(issue => {
      const parent = issue.fields.parent;
      const parentKey = parent && parent.key ? parent.key : null;
      const effort = (issue.fields.timeoriginalestimate || 0) / 3600;
      const assignee = issue.fields.assignee;
      const priority = issue.fields.priority;

      return {
        key: issue.key,
        parent: parentKey,
        parentName: parentKey || null,
        priority: priority ? priority.name : 'None',
        status: issue.fields.status.name,
        effort: Math.round(effort * 100) / 100,
        assignee: assignee ? assignee.displayName : null
      };
    });

    fs.writeFileSync('data.json', JSON.stringify({
      lastUpdated: new Date().toISOString(),
      totalTickets: tickets.length,
      tickets: tickets
    }, null, 2));

    console.log(`✓ Successfully fetched and saved ${tickets.length} tickets`);

  } catch (error) {
    console.error('Error fetching Jira data:', error.message);
    process.exit(1);
  }
}

fetchJiraData();
