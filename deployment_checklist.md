# Pinterest Automation Dashboard - Deployment Checklist

This checklist will guide you through deploying your Pinterest Automation Dashboard to Render.com with password protection.

## Prerequisites

- [ ] Email address (any email works for GitHub, not necessarily a domain email)
- [ ] Make.com account with a configured workflow (for the webhook URL)
- [ ] Basic familiarity with GitHub (or willingness to follow step-by-step instructions)

## Step 1: Create a GitHub Account

- [ ] Go to [github.com](https://github.com)
- [ ] Click "Sign up" and follow the registration process
- [ ] Verify your email address

## Step 2: Create a GitHub Repository

- [ ] Log in to GitHub
- [ ] Click the "+" icon in the top right corner and select "New repository"
- [ ] Name it "pinterest-automation-dashboard"
- [ ] Set it to "Public" (or Private if you prefer)
- [ ] Click "Create repository"

## Step 3: Upload Files to GitHub

### Option A: Using GitHub Web Interface (Easiest)

- [ ] In your new repository, click "uploading an existing file" link
- [ ] Drag and drop all the files from the zip archive you downloaded
- [ ] Click "Commit changes"

### Option B: Using Git Command Line (Advanced)

- [ ] Install Git on your computer
- [ ] Clone your repository: `git clone https://github.com/YOUR_USERNAME/pinterest-automation-dashboard.git`
- [ ] Extract the zip archive into the cloned folder
- [ ] Run:
  ```
  git add .
  git commit -m "Initial commit"
  git push origin main
  ```

## Step 4: Create a Render.com Account

- [ ] Go to [render.com](https://render.com)
- [ ] Click "Sign Up" and follow the registration process
- [ ] Verify your email address

## Step 5: Connect Render to GitHub

- [ ] In Render dashboard, click "New" > "Web Service"
- [ ] Select "Build and deploy from a Git repository"
- [ ] Click "Connect GitHub" and authorize Render
- [ ] Select your "pinterest-automation-dashboard" repository

## Step 6: Configure Deployment Settings

- [ ] Name: pinterest-automation-dashboard
- [ ] Environment: Node
- [ ] Region: Choose closest to your location
- [ ] Branch: main
- [ ] Build Command: `npm install`
- [ ] Start Command: `npm start`
- [ ] Plan: Free

## Step 7: Set Environment Variables

- [ ] Scroll down to "Environment" section
- [ ] Add the following variables:
  - [ ] `SESSION_SECRET`: A random string (e.g., "pinterest-automation-secret-12345")
  - [ ] `NODE_ENV`: `production`
  - [ ] `MAKE_WEBHOOK_URL`: Your Make.com webhook URL (or a placeholder to update later)
  - [ ] `PORT`: `10000`

## Step 8: Deploy the Application

- [ ] Click "Create Web Service"
- [ ] Wait for deployment to complete (2-5 minutes)
- [ ] Note the URL provided by Render (e.g., https://pinterest-automation-dashboard.onrender.com)

## Step 9: Access Your Dashboard

- [ ] Visit your Render URL
- [ ] Log in with default credentials:
  - Username: `admin`
  - Password: `pinterest2025`
- [ ] Change your password immediately after first login

## Step 10: Connect to Make.com (Optional)

- [ ] In Make.com, create a webhook trigger
- [ ] Copy the webhook URL
- [ ] In Render dashboard, update the `MAKE_WEBHOOK_URL` environment variable

## Troubleshooting

If you encounter any issues:

1. Check Render logs for error messages
2. Verify all environment variables are set correctly
3. Ensure your package.json includes all required dependencies
4. Refer to the detailed deployment_guide.md for more information

## Security Reminders

- Change the default password immediately after deployment
- Use a strong, unique password
- Set a custom SESSION_SECRET environment variable
- Regularly update dependencies to maintain security
