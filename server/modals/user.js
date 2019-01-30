const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

// {
//   email: "andrew@example.com",
//   password: 'sdfdagfgvfgrgfvrdff',
//   tokens: [{
//     access: 'auth',
//     token: 'dfgfdgrtgvtgfgtrgfbfgghfgsgfbfgg'
//   }]
// }

let UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  email: {
    type: String,
    required: true,
    minlength: 1,
    trim: true,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: `{Value} is not a valid email.`
    }
  },
  password: {
    type: String,
    require: true,
    minlength: 6
  },
  tokens: [{
    access: {
      type: String,
      require: true
    },
    token:{
      type: String,
      require: true
    }
  }]
});

UserSchema.methods.toJSON = function(){
  let user = this;
  let userObject = user.toObject();
  return _.pick(userObject, ['_id', 'name', 'email']);
};

UserSchema.methods.generateAuthToken = function(){
  let user = this;
  let access = 'auth';
  let token = jwt.sign({_id: user._id.toString(), access}, process.env.JWT_SECRET).toString();
  user.tokens = user.tokens.concat([{access, token}]);
  return user.save().then(() => {
    return token;
  })
};

UserSchema.methods.removeToken = function(token){
  let user = this;
  return user.update({
    $pull: {
      tokens : { token }
    }
  })
};

UserSchema.statics.findByToken = function (token) {
  let User = this;
  let decoded;
  try{
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  }catch(e){
    // return new Promise((resolve, reject) => {
    //   reject();
    // });
    return Promise.reject('');
  }
  return User.findOne({
    '_id': decoded._id,
    'tokens.token': token,
    'tokens.access' : 'auth'
  })
};

UserSchema.statics.findByCredentials = function (email, password) {
  let User = this;
  return User.findOne({email}).then((user) => {
    if(!user){
      return Promise.reject();
    }
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (err, res) => {
        if(res === true){
          resolve(user);
        }
        else{
          reject()
        }
      });
    })
  })
};

//Mongoose Middleware
UserSchema.pre('save', function (next) {
  let user = this;

  if(user.isModified('password')){
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        // Store hash in your password DB.
        user.password = hash;
        next();
      });
    });
  }else{
    next();
  }
});

let User = mongoose.model('User', UserSchema);

module.exports = {User};