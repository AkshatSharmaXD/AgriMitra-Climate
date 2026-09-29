import mongoose, { Document, Schema } from 'mongoose';

export interface ISatelliteSnapshot extends Document {
    farmId: mongoose.Types.ObjectId;
    ndvi: number;
    vegetationHealth: number;
    date: Date;
    source: string;
    createdAt: Date;
    updatedAt: Date;
}

const SatelliteSnapshotSchema = new Schema<ISatelliteSnapshot>({
    farmId: { type: Schema.Types.ObjectId, ref: 'Farm', required: true },
    ndvi: { type: Number, required: true },
    vegetationHealth: { type: Number, required: true },
    date: { type: Date, required: true },
    source: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model<ISatelliteSnapshot>('SatelliteSnapshot', SatelliteSnapshotSchema);
