import mongoose, { Document, Schema } from "mongoose";

export interface ImonthlyComplaint extends Document {
  ReceivedFrom: string;
  CarriedForwardFromPreviousMonth: string;
  Received: string;
  Resolved:string;
  Pending: string;
}

const monthlyComplaintSchema = new Schema<ImonthlyComplaint>(
  {
    ReceivedFrom: { type: String, required: true},
    CarriedForwardFromPreviousMonth: { type: String, required: true ,default:"Nil"},
    Received: { type: String, required: true ,default:"Nil"},
    Resolved: { type: String, required: true ,default:"Nil"},
    Pending: { type: String, required: true ,default:"Nil"},
    
  },
  { timestamps: true }
);

const monthlyComplaint = mongoose.model<ImonthlyComplaint>("MonthlyComplaint", monthlyComplaintSchema);
export default monthlyComplaint;
