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
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
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
    // Use new /rest/api/3/search/jql endpoint with POST
    const jql = `project = MVS AND sprint in (openSprints()) AND status in ("Queue", "In Development", "Failed QA", "Pause")`;
    const searchBody = JSON.stringify({
      jql: jql,
      fields: ['summary', 'status', 'timeoriginalestimate', 'assignee', 'parent', 'priority'],
      maxResults: 100
    });

    const ticketsResponse = await makeRequest(
      'novidea.atlassian.net',
      '/rest/api/3/search/jql',
      'POST',
      searchBody
    );

    // Fetch parent epic names
    const parentIds = new Set();
    ticketsResponse.issues.forEach(issue => {
      const parent = issue.fields.parent;
      if (parent && parent.key) {
        parentIds.add(parent.key);
      }
    });

    const parentNames = {};
    for (const parentId of parentIds) {
      try {
        const parentResponse = await makeRequest(
          'novidea.atlassian.net',
          `/rest/api/3/issue/${parentId}?fields=summary`
        );
        parentNames[parentId] = parentResponse.fields.summary;
      } catch (e) {
        console.warn(`Could not fetch parent ${parentId}: ${e.message}`);
        parentNames[parentId] = parentId;
      }
    }

    // Process and transform data
    const tickets = ticketsResponse.issues.map(issue => {
      const parent = issue.fields.parent;
      const parentKey = parent && parent.key ? parent.key : null;
      const effort = (issue.fields.timeoriginalestimate || 0) / 3600;
      const assignee = issue.fields.assignee;
      const priority = issue.fields.priority;

      return {
        key: issue.key,
        parent: parentKey,
        parentName: parentKey ? (parentNames[parentKey] || parentKey) : null,
        priority: priority ? priority.name : 'None',
        status: issue.fields.status.name,
        effort: Math.round(effort * 100) / 100,
        assignee: assignee ? assignee.displayName : null
      };
    });

    // Save data to file
    const data = {
      lastUpdated: new Date().toISOString(),
      totalTickets: tickets.length,
      tickets: tickets
    };

    fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
    console.log(`✓ Successfully fetched and saved ${tickets.length} tickets`);
    console.log(`✓ Last updated: ${data.lastUpdated}`);

  } catch (error) {
    console.error('Error fetching Jira data:', error.message);
    process.exit(1);
  }
}

fetchJiraData();
