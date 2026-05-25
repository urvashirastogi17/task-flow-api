import winston from "winston";

const logger = winston.createLogger({      // create Centralized Logger object
    level: "info",                         // minimum log level - error,warn,info,http,debug
    format: winston.format.combine(        // combine multiple formatting rules

        winston.format.timestamp(),

        winston.format.printf(             // custom log structure
            ({level, message, timestamp}) =>{
                return `${timestamp} [${level.toUpperCase()}]: ${message}`; // 2026-05-24 [INFO]: Server started
            }
        )
    ),

    transports:[                           // where logs should go

        new winston.transports.Console(),   // terminal logs

        new winston.transports.File({      // save logs in files
            filename:"logs/combined.log"
        }),

        new winston.transports.File({
            filename:"logs/error.log",
            level:"error"
        })
    ]
});

export { logger};