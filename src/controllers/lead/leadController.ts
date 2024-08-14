import { Request, Response } from "express";
import Lead, { ILead } from "../../models/lead/leadModel";
import User from "../../models/users/userModel";
import ProfileModel from "../../models/profile/profileModel";

export const createLead = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const lead = new Lead({
      ...req.body,
    });
    await lead.save();
    res.status(201).json(lead);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: "An unknown error occurred" });
    }
  }
};

export const getLeadById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    const lead: ILead | null = await Lead.findById(id);

    if (!lead) {
      res.status(404).json({ error: "Lead not found" });
    } else {
      res.status(200).json(lead);
    }
  } catch (error) {
    console.error("Error fetching lead by ID:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateLead = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { name, email, phone, language, message } = req.body;
  try {
    const updatedLead: ILead | null = await Lead.findByIdAndUpdate(
      id,
      {
        name,
        email,
        phone,
        language,
        message,
      },
      { new: true }
    );
    if (!updatedLead) {
      res.status(404).json({ error: "Lead not found" });
    } else {
      res.status(200).json(updatedLead);
    }
  } catch (error) {
    console.error("Error updating lead:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllLeads = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { pageSize, page, searchQuery, sortBy } = req.body;

  // Default values
  const defaultPageSize = 10;
  const defaultPageNumber = 1;
  const defaultSortField = "createdAt";
  const defaultSortOrder = 1;

  try {
    const pageNumber = parseInt(page as string, 10) || defaultPageNumber;
    const limitNumber = parseInt(pageSize as string, 10) || defaultPageSize;

    if (
      isNaN(pageNumber) ||
      isNaN(limitNumber) ||
      pageNumber <= 0 ||
      limitNumber <= 0
    ) {
      console.error("Invalid page or pageSize:", {
        page,
        pageSize,
        pageNumber,
        limitNumber,
      });
      return res.status(400).json({ error: "Invalid page or pageSize" });
    }

    const regexPattern = new RegExp(searchQuery as string, "i");

    const sortField = sortBy?.field || defaultSortField;
    const sortOrder = parseInt(sortBy?.by, 10) || defaultSortOrder;

    const pipeLine: Array<any> = [
      {
        $project: {
          name: 1,
          phone: 1,
          email: 1,
          language: 1,
          message: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
      {
        $skip: (pageNumber - 1) * limitNumber,
      },
      {
        $limit: limitNumber,
      },
      { $sort: { [sortField]: sortOrder } },
    ];

    if (searchQuery && searchQuery.length) {
      pipeLine.unshift({
        $match: {
          $or: [
            { name: { $regex: regexPattern } },
            { email: { $regex: regexPattern } },
            { phone: { $regex: regexPattern } },
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
    const isReadUser = permission?.permission.leads.view;

    let leads = [] as any[];

    if (isReadUser) {
      const leadData = await Lead.aggregate(pipeLine);
      leads = leadData;
      const totalLeads = await Lead.countDocuments();
      return res.status(200).json({
        page: pageNumber,
        pageSize: limitNumber,
        totalPages: Math.ceil(totalLeads / limitNumber),
        totalLeads,
        leads,
        permission,
      });
    } else {
      return res.status(200).json({
        page: pageNumber,
        pageSize: limitNumber,
        totalPages: 0,
        totalLeads: 0,
        leads,
        permission,
      });
    }
  } catch (error) {
    console.error("Error fetching leads:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
