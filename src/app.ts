import express, { Application, Request, Response } from "express";
import { SpecialtyRoute } from "./app/module/specialty/specialty.route";
import { IndexRoute } from "./app/routes";
import { any } from "better-auth";
import { globalErrorHandler } from "./app/middleware/GlobalErrorHandeler";
import notFoundMiddleware from "./app/middleware/notFound";
import cookieParser from "cookie-parser";

const app: Application = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/api/v1", IndexRoute);

app.get("/", (req: Request, res: Response) => {
    res.send("Hello, World!");
});

app.use(globalErrorHandler);
app.use(notFoundMiddleware);

export default app;
