import mongoose, { Document, Schema } from "mongoose";

export interface ILead extends Document {
  name: string;
  phone: string;
  email: string;
  language: string;
  message: string;
}

const leadSchema: Schema = new Schema<ILead>(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    language: { type: String, required: true },
    message: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const Lead = mongoose.model<ILead>("Lead", leadSchema);

export default Lead;
