import invoices from './invoices.json' assert { type: 'json' };
import plays from './plays.json' assert { type: 'json' };
import statement from './statement.js';

invoices.forEach((invoice) => {
  console.log(statement(invoice, plays));
});
