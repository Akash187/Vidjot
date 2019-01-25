const express = require('express');
const exphbs = require('express-handlebars');

const app = express();

app.use(express.static('public'));
app.engine('hbs', exphbs({defaultLayout: 'main.hbs'}));
app.set('view engine', 'hbs');

app.get('/', (req, res) => {
  res.render('index', {title: 'Home Page', auth: true});
});

app.get('/login', (req, res) => {
  res.render('login', {title: 'Login Page'});
});

app.get('/register', (req, res) => {
  res.render('register', {title: 'Register Page'});
});

app.get('/about', (req, res) => {
  res.render('about', {title: 'About Page'});
});

app.get('/ideas', (req, res) => {
  res.render('ideas', {title: 'Ideas Page', auth: true, ideas: [{title: "Build a News Feed with Nuxt 2 and Firestore",
    detail: "Full CRUD functionality (create, read, update, delete) with the new real-time NoSQL Firestore Database Comprehensive work with News API in order to dynamically fetch top headlines around the world (by news category, by country, by news source, etc)."}, {title: "Build a News Feed with Nuxt 2 and Firestore",
      detail: "Full CRUD functionality (create, read, update, delete) with the new real-time NoSQL Firestore Database Comprehensive work with News API in order to dynamically fetch top headlines around the world (by news category, by country, by news source, etc)."}]});
});

app.get('/idea/add', (req, res) => {
  res.render('add', {title: 'Add Page', auth: true});
});

app.get('/idea/edit', (req, res) => {
  res.render('edit', {title: 'Edit Page', ideaTitle: 'Hello hi there!', auth: true});
});

app.listen(3000, () => {
  console.log('Server started at part 3000');
});