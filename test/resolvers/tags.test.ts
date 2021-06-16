// pacages
import sinon from 'sinon';
import { expect } from 'chai';

// model
// import User from 'models/user';

// gql
import * as tags from 'gql/resolvers/tags';

// utils
import CustomError from 'utils/customError';

// types
import type { Request } from 'express';

type GetPromiseResolveType<T> = T extends PromiseLike<infer U>
  ? GetPromiseResolveType<U> // For recusive ness
  : T;

describe('[tags] Tags resolver', () => {
  describe('[addTags]', () => {
    type argsType = Parameters<typeof tags.addTags>[0];
    type retType = GetPromiseResolveType<ReturnType<typeof tags.addTags>>;

    const mockReq: Partial<Request> = {};
    const mockArgs: argsType = { tags: [] };

    beforeEach(() => {
      mockReq.isAuth = true;
      mockReq.userId = '123456789012';

      mockArgs.tags = [];
    });

    afterEach(() => {
      sinon.restore();
    });

    describe('[atuh]', () => {
      it("should throw CustomError('Unauthorized. Log out first', 401) if req.isAuth = false i.e. not logged in", () => {
        mockReq.isAuth = false;
        mockReq.userId = '123456789012';

        return tags
          .addTags(mockArgs, mockReq as Request)
          .then((result: retType) => {
            expect(result).to.be.undefined;
          })
          .catch((err: Error) => {
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

        return tags
          .addTags(mockArgs, mockReq as Request)
          .then((result: retType) => {
            expect(result).to.be.undefined;
          })
          .catch((err: Error) => {
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
      it("should throw CustomError('Invalid Input') whene there are no valid tags given", async () => {
        mockArgs.tags = ['tt', '12', '    12    '];

        try {
          const result = await tags.addTags(mockArgs, mockReq as Request);
          expect(result).to.be.undefined;
        } catch (err) {
          expect(err).to.be.instanceOf(CustomError);
          expect(err).to.have.property('message', 'Invalid Input');
          expect(err).to.have.property('status', 422);
          expect(err).to.have.property('data').that.deep.include({
            message: 'No valid tags',
            field: 'tags'
          });
        }
      });
    });
  });
});
