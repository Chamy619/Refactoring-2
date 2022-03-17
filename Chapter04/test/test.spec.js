import Province, { sampleProvinceData } from '../src/Province.js';
import chai from 'chai';
const expect = chai.expect;

describe('province', function () {
  it('shortfall', function () {
    const asia = new Province(sampleProvinceData());
    expect(asia.shortfall).equal(5);
  });

  it('profit', function () {
    const asia = new Province(sampleProvinceData());
    expect(asia.profit).equal(230);
  });
});
