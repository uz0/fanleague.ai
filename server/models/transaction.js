import mongoose from "mongoose";
let Schema = mongoose.Schema;

export default mongoose.model('Transactions', new Schema({
  userId: { type: String, required: true },
  amount: { type: Number, required: true },
  origin: { type: String, enum: ['user deposit', 'user withdraw', 'tournament deposit', 'tournament winning'], required: true },
  date: { type: Date, required: true }
}));