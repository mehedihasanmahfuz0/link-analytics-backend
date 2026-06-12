import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { userRepository } from "../repositories/userRepository";
import { logger } from "../config/logger";

const JWT_SECRET = process.env.JWT_SECRET!;

export const authService = {
  register: async (email: string, password: string) => {
    // 1. Check if user already exists
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error("Email already registered");
    }

    // 2. Hash the password (never store plain text passwords!)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Save to database
    const newUser = await userRepository.create(email, hashedPassword);

    logger.info({ userId: newUser.id }, "New user registered");
    return { id: newUser.id, email: newUser.email };
  },

  login: async (email: string, password: string) => {
    // 1. Find user
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new Error("Invalid email or password"); // Vague error for security!
    }

    // 2. Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error("Invalid email or password");
    }

    // 3. Generate JWT (Valid for 7 days)
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    logger.info({ userId: user.id }, "User logged in");
    return { token, user: { id: user.id, email: user.email } };
  },
};
