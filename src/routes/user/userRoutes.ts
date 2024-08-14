import { Router } from "express";
import {
  createUser,
  getAllUsers,
  updatePassword,
  updateUser,
  userLogin,
  userLogout,
} from "../../controllers/user/userController";
import { isAuth } from "../../middlewares/auth";

const router = Router();

router.post("/createUser", isAuth, createUser);
router.post("/getallUsers", isAuth, getAllUsers);
router.patch("/updateUser/:id", isAuth, updateUser);
router.patch("/updatePassword/:id", isAuth, updatePassword);
router.post("/userLogin", userLogin);
router.post("/logout", userLogout);

export default router;
