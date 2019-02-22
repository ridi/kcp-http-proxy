import * as chai from "chai";
import * as app from "../../index";
import * as fs from "fs";
import * as path from "path";
import * as jwt from "jsonwebtoken";

chai.use(require("chai-http"));

const cert = fs.readFileSync(path.resolve(__dirname, "../../resources/ridi-pay_to_ridi-kcp.key"));

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

describe("kcp payments api", () => {
    it("배치키 요청 결과 201 상태 반환", (done) => {
        chai.request(app)
            .post("/kcp/payments/auth-key")
            .set("Authorization", `Bearer ${token}`)
            .send({
                card_no: "5164531234567890",
                card_expiry_date: "2511",
                card_tax_no: "940101",
                card_password: "12",
                mode: "dev"
            })
            .end((_, res) => {
                chai.expect(res).to.have.status(201);
                return done();
            });
    })
});
