const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const db = new sqlite3.Database(':memory:');

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize database
db.serialize(() => {
  db.run("CREATE TABLE products (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, price REAL, description TEXT, category TEXT, image TEXT)");
  db.run("INSERT INTO products (name, price, description, category, image) VALUES ('G-SHOCK Watch', 7880, 'Stylish G-SHOCK watch', 'Watches', '/images/g-shock.jpg')");
  db.run("INSERT INTO products (name, price, description, category, image) VALUES ('CASIO Digital Watch', 4980, 'Classic CASIO digital watch', 'Watches', '/images/casio-digital.jpg')");
  db.run("INSERT INTO products (name, price, description, category, image) VALUES ('G-SHOCK Silver', 36380, 'Premium G-SHOCK silver watch', 'Watches', '/images/g-shock-silver.jpg')");
  db.run("INSERT INTO products (name, price, description, category, image) VALUES ('G-SHOCK Rose Gold', 4980, 'Elegant G-SHOCK rose gold watch', 'Watches', '/images/g-shock-rose-gold.jpg')");
});

// Routes
app.get('/', (req, res) => {
  const { search, category } = req.query;
  let query = "SELECT * FROM products";
  let params = [];

  if (search) {
    query += " WHERE name LIKE ? OR description LIKE ?";
    params.push(`%${search}%`, `%${search}%`);
  }

  if (category) {
    query += search ? " AND" : " WHERE";
    query += " category = ?";
    params.push(category);
  }

  db.all(query, params, (err, products) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    } else {
      db.all("SELECT DISTINCT category FROM products", (err, categories) => {
        if (err) {
          console.error(err);
          res.status(500).send('Internal Server Error');
        } else {
          res.render('index', { products, categories, search, selectedCategory: category });
        }
      });
    }
  });
});

app.get('/admin', (req, res) => {
  db.all("SELECT * FROM products", (err, products) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    } else {
      res.render('admin', { products });
    }
  });
});

app.post('/admin/add', (req, res) => {
  const { name, price, description, category, image } = req.body;
  db.run("INSERT INTO products (name, price, description, category, image) VALUES (?, ?, ?, ?, ?)", 
    [name, price, description, category, image], 
    (err) => {
      if (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
      } else {
        res.redirect('/admin');
      }
    }
  );
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));