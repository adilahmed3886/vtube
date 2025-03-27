import { Request, Response, NextFunction } from "express";

type fn<R> = (req: Request, res: Response, next: NextFunction) => Promise<R>;

const asyncHandler = <R>(func: fn<R>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(func(req, res, next)).catch(next);
  };
};

export { asyncHandler };