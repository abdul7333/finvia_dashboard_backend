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
exports.getAllCallsWebsite = exports.getAllCallsSummary = exports.getAllCallsBar = exports.getAllCalls = exports.updateCalls = exports.createCalls = void 0;
const callsModel_1 = __importDefault(require("../../models/calls/callsModel"));
const userModel_1 = __importDefault(require("../../models/users/userModel"));
const profileModel_1 = __importDefault(require("../../models/profile/profileModel"));
const createCalls = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const calls = new callsModel_1.default(Object.assign({}, req.body));
        yield calls.save();
        res.status(201).json(calls);
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
exports.createCalls = createCalls;
const updateCalls = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { stock, action, type, quantity, entry, target1, target2, stopLoss, booked, roi, PandL, status, } = req.body;
    try {
        const updatedCalls = yield callsModel_1.default.findByIdAndUpdate(id, {
            stock,
            action,
            type,
            quantity,
            entry,
            target1,
            target2,
            stopLoss,
            booked,
            roi,
            PandL,
            status,
        }, { new: true });
        if (!updatedCalls) {
            res.status(404).json({ error: "Calls not found" });
        }
        else {
            res.status(200).json(updatedCalls);
        }
    }
    catch (error) {
        console.error("Error updating Calls:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.updateCalls = updateCalls;
const getAllCalls = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { pageSize, page, searchQuery, sortBy } = req.body;
    try {
        const pageNumber = +page;
        const limitNumber = +pageSize;
        const regexPattern = new RegExp(searchQuery, "i");
        const pipeLine = [
            {
                $project: {
                    stock: 1,
                    action: 1,
                    type: 1,
                    quantity: 1,
                    entry: 1,
                    target1: 1,
                    target2: 1,
                    stopLoss: 1,
                    booked: 1,
                    roi: 1,
                    PandL: 1,
                    status: 1,
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
                        { stock: { $regex: regexPattern } },
                        { action: { $regex: regexPattern } },
                        { type: { $regex: regexPattern } },
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
        const isReadUser = permission === null || permission === void 0 ? void 0 : permission.permission.calls.view;
        let calls = [];
        if (isReadUser) {
            const CallsData = yield callsModel_1.default.aggregate(pipeLine);
            calls = CallsData;
            const totalCalls = yield callsModel_1.default.countDocuments();
            return res.status(200).json({
                page: pageNumber,
                pageSize: limitNumber,
                totalPages: Math.ceil(totalCalls / limitNumber),
                totalCalls,
                calls: CallsData,
                permission,
            });
        }
        else {
            return res.status(200).json({
                page: pageNumber,
                pageSize: limitNumber,
                totalPages: 0,
                totalCalls: 0,
                calls,
                permission,
            });
        }
    }
    catch (error) {
        console.error("Error fetching Calls:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});
exports.getAllCalls = getAllCalls;
const getAllCallsBar = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { filter } = req.body;
        const filterNumber = parseInt(filter);
        const pipeline = [
            {
                $sort: { createdAt: -1 }
            },
            {
                $addFields: {
                    month: { $month: "$createdAt" },
                    year: { $year: "$createdAt" }
                }
            },
            {
                $group: {
                    _id: { month: "$month", year: "$year" },
                    totalValue: {
                        $sum: "$PandL"
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    month: "$_id.month",
                    year: "$_id.year",
                    totalValue: 1
                }
            },
            {
                $sort: { year: -1, month: -1 }
            }
        ];
        if (filterNumber != 1 && filterNumber != -1) {
            pipeline.push({
                $limit: filterNumber
            });
            pipeline.push({
                $sort: { year: 1, month: 1 }
            });
        }
        else {
            const date = new Date();
            const month = date.getMonth();
            const year = date.getFullYear();
            if (filterNumber == 1) {
                const startOfMonth = new Date(year, month, 1);
                const endOfMonth = new Date(year, month + 1, 1);
                pipeline.splice(0, pipeline.length);
                pipeline.push({
                    $match: {
                        $expr: {
                            $and: [
                                { $gte: ["$createdAt", startOfMonth] },
                                { $lte: ["$createdAt", endOfMonth] }
                            ]
                        }
                    }
                });
            }
            if (filterNumber == -1) {
                const startOfThisMonth = new Date(year, month, 1);
                const startOfLastMonth = new Date(startOfThisMonth.getFullYear(), startOfThisMonth.getMonth() - 1, 1);
                const endOfLastMonth = new Date(startOfThisMonth.getTime() - 1);
                pipeline.splice(0, pipeline.length);
                pipeline.push({
                    $match: {
                        $expr: {
                            $and: [
                                { $gte: ["$createdAt", startOfLastMonth] },
                                { $lte: ["$createdAt", endOfLastMonth] }
                            ]
                        }
                    }
                });
            }
            pipeline.push({
                $group: {
                    _id: { $dayOfMonth: "$createdAt" },
                    totalValue: { $sum: "$PandL" }
                }
            }, {
                $project: {
                    _id: 0,
                    date: "$_id",
                    totalValue: 1
                }
            }, {
                $sort: { date: 1 }
            });
        }
        const CallsData = yield callsModel_1.default.aggregate(pipeline);
        return res.status(200).json({
            calls: CallsData
        });
    }
    catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
});
exports.getAllCallsBar = getAllCallsBar;
const getAllCallsSummary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pipeline = [
            {
                $sort: { createdAt: -1 }
            },
            {
                $limit: 500
            }
        ];
        const CallsSummary = yield callsModel_1.default.aggregate(pipeline);
        const totalCalls = yield callsModel_1.default.countDocuments();
        return res.status(200).json({
            calls: CallsSummary,
            totalCalls: totalCalls
        });
    }
    catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
});
exports.getAllCallsSummary = getAllCallsSummary;
const getAllCallsWebsite = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { pageSize, page, range } = req.body;
    try {
        const pageNumber = +page;
        const limitNumber = +pageSize;
        const pipeLine = [];
        if (range.startDate != "") {
            pipeLine.push({
                $match: {
                    $expr: {
                        $and: [
                            { $gte: ["$createdAt", new Date(range.startDate)] },
                            { $lte: ["$createdAt", new Date(range.endDate)] }
                        ]
                    }
                }
            });
        }
        pipeLine.push({
            $project: {
                stock: 1,
                action: 1,
                type: 1,
                quantity: 1,
                entry: 1,
                target1: 1,
                target2: 1,
                stopLoss: 1,
                booked: 1,
                roi: 1,
                PandL: 1,
                status: 1,
            },
        }, {
            $skip: +(pageNumber - 1) * limitNumber,
        }, {
            $limit: limitNumber,
        });
        const CallsData = yield callsModel_1.default.aggregate(pipeLine);
        const totalCalls = yield callsModel_1.default.countDocuments();
        return res.status(200).json({
            page: pageNumber,
            pageSize: limitNumber,
            totalPages: Math.ceil(totalCalls / limitNumber),
            totalCalls,
            calls: CallsData
        });
    }
    catch (error) {
        console.error("Error fetching Calls:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});
exports.getAllCallsWebsite = getAllCallsWebsite;
