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
import type { Document } from 'mongoose';
import type * as T from 'gql/resolvers/records/types';

type GetPromiseResolveType<T> = T extends PromiseLike<infer U>
  ? GetPromiseResolveType<U> // For recusive ness
  : T;

describe('[records] Records resolver', () => {
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
    _id: mockReq.userId,
    username: 'test',
    password: 'password',
    tags: ['oldTag', 'tags']
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
        _id: undefined,
        date: new Date('2021-06-01'),
        amount: 100.0,
        type: RecordType.DEBIT,
        tags: ['newTags', 'TAgs'],
        description: '   description  '
      }
    };

    beforeEach(() => {
      mockArgs.record = {
        _id: undefined,
        date: new Date('2021-06-01'),
        amount: 100.0,
        type: RecordType.DEBIT,
        tags: ['newTags', 'TAgs'],
        description: '   description  '
      };
    });

    authTests<ArgsType, RetType>(records.createRecord, mockArgs);

    describe('[input validation]', () => {
      it("should throw CustomError('Invalid Input') with data containting result of validateRecordInput()", async () => {
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

            // will give timeout error when any of this fails
            expect(userId).to.not.be.null;
            expect(userId).to.not.be.undefined;
            expect(tags).to.have.deep.members(expectedValues.tags);
            expect(description).to.equal(expectedValues.description);

            done();
            recordStub.restore();
          });

        records.createRecord(mockArgs, mockReq as Request);
      });

      it("should throw CustomError('Could not create') when new record is not saved", async () => {
        const recordStub = sinon
          .stub(Record.prototype, 'save')
          .resolves(undefined);

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
          expect(err).to.have.property('message', 'Could not create');
          expect(err).to.have.property('status', 500);
          expect(err).to.have.property('data').that.is.empty;
        }

        recordStub.restore();
      });
    });

    describe('[return value]', () => {
      it('should return data that is saved by .save()', async () => {
        const expectedData = {
          _id: '',
          userId: '',
          date: new Date(),
          amount: 0,
          type: RecordType.CREDIT,
          tags: [''],
          description: ''
        };

        const recordSaveStub = sinon
          .stub(Record.prototype, 'save')
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .callsFake(function (this: IRecord & Document<any, any>) {
            /**
             * Copying this to expectedData for comparision and changing
             * expectedData._id to this._id.toString()
             * expectedData.userId to this.userId.toString()
             * as createRecord() will retirn _id as string
             */
            expectedData._id = this._id.toString();
            expectedData.userId = this.userId.toString();
            expectedData.date = this.date;
            expectedData.amount = this.amount;
            expectedData.type = this.type;
            expectedData.tags = this.tags;
            expectedData.description = this.description;

            return this;
          });

        try {
          const result = await records.createRecord(
            mockArgs,
            mockReq as Request
          );

          expect(result).to.have.property('_id', expectedData._id);
          expect(result).to.have.property('userId', expectedData.userId);
          expect(result)
            .to.have.property('date')
            .that.deep.equals(expectedData.date);
          expect(result).to.have.property('amount', expectedData.amount);
          expect(result).to.have.property('type', expectedData.type);
          expect(result)
            .to.have.property('tags')
            .that.have.deep.members(expectedData.tags);
          expect(result).to.have.property(
            'description',
            expectedData.description
          );
        } catch (err) {
          // To throw the error thrown by expect when expect in try fails
          if (!(err instanceof CustomError)) throw err;

          expect(err).to.be.undefined;
        }

        recordSaveStub.restore();
      });
    });
  });

  describe('[listRecords]', () => {
    type ArgsType = Parameters<T.ListRecords>[0];
    type RetType = GetPromiseResolveType<ReturnType<T.ListRecords>>;

    authTests<ArgsType, RetType>(records.listRecords, null);

    describe('[DB]', () => {
      checkUserExistTest<ArgsType, RetType>(records.listRecords, null);
    });

    describe('[return value]', () => {
      it('should return records sorted in descending order of id', async () => {
        const dummyRecords = [
          {
            _id: '1',
            userId: userInstance._id,
            date: new Date(),
            amount: 123.45,
            type: RecordType.DEBIT,
            tags: [],
            description: 'ID = 1',
            toJSON: sinon.stub().returnsThis()
          },
          {
            _id: '2',
            userId: userInstance._id,
            date: new Date(),
            amount: 123.45,
            type: RecordType.DEBIT,
            tags: [],
            description: 'ID = 2',
            toJSON: sinon.stub().returnsThis()
          }
        ];

        const returnArr = dummyRecords.reverse();

        const recordFindStub = sinon
          .stub(Record, 'find')
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          .returns(dummyRecords);

        const recordSortStub = sinon
          .stub(dummyRecords, 'sort')
          .returns(returnArr);

        const result = await records.listRecords(null, mockReq as Request);

        // expect(result).to.deep.equal(returnArr);
        // have.ordered.members use when Order Wholeness Matters
        expect(result).to.have.deep.ordered.members(returnArr);

        recordFindStub.restore();
        recordSortStub.restore();
      });
    });
  });

  describe('[editRecord]', () => {
    type ArgsType = Parameters<T.EditRecord>[0];
    type RetType = GetPromiseResolveType<ReturnType<T.EditRecord>>;

    const RECORD_INSTANCE_DATA = {
      _id: '123',
      userId: mockReq.userId,
      date: new Date('2021-08-01'),
      amount: 123.45,
      type: RecordType.CREDIT,
      tags: ['oldTag'],
      description: 'description'
    };

    const mockArgs: ArgsType = {
      record: {
        _id: '123',
        date: new Date('2021-06-01'),
        amount: 100.0,
        type: RecordType.DEBIT,
        tags: ['newTags', 'TAgs'],
        description: '   should be trimmed  '
      }
    };

    const recordInstance = {
      ...sinon.createStubInstance(Record),
      ...RECORD_INSTANCE_DATA,
      save: sinon.stub().resolvesThis(),
      toJSON: sinon.stub().returnsThis()
    };

    let recordFindByIdStub: SinonStub;

    beforeEach(() => {
      Object.assign(recordInstance, RECORD_INSTANCE_DATA);
      recordInstance.save = sinon.stub().resolvesThis();
      recordInstance.toJSON = sinon.stub().returnsThis();

      mockArgs.record = {
        _id: '123',
        date: new Date('2021-06-01'),
        amount: 100.0,
        type: RecordType.DEBIT,
        tags: ['newTags', 'TAgs'],
        description: '   description  '
      };

      recordFindByIdStub = sinon
        .stub(Record, 'findById')
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        .resolves(recordInstance);
    });

    afterEach(() => {
      recordFindByIdStub.restore();
    });

    authTests<ArgsType, RetType>(records.editRecord, mockArgs);

    describe('[input validation]', () => {
      it("should throw CustomError('Invalid Input') with data about _id when _id is missing", async () => {
        mockArgs.record._id = undefined;

        const errorMessage = [
          {
            message: '_id is required and cannot be blank',
            field: '_id'
          }
        ];

        try {
          const result = await records.editRecord(mockArgs, mockReq as Request);

          expect(result).to.be.undefined;
        } catch (err) {
          // To throw the error thrown by expect when expect in try fails
          if (!(err instanceof CustomError)) throw err;

          expect(err).to.be.instanceOf(CustomError);
          expect(err).to.have.property('message', 'Invalid Input');
          expect(err).to.have.property('status', 422);
          expect(err)
            .to.have.property('data')
            .that.have.deep.members(errorMessage);
        }
      });

      it("should throw CustomError('Invalid Input') with data containting result of validateRecordInput()", async () => {
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
      checkUserExistTest<ArgsType, RetType>(records.editRecord, mockArgs);

      it("should throw CustomError('Record not found') when record._id is invalid", async () => {
        recordFindByIdStub.resolves(null);

        try {
          const result = await records.editRecord(mockArgs, mockReq as Request);

          expect(result).to.be.undefined;
        } catch (err) {
          // To throw the error thrown by expect when expect in try fails
          if (!(err instanceof CustomError)) throw err;

          expect(err).to.be.instanceOf(CustomError);
          expect(err).to.have.property('message', 'Record not found');
          expect(err).to.have.property('status', 422);
          expect(err)
            .to.have.property('data')
            .that.have.deep.members([
              {
                message: 'Invalid _id',
                field: '_id'
              }
            ]);
        }
      });

      it("should throw CustomError('Unauthorized') when current user did not create the record", async () => {
        recordInstance.userId = '098765432109';

        try {
          const result = await records.editRecord(mockArgs, mockReq as Request);

          expect(result).to.be.undefined;
        } catch (err) {
          // To throw the error thrown by expect when expect in try fails
          if (!(err instanceof CustomError)) throw err;

          expect(err).to.be.instanceOf(CustomError);
          expect(err).to.have.property('message', 'Unauthorized');
          expect(err).to.have.property('status', 401);
          expect(err).to.have.property('data').that.is.empty;
        }
      });

      it('should only save valid tags & trimmed description', done => {
        const expectedValues = {
          ...mockArgs.record,
          tags: ['tags'],
          description: trim(mockArgs.record.description)
        };

        recordInstance.save.callsFake(function (this: IRecord) {
          const { userId, date, amount, type, tags, description } = this;

          // will give timeout error when any of this fails
          expect(userId).to.equal(mockReq.userId);
          expect(userId).to.equal(recordInstance.userId);
          expect(date).to.equal(expectedValues.date);
          expect(amount).to.equal(expectedValues.amount);
          expect(type).to.equal(expectedValues.type);
          expect(tags).to.have.deep.members(expectedValues.tags);
          expect(description).to.equal(expectedValues.description);

          done();
        });

        records.editRecord(mockArgs, mockReq as Request);
      });

      it("should throw CustomError('Could not edit') when edited record could not be saved", async () => {
        recordInstance.save.resolves(null);

        try {
          const result = await records.editRecord(mockArgs, mockReq as Request);

          expect(result).to.be.undefined;
        } catch (err) {
          // To throw the error thrown by expect when expect in try fails
          if (!(err instanceof CustomError)) throw err;

          expect(err).to.be.instanceOf(CustomError);
          expect(err).to.have.property('message', 'Could not edit');
          expect(err).to.have.property('status', 500);
          expect(err).to.have.property('data').that.is.empty;
        }
      });
    });

    describe('[return value]', () => {
      it('should return data that is saved by .save()', async () => {
        const expectedData = {
          _id: '',
          userId: '',
          date: new Date(),
          amount: 0,
          type: RecordType.CREDIT,
          tags: [''],
          description: ''
        };

        recordInstance.save
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .callsFake(function (this: IRecord & Document<any, any>) {
            /**
             * Copying this to expectedData for comparision and changing
             * expectedData._id to this._id.toString()
             * expectedData.userId to this.userId.toString()
             * as createRecord() will retirn _id as string
             */
            expectedData._id = this._id.toString();
            expectedData.userId = this.userId.toString();
            expectedData.date = this.date;
            expectedData.amount = this.amount;
            expectedData.type = this.type;
            expectedData.tags = this.tags;
            expectedData.description = this.description;

            return this;
          });

        try {
          const result = await records.editRecord(mockArgs, mockReq as Request);

          expect(result).to.have.property('_id', expectedData._id);
          expect(result).to.have.property('userId', expectedData.userId);
          expect(result)
            .to.have.property('date')
            .that.deep.equals(expectedData.date);
          expect(result).to.have.property('amount', expectedData.amount);
          expect(result).to.have.property('type', expectedData.type);
          expect(result)
            .to.have.property('tags')
            .that.have.deep.members(expectedData.tags);
          expect(result).to.have.property(
            'description',
            expectedData.description
          );
        } catch (err) {
          // To throw the error thrown by expect when expect in try fails
          if (!(err instanceof CustomError)) throw err;

          expect(err).to.be.undefined;
        }
      });
    });
  });

  describe('[deleteRecord]', () => {
    type ArgsType = Parameters<T.DeleteRecord>[0];
    type RetType = GetPromiseResolveType<ReturnType<T.DeleteRecord>>;

    const RECORD_INSTANCE_DATA = {
      _id: '123',
      userId: mockReq.userId,
      date: new Date('2021-08-01'),
      amount: 123.45,
      type: RecordType.CREDIT,
      tags: ['oldTag'],
      description: 'description'
    };

    const mockArgs: ArgsType = {
      _id: '123'
    };

    const recordInstance = {
      ...sinon.createStubInstance(Record),
      ...RECORD_INSTANCE_DATA,
      save: sinon.stub().resolvesThis(),
      toJSON: sinon.stub().returnsThis()
    };

    let recordFindByIdStub: SinonStub;

    beforeEach(() => {
      mockArgs._id = '123';

      Object.assign(recordInstance, RECORD_INSTANCE_DATA);
      recordInstance.save = sinon.stub().resolvesThis();
      recordInstance.toJSON = sinon.stub().returnsThis();

      recordFindByIdStub = sinon
        .stub(Record, 'findById')
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        .resolves(recordInstance);
    });

    afterEach(() => {
      recordFindByIdStub.restore();
    });

    authTests<ArgsType, RetType>(records.deleteRecord, mockArgs);

    describe('[validation]', () => {
      it("should throw CustomError('Invalid Input') if _id is not given", async () => {
        mockArgs._id = '';

        try {
          const result = await records.deleteRecord(
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
            .that.have.deep.members([
              {
                message: '_id is required and cannot be blank',
                field: '_id'
              }
            ]);
        }
      });
    });

    describe('[DB]', () => {
      checkUserExistTest<ArgsType, RetType>(records.deleteRecord, mockArgs);

      it("should throw CustomError('Record not found') when record._id is invalid", async () => {
        recordFindByIdStub.resolves(null);

        try {
          const result = await records.deleteRecord(
            mockArgs,
            mockReq as Request
          );

          expect(result).to.be.undefined;
        } catch (err) {
          // To throw the error thrown by expect when expect in try fails
          if (!(err instanceof CustomError)) throw err;

          expect(err).to.be.instanceOf(CustomError);
          expect(err).to.have.property('message', 'Record not found');
          expect(err).to.have.property('status', 422);
          expect(err)
            .to.have.property('data')
            .that.have.deep.members([
              {
                message: 'Invalid _id',
                field: '_id'
              }
            ]);
        }
      });

      it("should throw CustomError('Unauthorized') when current user did not create the record", async () => {
        recordInstance.userId = '098765432109';

        try {
          const result = await records.deleteRecord(
            mockArgs,
            mockReq as Request
          );

          expect(result).to.be.undefined;
        } catch (err) {
          // To throw the error thrown by expect when expect in try fails
          if (!(err instanceof CustomError)) throw err;

          expect(err).to.be.instanceOf(CustomError);
          expect(err).to.have.property('message', 'Unauthorized');
          expect(err).to.have.property('status', 401);
          expect(err).to.have.property('data').that.is.empty;
        }
      });

      it("should throw CustomError('Could not delete record') when the record is not deleted", async () => {
        const recordStub = sinon.stub(Record, 'deleteOne').resolves({
          deletedCount: 0
        });

        try {
          const result = await records.deleteRecord(
            mockArgs,
            mockReq as Request
          );

          expect(result).to.be.undefined;
        } catch (err) {
          // To throw the error thrown by expect when expect in try fails
          if (!(err instanceof CustomError)) throw err;

          expect(err).to.be.instanceOf(CustomError);
          expect(err).to.have.property('message', 'Could not delete record');
          expect(err).to.have.property('status', 500);
          expect(err).to.have.property('data').that.is.empty;
        }

        recordStub.restore();
      });
    });

    describe('[return value]', () => {
      it('should return deleted record if record is deleted', async () => {
        const recordStub = sinon.stub(Record, 'deleteOne').resolves({
          deletedCount: 1
        });

        try {
          const result = await records.deleteRecord(
            mockArgs,
            mockReq as Request
          );

          expect(result).to.have.property('_id', recordInstance._id);
          expect(result).to.have.property('userId', recordInstance.userId);
          expect(result)
            .to.have.property('date')
            .that.deep.equals(recordInstance.date);
          expect(result).to.have.property('amount', recordInstance.amount);
          expect(result).to.have.property('type', recordInstance.type);
          expect(result)
            .to.have.property('tags')
            .that.have.deep.members(recordInstance.tags);
          expect(result).to.have.property(
            'description',
            recordInstance.description
          );
        } catch (err) {
          // To throw the error thrown by expect when expect in try fails
          if (!(err instanceof CustomError)) throw err;

          expect(err).to.be.undefined;
        }

        recordStub.restore();
      });
    });
  });
});
