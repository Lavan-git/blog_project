import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import config from '../config/index.js';
import type { User as IUser } from '@repo/shared';

// Extend the interface for Mongoose document
export interface IUserDocument extends Omit<IUser, '_id'>, Document {
  _id: string;
  password: string;
  refreshTokens: string[];
  comparePassword(candidatePassword: string): Promise<boolean>;
  toPublic(): IUser;
}

// User schema
const userSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [50, 'Name must be less than 50 characters long'],
      index: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      maxlength: [128, 'Password must be less than 128 characters long'],
      select: false, // Don't include password in queries by default
    },
    refreshTokens: {
      type: [String],
      default: [],
      select: false, // Don't include refresh tokens in queries by default
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete (ret as any).password;
        delete (ret as any).refreshTokens;
        delete (ret as any).__v;
        return ret;
      },
    },
    toObject: {
      transform: function (doc, ret) {
        delete (ret as any).password;
        delete (ret as any).refreshTokens;
        delete (ret as any).__v;
        return ret;
      },
    },
  }
);

// Indexes
userSchema.index({ createdAt: -1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(config.security.bcryptRounds);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Instance method to compare password
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Instance method to get public user data
userSchema.methods.toPublic = function (): IUser {
  const userObj = this.toObject();
  return {
    _id: userObj._id.toString(),
    name: userObj.name,
    email: userObj.email,
    createdAt: userObj.createdAt,
    updatedAt: userObj.updatedAt,
  };
};

// Static method to find user with password (for authentication)
userSchema.statics.findByEmailWithPassword = function (email: string) {
  return this.findOne({ email }).select('+password +refreshTokens');
};

// Static method to find user by refresh token
userSchema.statics.findByRefreshToken = function (refreshToken: string) {
  return this.findOne({ refreshTokens: refreshToken }).select('+refreshTokens');
};

// Virtual for posts count (can be populated later)
userSchema.virtual('postsCount', {
  ref: 'Post',
  localField: '_id',
  foreignField: 'author',
  count: true,
});

// Export the model
export const User = model<IUserDocument>('User', userSchema);
export default User;
