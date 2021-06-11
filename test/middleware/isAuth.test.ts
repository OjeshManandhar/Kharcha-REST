// packages
import { expect } from 'chai';

// middleware
import isAuth from './../../src/middleware/isAuth';

// types
import type { Request, Response, NextFunction } from 'express';

describe('Authorization middleware', () => {
  const mockReq: Partial<Request> = {
    headers: {
      Authorization: 'Bearer qwertyuiop'
    }
  };
  const mockRes: Partial<Response> = {};
  const mockNext: Partial<NextFunction> = () => {};

  it('should have property isAuth as false', () => {
    isAuth(mockReq as Request, mockRes as Response, mockNext as NextFunction);
    expect(mockReq).to.have.property('isAuth', false);
  });
});
