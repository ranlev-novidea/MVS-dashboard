const https = require('https');

const JIRA_EMAIL = process.env.JIRA_EMAIL;
const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN;

if (!JIRA_EMAIL || !JIRA_API_TOKEN) {
  console.error('Error: JIRA_EMAIL and JIRA_API_TOKEN required');
  process.exit(1);
}

const auth = Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString('base64');

function makeRequest(hostname, path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: hostname,
      path: path,
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function listAllFields() {
  try {
    console.log('Fetching all available Jira fields...\n');
    
    const fields = await makeRequest(
      'novidea.atlassian.net',
      '/rest/api/3/fields'
    );

    console.log(`Found ${fields.length} fields:\n`);
    console.log('='.repeat(80));
    
    // Sort by name for easier reading
    fields.sort((a, b) => a.name.localeCompare(b.name));
    
    fields.forEach(field => {
      console.log(`ID: ${field.id}`);
      console.log(`Name: ${field.name}`);
      console.log(`Type: ${field.type}`);
      console.log(`---`);
    });

    // Also search for "remaining" or "estimate"
    console.log('\n\n' + '='.repeat(80));
    console.log('Fields matching "remaining" or "estimate":\n');
    
    const relevant = fields.filter(f => 
      f.name.toLowerCase().includes('remaining') || 
      f.name.toLowerCase().includes('estimate') ||
      f.id.toLowerCase().includes('remaining') ||
      f.id.toLowerCase().includes('estimate')
    );

    if (relevant.length > 0) {
      relevant.forEach(field => {
        console.log(`✓ ID: ${field.id}`);
        console.log(`  Name: ${field.name}`);
        console.log(`  Type: ${field.type}\n`);
      });
    } else {
      console.log('No fields found with "remaining" or "estimate" in name');
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

listAllFields();
