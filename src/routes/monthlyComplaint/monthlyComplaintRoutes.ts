import { Router } from "express";
import { createmonthlyComplaint, getAllmonthlyComplaint, updatemonthlyComplaint } from "../../controllers/monthlyComplaint/monthlyComplaintcontroller";
import { isAuth } from "../../middlewares/auth";


const router = Router();

router.post("/createmonthlyComplaint",isAuth, createmonthlyComplaint);
router.post("/getAllmonthlyComplaint",isAuth, getAllmonthlyComplaint);
router.patch("/updatemonthlyComplaint/:id",isAuth, updatemonthlyComplaint);

export default router;
