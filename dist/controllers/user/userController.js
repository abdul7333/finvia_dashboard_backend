"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllUsers = exports.updatePassword = exports.updateUser = exports.userLogout = exports.userLogin = exports.createUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userModel_1 = __importDefault(require("../../models/users/userModel"));
const env_variables_1 = require("../../env-variables");
const profileModel_1 = __importDefault(require("../../models/profile/profileModel"));
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, phone, role, status, password } = req.body;
    try {
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const newUser = new userModel_1.default({
            name,
            email,
            phone,
            role,
            status,
            password: hashedPassword,
        });
        yield newUser.save();
        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: newUser,
        });
    }
    catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.createUser = createUser;
const userLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            res.status(400).json({ error: "Email and password are required" });
            return;
        }
        const user = yield userModel_1.default.findOne({ email, status: true });
        if (!user) {
            res.status(404).json({ error: "User not found or User not active " });
            return;
        }
        const passwordMatch = yield bcrypt_1.default.compare(password, user.password);
        if (!passwordMatch) {
            res.status(401).json({ error: "Invalid password" });
            return;
        }
        const token = jsonwebtoken_1.default.sign({
            userId: user._id,
            email: user.email,
            role: user.role,
        }, env_variables_1.JWT_TOKEN, { expiresIn: "1d" });
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
        });
        res.status(200).json({ message: "Login successful", token });
    }
    catch (error) {
        console.error("Error logging in user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.userLogin = userLogin;
const userLogout = (_, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.clearCookie("token");
    res.clearCookie("next-token");
    res.status(200).json({ success: true, message: "Logged out" });
});
exports.userLogout = userLogout;
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { name, email, phone, status, role } = req.body;
    try {
        const updateData = { name, email, phone, status, role };
        const updatedUser = yield userModel_1.default.findByIdAndUpdate(id, updateData, { new: true });
        if (!updatedUser) {
            res.status(404).json({ error: "User not found" });
        }
        else {
            res.status(200).json({
                success: true,
                message: "User updated successfully",
                user: updatedUser,
            });
        }
    }
    catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.updateUser = updateUser;
const updatePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { password } = req.body;
    try {
        const updateData = { password };
        if (password) {
            const hashedPassword = yield bcrypt_1.default.hash(password, 10);
            updateData.password = hashedPassword;
        }
        const updatedUser = yield userModel_1.default.findByIdAndUpdate(id, updateData, { new: true });
        if (!updatedUser) {
            res.status(404).json({ error: "User not found" });
        }
        else {
            res.status(200).json({
                success: true,
                message: "User updated successfully",
                user: updatedUser,
            });
        }
    }
    catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.updatePassword = updatePassword;
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { pageSize, page, searchQuery, sortBy } = req.body;
    const defaultPageSize = 10;
    const defaultPageNumber = 1;
    const defaultSortField = "createdAt";
    const defaultSortOrder = 1;
    try {
        const pageNumber = parseInt(page, 10) || defaultPageNumber;
        const limitNumber = parseInt(pageSize, 10) || defaultPageSize;
        if (isNaN(pageNumber) ||
            isNaN(limitNumber) ||
            pageNumber <= 0 ||
            limitNumber <= 0) {
            console.error("Invalid page or pageSize:", {
                page,
                pageSize,
                pageNumber,
                limitNumber,
            });
            return res.status(400).json({ error: "Invalid page or pageSize" });
        }
        const regexPattern = new RegExp(searchQuery, "i");
        const sortField = (sortBy === null || sortBy === void 0 ? void 0 : sortBy.field) || defaultSortField;
        const sortOrder = parseInt(sortBy === null || sortBy === void 0 ? void 0 : sortBy.by, 10) || defaultSortOrder;
        const pipeLine = [
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
        }
        else {
            pipeLine.unshift({ $match: {} });
        }
        const me = yield userModel_1.default.findOne({ _id: req.userId });
        const permission = yield profileModel_1.default.findOne({
            _id: me === null || me === void 0 ? void 0 : me.role,
            status: true,
        });
        const isReadUser = permission === null || permission === void 0 ? void 0 : permission.permission.users.view;
        let users = [];
        const roles = yield profileModel_1.default.find({});
        if (isReadUser) {
            const userData = yield userModel_1.default.aggregate(pipeLine);
            users = userData;
            const totalUsers = yield userModel_1.default.countDocuments();
            return res.status(200).json({
                page: pageNumber,
                pageSize: limitNumber,
                totalPages: Math.ceil(totalUsers / limitNumber),
                totalUsers,
                users,
                roles,
                permission,
            });
        }
        else {
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
    }
    catch (error) {
        console.error("Error fetching users:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});
exports.getAllUsers = getAllUsers;
