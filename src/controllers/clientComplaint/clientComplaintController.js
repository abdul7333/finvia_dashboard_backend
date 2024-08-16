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
exports.getAllClientComplaint = exports.updateClientComplaint = exports.createClientComplaint = void 0;
const clientComplaintModel_1 = __importDefault(require("../../models/clientComplaint/clientComplaintModel"));
const userModel_1 = __importDefault(require("../../models/users/userModel"));
const profileModel_1 = __importDefault(require("../../models/profile/profileModel"));
const createClientComplaint = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clientComplaint = new clientComplaintModel_1.default(Object.assign({}, req.body));
        yield clientComplaint.save();
        res.status(201).json(clientComplaint);
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
exports.createClientComplaint = createClientComplaint;
const updateClientComplaint = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { ReceivedFrom, PendingAtTheEndOfLastMonth, Received, Resolved, TotalPending, PendingMoreThanThreeMonths, AverageResolutionTime, } = req.body;
    try {
        const updatedClientComplaint = yield clientComplaintModel_1.default.findByIdAndUpdate(id, {
            ReceivedFrom,
            PendingAtTheEndOfLastMonth,
            Received,
            Resolved,
            TotalPending,
            PendingMoreThanThreeMonths,
            AverageResolutionTime,
        }, { new: true });
        if (!updatedClientComplaint) {
            res.status(404).json({ error: "ClientComplaint not found" });
        }
        else {
            res.status(200).json(updatedClientComplaint);
        }
    }
    catch (error) {
        console.error("Error updating ClientComplaint:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.updateClientComplaint = updateClientComplaint;
const getAllClientComplaint = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { pageSize, page, searchQuery, sortBy } = req.body;
    try {
        const pageNumber = +page;
        const limitNumber = +pageSize;
        const regexPattern = new RegExp(searchQuery, "i");
        const pipeLine = [
            {
                $project: {
                    ReceivedFrom: 1,
                    PendingAtTheEndOfLastMonth: 1,
                    Received: 1,
                    Resolved: 1,
                    TotalPending: 1,
                    PendingMoreThanThreeMonths: 1,
                    AverageResolutionTime: 1,
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
        let ClientComplaints = [];
        if (isReadUser) {
            const ClientComplaintData = yield clientComplaintModel_1.default.aggregate(pipeLine);
            ClientComplaints = ClientComplaintData;
            const totalClientComplaint = yield clientComplaintModel_1.default.countDocuments();
            return res.status(200).json({
                page: pageNumber,
                pageSize: limitNumber,
                totalPages: Math.ceil(totalClientComplaint / limitNumber),
                totalClientComplaint,
                ClientComplaints: ClientComplaintData,
                permission,
            });
        }
        else {
            return res.status(200).json({
                page: pageNumber,
                pageSize: limitNumber,
                totalPages: 0,
                totalClientComplaint: 0,
                ClientComplaints,
                permission,
            });
        }
    }
    catch (error) {
        console.error("Error fetching ClientComplaint:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});
exports.getAllClientComplaint = getAllClientComplaint;
