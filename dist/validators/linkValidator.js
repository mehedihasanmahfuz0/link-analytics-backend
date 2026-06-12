"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLinkSchema = void 0;
const zod_1 = require("zod");
exports.createLinkSchema = zod_1.z.object({
    body: zod_1.z.object({
        originalUrl: zod_1.z
            .string()
            .url("Must be a valid URL")
            .refine((url) => url.startsWith("http://") || url.startsWith("https://"), { message: "URL must start with http:// or https://" }),
    }),
});
