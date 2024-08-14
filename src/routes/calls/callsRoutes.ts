import { Router } from "express";
import {
  createCalls,
  getAllCalls,
  getAllCallsBar,
  getAllCallsSummary,
  getAllCallsWebsite,
  updateCalls,
} from "../../controllers/calls/callsController";
import { isAuth } from "../../middlewares/auth";

const router = Router();

router.post("/createCalls", isAuth ,createCalls);
router.post("/getAllCalls",isAuth, getAllCalls);
router.post("/getAllCallsBar", getAllCallsBar);
router.get("/getAllCallsSummary", getAllCallsSummary);
router.post("/getAllCallsWebsite", getAllCallsWebsite);
router.patch("/updateCalls/:id",isAuth, updateCalls);

export default router;
