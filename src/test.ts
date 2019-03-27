require('module-alias/register');
import * as fs from 'fs';
import * as mocha from 'mocha';
import * as moduleAlias from 'module-alias';
import * as path from 'path';

moduleAlias.addAlias('@root', __dirname);

const suite = new mocha();

fs.readdir(path.join(__dirname, 'test'), async (err, files) => {
    if (err) {
        throw err;
    }
    
    files.filter((filename: string) => (filename.match(/test\.ts$/))).map((filename) => {
        suite.addFile(path.join(__dirname, 'test', filename));
    });

    suite.run((failures: number) => {
        process.exit(failures);
    });
});







