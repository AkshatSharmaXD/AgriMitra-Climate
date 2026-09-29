import mongoose, { Document, Schema } from 'mongoose';

export interface IComment {
    author: string;
    text: string;
    timestamp: Date;
}

export interface IPost extends Document {
    author: string;
    title: string;
    content: string;
    likes: number;
    comments: IComment[];
    tag: string;
    createdAt: Date;
}

const CommentSchema = new Schema<IComment>({
    author: { type: String, required: true },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

const PostSchema = new Schema<IPost>({
    author: { type: String, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    likes: { type: Number, default: 0 },
    comments: [CommentSchema],
    tag: { type: String, default: 'General' },
}, { timestamps: true });

export default mongoose.model<IPost>('Post', PostSchema);
