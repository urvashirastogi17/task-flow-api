import path from 'path';
import dotenv from 'dotenv';
dotenv.config({
    path: path.resolve(process.cwd(),".env"),
})
import {logger} from './utils/logger.js';
import http from "http";

import app from './app.js'
import connectDB from './db/index.js';

import { initSocket } from "../src/socket/index.js";

const PORT = process.env.PORT || 3000;

// CREATE HTTP SERVER
const server = http.createServer(app);

connectDB()

.then(()=>{

    // INITIALIZE SOCKET.IO
    initSocket(server);

    server.listen(PORT, ()=>{
        logger.info(`App is listening on PORT ${PORT}`)
    })
})

.catch((err)=>{
    console.log("MongoDb connection error", err)
    process.exit(1)
})