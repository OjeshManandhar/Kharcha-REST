// packages
import { stub } from 'sinon';
import { expect } from 'chai';
import jwt from 'jsonwebtoken';

// utils
import CustomError from './../../src/utils/customError';
import { encodeIdToJwt } from './../../src/utils/token';

// env
import * as env_config from './../../src/env_config';

describe('[token] JWT token creator utility', () => {
  const _id = 'Just some id';

  it("should throw CustomError('JWT error') when JWT_SECRET is undefined", () => {
    const jwtSecretStub = stub(env_config, 'JWT_SECRET').value(undefined);

    expect(() => encodeIdToJwt(_id))
      .throws(CustomError)
      .that.has.property('message', 'JWT error');

    jwtSecretStub.restore();
  });

  it('should return the value returned by jwt.sign', () => {
    /**
     * This is because stub used the overload which has callback
     * and token is passed to callback hence void return type
     * but the actual code doesnot use callback it is
     * synchronous so returns string
     */
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const jwtStub = stub(jwt, 'sign').returns(_id);

    expect(encodeIdToJwt(_id)).to.equal(_id);

    jwtStub.restore();
  });
});
