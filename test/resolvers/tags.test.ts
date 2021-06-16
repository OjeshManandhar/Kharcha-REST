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

describe('[tags] Tags resolver', () => {
  describe('[addTags]', () => {
    const mockReq: Partial<Request> = {};
    const mockArgs: { tags: Array<string> } = { tags: [] };

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
          .then((result: Promise<Array<string>>) => {
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
          .then((result: Promise<Array<string>>) => {
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
  });
});
