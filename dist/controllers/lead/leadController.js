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
exports.getAllLeads = exports.updateLead = exports.getLeadById = exports.createLead = void 0;
const leadModel_1 = __importDefault(require("../../models/lead/leadModel"));
const userModel_1 = __importDefault(require("../../models/users/userModel"));
const profileModel_1 = __importDefault(require("../../models/profile/profileModel"));
const createLead = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const lead = new leadModel_1.default(Object.assign({}, req.body));
        yield lead.save();
        res.status(201).json(lead);
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
exports.createLead = createLead;
const getLeadById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const lead = yield leadModel_1.default.findById(id);
        if (!lead) {
            res.status(404).json({ error: "Lead not found" });
        }
        else {
            res.status(200).json(lead);
        }
    }
    catch (error) {
        console.error("Error fetching lead by ID:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.getLeadById = getLeadById;
const updateLead = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { name, email, phone, language, message } = req.body;
    try {
        const updatedLead = yield leadModel_1.default.findByIdAndUpdate(id, {
            name,
            email,
            phone,
            language,
            message,
        }, { new: true });
        if (!updatedLead) {
            res.status(404).json({ error: "Lead not found" });
        }
        else {
            res.status(200).json(updatedLead);
        }
    }
    catch (error) {
        console.error("Error updating lead:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.updateLead = updateLead;
const getAllLeads = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { pageSize, page, searchQuery, sortBy } = req.body;
    // Default values
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
        }
        else {
            pipeLine.unshift({ $match: {} });
        }
        const me = yield userModel_1.default.findOne({ _id: req.userId });
        const permission = yield profileModel_1.default.findOne({
            _id: me === null || me === void 0 ? void 0 : me.role,
            status: true,
        });
        const isReadUser = permission === null || permission === void 0 ? void 0 : permission.permission.leads.view;
        let leads = [];
        if (isReadUser) {
            const leadData = yield leadModel_1.default.aggregate(pipeLine);
            leads = leadData;
            const totalLeads = yield leadModel_1.default.countDocuments();
            return res.status(200).json({
                page: pageNumber,
                pageSize: limitNumber,
                totalPages: Math.ceil(totalLeads / limitNumber),
                totalLeads,
                leads,
                permission,
            });
        }
        else {
            return res.status(200).json({
                page: pageNumber,
                pageSize: limitNumber,
                totalPages: 0,
                totalLeads: 0,
                leads,
                permission,
            });
        }
    }
    catch (error) {
        console.error("Error fetching leads:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});
exports.getAllLeads = getAllLeads;
