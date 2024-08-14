import mongoose, { Document, Schema } from "mongoose";

export interface IAnnualComplaint extends Document {
  ReceivedFrom: string;
  CarriedFromPrevMonth: string;
  Received: string;
  Resolved:string;
  Pending: string;
}

const AnnualComplaintSchema = new Schema<IAnnualComplaint>(
  {
    ReceivedFrom: { type: String, required: true},
    CarriedFromPrevMonth: { type: String, required: true ,default:"Nil"},
    Received: { type: String, required: true ,default:"Nil"},
    Resolved: { type: String, required: true ,default:"Nil"},
    Pending: { type: String, required: true ,default:"Nil"},
    
  },
  { timestamps: true }
);

const AnnualComplaint= mongoose.model<IAnnualComplaint>("AnnualComplaint", AnnualComplaintSchema);
export default AnnualComplaint;
