import { Request } from "express";

export interface RequestWithHerotag extends Request {
  herotag?: string;
}
