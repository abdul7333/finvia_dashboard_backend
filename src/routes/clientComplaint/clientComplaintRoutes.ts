import { Router } from "express";
import { createClientComplaint, getAllClientComplaint, updateClientComplaint } from "../../controllers/clientComplaint/clientComplaintController";
import { isAuth } from "../../middlewares/auth";

const router = Router();

router.post("/createClientComplaint",isAuth, createClientComplaint);
router.post("/getAllClientComplaint",isAuth, getAllClientComplaint);
router.patch("/updateClientComplaint/:id",isAuth,updateClientComplaint);

export default router;
