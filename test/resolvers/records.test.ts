// packages
import { expect } from 'chai';
import trim from 'validator/lib/trim';
import sinon, { SinonStub } from 'sinon';

// model
import User, { IUser } from 'models/user';
import Record, { IRecord } from 'models/record';

// gql
import * as records from 'gql/resolvers/records';

// utils
import CustomError from 'utils/customError';
import { validateRecordInput } from 'utils/validation';

// global
import { RecordType } from 'global/enum';

// types
import type { Request } from 'express';
import type * as T from 'gql/resolvers/records/types';

type GetPromiseResolveType<T> = T extends PromiseLike<infer U>
  ? GetPromiseResolveType<U> // For recusive ness
  : T;

describe('[records] Records resolver', () => {
  function authTests<Arg, Ret>(
    fn: (args: Arg, req: Request) => Promise<Ret>,
    mockArgs: Arg
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

    userFindByIdStub = sinon
      .stub(User, 'findById')
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      .resolves(userInstance);
  });

  afterEach(() => {
    userFindByIdStub.restore();
    sinon.restore();
  });

  describe('[createRecord]', () => {
    type ArgsType = Parameters<T.CreateRecord>[0];
    type RetType = GetPromiseResolveType<ReturnType<T.CreateRecord>>;

    const mockArgs: ArgsType = {
      record: {
        _id: null,
        date: new Date('2021-06-01'),
        amount: 100.0,
        type: RecordType.DEBIT,
        tags: ['newTags', 'TAgs'],
        description: '   description  '
      }
    };

    beforeEach(() => {
      mockArgs.record = {
        _id: null,
        date: new Date('2021-06-01'),
        amount: 100.0,
        type: RecordType.DEBIT,
        tags: ['newTags', 'TAgs'],
        description: '   description  '
      };
    });

    authTests<ArgsType, RetType>(records.createRecord, mockArgs);

    describe('[input validation]', () => {
      it("should throw  CustomError('Invalid Input') with data containting result of validateRecordInput()", async () => {
        mockArgs.record = {
          date: new Date('2022-05-16'),
          amount: -100.0,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          type: 'ASD',
          tags: [],
          description: ''
        };

        const errorsList = validateRecordInput(mockArgs.record);

        try {
          const result = await records.createRecord(
            mockArgs,
            mockReq as Request
          );

          expect(result).to.be.undefined;
        } catch (err) {
          // To throw the error thrown by expect when expect in try fails
          if (!(err instanceof CustomError)) throw err;

          expect(err).to.be.instanceOf(CustomError);
          expect(err).to.have.property('message', 'Invalid Input');
          expect(err).to.have.property('status', 422);
          expect(err)
            .to.have.property('data')
            .that.have.deep.members(errorsList);
        }
      });
    });

    describe('[DB]', () => {
      checkUserExistTest<ArgsType, RetType>(records.createRecord, mockArgs);

      it('should save userId, valid tags & trimmed description', done => {
        const expectedValues = {
          tags: ['tags'],
          description: trim(mockArgs.record.description)
        };

        const recordStub = sinon
          .stub(Record.prototype, 'save')
          .callsFake(function (this: IRecord) {
            const { userId, tags, description } = this;

            // will give timeout error when aany of this fails
            expect(userId).to.be.ok;
            expect(tags).to.have.deep.members(expectedValues.tags);
            expect(description).to.equal(expectedValues.description);

            done();
            recordStub.restore();
          });

        records.createRecord(mockArgs, mockReq as Request);
      });
    });
  });
});
