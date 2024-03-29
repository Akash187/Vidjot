const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
const moment = require('moment');
const _ = require('lodash');
require('dotenv').config();
const {authenticate} = require("./middleware/authenticate");
const cookieParser = require('cookie-parser');

const {mongoose} = require('./db/mongoose');
const {Idea} = require('./modals/idea');
const {User} = require("./modals/user");
const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cookieParser());

app.use(express.static(path.join(__dirname, '../public')));
app.engine('hbs', exphbs({defaultLayout: 'main.hbs'}));
app.set('view engine', 'hbs');

app.get('/', (req, res) => {
  let token = req.cookies['x-auth'];
  if(!token) {
    res.render('index', {title: 'Home Page'});
  }else{
    res.redirect('/home');
  }
});

app.get('/home', authenticate, (req, res) => {
  let name = req.cookies['name'];
  res.render('index', {title: 'Home Page', auth: true, name});
});

app.get('/about', (req, res) => {
  let name = req.cookies['name'];
  let token = req.cookies['x-auth'];
  if(!token) {
    res.render('about', {title: 'About Page'});
  }else{
    res.render('about', {title: 'About Page', auth: true, name});
  }
});

app.get('/ideas', authenticate, (req, res) => {
  Idea.find({_creator: req.user._id})
    .sort( { updatedAt: -1 })
    .then((ideas) => {
      const modifiedIdeas = ideas.map(idea =>
        ({updatedAt: moment.unix(idea.updatedAt).fromNow(), _id: idea._id, title: idea.title, detail: idea.detail})
      );
      let name = req.cookies['name'];
      res.render('ideas', {title: 'Ideas Page', auth: true, ideas: modifiedIdeas, name});
    }, (e) => {
      res.status(400).send(e);
    });
  }, (e) => {
    console.log("Error in get /ideas");
});

app.get('/idea/add', authenticate, (req, res) => {
  let name = req.cookies['name'];
  res.render('add', {title: 'Add Page', auth: true, name});
});

app.post('/idea/add', authenticate, (req, res) => {
  let idea = new Idea({
    title: req.body.title,
    detail: req.body.detail,
    updatedAt: moment().unix(),
    _creator: req.user._id,
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
      let name = req.cookies['name'];
      res.render('edit', {ideaTitle: idea[0].title, ideaDetail: idea[0].detail, id: idea[0]._id, auth: true, name});
    }).catch((e) => {
    res.status(400).send();
  })
});

app.put('/idea/edit/:id', authenticate, (req, res) => {
  let id = req.params.id;
  let body = _.pick(req.body, ['title', 'detail']);

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Idea.findOneAndUpdate(
    {_id :id, _creator: req.user._id},
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

app.delete('/idea/:id', authenticate, (req, res) => {
  let id = req.params.id;
  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }
  Idea.findOneAndRemove({
    _id: id,
    _creator: req.user._id
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
  let token = req.cookies['x-auth'];
  if(!token) {
    res.render('login', {title: 'Login Page'});
  }else{
    res.redirect('/home');
  }
});

app.post('/users/login', (req, res) => {
  let body = _.pick(req.body, ['email', 'password']);
  User.findByCredentials(body.email, body.password).then((user) => {
    return user.generateAuthToken().then((token) => {
      //cookie that will expire in one week (604800000 milliseconds).
      res.cookie('x-auth', token, { maxAge: 604800000, httpOnly: true, secure: true});
      res.cookie('name', user.name, { maxAge: 604800000, httpOnly: true, secure: true});
      res.send({user});
    });
  }).catch((e) => {
    res.status(400).send(e);
  })
});

app.get('/register', (req, res) => {
  let token = req.cookies['x-auth'];
  if(!token) {
    res.render('register', {title: 'Register Page'});
  }else{
    res.redirect('/home');
  }
});

app.post('/register', (req, res) => {
  let body = _.pick(req.body, ['name', 'email', 'password']);
  let user = new User(body);

  user.save().then(() => {
    return user.generateAuthToken();
  }).then((token) => {
    res.cookie('x-auth', token, { maxAge: 604800000, httpOnly: true, secure: true});
    res.cookie('name', user.name, { maxAge: 604800000, httpOnly: true, secure: true});
    res.send({user});
  }).catch((e) => {
    res.status(400).send(e);
  })
});

app.delete('/logout/me/', authenticate, (req, res) => {
  req.user.removeToken(req.token).then(() => {
    res.clearCookie('x-auth');
    res.clearCookie('name');
    res.status(200).send();
  }).catch((e) => {
    res.status(400).send();
  })
});

app.get('*', (req, res) => {
  res.render('404', {layout: false});
});

app.listen(port, () => {
  console.log('Server started at part 3000');
});