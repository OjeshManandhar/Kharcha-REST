// pacages
import { expect } from 'chai';
import sinon, { SinonStub } from 'sinon';

// model
import User, { IUser } from 'models/user';

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
    type ArgsType = Parameters<typeof tags.addTags>[0];
    type RetType = GetPromiseResolveType<ReturnType<typeof tags.addTags>>;

    const mockReq: Partial<Request> = {};
    const mockArgs: ArgsType = { tags: ['newTag', 'tags'] };

    // Override cannot override properties which are not function, I think
    const userInstance = {
      ...sinon.createStubInstance<IUser>(User, {}),
      _id: '123456789012',
      username: 'test',
      password: 'password',
      tags: ['oldTag', 'tags'],
      save: sinon.stub().resolvesThis()
    };

    let userFindByIdStub: SinonStub;

    beforeEach(() => {
      mockReq.isAuth = true;
      mockReq.userId = '123456789012';

      mockArgs.tags = ['newTag', 'tags'];

      userInstance.tags = ['oldTag', 'tags'];
      userInstance.save = sinon.stub().resolvesThis();

      userFindByIdStub = sinon
        .stub(User, 'findById')
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        .resolves(userInstance);
    });

    afterEach(() => {
      /**
       * This won't work as there is no function to
       * restore to for this stub
       * userInstance.save.restore();
       */

      userFindByIdStub.restore();
      sinon.restore();
    });

    describe('[atuh]', () => {
      it("should throw CustomError('Unauthorized. Log out first', 401) if req.isAuth = false i.e. not logged in", () => {
        mockReq.isAuth = false;
        mockReq.userId = '123456789012';

        return tags
          .addTags(mockArgs, mockReq as Request)
          .then((result: RetType) => {
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
          .then((result: RetType) => {
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

    describe('[DB]', () => {
      it("should throw CustomError('User already exists') when username is already used", async () => {
        // Restore for this test
        userFindByIdStub.restore();

        // Create new stub for this test
        const userStub = sinon.stub(User, 'findById').resolves(null);

        try {
          const result = await tags.addTags(mockArgs, mockReq as Request);
          expect(result).to.be.undefined;
        } catch (err) {
          expect(err).to.be.instanceOf(CustomError);
          expect(err).to.have.property('message', 'User not found');
          expect(err).to.have.property('status', 401);
          expect(err).to.have.property('data').that.is.empty;
        }
        userStub.restore();
      });

      it('should return [] and not call save if there are no tags to be added', async () => {
        // Reset save for this test as it need to be traced for calls
        userInstance.save.reset();

        // Replace args.tags by tags that are already present in DB
        mockArgs.tags.splice(0, mockArgs.tags.length - 1, ...userInstance.tags);

        try {
          const result = await tags.addTags(mockArgs, mockReq as Request);

          expect(userInstance.save.called).to.be.false;
          expect(result).to.be.an('array').that.is.empty;
        } catch (err) {
          expect(err).to.be.undefined;
        }
      });

      it('should save all of existing tags and new tags to DB', done => {
        const tagsThatAreToBeSaved = Array.from(
          new Set(userInstance.tags.concat(mockArgs.tags))
        );

        userInstance.save.callsFake(function (this: unknown) {
          console.log('Fake called');

          // have.members use when Order Wholeness Matters
          // will give timeout error when this fails
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          expect((this as any).tags).to.have.members(tagsThatAreToBeSaved);

          done();
        });

        tags.addTags(mockArgs, mockReq as Request);
      });
    });
  });
});
