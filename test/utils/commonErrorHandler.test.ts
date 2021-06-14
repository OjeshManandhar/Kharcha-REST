// packages
import { stub } from 'sinon';
import { expect } from 'chai';

// utils
import CustomError from 'utils/customError';
import commonErrorHandler from 'utils/commonErrorHandler';

// env
import * as env_config from 'env_config';

describe('[commonErrorHandler] Common error handler utility', () => {
  const message = 'Test messsage';

  it('should throw the same error when error is CustomError', () => {
    const err = new CustomError('Test error');

    expect(() => commonErrorHandler(err, message)).throws(err);
  });

  it('should throw CustomError with given message and status 500 with empty data field when error is not CustomError and DEV_FEATURE is false', () => {
    const devFeatStub = stub(env_config, 'DEV_FEATURE').value(false);

    const error = new Error('Test error');

    try {
      const response = commonErrorHandler(error, message);
      expect(response).to.be.undefined;
    } catch (err) {
      expect(err).to.have.property('message', message);
      expect(err).to.have.property('status', 500);
      expect(err).to.have.property('data').and.is.empty;
    }

    devFeatStub.restore();
  });

  it('should throw CustomError with given message and status 500 with single object in data field when error is not CustomError and DEV_FEATURE is true', () => {
    const devFeatStub = stub(env_config, 'DEV_FEATURE').value(true);

    const errMsg = 'Test error';
    const error = new Error(errMsg);

    try {
      const response = commonErrorHandler(error, message);
      expect(response).to.be.undefined;
    } catch (err) {
      expect(err).to.have.property('message', message);
      expect(err).to.have.property('status', 500);
      expect(err)
        .to.have.property('data')
        .to.be.an('array')
        .and.to.be.of.length(1)
        .and.to.deep.include({ message: errMsg });
    }

    devFeatStub.restore();
  });
});
