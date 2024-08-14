import { Request, Response } from "express";
import AnnualComplaint, { IAnnualComplaint } from "../../models/AnnualComplaint/AnnualComplaintModel";
import User from "../../models/users/userModel";
import ProfileModel from "../../models/profile/profileModel";

export const createAnnualComplaint = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const AnnualComplaints = new AnnualComplaint({
        ...req.body,
      });
      await AnnualComplaints.save();
      res.status(201).json(AnnualComplaints);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(400).json({ error: "An unknown error occurred" });
      }
    }
  };
  
  export const updateAnnualComplaints = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const { id } = req.params;
    const {
        ReceivedFrom,
        CarriedFromPrevMonth,
        Received,
        Resolved,
        Pending,
    } = req.body;
    try {
      const updatedAnnualComplaint: IAnnualComplaint | null = await AnnualComplaint.findByIdAndUpdate(
        id,
        {
            ReceivedFrom,
            CarriedFromPrevMonth,
            Received,
            Resolved,
            Pending,
        },
        { new: true }
      );
      if (!updatedAnnualComplaint) {
        res.status(404).json({ error: "AnnualComplaint not found" });
      } else {
        res.status(200).json(updatedAnnualComplaint);
      }            
    } catch (error) {
      console.error("Error updating AnnualComplaint:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
  
  
  
  export const getAllAnnualComplaint = async (
      req: Request,
      res: Response
    ): Promise<Response> => {
      const { pageSize, page, searchQuery, sortBy } = req.body;
      try {
        const pageNumber = +page;
    
        const limitNumber = +pageSize;
    
        const regexPattern = new RegExp(searchQuery as string, "i");
        const pipeLine: Array<any> = [
          {
            $project: {
                ReceivedFrom:1,
                CarriedFromPrevMonth:1,
                Received:1,
                Resolved:1,
                Pending:1,
                createdAt: 1,
                updatedAt: 1,
            },
          },
          {
            $skip: +(pageNumber - 1) * limitNumber,
          },
          {
            $limit: limitNumber,
          },
          { $sort: { [sortBy.field]: +sortBy.by } },
        ];
    
    
        if (searchQuery && searchQuery.length) {
          pipeLine.unshift({
            $match: {
              $or: [
                { ReceivedFrom: { $regex: regexPattern } },
                { PendingAtTheEndOfLastMonth: { $regex: regexPattern } },
                { Received: { $regex: regexPattern } },
                { Resolved: { $regex: regexPattern } },
              ],
            },
          });
        } else {
          pipeLine.unshift({ $match: {} });
      }
      const me = await User.findOne({ _id: (req as any).userId });
      const permission = await ProfileModel.findOne({
      _id: me?.role,
      status: true,
      });
    const isReadUser = permission?.permission.Complaint.view;

    let AnnualComplaints = [] as any[];

    if (isReadUser) {
      const AnnualComplaintData = await AnnualComplaint.aggregate(pipeLine);
      AnnualComplaints = AnnualComplaintData;
      const totalAnnualComplaint = await AnnualComplaint.countDocuments();
      return res.status(200).json({
        page: pageNumber,
        pageSize: limitNumber,
        totalPages: Math.ceil(totalAnnualComplaint / limitNumber),
        totalAnnualComplaint,
        AnnualComplaints:AnnualComplaintData,
        permission,
      });
    } else {
      return res.status(200).json({
        page: pageNumber,
        pageSize: limitNumber,
        totalPages: 0,
        totalAnnualComplaint: 0,
        AnnualComplaints,
        permission,
      });
    }
  }  catch (error) {
    console.error("Error fetching AnnualComplaint:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
    