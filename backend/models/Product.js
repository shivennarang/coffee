const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  coffeeName: { type: String, required: true },
  rate: { type: Number, required: true },
  photo: { type: String, required: true },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;