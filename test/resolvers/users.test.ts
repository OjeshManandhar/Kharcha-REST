// packages
import sinon from 'sinon';
import { expect } from 'chai';

// model
import User from 'models/user';

// gql
import * as users from 'gql/resolvers/users';

// utils
import CustomError from 'utils/customError';

// types
import type { Request } from 'express';
import type * as T from 'gql/resolvers/users/types';

describe('[users] User resolver', async () => {
  describe('[createUser]', () => {
    const mockReq: Partial<Request> = {};
    const mockArgs: T.CreateUserArgs = {
      username: 'test',
      password: 'password',
      confirmPassword: 'password'
    };

    beforeEach(() => {
      mockReq.isAuth = false;

      mockArgs.username = 'test';
      mockArgs.password = 'password';
      mockArgs.confirmPassword = 'password';

      sinon.restore();
    });

    describe('[auth]', () => {
      it("should throw CustomError('Unauthorized. Log out first', 401) if req.isAuth = true i.e. logged in", done => {
        mockReq.isAuth = true;

        users
          .createUser(mockArgs, mockReq as Request)
          .then(result => {
            expect(result).to.be.undefined;

            done();
          })
          .catch(err => {
            expect(err).to.be.instanceOf(CustomError);
            expect(err).to.have.property(
              'message',
              'Unauthorized. Log out first'
            );
            expect(err).to.have.property('status', 401);
            expect(err).to.have.property('data').that.is.empty;

            done();
          });
      });
    });

    describe('[input validation]', () => {
      it("should throw CustomError('Invalid Input') when username to is too short", done => {
        mockArgs.username = 'asd';

        users
          .createUser(mockArgs, mockReq as Request)
          .then(result => {
            expect(result).to.be.undefined;

            done();
          })
          .catch(err => {
            expect(err).to.be.instanceOf(CustomError);
            expect(err).to.have.property('message', 'Invalid Input');
            expect(err).to.have.property('status', 422);
            expect(err).to.have.property('data').that.deep.include({
              message: 'Username must of length 4 to 15 characters',
              field: 'username'
            });

            done();
          });
      });

      it("should throw CustomError('Invalid Input') when username to is too long", done => {
        mockArgs.username = '1234567890123456';

        users
          .createUser(mockArgs, mockReq as Request)
          .then(result => {
            expect(result).to.be.undefined;

            done();
          })
          .catch(err => {
            expect(err).to.be.instanceOf(CustomError);
            expect(err).to.have.property('message', 'Invalid Input');
            expect(err).to.have.property('status', 422);
            expect(err).to.have.property('data').that.deep.include({
              message: 'Username must of length 4 to 15 characters',
              field: 'username'
            });

            done();
          });
      });

      it("should throw CustomError('Invalid Input') when password and confirmPassword are not same", done => {
        mockArgs.password = 'password';
        mockArgs.confirmPassword = 'confirmPassword';

        users
          .createUser(mockArgs, mockReq as Request)
          .then(result => {
            expect(result).to.be.undefined;

            done();
          })
          .catch(err => {
            expect(err).to.be.instanceOf(CustomError);
            expect(err).to.have.property('message', 'Invalid Input');
            expect(err).to.have.property('status', 422);
            expect(err).to.have.property('data').that.deep.include({
              message: 'Confirm Password does not match Password',
              field: 'confirmPassword'
            });

            done();
          });
      });

      it("should throw CustomError('Invalid Input') when password and confirmPassowrd are too short", done => {
        mockArgs.password = '1234567';
        mockArgs.confirmPassword = '1234567';

        users
          .createUser(mockArgs, mockReq as Request)
          .then(result => {
            expect(result).to.be.undefined;

            done();
          })
          .catch(err => {
            expect(err).to.be.instanceOf(CustomError);
            expect(err).to.have.property('message', 'Invalid Input');
            expect(err).to.have.property('status', 422);
            expect(err).to.have.property('data').that.deep.include({
              message: 'Password must be at least 8 characters',
              field: 'password'
            });
            expect(err).to.have.property('data').that.deep.include({
              message: 'Confirm Password must be at least 8 characters',
              field: 'confirmPassword'
            });

            done();
          });
      });
    });

    describe('[DB]', () => {
      it("should throw CustomError('User already exists') when username is already used", done => {
        const userStub = sinon.stub(User, 'findOne').returnsArg(0);

        users
          .createUser(mockArgs, mockReq as Request)
          .then(result => {
            expect(result).to.be.undefined;

            done();
            userStub.restore();
          })
          .catch(err => {
            expect(err).to.be.instanceOf(CustomError);
            expect(err).to.have.property('message', 'User already exists');
            expect(err).to.have.property('status', 401);
            expect(err).to.have.property('data').that.deep.include({
              message: 'Username already in use',
              field: 'username'
            });

            done();
            userStub.restore();
          });
      });

      it("should throw CustomError('Could not create') when new user is not saved", done => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const userFindOneStub = sinon.stub(User, 'findOne').returns(undefined);

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const userSaveStub = sinon.stub(User.prototype, 'save').returns({
          username: 'tester',
          password: '1234567890qwertyuiop',
          tags: []
        });

        users
          .createUser(mockArgs, mockReq as Request)
          .then(result => {
            expect(result).to.be.undefined;

            done();
            userFindOneStub.restore();
            userSaveStub.restore();
          })
          .catch(err => {
            expect(err).to.be.instanceOf(CustomError);
            expect(err).to.have.property('message', 'Could not create');
            expect(err).to.have.property('status', 500);
            expect(err).to.have.property('data').to.be.empty;

            done();
            userFindOneStub.restore();
            userSaveStub.restore();
          });
      });
    });
  });
});
