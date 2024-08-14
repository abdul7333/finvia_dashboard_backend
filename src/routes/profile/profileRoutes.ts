import { Router } from "express";

import { isAuth } from "../../middlewares/auth";
import {
  createProfile,
  getAllProfiles,
  getProfileById,
  updateProfile,
} from "../../controllers/profile/profileController";

const router = Router();

router.post("/createProfile", isAuth, createProfile);
router.get("/getProfile/:id", isAuth, getProfileById);
router.post("/getAllProfiles", isAuth, getAllProfiles);
router.patch("/updateProfile/:id", isAuth, updateProfile);

export default router;
