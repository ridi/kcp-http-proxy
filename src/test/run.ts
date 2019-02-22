import * as fs from "fs";
import * as path from "path";
import * as mocha from "mocha";

const suite = new mocha();

fs.readdir(path.join(__dirname, "integration"), (err, files) => {
	if (err) {
        throw err;
    }

	files.filter((filename) => (filename.match(/\.ts$/))).map((filename) => {
		suite.addFile(path.join(__dirname, "integration", filename));
	});

	suite.run((failures) => {
		process.exit(failures);
	});
});