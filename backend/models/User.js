
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  coffeeShopName: { type: String },
  logo: { type: String },
  description: { type: String },
  address: { type: String },
  authorize: { type: Boolean, required: true },
});

const User = mongoose.model('User', userSchema);

module.exports = User;