// packages
import { expect } from 'chai';

// utils
import CustomError from './../../src/utils/customError';

// middleware
import isAuth from './../../src/middleware/isAuth';

// types
import type { Request, Response, NextFunction } from 'express';

describe('Authorization middleware', () => {
  let mockRes: Partial<Response>;
  let mockReq: Partial<Request>;
  let mockNext: Partial<NextFunction>;

  beforeEach(() => {
    mockReq = {};
    mockRes = {};
    mockNext = () => {};
  });

  it('should call next() and req.isAuth = false when req is {}', () => {
    mockNext = (args: any) => {
      expect(args).to.be.undefined;
      expect(mockReq).to.have.property('isAuth', false);
    };

    isAuth(mockReq as Request, mockRes as Response, mockNext as NextFunction);
  });

  it('should call next() and req.isAuth = false when req.headers is {}', () => {
    mockReq.headers = {};

    mockNext = (args: any) => {
      expect(args).to.be.undefined;
      expect(mockReq).to.have.property('isAuth', false);
    };

    isAuth(mockReq as Request, mockRes as Response, mockNext as NextFunction);
  });

  it('should call next() and req.isAuth = false when req.headers.authorization is single word', () => {
    mockReq.headers = { authorization: 'Bearer' };

    mockNext = (args: any) => {
      expect(args).to.be.undefined;
      expect(mockReq).to.have.property('isAuth', false);
    };

    isAuth(mockReq as Request, mockRes as Response, mockNext as NextFunction);
  });

  it("should call next() with CustomError('JWT error ') with JWT_SECRET is undefined", () => {
    mockReq.headers = { authorization: 'Bearer token' };

    mockNext = (args: any) => {
      expect(args).to.be.an.instanceOf(CustomError);
      expect(mockReq).to.have.property('isAuth', false);
    };

    isAuth(mockReq as Request, mockRes as Response, mockNext as NextFunction);
  });

  it('should have property isAuth as false', () => {
    const mockReq: Partial<Request> = {
      headers: {
        Authorization: 'Bearer qwertyuiop'
      }
    };
    const mockNext: Partial<NextFunction> = () => {};

    isAuth(mockReq as Request, mockRes as Response, mockNext as NextFunction);
    expect(mockReq).to.have.property('isAuth', false);
  });
});
