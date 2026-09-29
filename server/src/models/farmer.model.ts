import mongoose, { Document, Schema } from 'mongoose';

export interface IFarmer extends Document {
    name: string;
    phone: string;
    language: 'en' | 'hi' | 'gu';
    createdAt: Date;
    updatedAt: Date;
}

const FarmerSchema = new Schema<IFarmer>({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    language: { type: String, enum: ['en', 'hi', 'gu'], default: 'en' }
}, { timestamps: true });

export default mongoose.model<IFarmer>('Farmer', FarmerSchema);
