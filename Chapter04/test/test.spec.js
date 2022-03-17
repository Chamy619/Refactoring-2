import Province, { sampleProvinceData } from '../src/Province.js';
import assert from 'assert';

describe('province', function () {
  it('shortfall', function () {
    const asia = new Province(sampleProvinceData());
    assert.equal(asia.shortfall, 5);
  });
});
