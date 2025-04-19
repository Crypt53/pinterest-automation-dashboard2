# Pinterest Automation Web Dashboard - Deployment Guide

This document provides instructions for deploying the Pinterest Automation Web Dashboard to make it permanently accessible online with password protection.

## Project Overview

The Pinterest Automation Web Dashboard is a full-stack web application that provides a user-friendly interface for managing your Pinterest content automation. It connects to your Google Sheets data source and Make.com workflow to allow you to:

- View your content queue
- Add new content ideas
- Monitor posting status
- View performance statistics
- Track automation activity

## Security Features

This application includes built-in security features:

- **Password Protection**: The application requires login credentials to access
- **Session Management**: User sessions are securely managed and expire after 24 hours
- **Protected Routes**: All routes and API endpoints are protected from unauthorized access
- **Secure Cookies**: Session cookies are secured when deployed to production

## Default Credentials

The application comes with default credentials that you should change after first login:
- Username: `admin`
- Password: `pinterest2025`

## Deployment on Render.com (Recommended)

Render provides a simple, secure option for deploying this application with password protection.

### Step 1: Prepare Your Repository

1. Create a GitHub account if you don't have one
2. Create a new repository named "pinterest-automation-dashboard"
3. Push all the application files to this repository

### Step 2: Create a Render Account

1. Go to [render.com](https://render.com) and sign up
2. You can sign up with your GitHub account for easier integration

### Step 3: Deploy as a Web Service

1. From your Render dashboard, click "New" > "Web Service"
2. Connect to your GitHub repository
3. Configure the service:
   - **Name**: pinterest-automation-dashboard
   - **Environment**: Node
   - **Region**: Choose the closest to your location
   - **Branch**: main (or master, depending on your GitHub setup)
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (sufficient for starting out)

### Step 4: Configure Environment Variables

1. Scroll down to the "Environment" section
2. Add the following key-value pairs:
   - `SESSION_SECRET`: A long, random string (e.g., `pinterest-automation-secret-key-12345`)
   - `NODE_ENV`: `production` (this enables secure cookies)
   - `MAKE_WEBHOOK_URL`: Your Make.com webhook URL
   - `PORT`: `10000` (Render will override this, but it's good practice)

3. Optional but recommended:
   - `ADMIN_USERNAME`: Set a custom admin username
   - `ADMIN_PASSWORD_HASH`: Generate a new bcrypt hash for your password (see instructions below)

### Step 5: Create a Custom Password

To change the default password:

1. Visit [bcrypt-generator.com](https://bcrypt-generator.com/) or a similar tool
2. Enter your desired password
3. Generate a bcrypt hash (use cost factor 10)
4. Add this hash as the `ADMIN_PASSWORD_HASH` environment variable in Render

Alternatively, after deploying, you can change your password through the application's settings page.

### Step 6: Deploy Your Application

1. Click "Create Web Service"
2. Wait for the deployment to complete (typically 2-5 minutes)
3. Render will provide a URL like `https://pinterest-automation-dashboard.onrender.com`

### Step 7: Access Your Secure Dashboard

1. Visit your Render URL
2. You'll be redirected to the login page
3. Enter the default credentials (or your custom ones if configured):
   - Username: `admin` (or your custom username)
   - Password: `pinterest2025` (or your custom password)
4. After first login, go to Settings to change your password

## Connecting to Make.com

To connect your deployed web application to your Make.com workflow:

1. In Make.com, create a new webhook trigger
2. Copy the webhook URL
3. Add this URL as the `MAKE_WEBHOOK_URL` environment variable in your Render deployment
4. The application will automatically use this webhook to trigger your Make.com workflow when new content is added

## Connecting to Google Sheets (Optional)

To connect to your Google Sheets for real data:

1. Create a Google Cloud project
2. Enable the Google Sheets API
3. Create a service account and download the credentials JSON file
4. Share your Google Sheet with the service account email
5. Add the credentials JSON content as the `GOOGLE_CREDENTIALS` environment variable in Render
6. Update the spreadsheet ID in the server.js file

## Custom Domain Setup (Optional)

For a more professional appearance, you can use a custom domain:

1. Purchase a domain from a provider like Namecheap or GoDaddy
2. In your Render dashboard:
   - Select your web service
   - Go to "Settings" > "Custom Domain"
   - Click "Add Custom Domain"
   - Enter your domain name
   - Follow the instructions to configure DNS settings at your domain provider

3. Wait for DNS propagation (can take up to 48 hours)

## Automatic Updates

Render automatically sets up continuous deployment from your GitHub repository:

1. Whenever you push changes to your GitHub repository, Render will automatically rebuild and redeploy your application
2. To update your application:
   - Make changes to your local files
   - Commit and push to GitHub
   - Render will automatically deploy the updates

## Troubleshooting

### Login Issues

- If you can't log in with the default credentials, check that your environment variables are set correctly
- If you've forgotten your password, you'll need to update the `ADMIN_PASSWORD_HASH` environment variable in Render

### Deployment Failures

- Check the Render logs for error messages
- Common issues include missing environment variables or dependencies
- Ensure your package.json includes all required dependencies: express, express-session, bcryptjs, etc.

### API Connection Problems

- If the dashboard can't connect to Make.com, verify your webhook URL is correct
- For Google Sheets issues, check that your service account has proper permissions

## Security Best Practices

1. **Change default credentials immediately** after first deployment
2. Use a **strong, unique password**
3. Set a **custom SESSION_SECRET** environment variable
4. Enable **HTTPS** (Render does this automatically)
5. Regularly **update dependencies** to patch security vulnerabilities

## Support and Maintenance

Once deployed, your application will run continuously. Monitor it periodically to ensure it's functioning correctly and update dependencies as needed to maintain security.

If you encounter any issues with deployment or need further customization, please reach out for assistance.
