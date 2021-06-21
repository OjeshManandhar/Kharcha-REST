// packages
import { expect, AssertionError } from 'chai';

// model
// import Record, { IRecord } from 'models/record';

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

  const mockReq: Partial<Request> = {
    isAuth: true,
    userId: '123456789012'
  };

  beforeEach(() => {
    mockReq.isAuth = true;
    mockReq.userId = '123456789012';
  });

  describe('[createRecord]', () => {
    type ArgsType = Parameters<T.CreateRecord>[0];
    type RetType = GetPromiseResolveType<ReturnType<T.CreateRecord>>;

    const mockArgs: ArgsType = {
      record: {
        _id: null,
        date: new Date(),
        amount: 100.0,
        type: RecordType.DEBIT,
        tags: [],
        description: ''
      }
    };

    beforeEach(() => {
      mockArgs.record = {
        _id: null,
        date: new Date(),
        amount: 100.0,
        type: RecordType.DEBIT,
        tags: [],
        description: ''
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
          if (err instanceof AssertionError) throw err;

          expect(err).to.be.instanceOf(CustomError);
          expect(err).to.have.property('message', 'Invalid Input');
          expect(err).to.have.property('status', 422);
          expect(err)
            .to.have.property('data')
            .that.have.deep.members(errorsList);
        }
      });
    });
  });
});
