import { Router } from "express";
import {
  createLead,
  getAllLeads,
  getLeadById,
  updateLead,
} from "../../controllers/lead/leadController";
import { isAuth } from "../../middlewares/auth";

const router = Router();

router.post("/createLead", createLead);
router.get("/getLead/:id", isAuth, getLeadById);
router.post("/getallLeads", isAuth, getAllLeads);
router.patch("/updateLead/:id", isAuth, updateLead);

export default router;
