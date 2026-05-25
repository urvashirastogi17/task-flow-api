import rateLimit from "express-rate-limit";

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // time window 15mins
    max:100,
    message: "Too many requests, please try later"
});

export {limiter};