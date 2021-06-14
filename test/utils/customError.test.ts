// packages
import { expect } from 'chai';

// utils
import CustomError, { ErrorData } from 'utils/customError';

describe('[customError] Custom Error class utility', () => {
  it('should return all default fields with nothing is passed', () => {
    const DEFAULT = {
      message: 'An error occured',
      status: 500,
      data: [] as ErrorData
    };
    const err = new CustomError();

    expect(err).to.be.instanceOf(CustomError);
    expect(err).to.have.property('message', DEFAULT.message);
    expect(err).to.have.property('status', DEFAULT.status);
    expect(err).to.have.deep.property('data', DEFAULT.data);
  });

  it('should return all fields with given arguments when parameters are passed', () => {
    const args = {
      message: 'Dummy Error',
      status: 401,
      data: [
        {
          message: 'Dummy message',
          field: 'dummy'
        },
        {
          message: 'Dummy message 2',
          field: 'dummy 2'
        }
      ] as ErrorData
    };
    const err = new CustomError(args.message, args.status, args.data);

    expect(err).to.be.instanceOf(CustomError);
    expect(err).to.have.property('message', args.message);
    expect(err).to.have.property('status', args.status);
    expect(err).to.have.deep.property('data', args.data);
  });
});
