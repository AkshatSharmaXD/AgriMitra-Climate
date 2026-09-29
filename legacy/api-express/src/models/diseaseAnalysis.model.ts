import mongoose, { Document, Schema } from 'mongoose';

export interface IDiseaseAnalysis extends Document {
    farmId: mongoose.Types.ObjectId;
    crop: string;
    imageUrl: string;
    disease: string;
    confidence: number;
    source: string;
    timestamp: Date;
    createdAt: Date;
    updatedAt: Date;
}

const DiseaseAnalysisSchema = new Schema<IDiseaseAnalysis>({
    farmId: { type: Schema.Types.ObjectId, ref: 'Farm', required: true },
    crop: { type: String, required: true },
    imageUrl: { type: String, required: true },
    disease: { type: String, required: true },
    confidence: { type: Number, required: true },
    source: { type: String, required: true },
    timestamp: { type: Date, required: true }
}, { timestamps: true });

export default mongoose.model<IDiseaseAnalysis>('DiseaseAnalysis', DiseaseAnalysisSchema);
