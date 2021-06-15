// packages
import sinon from 'sinon';
import bcrypt from 'bcryptjs';
import { expect } from 'chai';

// model
import User from 'models/user';

// gql
import * as users from 'gql/resolvers/users';

// utils
import CustomError from 'utils/customError';
import * as Token from 'utils/token';

// types
import type { Request } from 'express';
import type { SinonStub } from 'sinon';
import type * as T from 'gql/resolvers/users/types';

describe('[users] User resolver', async () => {
  describe('[createUser]', () => {
    let userFindOneStub: SinonStub;

    const mockReq: Partial<Request> = {};
    const mockArgs: T.CreateUserArgs = {
      username: 'test',
      password: 'password',
      confirmPassword: 'password'
    };

    beforeEach(() => {
      userFindOneStub = sinon.stub(User, 'findOne').resolves(null);

      mockReq.isAuth = false;

      mockArgs.username = 'test';
      mockArgs.password = 'password';
      mockArgs.confirmPassword = 'password';
    });

    afterEach(() => {
      sinon.restore();
      userFindOneStub.restore();
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
        // To clear the stub of this group for this test only
        userFindOneStub.restore();

        // Create new stub for this test
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

      it('should save hashed password to DB', done => {
        const hashedPassword = '1234567890qwertyuiop';

        const bcryptStub = sinon.stub(bcrypt, 'hash').resolves(hashedPassword);

        const userSaveStub = sinon
          .stub(User.prototype, 'save')
          .callsFake(function (this: unknown) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            expect((this as any).password).to.equal(hashedPassword);

            done();
            userSaveStub.restore();
            bcryptStub.restore();
          });

        users.createUser(mockArgs, mockReq as Request);
      });

      it("should throw CustomError('Could not create') when new user is not saved", done => {
        const userSaveStub = sinon.stub(User.prototype, 'save').resolves({
          username: 'tester',
          password: '1234567890qwertyuiop',
          tags: []
        });

        users
          .createUser(mockArgs, mockReq as Request)
          .then(result => {
            expect(result).to.be.undefined;

            done();
            userSaveStub.restore();
          })
          .catch(err => {
            expect(err).to.be.instanceOf(CustomError);
            expect(err).to.have.property('message', 'Could not create');
            expect(err).to.have.property('status', 500);
            expect(err).to.have.property('data').to.be.empty;

            done();
            userSaveStub.restore();
          });
      });
    });

    describe('[return value]', () => {
      it('should return _id and username as given by .save()', done => {
        const dummyData = {
          _id: '',
          username: 'dummy username'
        };

        const userSaveStub = sinon
          .stub(User.prototype, 'save')
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .callsFake(function (this: { [index: string]: any }) {
            /**
             * Could not change this._id so changeng
             * dummyData._id to this._id.toString()
             * as creatueUser() will retirn _id as string
             */
            dummyData._id = this._id.toString();
            this.username = dummyData.username;

            return this;
          });

        users
          .createUser(mockArgs, mockReq as Request)
          .then(result => {
            expect(result).to.have.property('_id', dummyData._id);
            expect(result).to.have.property('username', dummyData.username);

            done();
            userSaveStub.restore();
          })
          .catch(err => {
            expect(err).to.be.undefined;

            done();
            userSaveStub.restore();
          });
      });

      it('should return token given by encodeIdToJwt', done => {
        const dummyToken = '1234567890.qwertyuiop';

        const userSaveStub = sinon.stub(User.prototype, 'save').resolvesThis();

        const encodeIdToJwtStub = sinon
          .stub(Token, 'encodeIdToJwt')
          .returns(dummyToken);

        users
          .createUser(mockArgs, mockReq as Request)
          .then(result => {
            expect(result).to.haveOwnProperty('token', dummyToken);

            done();
            userSaveStub.restore();
            encodeIdToJwtStub.restore();
          })
          .catch(err => {
            expect(err).to.be.undefined;

            done();
            userSaveStub.restore();
            encodeIdToJwtStub.restore();
          });
      });
    });
  });

  describe('[login]', () => {
    const mockReq: Partial<Request> = {};
    const mockArgs: T.LoginArgs = {
      username: 'test',
      password: 'password'
    };

    beforeEach(() => {
      mockReq.isAuth = false;

      mockArgs.username = 'test';
      mockArgs.password = 'password';
    });

    afterEach(() => {
      sinon.restore();
    });

    describe('[auth]', () => {
      it("should throw CustomError('Unauthorized. Log out first', 401) if req.isAuth = true i.e. logged in", done => {
        mockReq.isAuth = true;

        users
          .login(mockArgs, mockReq as Request)
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
          .login(mockArgs, mockReq as Request)
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
          .login(mockArgs, mockReq as Request)
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

      it("should throw CustomError('Invalid Input') when password is too short", done => {
        mockArgs.password = '1234567';

        users
          .login(mockArgs, mockReq as Request)
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

            done();
          });
      });
    });

    describe('[DB]', () => {
      it("should throw CustomError('Incorrect username or password', 401) when username is not found", done => {
        const userStub = sinon.stub(User, 'findOne').resolves(null);

        users
          .login(mockArgs, mockReq as Request)
          .then(result => {
            expect(result).to.be.undefined;

            done();
            userStub.restore();
          })
          .catch(err => {
            expect(err).to.be.instanceOf(CustomError);
            expect(err).to.have.property(
              'message',
              'Incorrect username or password'
            );
            expect(err).to.have.property('status', 401);

            done();
            userStub.restore();
          });
      });

      it("should throw CustomError('Incorrect username or password', 401) when password doesn't match", done => {
        const userStub = sinon.stub(User, 'findOne').resolvesThis();

        const bcryptStub = sinon.stub(bcrypt, 'compare').resolves(false);

        users
          .login(mockArgs, mockReq as Request)
          .then(result => {
            expect(result).to.be.undefined;

            done();
            userStub.restore();
            bcryptStub.restore();
          })
          .catch(err => {
            expect(err).to.be.instanceOf(CustomError);
            expect(err).to.have.property(
              'message',
              'Incorrect username or password'
            );
            expect(err).to.have.property('status', 401);

            done();
            userStub.restore();
            bcryptStub.restore();
          });
      });
    });

    describe('[return value]', () => {
      it('should return token given by encodeIdToJwt', done => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const userStub = sinon.stub(User, 'findOne').resolves({
          _id: { id: '1234567890' }
        });

        const bcryptStub = sinon.stub(bcrypt, 'compare').resolves(true);

        const dummyToken = '1234567890.qwertyuiop';
        const encodeIdToJwtStub = sinon
          .stub(Token, 'encodeIdToJwt')
          .returns(dummyToken);

        users
          .login(mockArgs, mockReq as Request)
          .then(result => {
            expect(result).to.haveOwnProperty('token', dummyToken);

            done();
            userStub.restore();
            bcryptStub.restore();
            encodeIdToJwtStub.restore();
          })
          .catch(err => {
            expect(err).to.be.undefined;

            done();
            userStub.restore();
            bcryptStub.restore();
            encodeIdToJwtStub.restore();
          });
      });
    });
  });
});
