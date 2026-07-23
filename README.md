# MVS Sprint Effort Dashboard

An automated dashboard that displays unassigned work in your Jira sprint, organized by parent epic and priority. Updates daily automatically via GitHub Actions.

## Features

- 📊 **Visual Dashboard** - Stacked bar chart showing effort by parent epic
- 🎨 **Priority Breakdown** - Color-coded by priority (Highest → Low)
- 🔄 **Automatic Updates** - Refreshes daily at 9 AM UTC via GitHub Actions
- 📱 **Responsive Design** - Works on desktop and mobile
- 🚀 **Easy Deployment** - Hosted on GitHub Pages (free)

## Quick Start

### 1. Prerequisites

- GitHub account
- Jira Cloud account with API token
- Jira Cloud ID (found in your Jira URL: `https://yoursite.atlassian.net` → ID is `yoursite`)

### 2. Get Your Jira API Token

1. Go to https://id.atlassian.com/manage-profile/security/api-tokens
2. Click **Create API token**
3. Copy the token (you'll need it for GitHub Secrets)

### 3. Create GitHub Repository

1. **Fork or create** a new GitHub repository named `mvs-dashboard`
2. **Upload these files:**
   ```
   mvs-dashboard/
   ├── index.html
   ├── fetch-jira-data.js
   ├── package.json
   ├── .gitignore
   ├── README.md
   └── .github/workflows/refresh-dashboard.yml
   ```

### 4. Set Up GitHub Secrets

1. Go to your repo → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret** and add:
   - **Name:** `JIRA_CLOUD_ID`
   - **Value:** Your Jira Cloud ID (e.g., `12345678-1234-1234-1234-1234567890ab`)

3. Click **New repository secret** and add:
   - **Name:** `JIRA_API_TOKEN`
   - **Value:** Your Jira API token (paste the full token)

### 5. Enable GitHub Pages

1. Go to **Settings** → **Pages**
2. Under "Build and deployment":
   - **Source:** `Deploy from a branch`
   - **Branch:** `main` / `master` (whichever your default is)
   - **Folder:** `/ (root)`
3. Click **Save**

### 6. First Run

1. Go to **Actions** → **Refresh Dashboard Daily**
2. Click **Run workflow** to test immediately
3. Wait 1-2 minutes for it to complete
4. Check the `data.json` file appears in your repo with fresh data

### 7. Access Your Dashboard

Your dashboard will be live at:
```
https://<your-username>.github.io/mvs-dashboard
```

(Example: `https://john-doe.github.io/mvs-dashboard`)

## Configuration

### Change Update Schedule

Edit `.github/workflows/refresh-dashboard.yml`:

```yaml
on:
  schedule:
    # Change the cron time (format: minute hour day month day-of-week)
    # 0 9 * * * = 9 AM UTC every day
    # 0 6 * * 1-5 = 6 AM UTC weekdays only
    - cron: '0 9 * * *'
```

[Cron time reference](https://crontab.guru/)

### Update Jira Query

Edit `fetch-jira-data.js` and modify the JQL query:

```javascript
const ticketsResponse = await makeRequest(
  `/ex/jira/${JIRA_CLOUD_ID}/rest/api/3/search?` +
  `jql=project=YOUR_PROJECT AND sprint in (openSprints()) AND status in ("Queue", "In Development", "Failed QA", "Pause")` +
  // ↑ Change YOUR_PROJECT and statuses as needed
  `&fields=summary,status,timeoriginalestimate,assignee,parent,priority` +
  `&maxResults=100`
);
```

## Manual Refresh

To run the update manually:

1. Go to **Actions** → **Refresh Dashboard Daily**
2. Click **Run workflow** → **Run workflow**

Or push a commit to trigger automatically.

## Troubleshooting

### "Failed to load data" on dashboard

- Dashboard loaded but `data.json` is missing
- Run the workflow manually from GitHub Actions
- Check workflow logs for errors

### Workflow fails with "401 Unauthorized"

- ❌ Incorrect Jira API token
- ✅ Regenerate token and update GitHub Secret

### No updates showing

- Check the **Actions** tab to see if workflow ran
- Click the workflow run to see logs
- Verify workflow schedule time (may need to add buffer)

### Data is stale

- Manually trigger the workflow from Actions tab
- Workflow runs at 9 AM UTC (adjust in `.yml` file if needed)

## File Structure

```
mvs-dashboard/
├── index.html                          # Dashboard webpage
├── fetch-jira-data.js                  # Jira data fetching script
├── package.json                        # NPM configuration
├── data.json                           # Auto-generated data (don't edit)
├── .github/workflows/
│   └── refresh-dashboard.yml          # GitHub Actions workflow
├── .gitignore
└── README.md
```

## How It Works

1. **GitHub Actions Trigger** - Workflow runs on schedule (daily at 9 AM UTC)
2. **Fetch Jira Data** - `fetch-jira-data.js` queries your Jira sprint
3. **Generate `data.json`** - Transforms API response into dashboard format
4. **Push to Repo** - Commits updated data automatically
5. **Browser Loads** - `index.html` fetches `data.json` and renders dashboard

## Support

For issues or questions:
1. Check the GitHub Actions workflow logs
2. Verify Jira credentials and API token
3. Ensure JQL query matches your project setup

---

Made with ❤️ for better sprint visibility
