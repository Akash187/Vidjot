const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
const moment = require('moment');
const _ = require('lodash');

const {mongoose} = require('./db/mongoose');
const {Idea} = require('./modals/idea');
const {User} = require("./modals/user");
const app = express();

app.use(bodyParser.json());

app.use(express.static('public'));
app.engine('hbs', exphbs({defaultLayout: 'main.hbs'}));
app.set('view engine', 'hbs');

app.get('/', (req, res) => {
  res.render('index', {title: 'Home Page', auth: true});
});

app.get('/about', (req, res) => {
  res.render('about', {title: 'About Page'});
});

app.get('/ideas', (req, res) => {
  Idea.find().sort( { updatedAt: -1 }) .then((ideas) => {
    const modifiedIdeas = ideas.map(idea =>
        ({updatedAt: moment.unix(idea.updatedAt).fromNow(), _id: idea._id, title: idea.title, detail: idea.detail})
    );
    res.render('ideas', {title: 'Ideas Page', auth: true, ideas: modifiedIdeas});
  }, (e) => {
    res.status(400).send(e);
  });
}, (e) => {
  console.log("Error in get /ideas");
});

app.get('/idea/add', (req, res) => {
  res.render('add', {title: 'Add Page', auth: true});
});

app.post('/idea/add', (req, res) => {
  console.log("Route Called!" + req.body.title + " " + req.body.detail);
  let idea = new Idea({
    title: req.body.title,
    detail: req.body.detail,
    updatedAt: moment().unix()
  });
  idea.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    res.status(400).send(e);
  });
}, (e) => {
  console.log("Error in post /idea/add");
});

app.get('/idea/edit/:id', (req, res) => {
  let id = req.params.id;

  Idea.find({_id :id})
    .then((idea) => {
      if (!idea) {
        return res.status(404).send();
      }
      res.render('edit', {ideaTitle: idea[0].title, ideaDetail: idea[0].detail, id: idea[0]._id, auth: true});
    }).catch((e) => {
    res.status(400).send();
  })
});

app.put('/idea/edit/:id', (req, res) => {
  let id = req.params.id;
  let body = _.pick(req.body, ['title', 'detail']);

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Idea.findOneAndUpdate(
    {_id :id},
    {$set: body},
    {new: true})
    .then((idea) => {
      if (!idea) {
        return res.status(404).send();
      }
      res.send({idea});
    }).catch((e) => {
    res.status(400).send();
  })
});

app.delete('/ideas/:id', (req, res) => {
  let id = req.params.id;
  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }
  Idea.findOneAndRemove({
    _id: id
  }).then((idea) => {
    if (!idea) {
      return res.status(404).send();
    }
    return res.send({idea});
  }).catch((e) => {
    res.status(400).send();
  });
});

app.get('/login', (req, res) => {
  res.render('login', {title: 'Login Page'});
});

app.get('/register', (req, res) => {
  res.render('register', {title: 'Register Page'});
});

app.post('/register', (req, res) => {
  let body = _.pick(req.body, ['name', 'email', 'password']);
  let user = new User(body);

  user.save().then(() => {
    return user.generateAuthToken();
  }).then((token) => {
    res.header('x-auth', token).send(user);
  }).catch((e) => {
    res.status(400).send(e);
  })
});

app.listen(3000, () => {
  console.log('Server started at part 3000');
});