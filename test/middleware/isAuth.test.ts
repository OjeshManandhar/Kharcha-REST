// packages
import sinon from 'sinon';
// import jwt from 'jsonwebtoken';
import { expect } from 'chai';

// utils
import CustomError from './../../src/utils/customError';

// middleware
import isAuth from './../../src/middleware/isAuth';

// env
import * as env_config from './../../src/env_config';

// types
import type { Request, Response, NextFunction } from 'express';

describe('Authorization middleware', () => {
  const mockRes: Partial<Response> = {};

  let mockReq: Partial<Request>;
  let mockNext: Partial<NextFunction>;

  beforeEach(() => {
    mockReq = {};
    mockNext = () => {};
  });

  afterEach(() => {
    sinon.restore();
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

  it("should call next(CustomError('JWT error')) and req.isAuth = false when JWT_SECRET is undefined", () => {
    const jwtSecretStub = sinon.stub(env_config, 'JWT_SECRET').value(undefined);

    mockReq.headers = { authorization: 'Bearer token' };

    mockNext = (args: any) => {
      expect(args)
        .to.be.an.instanceOf(CustomError)
        .that.has.property('message', 'JWT error');
      expect(mockReq).to.have.property('isAuth', false);
    };

    isAuth(mockReq as Request, mockRes as Response, mockNext as NextFunction);

    jwtSecretStub.restore();
  });

  it("should call next(CustomError('Invalid Token')) and req.isAuth = false when token in invalid", done => {
    mockReq.headers = { authorization: 'Bearer token' };

    mockNext = (args: any) => {
      expect(args).to.be.an.instanceOf(CustomError);
      expect(args).to.have.property('message', 'Invalid Token');
      expect(args).to.have.property('status', 401);
      expect(mockReq).to.have.property('isAuth', false);

      done();
    };

    isAuth(mockReq as Request, mockRes as Response, mockNext as NextFunction);
  }).timeout(5 * 1000);
});
