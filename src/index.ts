import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { config, validateEnv } from "./config/env";
import { errorHandler } from "./middleware/error-handler";
import { notFoundHandler } from "./middleware/not-found-handler";
import { generalLimiter } from "./middleware/rate-limiter";
import { healthRouter } from "./routes/health";
import { exampleRouter } from "./routes/example";
import { usersRouter } from "./routes/users";

// Validate environment variables
validateEnv();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());
app.use(morgan("combined"));

// Rate limiting (only in production)
if (config.NODE_ENV === "production") {
    app.use(generalLimiter);
}

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/health", healthRouter);
app.use("/example", exampleRouter);
app.use("/users", usersRouter);

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const server = app.listen(config.PORT, () => {
    console.log(`🚀 Server running on port ${config.PORT}`);
    console.log(`🌍 Environment: ${config.NODE_ENV}`);
    console.log(
        `📊 Health check available at http://localhost:${config.PORT}/health`,
    );
});

// Graceful shutdown
process.on("SIGTERM", () => {
    console.log("SIGTERM received, shutting down gracefully");
    server.close(() => {
        console.log("Process terminated");
        process.exit(0);
    });
});

process.on("SIGINT", () => {
    console.log("SIGINT received, shutting down gracefully");
    server.close(() => {
        console.log("Process terminated");
        process.exit(0);
    });
});

export default app;
