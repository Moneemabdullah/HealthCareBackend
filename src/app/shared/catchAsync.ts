import { NextFunction, Request, RequestHandler, Response } from "express";

const catchAsync = (fn: RequestHandler) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await fn(req, res, next);
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: "An error occurred",
                error: error.message,
            });
        }
    };
};
export default catchAsync;
