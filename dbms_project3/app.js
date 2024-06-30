const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const app = express();
const port = 3000;

// Create MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',   // Replace with your MySQL username
  password: 'batman2003',   // Replace with your MySQL password
  database: 'batman'   // Replace with your MySQL database name
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('Connected to MySQL database');
  
  // Create users table if it doesn't exist
  const createTableSql = `CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
  )`;
  
  db.query(createTableSql, (err, result) => {
    if (err) {
      console.error('Error creating table', err);
    } else {
      console.log('Users table created or already exists');
    }
  });
});

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));

// Serve HTML file
// Corrected usage of res.send() with properly formatted multi-line string
app.get('/', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <title>User Registration</title>
          <style>
              body { font-family: Arial, sans-serif; }
              .container { max-width: 400px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
              .form-group { margin-bottom: 15px; }
              label { display: block; margin-bottom: 5px; }
              input { width: 100%; padding: 8px; box-sizing: border-box; }
              button { width: 100%; padding: 10px; background-color: #007bff; color: #fff; border: none; border-radius: 5px; cursor: pointer; }
              button:hover { background-color: #0056b3; }
          </style>
      </head>
      <body>
          <div class="container">
              <h2>User Registration</h2>
              <form id="registerForm">
                  <div class="form-group">
                      <label for="username">Username:</label>
                      <input type="text" id="username" name="username" required>
                  </div>
                  <div class="form-group">
                      <label for="email">Email:</label>
                      <input type="email" id="email" name="email" required>
                  </div>
                  <div class="form-group">
                      <label for="password">Password:</label>
                      <input type="password" id="password" name="password" required>
                  </div>
                  <button type="submit">Register</button>
              </form>
              <p id="message"></p>
          </div>
          <script>
              document.getElementById('registerForm').addEventListener('submit', function(event) {
                  event.preventDefault();
                  
                  const username = document.getElementById('username').value;
                  const email = document.getElementById('email').value;
                  const password = document.getElementById('password').value;
  
                  fetch('/register', {
                      method: 'POST',
                      headers: {
                          'Content-Type': 'application/json'
                      },
                      body: JSON.stringify({ username, email, password })
                  })
                  .then(response => {
                      if (!response.ok) {
                          throw new Error('Network response was not ok');
                      }
                      return response.text();
                  })
                  .then(data => {
                      document.getElementById('message').textContent = \`User registered successfully! ID: \${data}\`;
                      document.getElementById('registerForm').reset();  // Reset the form after successful registration
                  })
                  .catch(error => {
                      document.getElementById('message').textContent = \`Error: \${error.message}\`;
                  });
              });
          </script>
      </body>
      </html>
    `);
  });
  

// Route for handling user registration
app.post('/register', (req, res) => {
  const { username, email, password } = req.body;
  
  // Insert user data into MySQL
  const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
  db.query(sql, [username, email, password], (err, result) => {
    if (err) {
      console.error('Error registering user', err);
      res.status(500).send('Error registering user');
    } else {
      console.log('User registered with ID:', result.insertId);
      res.status(201).send(`${result.insertId}`); // Return the inserted ID to the frontend
    }
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
