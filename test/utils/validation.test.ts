// packages
import { expect } from 'chai';

// utils
import * as validation from './../../src/utils/validation';

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
});
