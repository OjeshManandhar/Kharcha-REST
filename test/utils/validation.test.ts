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
});
