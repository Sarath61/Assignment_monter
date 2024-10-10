import { IUser } from "./Models/userModel";
import { Express } from "express-serve-static-core";
import { Jwt } from "jsonwebtoken";

declare module "xss-clean";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

declare module "jsonwebtoken" {
  export interface JwtVerifyPromisified {
    (token: string, secretOrPublicKey: string | Buffer): Promise<
      jwt.JwtPayload | string
    >;
  }
}
