// packages
import sinon from 'sinon';
import { expect } from 'chai';
import { Types } from 'mongoose';
import jwt, { TokenExpiredError } from 'jsonwebtoken';

// utils
import CustomError from './../../src/utils/customError';

// middleware
import isAuth from './../../src/middleware/isAuth';

// env
import * as env_config from './../../src/env_config';

// types
import type { Request, Response, NextFunction } from 'express';

describe('[isAuth] Authorization middleware', () => {
  const mockRes: Partial<Response> = {};

  let mockReq: Partial<Request>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {};
    mockNext = () => {
      return;
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('related to headers', () => {
    it('should call next() and req.isAuth = false when req is {}', () => {
      mockNext = (args: unknown) => {
        expect(args).to.be.undefined;

        expect(mockReq)
          .to.have.property('isAuth', false)
          .and.not.have.property('userId');
      };

      isAuth(mockReq as Request, mockRes as Response, mockNext as NextFunction);
    });

    it('should call next() and req.isAuth = false when req.headers is {}', () => {
      mockReq.headers = {};

      mockNext = (args: unknown) => {
        expect(args).to.be.undefined;

        expect(mockReq)
          .to.have.property('isAuth', false)
          .and.not.have.property('userId');
      };

      isAuth(mockReq as Request, mockRes as Response, mockNext as NextFunction);
    });

    it('should call next() and req.isAuth = false when req.headers.authorization is single word', () => {
      mockReq.headers = { authorization: 'Bearer' };

      mockNext = (args: unknown) => {
        expect(args).to.be.undefined;

        expect(mockReq)
          .to.have.property('isAuth', false)
          .and.not.have.property('userId');
      };

      isAuth(mockReq as Request, mockRes as Response, mockNext as NextFunction);
    });
  });

  describe('related to JWT', () => {
    it("should call next(CustomError('JWT error')) and req.isAuth = false when JWT_SECRET is undefined", () => {
      const jwtSecretStub = sinon
        .stub(env_config, 'JWT_SECRET')
        .value(undefined);

      mockReq.headers = { authorization: 'Bearer token' };

      mockNext = (args: unknown) => {
        expect(args)
          .to.be.an.instanceOf(CustomError)
          .that.has.property('message', 'JWT error');

        expect(mockReq)
          .to.have.property('isAuth', false)
          .and.not.have.property('userId');
      };

      isAuth(mockReq as Request, mockRes as Response, mockNext as NextFunction);

      jwtSecretStub.restore();
    });

    it("should call next(CustomError('Invalid Token')) and req.isAuth = false when token in invalid", done => {
      mockReq.headers = { authorization: 'Bearer token' };

      mockNext = (args: unknown) => {
        expect(args).to.be.an.instanceOf(CustomError);
        expect(args).to.have.property('message', 'Invalid Token');
        expect(args).to.have.property('status', 401);
        expect(args)
          .to.have.property('data')
          .that.is.an('array')
          .and.deep.include({
            message: 'Invalid Signature',
            field: 'Authorization'
          });

        expect(mockReq)
          .to.have.property('isAuth', false)
          .and.not.have.property('userId');

        done();
      };

      isAuth(mockReq as Request, mockRes as Response, mockNext as NextFunction);
    });

    it("should call next(CustomError('Invalid Token')) and req.isAuth = false when token in expired", done => {
      const jwtStub = sinon
        .stub(jwt, 'verify')
        .callsArgWith(
          2,
          new TokenExpiredError('jwt expired', new Date()),
          undefined
        );

      mockReq.headers = { authorization: 'Bearer token' };

      mockNext = (args: unknown) => {
        expect(args).to.be.an.instanceOf(CustomError);
        expect(args).to.have.property('message', 'Invalid Token');
        expect(args).to.have.property('status', 401);
        expect(args)
          .to.have.property('data')
          .that.is.an('array')
          .and.deep.include({
            message: 'Token expired',
            field: 'Authorization'
          });

        expect(mockReq)
          .to.have.property('isAuth', false)
          .and.not.have.property('userId');

        done();
      };

      isAuth(mockReq as Request, mockRes as Response, mockNext as NextFunction);

      jwtStub.restore();
    });
  });

  describe('related to decoded token', () => {
    it("should call next(CustomError('Invalid token')) and req.isAuth = false when token._id is invalid", done => {
      const jwtStub = sinon
        .stub(jwt, 'verify')
        .callsArgWith(2, undefined, { _id: '1234567890' });

      mockReq.headers = { authorization: 'Bearer token' };

      mockNext = (args: unknown) => {
        expect(args).to.be.an.instanceOf(CustomError);
        expect(args).to.have.property('message', 'Invalid Token');
        expect(args).to.have.property('status', 401);
        expect(args)
          .to.have.property('data')
          .that.is.an('array')
          .and.deep.include({
            message: 'Token has been changed',
            field: 'Authorization'
          });

        expect(mockReq)
          .to.have.property('isAuth', false)
          .and.not.have.property('userId');

        done();
      };

      isAuth(mockReq as Request, mockRes as Response, mockNext as NextFunction);

      jwtStub.restore();
    });

    it('should call next() and req.isAuth = false when jwt is valid but does not contain _id', done => {
      const jwtStub = sinon.stub(jwt, 'verify').callsArgWith(2, undefined, {});

      mockReq.headers = { authorization: 'Bearer token' };

      mockNext = (args: unknown) => {
        expect(args).to.be.undefined;

        expect(mockReq).to.have.property('isAuth', false);
        expect(mockReq).to.not.have.property('userId');

        done();
      };

      isAuth(mockReq as Request, mockRes as Response, mockNext as NextFunction);

      jwtStub.restore();
    });

    it('should call next() and req = { isAuth: true, userId: {...} } when jwt is valid ', done => {
      const _id = new Types.ObjectId();

      const jwtStub = sinon
        .stub(jwt, 'verify')
        .callsArgWith(2, undefined, { _id: _id.toString() });

      mockReq.headers = { authorization: 'Bearer token' };

      mockNext = (args: unknown) => {
        expect(args).to.be.undefined;

        expect(mockReq).to.have.property('isAuth', true);
        expect(mockReq).to.have.property('userId').that.deep.equal(_id);

        done();
      };

      isAuth(mockReq as Request, mockRes as Response, mockNext as NextFunction);

      jwtStub.restore();
    });
  });
});
