// packages
import { expect } from 'chai';

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
      mockReq.isAuth = true;

      mockArgs.username = 'test';
      mockArgs.password = 'password';
      mockArgs.confirmPassword = 'password';
    });

    it("should throw CustomError('Unauthorized. Log out first', 401) if req.isAuth = true i.e. logged in", done => {
      mockReq.isAuth = true;

      users
        .createUser(mockArgs, mockReq as Request)
        .then(result => {
          expect(result).to.be.undefined;

          done();
        })
        .catch(err => {
          console.log('err:', err.message);

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
});
