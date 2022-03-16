import chai from 'chai';
import statement from '../src/statement.js';
const expect = chai.expect;

const STATEMENT_PLAY_INPUT = {
  BigCo: {
    hamlet: { name: 'Hamlet', type: 'tragedy' },
    'as-like': { name: 'As You Like It', type: 'comedy' },
    othello: { name: 'Othello', type: 'tragedy' },
  },
};

const STATEMENT_INVOICE_INPUT = {
  BigCo: {
    customer: 'BigCo',
    performances: [
      {
        playID: 'hamlet',
        audience: 55,
      },
      {
        playID: 'as-like',
        audience: 35,
      },
      {
        playID: 'othello',
        audience: 40,
      },
    ],
  },
};

const STATEMENT_EXPECT_RESULT = {
  BigCo: `청구 내역 (고객명: BigCo)\n  Hamlet: $650.00 (55석)\n  As You Like It: $580.00 (35석)\n  Othello: $500.00 (40석)\n총액: $1,730.00\n적립 포인트: 47\n`,
};

describe('statement 함수 테스트', () => {
  it('통과하는 테스트', () => {
    const result = statement(STATEMENT_INVOICE_INPUT.BigCo, STATEMENT_PLAY_INPUT.BigCo);
    expect(result).to.equal(STATEMENT_EXPECT_RESULT.BigCo);
  });
});
