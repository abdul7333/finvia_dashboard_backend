import mongoose, { Document, Schema } from "mongoose";

export interface ICalls extends Document {
  stock: string;
  action: string;
  type: string;
  quantity: number;
  entry: number;
  target1:number;
  target2:number;
  stopLoss: number;
  booked:number;
  roi:number;
  PandL:number;
  status:string;
  createdAt:Date;
  updatedAt:Date;
}

const CallsSchema = new Schema<ICalls>(
  {
    stock: { type: String, required: true },
    action: { type: String, required: true },
    type: { type: String, required: true },
    quantity: { type: Number, required: true },
    entry: { type: Number, required: true },
    target1: { type: Number, required: true },
    target2: { type: Number, required: true },
    stopLoss: { type: Number, required: true },
    booked: { type: Number, required: true },
    roi: { type: Number, required: true },
    PandL: { type: Number, required: true },
    status: { type: String, required: true },
    createdAt:{type:Date,required:true},
    updatedAt:{type:Date,required:true},
  },
  { timestamps: true }
);

const Calls = mongoose.model<ICalls>("Calls", CallsSchema);
export default Calls;
