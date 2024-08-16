import { Request, Response, NextFunction } from "express";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import { JWT_TOKEN } from "../env-variables";

export const isAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const privateKey = JWT_TOKEN;
    const token = req.cookies["token"];
    if (!token) {
      res.status(401).json({
        success: false,
        error: "Unauthorized access",
        message: "No token found",
      });
      return;
    }

    jwt.verify(
      token,
      privateKey!,
      (err: JsonWebTokenError | null, decoded: any) => {
        if (err) {
          res.status(401).json({
            success: false,
            error: "Unauthorized access",
            message: err.message ?? "Invalid token",
          });
          return;
        } else {
          (req as any).userId = decoded.userId;
          next();
        }
      }
    );
  } catch (error) {
    console.error("Error in authentication middleware:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};
