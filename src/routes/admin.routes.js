import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/role.middleware.js';
import { adminDashboard } from '../controllers/admin.controllers.js';

const router = Router();

router.route("/dashboard").get(verifyJWT, authorizeRoles("ADMIN"), adminDashboard);

export default router;