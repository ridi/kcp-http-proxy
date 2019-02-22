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

const token = jwt.sign(
    {
        iss: "ridi-pay",
        aud: "ridi-kcp",
        exp: Math.ceil(nextYear.getTime() / 1000)
    },
    cert,
    {
        algorithm: "RS256"
    }
);
// jwt.sign({
//     iss: "ridi-pay",
//     aud: "ridi-kcp",
//     exp: Math.ceil(nextYear.getTime() / 1000)
// }, cert, { algorithm: "RS256" }, (err, token) => {
//     console.log('JWT TOKEN:', token);
//     console.log("=========");
//     return token;
//     // jwt.verify(token, pem, (err, decoded) => {
//     //     console.log('ERR', err);
//     //     console.log('DECODED', decoded);
//     // });

// });

describe("kcp payments api", () => {
    // it("should return 200 if it exists", (done) => {
    //     chai
    //         .request(app)
    //         .get("/kcp/health")
    //         .end((err, res) => {
    //             chai.expect(res).to.have.status(200);

    //             return done();
    //         });
    // });

    it("배치키 요청 결과 201 상태 반환", (done) => {
        chai.request(app)
            .post("/kcp/payments/auth-key")
            .set("Authorization", `Bearer ${token}`)
            .send({
                card_no: "1234567800000000",
                card_expiry_date: "3003",
                card_tax_no: "790101",
                card_password: "00",
                mode: "dev"
            })
            .end((err, res) => {
                //console.info('err', err);
                //console.info('res', res);
                chai.expect(res).to.have.status(201);
                return done();
            });
    })
});
