import mongoose, { Document, Schema } from "mongoose";

export interface IClientComplaint extends Document {
  ReceivedFrom: string;
  PendingAtTheEndOfLastMonth: string;
  Received: string;
  Resolved:string;
  TotalPending: string;
  PendingMoreThanThreeMonths: string;
  AverageResolutionTime:string;
}

const ClientComplaintSchema = new Schema<IClientComplaint>(
  {
    ReceivedFrom: { type: String, required: true},
    PendingAtTheEndOfLastMonth: { type: String, required: true ,default:"Nil"},
    Received: { type: String, required: true ,default:"Nil"},
    Resolved: { type: String, required: true ,default:"Nil"},
    TotalPending: { type: String, required: true ,default:"Nil"},
    PendingMoreThanThreeMonths: { type: String, required: true,default:"Nil" },
    AverageResolutionTime: { type: String, required: true ,default:"Nil"},
    
  },
  { timestamps: true }
);

const ClientComplaint = mongoose.model<IClientComplaint>("ClientComplaint", ClientComplaintSchema);
export default ClientComplaint;
