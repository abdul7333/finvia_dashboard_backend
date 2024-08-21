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
    name: { type: String},
    phone: { type: String, required: true },
    email: { type: String, required: true },
    language: { type: String},
    message: { type: String},
  },
  {
    timestamps: true,
  }
);

const Lead = mongoose.model<ILead>("Lead", leadSchema);

export default Lead;
