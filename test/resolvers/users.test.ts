// packages
import sinon from 'sinon';
import bcrypt from 'bcryptjs';
import { expect } from 'chai';
import type { Request } from 'express';
import type { SinonStub } from 'sinon';

// model
import User from 'models/user';
import type { IUser } from 'models/user/types';

// gql
import * as users from 'gql/resolvers/users';
import type * as T from 'gql/resolvers/users/types';

// utils
import CustomError from 'utils/customError';
import * as Token from 'utils/token';

describe('[users] User resolver', async () => {
  describe('[createUser]', () => {
    let bcryptHashStub: SinonStub;
    let userFindOneStub: SinonStub;

    const hashedPassword = '1234567890qwertyuiop';

    const mockReq: Partial<Request> = {};
    const mockArgs: T.CreateUserArgs = {
      username: 'test',
      password: 'password',
      confirmPassword: 'password'
    };

    beforeEach(() => {
      bcryptHashStub = sinon.stub(bcrypt, 'hash').resolves(hashedPassword);

      userFindOneStub = sinon.stub(User, 'findOne').resolves(null);

      mockReq.isAuth = false;

      mockArgs.username = 'test';
      mockArgs.password = 'password';
      mockArgs.confirmPassword = 'password';
    });

    afterEach(() => {
      sinon.restore();
      bcryptHashStub.restore();
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
      it("should throw CustomError('Invalid Input') when username to is too short", async () => {
        mockArgs.username = 'asd';

        try {
          const result = await users.createUser(mockArgs, mockReq as Request);
          expect(result).to.be.undefined;
        } catch (err) {
          expect(err).to.be.instanceOf(CustomError);
          expect(err).to.have.property('message', 'Invalid Input');
          expect(err).to.have.property('status', 422);
          expect(err).to.have.property('data').that.deep.include({
            message: 'Username must of length 4 to 15 characters',
            field: 'username'
          });
        }
      });

      it("should throw CustomError('Invalid Input') when username to is too long", () => {
        mockArgs.username = '1234567890123456';

        return users
          .createUser(mockArgs, mockReq as Request)
          .then(result => {
            expect(result).to.be.undefined;
          })
          .catch(err => {
            expect(err).to.be.instanceOf(CustomError);
            expect(err).to.have.property('message', 'Invalid Input');
            expect(err).to.have.property('status', 422);
            expect(err).to.have.property('data').that.deep.include({
              message: 'Username must of length 4 to 15 characters',
              field: 'username'
            });
          });
      });

      it("should throw CustomError('Invalid Input') when password and confirmPassword are not same", () => {
        mockArgs.password = 'password';
        mockArgs.confirmPassword = 'confirmPassword';

        return users
          .createUser(mockArgs, mockReq as Request)
          .then(result => {
            expect(result).to.be.undefined;
          })
          .catch(err => {
            expect(err).to.be.instanceOf(CustomError);
            expect(err).to.have.property('message', 'Invalid Input');
            expect(err).to.have.property('status', 422);
            expect(err).to.have.property('data').that.deep.include({
              message: 'Confirm Password does not match Password',
              field: 'confirmPassword'
            });
          });
      });

      it("should throw CustomError('Invalid Input') when password and confirmPassowrd are too short", () => {
        mockArgs.password = '1234567';
        mockArgs.confirmPassword = '1234567';

        return users
          .createUser(mockArgs, mockReq as Request)
          .then(result => {
            expect(result).to.be.undefined;
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
          });
      });
    });

    describe('[DB]', () => {
      it("should throw CustomError('User already exists') when username is already used", () => {
        // To clear the stub of this group for this test only
        userFindOneStub.restore();

        // Create new stub for this test
        const userStub = sinon.stub(User, 'findOne').returnsArg(0);

        return users
          .createUser(mockArgs, mockReq as Request)
          .then(result => {
            expect(result).to.be.undefined;

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

            userStub.restore();
          });
      });

      it('should save hashed password to DB', done => {
        const userSaveStub = sinon
          .stub(User.prototype, 'save')
          .callsFake(function (this: unknown) {
            // will give timeout error when this fails
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            expect((this as any).password).to.equal(hashedPassword);

            done();
            userSaveStub.restore();
          });

        users.createUser(mockArgs, mockReq as Request);
      });

      it("should throw CustomError('Could not create') when new user is not saved", () => {
        const userSaveStub = sinon.stub(User.prototype, 'save').resolves({
          username: 'tester',
          password: '1234567890qwertyuiop',
          tags: []
        });

        return users
          .createUser(mockArgs, mockReq as Request)
          .then(result => {
            expect(result).to.be.undefined;

            userSaveStub.restore();
          })
          .catch(err => {
            expect(err).to.be.instanceOf(CustomError);
            expect(err).to.have.property('message', 'Could not create');
            expect(err).to.have.property('status', 500);
            expect(err).to.have.property('data').to.be.empty;

            userSaveStub.restore();
          });
      });
    });

    describe('[return value]', () => {
      it('should return _id and username as given by .save()', () => {
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

        return users
          .createUser(mockArgs, mockReq as Request)
          .then(result => {
            expect(result).to.have.property('_id', dummyData._id);
            expect(result).to.have.property('username', dummyData.username);

            userSaveStub.restore();
          })
          .catch(err => {
            expect(err).to.be.undefined;

            userSaveStub.restore();
          });
      });

      it('should return token given by encodeIdToJwt', () => {
        const dummyToken = '1234567890.qwertyuiop';

        const userSaveStub = sinon.stub(User.prototype, 'save').resolvesThis();

        const encodeIdToJwtStub = sinon
          .stub(Token, 'encodeIdToJwt')
          .returns(dummyToken);

        return users
          .createUser(mockArgs, mockReq as Request)
          .then(result => {
            expect(result).to.haveOwnProperty('token', dummyToken);

            userSaveStub.restore();
            encodeIdToJwtStub.restore();
          })
          .catch(err => {
            expect(err).to.be.undefined;

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
      it("should throw CustomError('Unauthorized. Log out first', 401) if req.isAuth = true i.e. logged in", () => {
        mockReq.isAuth = true;

        return users
          .login(mockArgs, mockReq as Request)
          .then(result => {
            expect(result).to.be.undefined;
          })
          .catch(err => {
            expect(err).to.be.instanceOf(CustomError);
            expect(err).to.have.property(
              'message',
              'Unauthorized. Log out first'
            );
            expect(err).to.have.property('status', 401);
            expect(err).to.have.property('data').that.is.empty;
          });
      });
    });

    describe('[input validation]', () => {
      it("should throw CustomError('Invalid Input') when username to is too short", () => {
        mockArgs.username = 'asd';

        return users
          .login(mockArgs, mockReq as Request)
          .then(result => {
            expect(result).to.be.undefined;
          })
          .catch(err => {
            expect(err).to.be.instanceOf(CustomError);
            expect(err).to.have.property('message', 'Invalid Input');
            expect(err).to.have.property('status', 422);
            expect(err).to.have.property('data').that.deep.include({
              message: 'Username must of length 4 to 15 characters',
              field: 'username'
            });
          });
      });

      it("should throw CustomError('Invalid Input') when username to is too long", () => {
        mockArgs.username = '1234567890123456';

        return users
          .login(mockArgs, mockReq as Request)
          .then(result => {
            expect(result).to.be.undefined;
          })
          .catch(err => {
            expect(err).to.be.instanceOf(CustomError);
            expect(err).to.have.property('message', 'Invalid Input');
            expect(err).to.have.property('status', 422);
            expect(err).to.have.property('data').that.deep.include({
              message: 'Username must of length 4 to 15 characters',
              field: 'username'
            });
          });
      });

      it("should throw CustomError('Invalid Input') when password is too short", () => {
        mockArgs.password = '1234567';

        return users
          .login(mockArgs, mockReq as Request)
          .then(result => {
            expect(result).to.be.undefined;
          })
          .catch(err => {
            expect(err).to.be.instanceOf(CustomError);
            expect(err).to.have.property('message', 'Invalid Input');
            expect(err).to.have.property('status', 422);
            expect(err).to.have.property('data').that.deep.include({
              message: 'Password must be at least 8 characters',
              field: 'password'
            });
          });
      });
    });

    describe('[DB]', () => {
      it("should throw CustomError('Incorrect username or password', 401) when username is not found", () => {
        const userStub = sinon.stub(User, 'findOne').resolves(null);

        return users
          .login(mockArgs, mockReq as Request)
          .then(result => {
            expect(result).to.be.undefined;

            userStub.restore();
          })
          .catch(err => {
            expect(err).to.be.instanceOf(CustomError);
            expect(err).to.have.property(
              'message',
              'Incorrect username or password'
            );
            expect(err).to.have.property('status', 401);

            userStub.restore();
          });
      });

      it("should throw CustomError('Incorrect username or password', 401) when password doesn't match", () => {
        const userStub = sinon.stub(User, 'findOne').resolvesThis();

        const bcryptStub = sinon.stub(bcrypt, 'compare').resolves(false);

        return users
          .login(mockArgs, mockReq as Request)
          .then(result => {
            expect(result).to.be.undefined;

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

            userStub.restore();
            bcryptStub.restore();
          });
      });
    });

    describe('[return value]', () => {
      it('should return token given by encodeIdToJwt', () => {
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

        return users
          .login(mockArgs, mockReq as Request)
          .then(result => {
            expect(result).to.haveOwnProperty('token', dummyToken);

            userStub.restore();
            bcryptStub.restore();
            encodeIdToJwtStub.restore();
          })
          .catch(err => {
            expect(err).to.be.undefined;

            userStub.restore();
            bcryptStub.restore();
            encodeIdToJwtStub.restore();
          });
      });
    });
  });

  describe('[changePassword]', () => {
    // Override cannot override properties which are not function, I think
    const userInstance = {
      ...sinon.createStubInstance<IUser>(User, {}),
      _id: '123456789012',
      username: 'test',
      password: 'password',
      tags: [],
      save: function () {
        return this;
      }
    };
    const hashedPassword = '1234567890qwertyuiop';

    let bcryptHashStub: SinonStub;
    let userFindByIdStub: SinonStub;
    let bcryptcompareStub: SinonStub;

    const mockReq: Partial<Request> = {
      isAuth: true,
      userId: '123456789012'
    };
    const mockArgs: T.ChangePasswordArgs = {
      oldPassword: 'password',
      newPassword: 'qwertyuiop',
      confirmNewPassword: 'qwertyuiop'
    };

    beforeEach(() => {
      bcryptHashStub = sinon.stub(bcrypt, 'hash').resolves(hashedPassword);

      bcryptcompareStub = sinon.stub(bcrypt, 'compare').resolves(true);

      userFindByIdStub = sinon
        .stub(User, 'findById')
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        .resolves(userInstance);

      mockReq.isAuth = true;
      mockReq.userId = '123456789012';

      mockArgs.oldPassword = 'password';
      mockArgs.newPassword = 'qwertyuiop';
      mockArgs.confirmNewPassword = 'qwertyuiop';
    });

    afterEach(() => {
      bcryptHashStub.restore();
      userFindByIdStub.restore();
      bcryptcompareStub.restore();
      sinon.restore();
    });

    describe('[atuh]', () => {
      it("should throw CustomError('Unauthorized. Log out first', 401) if req.isAuth = false i.e. not logged in", () => {
        mockReq.isAuth = false;
        mockReq.userId = '123456789012';

        return users
          .changePassword(mockArgs, mockReq as Request)
          .then(result => {
            expect(result).to.be.undefined;
          })
          .catch(err => {
            expect(err).to.be.instanceOf(CustomError);
            expect(err).to.have.property(
              'message',
              'Unauthorized. Log in first'
            );
            expect(err).to.have.property('status', 401);
            expect(err).to.have.property('data').that.is.empty;
          });
      });

      it("should throw CustomError('Unauthorized. Log out first', 401) if req.uesrId is falsy i.e. not logged in", () => {
        mockReq.isAuth = true;
        mockReq.userId = undefined;

        return users
          .changePassword(mockArgs, mockReq as Request)
          .then(result => {
            expect(result).to.be.undefined;
          })
          .catch(err => {
            expect(err).to.be.instanceOf(CustomError);
            expect(err).to.have.property(
              'message',
              'Unauthorized. Log in first'
            );
            expect(err).to.have.property('status', 401);
            expect(err).to.have.property('data').that.is.empty;
          });
      });
    });

    describe('[input validation]', () => {
      it("should throw CustomError('Invalid Input') when oldPassword is too short", () => {
        mockArgs.oldPassword = '1234567';

        return users
          .changePassword(mockArgs, mockReq as Request)
          .then(result => {
            expect(result).to.be.undefined;
          })
          .catch(err => {
            expect(err).to.be.instanceOf(CustomError);
            expect(err).to.have.property('message', 'Invalid Input');
            expect(err).to.have.property('status', 422);
            expect(err).to.have.property('data').that.deep.include({
              message: 'Old Password must be at least 8 characters',
              field: 'oldPassword'
            });
          });
      });

      it("should throw CustomError('Invalid Input') when oldPassword and newPassword are same", () => {
        mockArgs.oldPassword = '1234567';
        mockArgs.newPassword = mockArgs.oldPassword;

        return users
          .changePassword(mockArgs, mockReq as Request)
          .then(result => {
            expect(result).to.be.undefined;
          })
          .catch(err => {
            expect(err).to.be.instanceOf(CustomError);
            expect(err).to.have.property('message', 'Invalid Input');
            expect(err).to.have.property('status', 422);
            expect(err).to.have.property('data').that.deep.include({
              message: 'New Password cannot be same as Old Password',
              field: 'newPassword'
            });
          });
      });

      it("should throw CustomError('Invalid Input') when newPassword and confirmNewPassword are not same", () => {
        mockArgs.newPassword = 'new password';
        mockArgs.confirmNewPassword = 'confirm new password';

        return users
          .changePassword(mockArgs, mockReq as Request)
          .then(result => {
            expect(result).to.be.undefined;
          })
          .catch(err => {
            expect(err).to.be.instanceOf(CustomError);
            expect(err).to.have.property('message', 'Invalid Input');
            expect(err).to.have.property('status', 422);
            expect(err).to.have.property('data').that.deep.include({
              message: 'Confirm New Password does not match New Password',
              field: 'confirmNewPassword'
            });
          });
      });

      it("should throw CustomError('Invalid Input') when newPassword and confirmNewPassword are too short", () => {
        mockArgs.newPassword = '1234567';
        mockArgs.confirmNewPassword = '1234567';

        return users
          .changePassword(mockArgs, mockReq as Request)
          .then(result => {
            expect(result).to.be.undefined;
          })
          .catch(err => {
            expect(err).to.be.instanceOf(CustomError);
            expect(err).to.have.property('message', 'Invalid Input');
            expect(err).to.have.property('status', 422);
            expect(err).to.have.property('data').that.deep.include({
              message: 'New Password must be at least 8 characters',
              field: 'newPassword'
            });
            expect(err).to.have.property('data').that.deep.include({
              message: 'Confirm New Password must be at least 8 characters',
              field: 'confirmNewPassword'
            });
          });
      });
    });

    describe('[DB]', () => {
      it("should throw CustomError('User not found', 401) when user is not found", () => {
        // restore for this test
        userFindByIdStub.restore();

        const userStub = sinon.stub(User, 'findById').resolves(null);

        return users
          .changePassword(mockArgs, mockReq as Request)
          .then(result => {
            expect(result).to.be.undefined;

            userStub.restore();
          })
          .catch(err => {
            expect(err).to.be.instanceOf(CustomError);
            expect(err).to.have.property('message', 'User not found');
            expect(err).to.have.property('status', 401);

            userStub.restore();
          });
      });

      it("should throw CustomError('Incorrect old password', 401) when oldPassword is incorrect", () => {
        // restore for this test
        bcryptcompareStub.restore();

        const bcryptStub = sinon.stub(bcrypt, 'compare').resolves(false);

        return users
          .changePassword(mockArgs, mockReq as Request)
          .then(result => {
            expect(result).to.be.undefined;

            bcryptStub.restore();
          })
          .catch(err => {
            expect(err).to.be.instanceOf(CustomError);
            expect(err).to.have.property('message', 'Incorrect old password');
            expect(err).to.have.property('status', 401);

            bcryptStub.restore();
          });
      });

      it('should save hashed password to DB', done => {
        const userInstanceStub = sinon
          .stub(userInstance, 'save')
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          .callsFake(function (this: unknown) {
            // will give timeout error when this fails
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            expect((this as any).password).to.equal(hashedPassword);

            done();
            userInstanceStub.restore();
          });

        users.changePassword(mockArgs, mockReq as Request);
      });

      it("should throw CustomError('Could not change password') when pssword change is not saved", () => {
        const userInstanceStub = sinon.stub(userInstance, 'save').resolves({});

        return users
          .changePassword(mockArgs, mockReq as Request)
          .then(result => {
            expect(result).to.be.undefined;

            userInstanceStub.restore();
          })
          .catch(err => {
            expect(err).to.be.instanceOf(CustomError);
            expect(err).to.have.property(
              'message',
              'Could not change password'
            );
            expect(err).to.have.property('status', 500);
            expect(err).to.have.property('data').to.be.empty;

            userInstanceStub.restore();
          });
      });
    });

    describe('[return value]', () => {
      it('should return true when pssword change is saved', () => {
        return users
          .changePassword(mockArgs, mockReq as Request)
          .then(result => {
            expect(result).to.be.true;
          })
          .catch(err => {
            expect(err).to.be.undefined;
          });
      });
    });
  });
});
