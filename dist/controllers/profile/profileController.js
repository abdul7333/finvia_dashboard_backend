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
exports.getAllProfiles = exports.getProfileById = exports.updateProfile = exports.createProfile = void 0;
const profileModel_1 = __importDefault(require("../../models/profile/profileModel"));
const userModel_1 = __importDefault(require("../../models/users/userModel"));
const createProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { profileName, status, permission } = req.body;
    try {
        const profile = new profileModel_1.default({
            profileName,
            status,
            permission,
        });
        yield profile.save();
        return res.status(201).json(profile);
    }
    catch (error) {
        console.error("Error creating profile:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});
exports.createProfile = createProfile;
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { profileName, status, permission } = req.body;
    try {
        const profile = yield profileModel_1.default.findByIdAndUpdate(id, { profileName, status, permission, updatedBy: req.userId }, { new: true });
        if (!profile) {
            res.status(404).json({ error: "Profile not found" });
        }
        else {
            res.status(200).json(profile);
        }
    }
    catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.updateProfile = updateProfile;
const getProfileById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const profile = yield profileModel_1.default.findById(req.params.id);
        if (!profile) {
            return res.status(404).json({ error: "Profile not found" });
        }
        return res.status(200).json(profile);
    }
    catch (error) {
        console.error("Error getting profile by ID:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});
exports.getProfileById = getProfileById;
const getAllProfiles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { pageSize, page, searchQuery } = req.body;
    try {
        const pageNumber = +page;
        const limitNumber = +pageSize;
        const regexPattern = new RegExp(searchQuery, "i");
        const pipeLine = [
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
        }
        else {
            pipeLine.unshift({ $match: {} });
        }
        const me = yield userModel_1.default.findOne({ _id: req.userId });
        const permission = yield profileModel_1.default.findOne({
            _id: me === null || me === void 0 ? void 0 : me.role,
            status: true,
        });
        const isReadUser = permission === null || permission === void 0 ? void 0 : permission.permission.profile.view;
        let profiles = [];
        if (isReadUser) {
            const profileData = yield profileModel_1.default.aggregate(pipeLine);
            profiles = profileData;
            const totalProfiles = yield profileModel_1.default.countDocuments();
            res.status(200).json({
                page: pageNumber,
                pagesize: limitNumber,
                totalPages: Math.ceil(totalProfiles / limitNumber),
                totalProfiles,
                profiles,
                permission,
            });
        }
        else {
            res.status(200).json({
                page: pageNumber,
                pagesize: limitNumber,
                totalPages: 0,
                totalProfiles: 0,
                profiles,
                permission,
            });
        }
    }
    catch (error) {
        console.error("Error getting all profiles:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.getAllProfiles = getAllProfiles;
