// packages
import { expect } from 'chai';

// utils
import generateQuery from 'utils/generateQuery';

describe("[generateQuery] Query generator for filterRecords (Using 'numbers' only for this tes)", () => {
  it('should only return the start/end value when both are given and same', () => {
    const start = 5,
      end = start;

    expect(generateQuery(start, end)).to.be.equal(start);
    expect(generateQuery(start, end)).to.be.equal(end);
  });

  it('should return object with $gte and $lte when both start and end are given but not same', () => {
    const start = 5,
      end = 10;

    expect(generateQuery(start, end)).to.be.deep.equal({
      $gte: start,
      $lte: end
    });
  });

  it('should return object with only $gte when only start is given', () => {
    const start = 5;

    const result = generateQuery(start, undefined);

    expect(result).to.have.property('$gte', start);
    expect(result).to.not.have.property('$lte');
  });

  it('should return object with only $lte when only end is given', () => {
    const end = 5;

    const result = generateQuery(undefined, end);

    expect(result).to.not.have.property('$gte');
    expect(result).to.have.property('$lte', end);
  });

  it('should return undefined when both start and end are not given', () => {
    expect(generateQuery(undefined, undefined)).to.be.undefined;
  });
});
