import { Router } from "express";
import { userRegisterValidator, userLoginValidator, userChangeCurrentPasswordValidator, userForgotPasswordvalidator, userResetForgotPasswordValidator } from "../validators/index.js";
import { validate } from "../middlewares/validators.middleware.js";
import { changePassword, forgotPassword, GetCurrentUser, loginUser, logoutUser, registerUser, resendEmailVerification, resetForgotPassword, updateAvatar, verifyEmail } from "../controllers/auth.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/register").post(userRegisterValidator(),validate, registerUser);

router.route("/login").post(userLoginValidator(), validate,loginUser);

router.route("/current-user").get(verifyJWT,GetCurrentUser );

router.route("/logout").post(verifyJWT, logoutUser);

router.route("/verify-email/:verificationToken").get(verifyEmail);

router.route("/resend-email-verification").post(verifyJWT,resendEmailVerification);

router.route("/forgot-password").post(userForgotPasswordvalidator(), validate, forgotPassword);

router.route("/reset-password/:resetToken").post(userResetForgotPasswordValidator(), validate, resetForgotPassword);

router.route("/change-password").post(userChangeCurrentPasswordValidator(), validate,verifyJWT, changePassword);

router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateAvatar);

export default router;