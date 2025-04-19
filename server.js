const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const axios = require('axios');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcryptjs');
const session = require('express-session');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'pinterest-automation-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production', 
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// User credentials - in a real app, store these in a database
const users = [
  {
    username: 'admin',
    // Default password is "pinterest2025" - change this immediately after first login
    passwordHash: '$2a$10$.6xvDLu0BXNpUBu6.pEeVeOhZMXt3eHJYzW/REA1hhooo7kImSdia'
  }
];

// Authentication routes
app.get('/login', (req, res) => {
  if (req.session.authenticated) {
    return res.redirect('/');
  }
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  const user = users.find(u => u.username === username);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  bcrypt.compare(password, user.passwordHash, (err, isMatch) => {
    if (err || !isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    req.session.authenticated = true;
    req.session.username = username;
    res.json({ success: true });
  });
});

app.get('/api/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

// Authentication middleware for protecting routes
function requireAuth(req, res, next) {
  if (req.session.authenticated) {
    return next();
  }
  
  // If requesting an API endpoint, return 401
  if (req.path.startsWith('/api/')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  // Otherwise redirect to login page
  res.redirect('/login');
}

// Apply authentication to all routes except login and help
app.use((req, res, next) => {
  if (req.path === '/login' || req.path === '/api/login' || req.path.includes('/help/')) {
    return next();
  }
  requireAuth(req, res, next);
});

// Serve static files after authentication middleware
app.use(express.static(path.join(__dirname)));

// Google Sheets API setup
const sheets = google.sheets('v4');
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

// Make.com webhook URL (would be set in .env file)
const MAKE_WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL || 'https://hook.eu2.make.com/your-webhook-id';

// Routes
app.get('/api/content', async (req, res) => {
    try {
        const content = await getContentFromGoogleSheets();
        res.json(content);
    } catch (error) {
        console.error('Error fetching content:', error);
        res.status(500).json({ error: 'Failed to fetch content' });
    }
});

app.post('/api/content', async (req, res) => {
    try {
        const { theme, aiTool, notes } = req.body;
        
        if (!theme || !aiTool) {
            return res.status(400).json({ error: 'Theme and AI Tool are required' });
        }
        
        // Add to Google Sheets
        await addRowToGoogleSheets({ theme, aiTool, notes });
        
        // Trigger Make.com workflow (optional)
        await triggerMakeWorkflow({ theme, aiTool, notes });
        
        res.json({ success: true, message: 'Content added successfully' });
    } catch (error) {
        console.error('Error adding content:', error);
        res.status(500).json({ error: 'Failed to add content' });
    }
});

app.get('/api/stats', async (req, res) => {
    try {
        // In a real app, this would fetch actual stats from Pinterest API
        // For now, return mock data
        res.json({
            impressions: 156,
            saves: 42,
            clicks: 18,
            comments: 5,
            totalPosts: 24,
            status: 'Active',
            lastRun: '2025-04-18T10:15:00Z',
            nextRun: '2025-04-18T10:45:00Z',
            frequency: 'Every 30 minutes'
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

app.get('/api/activity', async (req, res) => {
    try {
        // In a real app, this would fetch actual activity from logs
        // For now, return mock data
        res.json([
            {
                type: 'success',
                message: 'Pin created: "5 Advanced ChatGPT Image Creation Tips"',
                timestamp: '2025-04-18T10:15:00Z'
            },
            {
                type: 'error',
                message: 'Error: Failed to generate image for "Data Analysis with Claude"',
                timestamp: '2025-04-17T15:30:00Z'
            },
            {
                type: 'info',
                message: 'New content added: "Prompt Engineering for Images"',
                timestamp: '2025-04-17T14:20:00Z'
            },
            {
                type: 'success',
                message: 'Pin created: "How Claude\'s Research Function Transforms Data Analysis"',
                timestamp: '2025-04-16T11:45:00Z'
            }
        ]);
    } catch (error) {
        console.error('Error fetching activity:', error);
        res.status(500).json({ error: 'Failed to fetch activity' });
    }
});

// Help API endpoint
app.get('/api/help/:section', (req, res) => {
    const section = req.params.section;
    const helpContent = {
        dashboard: {
            title: "Dashboard Overview",
            content: "The dashboard provides a complete view of your Pinterest automation. Monitor your content queue, automation status, performance metrics, and recent activity all in one place."
        },
        content: {
            title: "Content Management",
            content: "Add new content ideas to your queue by clicking 'Add New Content'. Each entry requires a Theme (what the pin is about) and AI Tool (ChatGPT or Claude). The system will automatically generate and post pins based on your queue."
        },
        analytics: {
            title: "Analytics & Performance",
            content: "Track your Pinterest performance with key metrics including impressions, saves, clicks, and comments. The Quick Stats panel shows your current performance at a glance."
        },
        automation: {
            title: "Automation Settings",
            content: "The Automation Status panel shows when your automation last ran and when it will run next. The system automatically checks for new content to post based on your configured frequency."
        },
        settings: {
            title: "Account Settings",
            content: "Manage your account settings, update your password, and configure integration with Make.com and Pinterest from the Settings page."
        }
    };
    
    if (helpContent[section]) {
        res.json(helpContent[section]);
    } else {
        res.status(404).json({ error: 'Help section not found' });
    }
});

// Helper functions
async function getContentFromGoogleSheets() {
    // In a real app, this would use Google Sheets API to fetch data
    // For now, return mock data
    return [
        {
            id: '1',
            status: 'pending',
            theme: 'ChatGPT Image Creation Tips',
            aiTool: 'ChatGPT 4.0',
            scheduled: 'Next run',
            notes: 'Focus on prompt engineering for images'
        },
        {
            id: '2',
            status: 'pending',
            theme: 'Claude Research Function',
            aiTool: 'Claude',
            scheduled: 'Next run',
            notes: 'Highlight data analysis capabilities'
        },
        {
            id: '3',
            status: 'processed',
            theme: 'Prompt Engineering for Images',
            aiTool: 'ChatGPT 4.0',
            scheduled: '2025-04-17',
            notes: ''
        },
        {
            id: '4',
            status: 'error',
            theme: 'Data Analysis with Claude',
            aiTool: 'Claude',
            scheduled: '2025-04-16',
            notes: 'Error: DALL-E generation failed'
        }
    ];
}

async function addRowToGoogleSheets(data) {
    // In a real app, this would use Google Sheets API to add a row
    console.log('Adding to Google Sheets:', data);
    // Implementation would go here
    return true;
}

async function triggerMakeWorkflow(data) {
    // In a real app, this would trigger the Make.com workflow via webhook
    try {
        // const response = await axios.post(MAKE_WEBHOOK_URL, data);
        // return response.data;
        console.log('Triggering Make.com workflow:', data);
        return { success: true };
    } catch (error) {
        console.error('Error triggering Make.com workflow:', error);
        throw error;
    }
}

// Serve the frontend for any other routes
app.get('*', (req, res) => {
    if (!req.session.authenticated && !req.path.includes('/help/')) {
        return res.redirect('/login');
    }
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
