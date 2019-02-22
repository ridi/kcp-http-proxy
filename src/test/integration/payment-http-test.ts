import * as chai from "chai";
import * as app from "../../index";
import * as fs from "fs";
import * as path from "path";
import * as jwt from "jsonwebtoken";

chai.use(require("chai-http"));

const cert = fs.readFileSync(path.resolve(__dirname, "../../resources/ridi-pay_to_ridi-kcp.key"));
const pem = fs.readFileSync(path.resolve(__dirname, "../../resources/ridi-pay_to_ridi-kcp.key.pub"));

const nextYear = new Date();
nextYear.setFullYear(new Date().getFullYear() + 1);
//1577718000
//1550812981
console.log('NOW', Math.ceil(new Date().getTime() / 1000));
console.log('TOM', Math.ceil(nextYear.getTime() / 1000));
jwt.sign({
    iss: "ridi-pay",
    aud: "ridi-kcp",
    exp: Math.ceil(nextYear.getTime() / 1000)
}, cert, { algorithm: "RS256" }, (err, token) => {
    console.log('JWT TOKEN:', token);
    console.log("=========");
    
    // jwt.verify(token, pem, (err, decoded) => {
    //     console.log('ERR', err);
    //     console.log('DECODED', decoded);
    // });
});

function test(jwt) {
    describe("Check health", () => {
        it("should return 200 if it exists", (done) => {
            chai
                .request(app)
                .get("/kcp/health")
                .end((err, res) => {
                    chai.expect(res).to.have.status(200);

                    return done();
                });
        })
    })
}