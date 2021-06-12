// packages
import sinon from 'sinon';
import { expect } from 'chai';

// utils
import CustomError from './../../src/utils/customError';
import commonErrorHandler from './../../src/utils/commonErrorHandler';

// env
import * as env_config from './../../src/env_config';

describe('[commonErrorHandler.test] Common error handler utility', () => {
  const message = 'Test messsage';

  it('should throw the same error when error is CustomError', () => {
    const err = new CustomError('Test error');

    expect(() => commonErrorHandler(err, message)).throws(err);
  });

  it('should throw CustomError with given message and status 500 with empty data field when error is not CustomError and DEV_FEATURE is false', () => {
    const devFeatStub = sinon.stub(env_config, 'DEV_FEATURE').value(false);

    const err = new Error('Test error');

    expect(() => commonErrorHandler(err, message))
      .throws(CustomError)
      .has.property('message', message);
    expect(() => commonErrorHandler(err, message))
      .throws(CustomError)
      .has.property('status', 500);
    expect(() => commonErrorHandler(err, message))
      .throws(CustomError)
      .to.have.property('data').and.is.empty;

    devFeatStub.restore();
  });

  it('should throw CustomError with given message and status 500 with single object in data field when error is not CustomError and DEV_FEATURE is true', () => {
    const devFeatStub = sinon.stub(env_config, 'DEV_FEATURE').value(true);

    const errMsg = 'Test error';
    const err = new Error(errMsg);

    expect(() => commonErrorHandler(err, message))
      .throws(CustomError)
      .that.has.property('message', message);
    expect(() => commonErrorHandler(err, message))
      .throws(CustomError)
      .that.has.property('status', 500);
    expect(() => commonErrorHandler(err, message))
      .throws(CustomError)
      .to.have.property('data')
      .to.be.an('array')
      .and.to.be.of.length(1)
      .and.to.deep.include({ message: errMsg });

    devFeatStub.restore();
  });
});
