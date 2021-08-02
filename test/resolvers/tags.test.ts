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
import type * as T from 'gql/resolvers/tags/types';

type GetPromiseResolveType<T> = T extends PromiseLike<infer U>
  ? GetPromiseResolveType<U> // For recusive ness
  : T;

describe('[tags] Tags resolver', () => {
  function authTests<Arg, Ret>(
    fn: (args: Arg, req: Request) => Promise<Ret>,
    mockArgs: Arg
  ) {
    describe('[auth]', () => {
      it("should throw CustomError('Unauthorized. Log out first', 401) if req.isAuth = false i.e. not logged in", async () => {
        mockReq.isAuth = false;
        mockReq.userId = '123456789012';

        try {
          const result = await fn(mockArgs, mockReq as Request);

          expect(result).to.be.undefined;
        } catch (err) {
          // To throw the error thrown by expect when expect in try fails
          if (!(err instanceof CustomError)) throw err;

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
          if (!(err instanceof CustomError)) throw err;

          expect(err).to.be.instanceOf(CustomError);
          expect(err).to.have.property('message', 'Unauthorized. Log in first');
          expect(err).to.have.property('status', 401);
          expect(err).to.have.property('data').that.is.empty;
        }
      });
    });
  }

  function checkUserExistTest<Arg, Ret>(
    fn: (args: Arg, req: Request) => Promise<Ret>,
    mockArgs: Arg
  ) {
    it("should throw CustomError('User not found') when user does not exist", async () => {
      // Change resolve value for this test
      userFindByIdStub.resolves(null);

      try {
        const result: Ret = await fn(mockArgs, mockReq as Request);

        expect(result).to.be.undefined;
      } catch (err) {
        // To throw the error thrown by expect when expect in try fails
        if (!(err instanceof CustomError)) throw err;

        expect(err).to.be.instanceOf(CustomError);
        expect(err).to.have.property('message', 'User not found');
        expect(err).to.have.property('status', 401);
        expect(err).to.have.property('data').that.is.empty;
      }
    });
  }

  const mockReq: Partial<Request> = {
    isAuth: true,
    userId: '123456789012'
  };

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

    const mockArgs: ArgsType = { tags: ['newTag', 'TAGS'] };

    beforeEach(() => {
      mockArgs.tags = ['newTag', 'tags'];
    });

    authTests<ArgsType, RetType>(tags.addTags, mockArgs);

    describe('[input validation]', () => {
      it("should throw CustomError('Invalid Input') when there are no valid tags given", async () => {
        mockArgs.tags = ['tt', '12', '    12    '];

        try {
          const result = await tags.addTags(mockArgs, mockReq as Request);

          expect(result).to.be.undefined;
        } catch (err) {
          // To throw the error thrown by expect when expect in try fails
          if (!(err instanceof CustomError)) throw err;

          expect(err).to.be.instanceOf(CustomError);
          expect(err).to.have.property('message', 'Invalid Input');
          expect(err).to.have.property('status', 422);
          expect(err).to.have.property('data').that.deep.includes({
            message: 'No valid tags',
            field: 'tags'
          });
        }
      });
    });

    describe('[DB]', () => {
      checkUserExistTest<ArgsType, RetType>(tags.addTags, mockArgs);

      it('should return [] and not call save if there are no tags to be added', async () => {
        // Reset save for this test as its calls need to be traced
        userInstance.save.reset();

        // Replace args.tags by tags in unppercase that are already present in DB
        mockArgs.tags.splice(
          0,
          mockArgs.tags.length - 1,
          ...userInstance.tags.map(t => t.toUpperCase())
        );

        try {
          const result = await tags.addTags(mockArgs, mockReq as Request);

          expect(userInstance.save.called).to.be.false;
          expect(result).to.be.an('array').that.is.empty;
        } catch (err) {
          // To throw the error thrown by expect when expect in try fails
          if (!(err instanceof CustomError)) throw err;

          expect(err).to.be.undefined;
        }
      });

      it('should save all of existing tags and new tags to DB', done => {
        const tagsThatAreToBeSaved = Array.from(
          new Set(userInstance.tags.concat(mockArgs.tags))
        );

        userInstance.save.callsFake(function (this: unknown) {
          // have.members use when Un-Order Wholeness Matters
          // will give timeout error when this fails
          expect((this as IUser).tags).to.have.members(tagsThatAreToBeSaved);

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
          if (!(err instanceof CustomError)) throw err;

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
          // To throw the error thrown by expect when expect in try fails
          if (!(err instanceof CustomError)) throw err;

          expect(err).to.be.undefined;
        }
      });
    });
  });

  describe('[listTags]', () => {
    type ArgsType = Parameters<T.ListTags>[0];
    type RetType = GetPromiseResolveType<ReturnType<T.ListTags>>;

    authTests<ArgsType, RetType>(tags.listTags, null);

    describe('[DB]', () => {
      checkUserExistTest<ArgsType, RetType>(tags.listTags, null);
    });

    describe('[return value]', () => {
      it('should return only the tags stored in users document', async () => {
        const result = await tags.listTags(null, mockReq as Request);

        // have.members use when Un-Order Wholeness Matters
        expect(result).to.have.members(userInstance.tags);
      });
    });
  });

  describe('[searchTags]', () => {
    type ArgsType = Parameters<T.SearchTags>[0];
    type RetType = GetPromiseResolveType<ReturnType<T.SearchTags>>;

    const mockArgs: ArgsType = { tag: 'old' };

    beforeEach(() => {
      mockArgs.tag = 'old';
    });

    authTests<ArgsType, RetType>(tags.searchTags, mockArgs);

    describe('[input validation]', () => {
      it("should throw CustomError('Invalid Input') when invalid tag is given", async () => {
        mockArgs.tag = '   ';

        try {
          const result = await tags.searchTags(mockArgs, mockReq as Request);

          expect(result).to.be.undefined;
        } catch (err) {
          // To throw the error thrown by expect when expect in try fails
          if (!(err instanceof CustomError)) throw err;

          expect(err).to.be.instanceOf(CustomError);
          expect(err).to.have.property('message', 'Invalid Input');
          expect(err).to.have.property('status', 422);
          expect(err).to.have.property('data').that.deep.includes({
            message: 'Empty tag given',
            field: 'tag'
          });
        }
      });
    });

    describe('[DB]', () => {
      checkUserExistTest<ArgsType, RetType>(tags.searchTags, mockArgs);
    });

    describe('[return value]', () => {
      it('should return only tags that pass the regex', async () => {
        mockArgs.tag = 'old';
        userInstance.tags = ['oldTags', 'old', 'tags'];

        const resultArr = ['oldTags', 'old'];

        const result = await tags.searchTags(mockArgs, mockReq as Request);

        expect(result).to.have.members(resultArr);
      });
    });
  });

  describe('[editTag]', () => {
    type ArgsType = Parameters<T.EditTag>[0];
    type RetType = GetPromiseResolveType<ReturnType<T.EditTag>>;

    const mockArgs: ArgsType = { oldTag: 'oldTag', newTag: 'newTag' };

    beforeEach(() => {
      mockArgs.oldTag = 'oldTag';
      mockArgs.newTag = 'newTag';
    });

    authTests<ArgsType, RetType>(tags.editTag, mockArgs);

    describe('[input validation]', () => {
      it("should throw CustomError('Invalid Input') when oldTag is invalid", async () => {
        mockArgs.oldTag = '  tt ';

        try {
          const result = await tags.editTag(mockArgs, mockReq as Request);

          expect(result).to.be.undefined;
        } catch (err) {
          // To throw the error thrown by expect when expect in try fails
          if (!(err instanceof CustomError)) throw err;

          expect(err).to.be.instanceOf(CustomError);
          expect(err).to.have.property('message', 'Invalid Input');
          expect(err).to.have.property('status', 422);
          expect(err).to.have.property('data').that.deep.includes({
            message: 'Old tag must be of length 3 to 20 characters',
            field: 'oldTag'
          });
        }
      });

      it("should throw CustomError('Invalid Input') when newTag is invalid", async () => {
        mockArgs.newTag = '  tt ';

        try {
          const result = await tags.editTag(mockArgs, mockReq as Request);

          expect(result).to.be.undefined;
        } catch (err) {
          // To throw the error thrown by expect when expect in try fails
          if (!(err instanceof CustomError)) throw err;

          expect(err).to.be.instanceOf(CustomError);
          expect(err).to.have.property('message', 'Invalid Input');
          expect(err).to.have.property('status', 422);
          expect(err).to.have.property('data').that.deep.includes({
            message: 'New tag must be of length 3 to 20 characters',
            field: 'newTag'
          });
        }
      });

      it("should throw CustomError('Invalid Input') when newTag is same as oldTag", async () => {
        mockArgs.oldTag = mockArgs.newTag = 'tag';

        try {
          const result = await tags.editTag(mockArgs, mockReq as Request);

          expect(result).to.be.undefined;
        } catch (err) {
          // To throw the error thrown by expect when expect in try fails
          if (!(err instanceof CustomError)) throw err;

          expect(err).to.be.instanceOf(CustomError);
          expect(err).to.have.property('message', 'Invalid Input');
          expect(err).to.have.property('status', 422);
          expect(err).to.have.property('data').that.deep.includes({
            message: "New tag can't be same as Old tag",
            field: 'newTag'
          });
        }
      });
    });

    describe('[DB]', () => {
      checkUserExistTest<ArgsType, RetType>(tags.editTag, mockArgs);

      it("should throw CustomError('Invalid Input') when oldTag does not exist in document", async () => {
        mockArgs.oldTag = '  ttt   ';

        try {
          const result = await tags.editTag(mockArgs, mockReq as Request);

          expect(result).to.be.undefined;
        } catch (err) {
          // To throw the error thrown by expect when expect in try fails
          if (!(err instanceof CustomError)) throw err;

          expect(err).to.be.instanceOf(CustomError);
          expect(err).to.have.property('message', 'Invalid Input');
          expect(err).to.have.property('status', 422);
          expect(err).to.have.property('data').that.deep.includes({
            message: "Old tag doesn't exist",
            field: 'oldTag'
          });
        }
      });

      it("should throw CustomError('Invalid Input') when newTag exist in document", async () => {
        /**
         * userInstance.tags[0] is used for mockArgs.oldTag
         * so use userInstance.tags[1]
         */
        mockArgs.newTag = userInstance.tags[1];

        try {
          const result = await tags.editTag(mockArgs, mockReq as Request);

          expect(result).to.be.undefined;
        } catch (err) {
          // To throw the error thrown by expect when expect in try fails
          if (!(err instanceof CustomError)) throw err;

          expect(err).to.be.instanceOf(CustomError);
          expect(err).to.have.property('message', 'Invalid Input');
          expect(err).to.have.property('status', 422);
          expect(err).to.have.property('data').that.deep.includes({
            message: 'New tag already exist',
            field: 'newTag'
          });
        }
      });

      it('should not save oldTag and sould save newTag', done => {
        userInstance.save.callsFake(function (this: unknown) {
          const tags = (this as IUser).tags;

          // will give timeout error when this fails
          expect(tags).to.include(mockArgs.newTag);
          expect(tags).to.not.include(mockArgs.oldTag);

          done();
        });

        tags.editTag(mockArgs, mockReq as Request);
      });

      it("should throw CustomError('Could not update') when edited tag could not be saved", async () => {
        userInstance.save.resolves(null);

        try {
          const result = await tags.editTag(mockArgs, mockReq as Request);

          expect(result).to.be.undefined;
        } catch (err) {
          // To throw the error thrown by expect when expect in try fails
          if (!(err instanceof CustomError)) throw err;

          expect(err).to.be.instanceOf(CustomError);
          expect(err).to.have.property('message', 'Could not update');
          expect(err).to.have.property('status', 500);
          expect(err).to.have.property('data').that.is.empty;
        }
      });
    });

    describe('[return value]', () => {
      it('should return newTag iff it is saved to DB', async () => {
        try {
          const result = await tags.editTag(mockArgs, mockReq as Request);

          expect(result).to.equal(mockArgs.newTag);
        } catch (err) {
          // To throw the error thrown by expect when expect in try fails
          if (!(err instanceof CustomError)) throw err;

          expect(err).to.be.undefined;
        }
      });
    });
  });

  describe('[deleteTags]', () => {
    type ArgsType = Parameters<T.DeleteTags>[0];
    type RetType = GetPromiseResolveType<ReturnType<T.DeleteTags>>;

    const mockArgs: ArgsType = { tags: ['newTag', 'TAGS'] };

    beforeEach(() => {
      mockArgs.tags = ['newTag', 'tags'];
    });

    authTests<ArgsType, RetType>(tags.deleteTags, mockArgs);

    describe('[input validation]', () => {
      it("should throw CustomError('Invalid Input') when there are no valid tags given", async () => {
        mockArgs.tags = ['tt', '12', '    12    '];

        try {
          const result = await tags.addTags(mockArgs, mockReq as Request);

          expect(result).to.be.undefined;
        } catch (err) {
          // To throw the error thrown by expect when expect in try fails
          if (!(err instanceof CustomError)) throw err;

          expect(err).to.be.instanceOf(CustomError);
          expect(err).to.have.property('message', 'Invalid Input');
          expect(err).to.have.property('status', 422);
          expect(err).to.have.property('data').that.deep.includes({
            message: 'No valid tags',
            field: 'tags'
          });
        }
      });
    });

    describe('[DB]', () => {
      checkUserExistTest<ArgsType, RetType>(tags.deleteTags, mockArgs);

      it('should return [] and not call save if there are no tags to be deleted', async () => {
        // Reset save for this test as its calls need to be traced
        userInstance.save.reset();

        // Replace args.tags by tags that are not present in DB
        mockArgs.tags = ['new tag', 'test'];

        try {
          const result = await tags.deleteTags(mockArgs, mockReq as Request);

          expect(userInstance.save.called).to.be.false;
          expect(result).to.be.an('array').that.is.empty;
        } catch (err) {
          // To throw the error thrown by expect when expect in try fails
          if (!(err instanceof CustomError)) throw err;

          expect(err).to.be.undefined;
        }
      });

      it('should not save tags to be deleted to DB', done => {
        userInstance.save.callsFake(function (this: unknown) {
          // will give timeout error when this fails

          // this doesn't work as stated in docs
          // expect(tags).to.not.have.members(userInstance.tags);

          expect((this as IUser).tags).to.satisfy((tags: Array<string>) =>
            tags.reduce((acc: boolean, tag: string) => {
              if (!acc) return false;

              return mockArgs.tags.find(t => t === tag) ? false : true;
            }, true)
          );

          done();
        });

        tags.deleteTags(mockArgs, mockReq as Request);
      });

      it("should throw CustomError('Could not update') when deleted tags are not saved", async () => {
        userInstance.save.resolves({});

        try {
          const result = await tags.deleteTags(mockArgs, mockReq as Request);

          expect(result).to.be.undefined;
        } catch (err) {
          // To throw the error thrown by expect when expect in try fails
          if (!(err instanceof CustomError)) throw err;

          expect(err).to.be.instanceOf(CustomError);
          expect(err).to.have.property('message', 'Could not update');
          expect(err).to.have.property('status', 500);
          expect(err).to.have.property('data').to.be.empty;
        }
      });
    });

    describe('[return value]', () => {
      it('should only return tags that are deleted', async () => {
        // Found by comparing userInstance.tages and mockArgs.tags
        const tagsThatAreAdded = ['tags'];

        try {
          const result = await tags.deleteTags(mockArgs, mockReq as Request);

          // Unordered Wholeness Matters — .to.have.members
          expect(result).to.have.members(tagsThatAreAdded);
        } catch (err) {
          // To throw the error thrown by expect when expect in try fails
          if (!(err instanceof CustomError)) throw err;

          expect(err).to.be.undefined;
        }
      });
    });
  });
});
