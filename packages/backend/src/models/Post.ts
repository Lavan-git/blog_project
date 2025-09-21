import { Schema, model, Document, Types } from 'mongoose';
import type { Post as IPost } from '@repo/shared';

// Extend the interface for Mongoose document
export interface IPostDocument extends Omit<IPost, '_id' | 'author'>, Document {
  _id: string;
  author: Types.ObjectId;
}

// Post schema
const postSchema = new Schema<IPostDocument>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [1, 'Title cannot be empty'],
      maxlength: [200, 'Title must be less than 200 characters long'],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      minlength: [1, 'Content cannot be empty'],
      maxlength: [10000, 'Content must be less than 10000 characters long'],
      index: 'text', // Text index for search
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: function (tags: string[]) {
          return tags.length <= 10;
        },
        message: 'Maximum 10 tags allowed',
      },
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required'],
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete (ret as any).__v;
        return ret;
      },
    },
    toObject: {
      transform: function (doc, ret) {
        delete (ret as any).__v;
        return ret;
      },
    },
  }
);

// Indexes for efficient querying
postSchema.index({ author: 1, createdAt: -1 }); // Main compound index for user posts
postSchema.index({ createdAt: -1 }); // For general post listing
postSchema.index({ tags: 1 }); // For tag-based filtering

// Text search index
postSchema.index({
  title: 'text',
  content: 'text',
  tags: 'text',
});

// Pre middleware to populate author info
postSchema.pre(/^find/, function (next) {
  (this as any).populate({
    path: 'author',
    select: 'name email',
  });
  next();
});

// Virtual for excerpt (first 150 characters of content)
postSchema.virtual('excerpt').get(function () {
  return this.content.length > 150 
    ? this.content.substring(0, 150) + '...' 
    : this.content;
});

// Virtual for reading time estimate (words per minute: 200)
postSchema.virtual('readingTime').get(function () {
  const wordCount = this.content.split(/\s+/).length;
  const readingTimeMinutes = Math.ceil(wordCount / 200);
  return readingTimeMinutes;
});

// Static method to find posts with pagination and filtering
postSchema.statics.findWithFilters = function (filters: {
  author?: string;
  search?: string;
  tags?: string | string[];
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) {
  const {
    author,
    search,
    tags,
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = filters;

  const query: any = {};

  if (author) {
    query.author = author;
  }

  if (search) {
    query.$text = { $search: search };
  }

  if (tags) {
    const tagArray = Array.isArray(tags) ? tags : [tags];
    query.tags = { $in: tagArray };
  }

  const sortOptions: any = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const skip = (page - 1) * limit;

  return {
    query: this.find(query).sort(sortOptions).skip(skip).limit(limit),
    countQuery: this.countDocuments(query),
  };
};

// Static method to get posts by tag with count
postSchema.statics.getTagsWithCounts = function (authorId?: string) {
  const matchStage: any = {};
  if (authorId) {
    matchStage.author = new Types.ObjectId(authorId);
  }

  return this.aggregate([
    { $match: matchStage },
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort: { count: -1, _id: 1 } },
  ]);
};

// Static method to get post statistics
postSchema.statics.getStats = function (authorId?: string) {
  const matchStage: any = {};
  if (authorId) {
    matchStage.author = new Types.ObjectId(authorId);
  }

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalPosts: { $sum: 1 },
        totalWords: {
          $sum: {
            $size: {
              $split: ['$content', ' '],
            },
          },
        },
        avgWordsPerPost: {
          $avg: {
            $size: {
              $split: ['$content', ' '],
            },
          },
        },
        totalTags: {
          $sum: { $size: '$tags' },
        },
        uniqueTags: { $addToSet: '$tags' },
      },
    },
    {
      $project: {
        _id: 0,
        totalPosts: 1,
        totalWords: 1,
        avgWordsPerPost: { $round: ['$avgWordsPerPost', 0] },
        totalTags: 1,
        uniqueTagsCount: { $size: { $reduce: {
          input: '$uniqueTags',
          initialValue: [],
          in: { $setUnion: ['$$value', '$$this'] },
        }}},
      },
    },
  ]);
};

// Export the model
export const Post = model<IPostDocument>('Post', postSchema);
export default Post;
