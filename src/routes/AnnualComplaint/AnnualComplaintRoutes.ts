import { Router } from "express";
import { createAnnualComplaint, getAllAnnualComplaint, updateAnnualComplaints } from "../../controllers/AnnualComplaint/AnnualComplaintcontroller";
import { isAuth } from "../../middlewares/auth";

const router = Router();

router.post("/createAnnualComplaint",isAuth, createAnnualComplaint);
router.post("/getAllAnnualComplaint",isAuth,getAllAnnualComplaint);
router.patch("/updateAnnualComplaints/:id", isAuth,updateAnnualComplaints);

export default router;
