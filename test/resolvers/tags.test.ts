// pacages
import sinon, { SinonStub } from 'sinon';
import { expect, AssertionError } from 'chai';

// model
import User, { IUser } from 'models/user';

// gql
import * as tags from 'gql/resolvers/tags';

// utils
import CustomError from 'utils/customError';

// types
import type { Request } from 'express';
import type * as T from 'gql/resolvers/tags/types';

type GetPromiseResolveType<T> = T extends PromiseLike<infer U>
  ? GetPromiseResolveType<U> // For recusive ness
  : T;

function authTests<Arg, Ret>(
  fn: (args: Arg, req: Request) => Promise<Ret>,
  mockArgs: Arg,
  mockReq: Partial<Request>
) {
  describe('[atuh]', () => {
    it("should throw CustomError('Unauthorized. Log out first', 401) if req.isAuth = false i.e. not logged in", async () => {
      mockReq.isAuth = false;
      mockReq.userId = '123456789012';

      try {
        const result = await fn(mockArgs, mockReq as Request);

        expect(result).to.be.undefined;
      } catch (err) {
        // To throw the error thrown by expect when expect in try fails
        if (err instanceof AssertionError) throw err;

        expect(err).to.be.instanceOf(CustomError);
        expect(err).to.have.property('message', 'Unauthorized. Log in first');
        expect(err).to.have.property('status', 401);
        expect(err).to.have.property('data').that.is.empty;
      }
    });

    it("should throw CustomError('Unauthorized. Log out first', 401) if req.uesrId is falsy i.e. not logged in", async () => {
      mockReq.isAuth = true;
      mockReq.userId = undefined;

      try {
        const result = await fn(mockArgs, mockReq as Request);

        expect(result).to.be.undefined;
      } catch (err) {
        // To throw the error thrown by expect when expect in try fails
        if (err instanceof AssertionError) throw err;

        expect(err).to.be.instanceOf(CustomError);
        expect(err).to.have.property('message', 'Unauthorized. Log in first');
        expect(err).to.have.property('status', 401);
        expect(err).to.have.property('data').that.is.empty;
      }
    });
  });
}

describe('[tags] Tags resolver', () => {
  const mockReq: Partial<Request> = {};

  const userInstance = {
    // Override cannot override properties which are not function, I think
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

  describe('[addTags]', () => {
    type ArgsType = Parameters<T.AddTags>[0];
    type RetType = GetPromiseResolveType<ReturnType<T.AddTags>>;

    const mockArgs: ArgsType = { tags: ['newTag', 'tags'] };

    beforeEach(() => {
      mockArgs.tags = ['newTag', 'tags'];
    });

    authTests<ArgsType, RetType>(tags.addTags, mockArgs, mockReq);

    describe('[input validation]', () => {
      it("should throw CustomError('Invalid Input') whene there are no valid tags given", async () => {
        mockArgs.tags = ['tt', '12', '    12    '];

        try {
          const result = await tags.addTags(mockArgs, mockReq as Request);

          expect(result).to.be.undefined;
        } catch (err) {
          // To throw the error thrown by expect when expect in try fails
          if (err instanceof AssertionError) throw err;

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
      it("should throw CustomError('User not found') when user doesnot exist", async () => {
        // Restore for this test
        userFindByIdStub.restore();

        // Create new stub for this test
        const userStub = sinon.stub(User, 'findById').resolves(null);

        try {
          const result = await tags.addTags(mockArgs, mockReq as Request);

          expect(result).to.be.undefined;
        } catch (err) {
          // To throw the error thrown by expect when expect in try fails
          if (err instanceof AssertionError) throw err;

          expect(err).to.be.instanceOf(CustomError);
          expect(err).to.have.property('message', 'User not found');
          expect(err).to.have.property('status', 401);
          expect(err).to.have.property('data').that.is.empty;
        }

        userStub.restore();
      });

      it('should return [] and not call save if there are no tags to be added', async () => {
        // Reset save for this test as its calls need to be traced
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
          // have.members use when Order Wholeness Matters
          // will give timeout error when this fails
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          expect((this as any).tags).to.have.members(tagsThatAreToBeSaved);

          done();
        });

        tags.addTags(mockArgs, mockReq as Request);
      });

      it("should throw CustomError('Could not update') when new tags are not saved", async () => {
        userInstance.save.resolves({});

        try {
          const result = await tags.addTags(mockArgs, mockReq as Request);

          expect(result).to.be.undefined;
        } catch (err) {
          // To throw the error thrown by expect when expect in try fails
          if (err instanceof AssertionError) throw err;

          expect(err).to.be.instanceOf(CustomError);
          expect(err).to.have.property('message', 'Could not update');
          expect(err).to.have.property('status', 500);
          expect(err).to.have.property('data').to.be.empty;
        }
      });
    });

    describe('[return value]', () => {
      it('should only return tags that are added', async () => {
        // Found by comparing userInstance.tages and mockArgs.tags
        const tagsThatAreAdded = ['newTag'];

        try {
          const result = await tags.addTags(mockArgs, mockReq as Request);

          // Unordered Wholeness Matters — .to.have.members
          expect(result).to.have.members(tagsThatAreAdded);
        } catch (err) {
          expect(err).to.be.undefined;
        }
      });
    });
  });
});
