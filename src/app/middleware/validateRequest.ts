import { NextFunction, Request, Response } from "express";
import z from "zod";

export const validateRequest = (zodObject: z.ZodObject) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const parsedResult = zodObject.safeParse(req.body);

        if (!parsedResult.success) {
            next(parsedResult.error);
        }

        //sanitizing the data
        req.body = parsedResult.data;
        next();
    };
};
