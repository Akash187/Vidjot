let mongoose = require('mongoose');

let Idea = mongoose.model('Idea', {
  title: {
    type: String,
    required: true,
    minlength: 1,
    unique: true,
    trim: true
  },
  detail: {
    type: String,
    required: true,
    minlength: 1,
    unique: true,
    trim: true
  },
  updatedAt: {
    type: Number,
    required: true
  }
});

module.exports = {Idea};