# GitHub Repository Setup - Step by Step

## What You'll Have

A fully automated dashboard that:
- ✅ Updates automatically every day at 9 AM UTC
- ✅ Displays unassigned work by parent epic & priority
- ✅ Shows effort by status and implementer
- ✅ Hosted free on GitHub Pages
- ✅ No server needed, no costs

## Step 1: Prepare Your Jira Credentials

### Get Jira Cloud ID
1. Open your Jira site: `https://your-site.atlassian.net`
2. Copy the ID part - e.g., if URL is `https://mycompany.atlassian.net`, the ID is `mycompany`
3. Actually, you need the full UUID. Go here: https://id.atlassian.com/manage-profile/security/api-tokens
4. Your Cloud ID is in the URL after `/cloud/`

### Create Jira API Token
1. Go to https://id.atlassian.com/manage-profile/security/api-tokens
2. Click **Create API token**
3. Give it a name: `GitHub Dashboard`
4. Copy the token (you'll only see it once!)
5. Save it somewhere safe

---

## Step 2: Create GitHub Repository

### Option A: Create New Repo
1. Go to https://github.com/new
2. **Repository name:** `mvs-dashboard`
3. **Description:** `MVS Sprint Effort Dashboard`
4. **Public** (so GitHub Pages works)
5. Click **Create repository**

### Option B: Use GitHub CLI
```bash
gh repo create mvs-dashboard --public --source=. --remote=origin --push
```

---

## Step 3: Add Files to Your Repo

You have **6 files** to upload. Choose one method:

### Method 1: GitHub Web UI (Easiest)
1. Go to your repo: `https://github.com/your-username/mvs-dashboard`
2. Click **Add file** → **Create new file** for each:
   - `index.html`
   - `fetch-jira-data.js`
   - `package.json`
   - `data.json`
   - `README.md`
3. Create folder `.github/workflows/` and add:
   - `refresh-dashboard.yml`
4. Create `.gitignore`

### Method 2: Git Command Line
```bash
# Clone your new repo
git clone https://github.com/your-username/mvs-dashboard
cd mvs-dashboard

# Create directory structure
mkdir -p .github/workflows

# Copy all files from this folder
# (Files are provided in a separate section below)

# Commit and push
git add .
git commit -m "Initial commit: add dashboard files"
git push origin main
```

---

## Step 4: Configure GitHub Secrets

1. Go to your repo
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**

### Secret 1: JIRA_CLOUD_ID
- **Name:** `JIRA_CLOUD_ID`
- **Value:** Your Jira Cloud ID (e.g., `12345678-1234-1234-1234-1234567890ab`)
- Click **Add secret**

### Secret 2: JIRA_API_TOKEN  
- **Name:** `JIRA_API_TOKEN`
- **Value:** Your Jira API token (the one you created earlier)
- Click **Add secret**

✅ Both secrets are now stored securely!

---

## Step 5: Enable GitHub Pages

1. In your repo, go to **Settings** → **Pages**
2. Under "Build and deployment":
   - **Source:** `Deploy from a branch`
   - **Branch:** `main` (or `master`)
   - **Folder:** `/ (root)`
3. Click **Save**
4. Wait 30 seconds, refresh the page
5. You should see: "Your site is live at `https://your-username.github.io/mvs-dashboard`"

---

## Step 6: Test the Dashboard

### Option 1: Run Workflow Manually (Recommended)
1. Go to **Actions** tab
2. Click **Refresh Dashboard Daily**
3. Click **Run workflow** → **Run workflow**
4. Wait 1-2 minutes for it to complete
5. Check the box to see if it says ✅ Success

### Option 2: Just Check It
If you already uploaded `data.json`, visit:
```
https://your-username.github.io/mvs-dashboard
```

You should see the dashboard with sample data!

---

## Step 7: Verify Daily Updates

The workflow will now run **automatically at 9 AM UTC every day**.

### To change the time:
1. Go to `.github/workflows/refresh-dashboard.yml`
2. Edit the `cron` line:
   ```yaml
   - cron: '0 9 * * *'  # Change the time here
   ```
3. Format: `minute hour day month weekday`
   - `0 9 * * *` = 9 AM UTC every day
   - `0 6 * * 1-5` = 6 AM UTC weekdays only
   - Use https://crontab.guru to generate times

---

## Troubleshooting

### Dashboard shows "Loading..." forever
❌ `data.json` wasn't created by the workflow
✅ Manually run the workflow from Actions tab

### Workflow fails (red ❌)
1. Click the failed run in Actions
2. Click the **Refresh Dashboard Daily** job
3. Look for the error message
4. Common issues:
   - Wrong Cloud ID or API token
   - Jira project name doesn't exist
   - API token is invalid or revoked

### Dashboard shows old data
✅ This is normal - it updates once per day
🔄 To refresh manually: go to Actions, run workflow

---

## File Reference

Here are all the files you need:

| File | Purpose |
|------|---------|
| `index.html` | The dashboard webpage |
| `fetch-jira-data.js` | Script that fetches Jira data |
| `package.json` | Node.js configuration |
| `data.json` | Data file (auto-generated, you can include sample) |
| `.github/workflows/refresh-dashboard.yml` | Automation script |
| `.gitignore` | Git configuration |
| `README.md` | Documentation |
| `SETUP.md` | This file |

---

## Access Your Dashboard

Once everything is set up:

```
https://your-username.github.io/mvs-dashboard
```

**Examples:**
- `https://john-doe.github.io/mvs-dashboard`
- `https://teamlead.github.io/mvs-dashboard`

Share this URL with your team! 🎉

---

## Next Steps

1. ✅ Set up the repo
2. ✅ Configure secrets
3. ✅ Test the workflow
4. ✅ Share the dashboard URL
5. 📊 Check daily updates

---

Need help? Check the `README.md` file for more details!
