import mongoose, { Document, Schema } from 'mongoose';

export interface IWeatherSnapshot extends Document {
    farmId: mongoose.Types.ObjectId;
    temperature: number;
    humidity: number;
    rainfall: number;
    windSpeed: number;
    forecast: any[];
    timestamp: Date;
    createdAt: Date;
    updatedAt: Date;
}

const WeatherSnapshotSchema = new Schema<IWeatherSnapshot>({
    farmId: { type: Schema.Types.ObjectId, ref: 'Farm', required: true },
    temperature: { type: Number, required: true },
    humidity: { type: Number, required: true },
    rainfall: { type: Number, required: true },
    windSpeed: { type: Number, required: true },
    forecast: [{ type: Schema.Types.Mixed }],
    timestamp: { type: Date, required: true }
}, { timestamps: true });

export default mongoose.model<IWeatherSnapshot>('WeatherSnapshot', WeatherSnapshotSchema);
