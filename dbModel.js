import mongoose from 'mongoose';

const instance = mongoose.Schema({
  caption: String,
  user: String,
  imageURL: String,
  comments: [{
    username: String,
    text: String,
  }],
});

export default mongoose.model('posts', instance);
