let mongoose = require('mongoose');

//Mongoose model for ideas
let Idea = mongoose.model('Idea', {
  title: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  detail: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  updatedAt: {
    type: Number,
    required: true
  },
  _creator: {
    required: true,
    type: mongoose.Schema.Types.ObjectId
  }
});

module.exports = {Idea};