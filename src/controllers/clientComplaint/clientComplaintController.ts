import { Request, Response } from "express";
import ClientComplaint, { IClientComplaint } from "../../models/clientComplaint/clientComplaintModel";
import User from "../../models/users/userModel";
import ProfileModel from "../../models/profile/profileModel";

export const createClientComplaint = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const clientComplaint = new ClientComplaint({
        ...req.body,
      });
      await clientComplaint.save();
      res.status(201).json(clientComplaint);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(400).json({ error: "An unknown error occurred" });
      }
    }
  };
  
  export const updateClientComplaint = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const { id } = req.params;
    const {
      ReceivedFrom,
      PendingAtTheEndOfLastMonth,
      Received,
      Resolved,
      TotalPending,
      PendingMoreThanThreeMonths,
      AverageResolutionTime,
    } = req.body;
    try {
      const updatedClientComplaint: IClientComplaint | null = await ClientComplaint.findByIdAndUpdate(
        id,
        {
            ReceivedFrom,
            PendingAtTheEndOfLastMonth,
            Received,
            Resolved,
            TotalPending,
            PendingMoreThanThreeMonths,
            AverageResolutionTime,
        },
        { new: true }
      );
      if (!updatedClientComplaint) {
        res.status(404).json({ error: "ClientComplaint not found" });
      } else {
        res.status(200).json(updatedClientComplaint);
      }
    } catch (error) {
      console.error("Error updating ClientComplaint:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
  
  
  
  export const getAllClientComplaint = async (
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
                PendingAtTheEndOfLastMonth:1,
                Received:1,
                Resolved:1,
                TotalPending:1,
                PendingMoreThanThreeMonths:1,
                AverageResolutionTime:1,
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
    let ClientComplaints = [] as any[];

    if (isReadUser) {
      const ClientComplaintData = await ClientComplaint.aggregate(pipeLine);
      ClientComplaints = ClientComplaintData;
      const totalClientComplaint = await ClientComplaint.countDocuments();
      return res.status(200).json({
        page: pageNumber,
        pageSize: limitNumber,
        totalPages: Math.ceil(totalClientComplaint / limitNumber),
        totalClientComplaint,
        ClientComplaints:ClientComplaintData,
        permission,
      });
    } else {
      return res.status(200).json({
        page: pageNumber,
        pageSize: limitNumber,
        totalPages: 0,
        totalClientComplaint: 0,
        ClientComplaints,
        permission,
      });
    }
  } catch (error) {
    console.error("Error fetching ClientComplaint:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
    