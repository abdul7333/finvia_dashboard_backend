import { Request, Response } from "express";
import monthlyComplaint, { ImonthlyComplaint } from "../../models/monthlyComplaint/monthlyComplaintModel";
import User from "../../models/users/userModel";
import ProfileModel from "../../models/profile/profileModel";


export const createmonthlyComplaint = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const monthlyComplaints = new monthlyComplaint({
        ...req.body,
      });
      await monthlyComplaints.save();
      res.status(201).json(monthlyComplaints);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(400).json({ error: "An unknown error occurred" });
      }
    }
  };
  
  export const updatemonthlyComplaint = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const { id } = req.params;
    const {
        ReceivedFrom,
        CarriedForwardFromPreviousMonth,
        Received,
        Resolved,
        Pending,
    } = req.body;
    try {
      const updatedmonthlyComplaint: ImonthlyComplaint | null = await monthlyComplaint.findByIdAndUpdate(
        id,
        {
            ReceivedFrom,
            CarriedForwardFromPreviousMonth,
            Received,
            Resolved,
            Pending,
        },
        { new: true }
      );
      if (!updatedmonthlyComplaint) {
        res.status(404).json({ error: "monthlyComplaints not found" });
      } else {
        res.status(200).json(updatedmonthlyComplaint);
      }            
    } catch (error) {
      console.error("Error updating monthlyComplaint:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
  
  
  
  export const getAllmonthlyComplaint = async (
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
                CarriedForwardFromPreviousMonth:1,
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

    let monthlyComplaints = [] as any[];

    if (isReadUser) {
      const monthlyComplaintData = await monthlyComplaint.aggregate(pipeLine);
      monthlyComplaints = monthlyComplaintData;
      const totalmonthlyComplaint = await monthlyComplaint.countDocuments();
      return res.status(200).json({
        page: pageNumber,
        pageSize: limitNumber,
        totalPages: Math.ceil(totalmonthlyComplaint / limitNumber),
        totalmonthlyComplaint,
        monthlyComplaints:monthlyComplaintData,
        permission,
      });
    } else {
      return res.status(200).json({
        page: pageNumber,
        pageSize: limitNumber,
        totalPages: 0,
        totalmonthlyComplaint: 0,
        monthlyComplaints,
        permission,
      });
    }
  } catch (error) {
    console.error("Error fetching monthlyComplaint:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
    