// packages
import { expect } from 'chai';

// utils
import * as validation from './../../src/utils/validation';

// global
import {
  RecordType,
  TypeCriteria,
  FilterCriteria
} from '../../src/global/enum';

// types
import type { RecordInput, RecordFilter } from './../../src/global/types';

describe('[validation] Validation utility', () => {
  describe('[User] Validation related to user', () => {
    describe('[password]', () => {
      it('should return true when password is short', () => {
        expect(validation.passwordIsLength('1234567')).to.be.true;
      });

      it('should return false when password is long enough', () => {
        expect(validation.passwordIsLength('12345678')).to.be.false;
      });
    });

    describe('[username]', () => {
      it('should return true when username is short', () => {
        expect(validation.usernameIsLength('123')).to.be.true;
      });

      it('should return true when username is long', () => {
        expect(validation.usernameIsLength('1234567890123456')).to.be.true;
      });

      it('should return false when username is of correct length', () => {
        expect(validation.usernameIsLength('1234567')).to.be.false;
      });
    });
  });

  describe('[Tags] Validation related to tags', () => {
    describe('[trim tags]', () => {
      it('should return all tags after trimming them', () => {
        const tags = ['   asda', 'qwer', 'zxc   ', '  ads d dsda   '];
        const trimmedTags = ['asda', 'qwer', 'zxc', 'ads d dsda'];

        expect(validation.trimTags(tags)).to.have.members(trimmedTags);
      });
    });

    describe('[tags length]', () => {
      it('should return true when tag is short', () => {
        expect(validation.tagIsLength('12')).to.be.true;
      });

      it('should return true when tag is long', () => {
        expect(validation.tagIsLength('123456789012345678901')).to.be.true;
      });

      it('should return false when tag is of correct length', () => {
        expect(validation.tagIsLength('1234567')).to.be.false;
      });
    });

    describe('[filter tags]', () => {
      it('should only return tags of correct length', () => {
        const tags = [
          '12',
          '123',
          '1234567',
          '12345678901234567890',
          '123456789012345678901'
        ];
        const validTags = ['123', '1234567', '12345678901234567890'];

        expect(validation.filterTagsOnLength(tags)).to.have.members(validTags);
      });

      it('should remove duplicate(case insensitive) tags', () => {
        const tags = ['asdf', '1234', 'ASDF', 'asdf', 'aSdF', 'a s d f'];
        const validTags = ['asdf', '1234', 'a s d f'];

        expect(validation.filterDuplicateTags(tags)).to.have.members(validTags);
      });

      it('should return tags that are trimmed, of valid length and unique(no case insensitive deplicates)', () => {
        const tags = [
          '   12',
          '12',
          'test',
          '   test    ',
          'tester',
          'TEST',
          'noTags',
          'no tags',
          'TesTer',
          'tt',
          '   gift'
        ];
        const validTags = ['test', 'tester', 'noTags', 'no tags', 'gift'];

        expect(validation.filterUniqueValidTags(tags)).to.have.members(
          validTags
        );
      });
    });
  });

  describe('[Records] Validation related to records', () => {
    describe('[record input]', () => {
      const record: RecordInput = {
        _id: null,
        date: new Date('2021-01-01'),
        amount: 100,
        type: RecordType.DEBIT,
        tags: [],
        description: ''
      };

      beforeEach(() => {
        record.date = new Date('2021-01-01');
        record.amount = 100;
        record.type = RecordType.DEBIT;
        record.tags = [];
        record.description = '';
      });

      describe('[date]', () => {
        it('should not return error on date field when date is today or before today', () => {
          expect(validation.validateRecordInput(record))
            .to.be.an('array')
            .and.not.deep.include({
              message: 'date must be at today or before today',
              field: 'date'
            });
        });

        it('should return error on date field when date is after today', () => {
          record.date = new Date('2022-01-01');

          expect(validation.validateRecordInput(record))
            .to.be.an('array')
            .and.deep.include({
              message: 'date must be at today or before today',
              field: 'date'
            });
        });
      });

      describe('[amount]', () => {
        it('should not return error on amount field when amount is greater than 0', () => {
          expect(validation.validateRecordInput(record))
            .to.be.an('array')
            .and.not.deep.include({
              message: 'amount must be greater than 0',
              field: 'amount'
            });
        });

        it('should return error on amount field when amount is 0', () => {
          record.amount = 0;

          expect(validation.validateRecordInput(record))
            .to.be.an('array')
            .and.deep.include({
              message: 'amount must be greater than 0',
              field: 'amount'
            });
        });

        it('should return error on amount field when amount is less than 0', () => {
          record.amount = -1;

          expect(validation.validateRecordInput(record))
            .to.be.an('array')
            .and.deep.include({
              message: 'amount must be greater than 0',
              field: 'amount'
            });
        });
      });

      describe('[tags]', () => {
        it(`should not return error on type field when type is '${RecordType.DEBIT}'`, () => {
          expect(validation.validateRecordInput(record))
            .to.be.an('array')
            .and.not.deep.include({
              message: `type must be either '${RecordType.DEBIT}' or '${RecordType.CREDIT}'`,
              field: 'type'
            });
        });

        it(`should not return error on type field when type is '${RecordType.CREDIT}'`, () => {
          record.type = RecordType.CREDIT;

          expect(validation.validateRecordInput(record))
            .to.be.an('array')
            .and.not.deep.include({
              message: `type must be either '${RecordType.DEBIT}' or '${RecordType.CREDIT}'`,
              field: 'type'
            });
        });

        it(`should return error on type field when type is not '${RecordType.DEBIT}' or '${RecordType.DEBIT}'`, () => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
          // @ts-ignore
          record.type = 'ASD';

          expect(validation.validateRecordInput(record))
            .to.be.an('array')
            .and.deep.include({
              message: `type must be either '${RecordType.DEBIT}' or '${RecordType.CREDIT}'`,
              field: 'type'
            });
        });
      });
    });

    describe('[record filter]', () => {
      const criteria: RecordFilter = {
        idStart: '123',
        idEnd: '234',
        dateStart: new Date('2020-01-01'),
        dateEnd: new Date('2020-02-01'),
        amountStart: 100,
        amountEnd: 200,
        type: TypeCriteria.ANY,
        tagsType: FilterCriteria.ANY,
        tags: [],
        description: '',
        filterCriteria: FilterCriteria.ANY
      };

      beforeEach(() => {
        criteria.idStart = '123';
        criteria.idEnd = '234';
        criteria.dateStart = new Date('2020-01-01');
        criteria.dateEnd = new Date('2020-02-01');
        criteria.amountStart = 100;
        criteria.amountEnd = 200;
        criteria.type = TypeCriteria.ANY;
        criteria.tagsType = FilterCriteria.ANY;
        criteria.tags = [];
        criteria.description = '';
        criteria.filterCriteria = FilterCriteria.ANY;
      });

      describe('[_id]', () => {
        it('should not return error on idStart or idEnd field if any one is not given', () => {
          criteria.idStart = null;
          criteria.idEnd = '234';

          expect(validation.validateRecordFilter(criteria))
            .to.be.an('array')
            .and.not.deep.include({
              message: 'idEnd cannot be smaller than idStart',
              field: 'idEnd'
            });

          criteria.idStart = '123';
          criteria.idEnd = null;

          expect(validation.validateRecordFilter(criteria))
            .to.be.an('array')
            .and.not.deep.include({
              message: 'idEnd cannot be smaller than idStart',
              field: 'idEnd'
            });
        });

        it('should not return error on idStart or idEnd field when both are given and idStart comes before idEnd', () => {
          expect(validation.validateRecordFilter(criteria))
            .to.be.an('array')
            .and.not.deep.include({
              message: 'idEnd cannot be smaller than idStart',
              field: 'idEnd'
            });
        });

        it('should return error on idEnd field when both are given and idStart comes after idEnd', () => {
          criteria.idStart = '234';
          criteria.idEnd = '123';

          expect(validation.validateRecordFilter(criteria))
            .to.be.an('array')
            .and.deep.include({
              message: 'idEnd cannot be smaller than idStart',
              field: 'idEnd'
            });
        });
      });

      describe('[date]', () => {
        it('should not return error on field dateStart if it is not given or is given and is before today', () => {
          criteria.dateStart = null;
          criteria.dateEnd = null;
          expect(validation.validateRecordFilter(criteria))
            .to.be.an('array')
            .and.not.deep.include({
              message: 'dateStart must be today or before today',
              field: 'dateStart'
            });

          criteria.dateStart = new Date('2021-06-12');
          criteria.dateEnd = null;
          expect(validation.validateRecordFilter(criteria))
            .to.be.an('array')
            .and.not.deep.include({
              message: 'dateStart must be today or before today',
              field: 'dateStart'
            });
        });

        it('should return error on field dateStart if it is given and after today', () => {
          criteria.dateStart = new Date('2022-01-01');
          criteria.dateEnd = null;

          expect(validation.validateRecordFilter(criteria))
            .to.be.an('array')
            .and.deep.include({
              message: 'dateStart must be today or before today',
              field: 'dateStart'
            });
        });

        it('should not return error on field dateEnd if it is not given or is given and is before today', () => {
          criteria.dateStart = null;
          criteria.dateEnd = null;
          expect(validation.validateRecordFilter(criteria))
            .to.be.an('array')
            .and.not.deep.include({
              message: 'dateEnd must be today or before today',
              field: 'dateEnd'
            });

          criteria.dateStart = null;
          criteria.dateEnd = new Date('2021-06-12');
          expect(validation.validateRecordFilter(criteria))
            .to.be.an('array')
            .and.not.deep.include({
              message: 'dateEnd must be today or before today',
              field: 'dateEnd'
            });
        });

        it('should return error on field dateEnd if it is given and after today', () => {
          criteria.dateStart = null;
          criteria.dateEnd = new Date('2022-01-01');

          expect(validation.validateRecordFilter(criteria))
            .to.be.an('array')
            .and.deep.include({
              message: 'dateEnd must be today or before today',
              field: 'dateEnd'
            });
        });

        it('should not return error on field dateEnd if both are given and are before today but dateEnd is after dateStart', () => {
          criteria.dateStart = new Date('2021-01-01');
          criteria.dateEnd = new Date('2021-02-01');

          expect(validation.validateRecordFilter(criteria))
            .to.be.an('array')
            .and.not.deep.include({
              message: 'dateEnd cannot be before dateStart',
              field: 'dateEnd'
            });
        });

        it('should return error on field dateEnd if both are given and are before today but dateEnd is before dateStart', () => {
          criteria.dateStart = new Date('2021-02-01');
          criteria.dateEnd = new Date('2021-01-01');

          expect(validation.validateRecordFilter(criteria))
            .to.be.an('array')
            .and.deep.include({
              message: 'dateEnd cannot be before dateStart',
              field: 'dateEnd'
            });
        });
      });

      describe('[amount]', () => {
        it('should not return error on field amountStart if it is not given or is given and >= 0', () => {
          criteria.amountStart = null;
          criteria.amountEnd = null;
          expect(validation.validateRecordFilter(criteria))
            .to.be.an('array')
            .and.not.deep.include({
              message: 'amountStart must be greater than 0',
              field: 'amountStart'
            });

          criteria.amountStart = 0;
          criteria.amountEnd = null;
          expect(validation.validateRecordFilter(criteria))
            .to.be.an('array')
            .and.not.deep.include({
              message: 'amountStart must be greater than 0',
              field: 'amountStart'
            });
        });

        it('should return error on field amountStart if it is given and is < 0', () => {
          criteria.amountStart = -100;
          criteria.amountEnd = null;

          expect(validation.validateRecordFilter(criteria))
            .to.be.an('array')
            .and.deep.include({
              message: 'amountStart must be greater than 0',
              field: 'amountStart'
            });
        });

        it('should not return error on field amountEnd if it is not given or is given and > 0', () => {
          criteria.amountStart = null;
          criteria.amountEnd = null;
          expect(validation.validateRecordFilter(criteria))
            .to.be.an('array')
            .and.not.deep.include({
              message: 'amountEnd must be greater than 0',
              field: 'amountEnd'
            });

          criteria.amountStart = null;
          criteria.amountEnd = 100;
          expect(validation.validateRecordFilter(criteria))
            .to.be.an('array')
            .and.not.deep.include({
              message: 'amountEnd must be greater than 0',
              field: 'amountEnd'
            });
        });

        it('should return error on field amountEnd if it is given and <= 0', () => {
          criteria.amountStart = null;
          criteria.amountEnd = 0;

          expect(validation.validateRecordFilter(criteria))
            .to.be.an('array')
            .and.deep.include({
              message: 'amountEnd must be greater than 0',
              field: 'amountEnd'
            });
        });

        it('should not return error on field amountEnd if both are given and are before today but amountEnd is after amountStart', () => {
          criteria.amountStart = 0;
          criteria.amountEnd = 100;

          expect(validation.validateRecordFilter(criteria))
            .to.be.an('array')
            .and.not.deep.include({
              message: 'amountEnd cannot be smaller than amountStart',
              field: 'amountEnd'
            });
        });

        it('should return error on field amountEnd if both are given and are before today but amountEnd is before amountStart', () => {
          criteria.amountStart = 100;
          criteria.amountEnd = 10;

          expect(validation.validateRecordFilter(criteria))
            .to.be.an('array')
            .and.deep.include({
              message: 'amountEnd cannot be smaller than amountStart',
              field: 'amountEnd'
            });
        });
      });
    });
  });
});
