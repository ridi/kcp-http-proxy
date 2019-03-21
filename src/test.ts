import * as mocha from 'mocha';
import * as path from 'path';
require('module-alias/register');

const suite = new mocha();
suite.addFile(path.join(__dirname, 'test', 'payment_controller_test.ts'));
suite.run((failures: number) => {
    process.exit(failures);
});