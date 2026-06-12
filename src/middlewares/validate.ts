import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

// This is a higher-order function. It takes a Zod schema and returns an Express middleware.
export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // schema.parse throws an error if the data doesn't match the schema
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next(); // If valid, proceed to the controller!
    } catch (error: any) {
      // If invalid, return a clean 400 Bad Request with the exact Zod errors
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.errors,
      });
    }
  };
};
