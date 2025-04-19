// Authentication middleware
const bcrypt = require('bcryptjs');
const session = require('express-session');

// Add these to your package.json dependencies
// "bcryptjs": "^2.4.3",
// "express-session": "^1.17.3",

// User credentials - in a real app, store these in a database
const users = [
  {
    username: 'admin',
    // Default password is "pinterest2025" - change this immediately after first login
    passwordHash: '$2a$10$XFE.tWJBL6WdO8xwVK5cBuRx9H.LwBGp.O4BICOh9HJXEfud5.Lsa'
  }
];

// Setup session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'pinterest-automation-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production', 
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

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

// Apply authentication to all routes except login
app.use((req, res, next) => {
  if (req.path === '/login' || req.path === '/api/login' || req.path.includes('/help/')) {
    return next();
  }
  requireAuth(req, res, next);
});

// Add this to your server.js file before the existing routes
