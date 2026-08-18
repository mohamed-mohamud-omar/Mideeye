import mongoose from 'mongoose';

const authorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Author name is required'],
      trim: true
    },
    bio: {
      type: String,
      default: ''
    },
    photo: {
      type: String,
      default: ''
    },
    featured: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

export const Author = mongoose.model('Author', authorSchema);
