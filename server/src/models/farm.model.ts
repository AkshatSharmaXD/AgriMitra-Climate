import mongoose, { Document, Schema } from 'mongoose';

export interface ILocation {
    lat: number;
    lng: number;
}

export interface ISoil {
    type: string;
    moisture?: string;
    nitrogen?: string;
    phosphorus?: string;
    potassium?: string;
}

export interface IFarm extends Document {
    farmerId: mongoose.Types.ObjectId;
    location: ILocation;
    state: string;
    district: string;
    area: number;
    crop: string;
    season: 'Kharif' | 'Rabi' | 'Zaid';
    soil: ISoil;
    irrigation: string;
    isDemo?: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const SoilSchema = new Schema<ISoil>({
    type: { type: String, required: true },
    moisture: { type: String },
    nitrogen: { type: String },
    phosphorus: { type: String },
    potassium: { type: String }
}, { _id: false });

const FarmSchema = new Schema<IFarm>({
    farmerId: { type: Schema.Types.ObjectId, ref: 'Farmer', required: true, index: true },
    location: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
    },
    state: { type: String, required: true },
    district: { type: String, required: true, index: true },
    area: { type: Number, required: true },
    crop: { type: String, required: true },
    season: { type: String, enum: ['Kharif', 'Rabi', 'Zaid'], required: true },
    soil: { type: SoilSchema, required: true },
    irrigation: { type: String, required: true },
    isDemo: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model<IFarm>('Farm', FarmSchema);
