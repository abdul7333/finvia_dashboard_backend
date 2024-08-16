import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User, { IUser } from "../../models/users/userModel";
import { JWT_TOKEN } from "../../env-variables";
import ProfileModel from "../../models/profile/profileModel";

export const createUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { name, email, phone, role, status, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser: IUser = new User({
      name,
      email,
      phone,
      role,
      status,
      password: hashedPassword,
    });
    await newUser.save();
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: newUser,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const userLogin = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    const user: IUser | null = await User.findOne({ email, status: true });

    if (!user) {
      res.status(404).json({ error: "User not found or User not active " });
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      res.status(401).json({ error: "Invalid password" });
      return;
    }

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
      },
      JWT_TOKEN!,
      { expiresIn: "1d" }
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const userLogout = async (_: Request, res: Response) => {
  res.clearCookie("token");
  res.clearCookie("next-token");
  res.status(200).json({ success: true, message: "Logged out" });
};

export const updateUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { name, email, phone, status, role } = req.body;

  try {
    const updateData: Partial<IUser> = { name, email, phone, status, role };

    const updatedUser: IUser | null = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updatedUser) {
      res.status(404).json({ error: "User not found" });
    } else {
      res.status(200).json({
        success: true,
        message: "User updated successfully",
        user: updatedUser,
      });
    }
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updatePassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { password } = req.body;

  try {
    const updateData: Partial<IUser> = { password };

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    const updatedUser: IUser | null = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updatedUser) {
      res.status(404).json({ error: "User not found" });
    } else {
      res.status(200).json({
        success: true,
        message: "User updated successfully",
        user: updatedUser,
      });
    }
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { pageSize, page, searchQuery, sortBy } = req.body;

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
          role: 1,
          password: 1,
          status: 1,
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
    const isReadUser = permission?.permission.users.view;

    let users = [] as any[];
    const roles = await ProfileModel.find({});
    if (isReadUser) {
      const userData = await User.aggregate(pipeLine);
      users = userData;
      const totalUsers = await User.countDocuments();
      return res.status(200).json({
        page: pageNumber,
        pageSize: limitNumber,
        totalPages: Math.ceil(totalUsers / limitNumber),
        totalUsers,
        users,
        roles,
        permission,
      });
    } else {
      return res.status(200).json({
        page: pageNumber,
        pageSize: limitNumber,
        totalPages: 0,
        totalUsers: 0,
        users,
        roles,
        permission,
      });
    }
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
