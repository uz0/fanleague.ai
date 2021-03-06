import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const refTo = schemaName => ({
  type: Schema.Types.ObjectId,
  ref: schemaName,
  default: null
});

const schema = new Schema({
  userId: refTo('User'),
  key: {
    type: String,
    unique: true
  },
  isClaimed: {
    type: Boolean,
    default: false
  },
  description: {
    type: String
  },
  image: {
    type: String
  }
});

export default mongoose.model('Reward', schema);
