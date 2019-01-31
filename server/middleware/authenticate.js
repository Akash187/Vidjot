const {User} = require('./../modals/user');

let authenticate = (req, res, next) => {
  let token = req.cookies['x-auth'];

  User.findByToken(token).then((user) => {
    if(!user){
      return Promise.reject('');
    }
    req.user = user;
    req.token = token;
    next();
  }).catch((e) => {
    res.redirect('/');
  })
};

module.exports = {
  authenticate
};