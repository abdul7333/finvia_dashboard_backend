import { Request, Response } from "express";
import ProfileModel, { IProfile } from "../../models/profile/profileModel";
import User from "../../models/users/userModel";

export const createProfile = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { profileName, status, permission } = req.body;
  try {
    const profile: IProfile = new ProfileModel({
      profileName,
      status,
      permission,
    });
    await profile.save();
    return res.status(201).json(profile);
  } catch (error) {
    console.error("Error creating profile:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const updateProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { profileName, status, permission } = req.body;
  try {
    const profile: IProfile | null = await ProfileModel.findByIdAndUpdate(
      id,
      { profileName, status, permission, updatedBy: (req as any).userId },
      { new: true }
    );
    if (!profile) {
      res.status(404).json({ error: "Profile not found" });
    } else {
      res.status(200).json(profile);
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getProfileById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const profile = await ProfileModel.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }
    return res.status(200).json(profile);
  } catch (error) {
    console.error("Error getting profile by ID:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllProfiles = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { pageSize, page, searchQuery } = req.body;
  try {
    const pageNumber = +page;
    const limitNumber = +pageSize;
    const regexPattern = new RegExp(searchQuery as string, "i");

    const pipeLine: Array<any> = [
      {
        $project: {
          profileName: 1,
          status: 1,
          permission: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $skip: +(pageNumber - 1) * limitNumber,
      },
      {
        $limit: limitNumber,
      },
    ];

    if (searchQuery && searchQuery.length) {
      pipeLine.unshift({
        $match: {
          $or: [
            { profileName: { $regex: regexPattern } },
            { status: { $regex: regexPattern } },
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
    const isReadUser = permission?.permission.profile.view;

    let profiles = [] as any[];

    if (isReadUser) {
      const profileData = await ProfileModel.aggregate(pipeLine);
      profiles = profileData;
      const totalProfiles = await ProfileModel.countDocuments();

      res.status(200).json({
        page: pageNumber,
        pagesize: limitNumber,
        totalPages: Math.ceil(totalProfiles / limitNumber),
        totalProfiles,
        profiles,
        permission,
      });
    } else {
      res.status(200).json({
        page: pageNumber,
        pagesize: limitNumber,
        totalPages: 0,
        totalProfiles: 0,
        profiles,
        permission,
      });
    }
  } catch (error) {
    console.error("Error getting all profiles:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
