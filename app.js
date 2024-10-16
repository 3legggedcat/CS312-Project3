import express from 'express';
import bodyParser from 'body-parser';
import expressLayouts from 'express-ejs-layouts';
import pkg from 'pg';  // Dynamically import the pg module
const { Client } = pkg;

const app = express();
const port = 3000;

// PostgreSQL connection
const client = new Client({
  user: 'pp3', 
  host: 'localhost',        
  database: 'BlogDB',       
  password: 'franz', 
  port: 5432,               
});

// Connect to PostgreSQL database with error handling
client.connect()
  .then(() => console.log('Connected to PostgreSQL database'))
  .catch(err => console.error('Connection error', err.stack));

// Set up EJS and layout engine
app.set('view engine', 'ejs');
app.use(expressLayouts);

// Middleware for parsing form data
app.use(bodyParser.urlencoded({ extended: true }));

// Homepage route - Display blog posts
app.get('/', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM blogs');
    const posts = result.rows;
    res.render('index', { posts });
  } catch (err) {
    console.error('Error fetching blog posts', err);
    res.status(500).send('Error fetching blog posts');
  }
});

// Sign Up Route
app.get('/signup', (req, res) => {
  res.render('signup');
});

app.post('/signup', async (req, res) => {
  const { name, password } = req.body;
  try {
    const result = await client.query('SELECT * FROM users WHERE name = $1', [name]);
    if (result.rows.length > 0) {
      res.send('Username already taken. Try another one.');
    } else {
      await client.query('INSERT INTO users (name, password) VALUES ($1, $2)', [name, password]);
      res.redirect('/login');
    }
  } catch (err) {
    console.error('Error during signup', err);
    res.status(500).send('Error during signup');
  }
});

// Login Route
app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', async (req, res) => {
  const { name, password } = req.body;
  try {
    const result = await client.query('SELECT * FROM users WHERE name = $1 AND password = $2', [name, password]);
    if (result.rows.length > 0) {
      res.redirect('/');
    } else {
      res.send('Invalid credentials, please try again.');
    }
  } catch (err) {
    console.error('Error during login', err);
    res.status(500).send('Error during login');
  }
});

// Post creation route
app.post('/new-post', async (req, res) => {
  const { name, title, body } = req.body;
  try {
    await client.query(
      'INSERT INTO blogs (creator_name, title, body, date_created) VALUES ($1, $2, $3, NOW())',
      [name, title, body]
    );
    res.redirect('/');
  } catch (err) {
    console.error('Error creating post', err);
    res.status(500).send('Error creating post');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
