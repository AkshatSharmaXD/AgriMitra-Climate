import mongoose, { Document, Schema } from 'mongoose';

export interface IFarmRisk extends Document {
    farmId: mongoose.Types.ObjectId;
    waterStress: number;
    heatStress: number;
    rainfallRisk: number;
    diseaseRisk: number;
    vegetationRisk: number;
    overallScore: number;
    level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    timestamp: Date;
    createdAt: Date;
    updatedAt: Date;
}

const FarmRiskSchema = new Schema<IFarmRisk>({
    farmId: { type: Schema.Types.ObjectId, ref: 'Farm', required: true },
    waterStress: { type: Number, required: true },
    heatStress: { type: Number, required: true },
    rainfallRisk: { type: Number, required: true },
    diseaseRisk: { type: Number, required: true },
    vegetationRisk: { type: Number, required: true },
    overallScore: { type: Number, required: true },
    level: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], required: true },
    timestamp: { type: Date, required: true }
}, { timestamps: true });

export default mongoose.model<IFarmRisk>('FarmRisk', FarmRiskSchema);
