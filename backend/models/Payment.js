
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const paymentSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  productName: { type: String, required: true },
  price: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);