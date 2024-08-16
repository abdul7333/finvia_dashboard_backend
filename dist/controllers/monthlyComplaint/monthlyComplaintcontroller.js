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
exports.getAllmonthlyComplaint = exports.updatemonthlyComplaint = exports.createmonthlyComplaint = void 0;
const monthlyComplaintModel_1 = __importDefault(require("../../models/monthlyComplaint/monthlyComplaintModel"));
const userModel_1 = __importDefault(require("../../models/users/userModel"));
const profileModel_1 = __importDefault(require("../../models/profile/profileModel"));
const createmonthlyComplaint = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const monthlyComplaints = new monthlyComplaintModel_1.default(Object.assign({}, req.body));
        yield monthlyComplaints.save();
        res.status(201).json(monthlyComplaints);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        }
        else {
            res.status(400).json({ error: "An unknown error occurred" });
        }
    }
});
exports.createmonthlyComplaint = createmonthlyComplaint;
const updatemonthlyComplaint = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { ReceivedFrom, CarriedForwardFromPreviousMonth, Received, Resolved, Pending, } = req.body;
    try {
        const updatedmonthlyComplaint = yield monthlyComplaintModel_1.default.findByIdAndUpdate(id, {
            ReceivedFrom,
            CarriedForwardFromPreviousMonth,
            Received,
            Resolved,
            Pending,
        }, { new: true });
        if (!updatedmonthlyComplaint) {
            res.status(404).json({ error: "monthlyComplaints not found" });
        }
        else {
            res.status(200).json(updatedmonthlyComplaint);
        }
    }
    catch (error) {
        console.error("Error updating monthlyComplaint:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.updatemonthlyComplaint = updatemonthlyComplaint;
const getAllmonthlyComplaint = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { pageSize, page, searchQuery, sortBy } = req.body;
    try {
        const pageNumber = +page;
        const limitNumber = +pageSize;
        const regexPattern = new RegExp(searchQuery, "i");
        const pipeLine = [
            {
                $project: {
                    ReceivedFrom: 1,
                    CarriedForwardFromPreviousMonth: 1,
                    Received: 1,
                    Resolved: 1,
                    Pending: 1,
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
        }
        else {
            pipeLine.unshift({ $match: {} });
        }
        const me = yield userModel_1.default.findOne({ _id: req.userId });
        const permission = yield profileModel_1.default.findOne({
            _id: me === null || me === void 0 ? void 0 : me.role,
            status: true,
        });
        const isReadUser = permission === null || permission === void 0 ? void 0 : permission.permission.Complaint.view;
        let monthlyComplaints = [];
        if (isReadUser) {
            const monthlyComplaintData = yield monthlyComplaintModel_1.default.aggregate(pipeLine);
            monthlyComplaints = monthlyComplaintData;
            const totalmonthlyComplaint = yield monthlyComplaintModel_1.default.countDocuments();
            return res.status(200).json({
                page: pageNumber,
                pageSize: limitNumber,
                totalPages: Math.ceil(totalmonthlyComplaint / limitNumber),
                totalmonthlyComplaint,
                monthlyComplaints: monthlyComplaintData,
                permission,
            });
        }
        else {
            return res.status(200).json({
                page: pageNumber,
                pageSize: limitNumber,
                totalPages: 0,
                totalmonthlyComplaint: 0,
                monthlyComplaints,
                permission,
            });
        }
    }
    catch (error) {
        console.error("Error fetching monthlyComplaint:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});
exports.getAllmonthlyComplaint = getAllmonthlyComplaint;
