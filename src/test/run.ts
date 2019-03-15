import * as fs from "fs";
import * as mocha from "mocha";
import * as path from "path";
import { Database } from "../database";


	const suite = new mocha();

	fs.readdir(path.join(__dirname, "integration"), (err, files) => {
		if (err) {
			throw err;
		}
	
		files.filter((filename: string) => (filename.match(/\.ts$/))).map((filename) => {
			suite.addFile(path.join(__dirname, "integration", filename));
		});
	
		suite.run((failures: number) => {
			process.exit(failures);
		});
	});

