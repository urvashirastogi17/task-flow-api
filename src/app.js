import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { errorHandler } from './middlewares/error.middleware.js';
import { limiter } from './middlewares/rateLimiter.middleware.js';
const app = express();

app.use(helmet());

app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({extended:true, limit:"16kb"}));
app.use(express.static("public"))
app.use(cookieParser())
app.use(cors({
    origin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",")
    : ["http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type"]
}));

app.use(morgan("dev"));
app.use(limiter);

import healthCheckRouter from './routes/healthcheck.routes.js';
import authRouter from './routes/auth.routes.js';
import adminRouter from './routes/admin.routes.js';
import taskRouter from './routes/task.routes.js';
app.use("/api/healthcheck", healthCheckRouter);
app.use("/api/auth", authRouter);
app.use("/api/tasks",taskRouter);
app.use("/api/admin",adminRouter);
app.use(errorHandler);

app.get('/',(req,res)=>{
    res.send("Working")
})

export default app;