const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// Middleware to parse JSON bodies
app.use(express.json());

// API routes
const passwordRoute = require('./routes/password');
app.use('/api/password', passwordRoute);
const uuidRoute = require('./routes/uuid');
app.use('/api/uuid', uuidRoute);
const excel2jsonRoute = require('./routes/excel2json');
app.use('/api/excel2json', excel2jsonRoute);
const json2tableRoute = require('./routes/json2table');
app.use('/api/json2table', json2tableRoute);
const htmltextRoute = require('./routes/htmltext');
app.use('/api/htmltext', htmltextRoute);

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// Main page route
app.get('/', (req, res) => {
  res.render('index');
});

// Serve the main page for all routes
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, '../public/index.html'));
// });

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📁 Serving static files from: ${path.join(__dirname, '../public')}`);
}); 