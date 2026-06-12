"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
// This is a higher-order function. It takes a Zod schema and returns an Express middleware.
const validate = (schema) => {
    return (req, res, next) => {
        try {
            // schema.parse throws an error if the data doesn't match the schema
            schema.parse({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            next(); // If valid, proceed to the controller!
        }
        catch (error) {
            // If invalid, return a clean 400 Bad Request with the exact Zod errors
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: error.errors,
            });
        }
    };
};
exports.validate = validate;
