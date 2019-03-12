import * as chai from "chai";
import * as fs from "fs";
import * as jwt from "jsonwebtoken";
import * as path from "path";
import { Mode } from "../../api/common/config";
import * as app from "../../index";

chai.use(require("chai-http"));

const cert: Buffer = fs.readFileSync(path.resolve(__dirname, "../../resources/ridi-pay_to_ridi-kcp.key"));

const today: Date = new Date();
const lastYear: Date = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
const nextYear: Date = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());

const SHIHANCARD_MOCK_REQUEST = {
    card_no: "4499140000000000",
    card_expiry_date: "7912",
    card_tax_no: "000101",
    card_password: "00"
};

describe("Authorization Tests", () => {
    const EXPIRED_JWT: string = jwt.sign(
        {
            iss: "ridi-pay",
            aud: "ridi-kcp",
            exp: Math.ceil(lastYear.getTime() / 1000)
        },
        cert,
        {
            algorithm: "RS256"
        }
    );

    it("만료된 JWT 401 상태 반환", (done) => {
        chai.request(app)
            .post("/kcp/payments/auth-key")
            .set("Authorization", `Bearer ${EXPIRED_JWT}`)
            .send(SHIHANCARD_MOCK_REQUEST)
            .end((_, res) => {
                chai.expect(res).to.have.status(401);
                chai.expect(res.body.is_success).to.be.false;
                chai.expect(res.body.message).to.include("Failed to check authorization");
                return done();
            });
    });
});

describe("Payments Tests", () => {
    const TEST_JWT: string = jwt.sign(
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

    let TEST_AUTH_KEY: string;
    let TEST_KCP_TNO: string;

    const TEST_ORDER_NO: string = `TEST${new Date().getTime()}`;
    const TEST_PRODUCT_AMOUNT: number = 10000;

    it("배치키 요청 201 상태 반환", (done) => {
        chai.request(app)
            .post("/kcp/payments/auth-key")
            .set("Authorization", `Bearer ${TEST_JWT}`)
            .send({
                card_no: SHIHANCARD_MOCK_REQUEST.card_no,
                card_expiry_date: SHIHANCARD_MOCK_REQUEST.card_expiry_date,
                card_tax_no: SHIHANCARD_MOCK_REQUEST.card_tax_no,
                card_password: SHIHANCARD_MOCK_REQUEST.card_password,
                mode: Mode.DEV
            })
            .end((_, res) => {
                chai.expect(res).to.have.status(201);
                chai.expect(res.body.code).to.equal("0000");
                chai.expect(res.body.is_success).to.be.true;
                chai.expect(res.body.card_code).to.equal("CCLG");
                chai.expect(res.body.card_name).to.equal("신한카드");
                chai.expect(res.body.batch_key).to.match(/[0-9A-Za-z]+/);

                TEST_AUTH_KEY = res.body.batch_key;
                return done();
            });
    });

    it("결제 요청 200 상태 반환", (done) => {        
        let PAYMENT_MOCK_REQUEST = {
            bill_key: TEST_AUTH_KEY,
            order_no: TEST_ORDER_NO,
            product_name: "테스트 상품",
            product_amount: TEST_PRODUCT_AMOUNT,
            buyer_name: "테스터",
            buyer_email: "payment-test@ridi.com",
            mode: Mode.DEV
        };
        
        chai.request(app)
            .post("/kcp/payments")
            .set("Authorization", `Bearer ${TEST_JWT}`)
            .send(PAYMENT_MOCK_REQUEST)
            .end((_, res) => {
                chai.expect(res).to.have.status(200);     
                chai.expect(res.body.code).to.equal("0000");
                chai.expect(res.body.is_success).to.be.true;
                chai.expect(res.body.pay_method).to.equal("PACA");
                chai.expect(res.body.order_no).to.equal(TEST_ORDER_NO);
                chai.expect(res.body.card_code).to.equal("CCLG");
                chai.expect(res.body.card_name).to.equal("신한카드");
                chai.expect(res.body.acqu_code).to.equal("CCLG");
                chai.expect(res.body.acqu_name).to.equal("신한카드");
                chai.expect(res.body.card_no).to.equal(SHIHANCARD_MOCK_REQUEST.card_no);
                chai.expect(res.body.mcht_taxno).to.match(/[0-9]+/);
                chai.expect(res.body.mall_taxno).to.match(/[0-9]+/);
                chai.expect(res.body.ca_order_id).to.equal(TEST_ORDER_NO);
                chai.expect(res.body.tno).to.match(/[0-9]+/);
                chai.expect(res.body.amount).to.equal(PAYMENT_MOCK_REQUEST.product_amount);
                chai.expect(res.body.card_amount).to.equal(PAYMENT_MOCK_REQUEST.product_amount);
                chai.expect(res.body.coupon_amount).to.equal(0);
                chai.expect(res.body.is_escrow).to.be.true;
                chai.expect(res.body.van_code).to.equal("VNKC");
                chai.expect(res.body.app_time).to.match(/[0-9]{14}/);
                chai.expect(res.body.van_app_time).to.match(/[0-9]{14}/);
                chai.expect(res.body.app_no).to.match(/[0-9]+/);
                chai.expect(res.body.tax_flag).to.equal("TG03");
                chai.expect(res.body.tax_amount).to.equal(9090);
                chai.expect(res.body.tax_free_amount).to.equal(0);
                chai.expect(res.body.vat_amount).to.equal(910);
                chai.expect(res.body.is_partial_cancel).to.be.true;

                TEST_KCP_TNO = res.body.tno;
                return done();
            });
    });
    
    it("결제 취소 200 상태 반환", (done) => {
        chai.request(app)
            .del(`/kcp/payments/${TEST_KCP_TNO}`)
            .set("Authorization", `Bearer ${TEST_JWT}`)
            .send({
                reason: "결제 취소 테스트",
                mode: Mode.DEV
            })
            .end((_, res) => {
                chai.expect(res).to.have.status(200);
                chai.expect(res.body.code).to.equal("0000");
                chai.expect(res.body.is_success).to.be.true;
                chai.expect(res.body.pay_method).to.equal("PACA");
                chai.expect(res.body.order_no).to.equal(TEST_ORDER_NO);
                chai.expect(res.body.card_code).to.equal("CCLG");
                chai.expect(res.body.card_name).to.equal("신한카드");
                chai.expect(res.body.acqu_code).to.equal("CCLG");
                chai.expect(res.body.acqu_name).to.equal("신한카드");
                chai.expect(res.body.mcht_taxno).to.match(/[0-9]+/);
                chai.expect(res.body.mall_taxno).to.match(/[0-9]+/);
                chai.expect(res.body.ca_order_id).to.equal(TEST_ORDER_NO);
                chai.expect(res.body.tno).to.equal(TEST_KCP_TNO);
                chai.expect(res.body.amount).to.equal(TEST_PRODUCT_AMOUNT);
                chai.expect(res.body.card_amount).to.equal(TEST_PRODUCT_AMOUNT);
                chai.expect(res.body.coupon_amount).to.equal(0);
                chai.expect(res.body.is_escrow).to.be.true;
                chai.expect(res.body.cancel_gubun).to.equal("B");
                chai.expect(res.body.van_code).to.equal("VNKC");
                chai.expect(res.body.app_time).to.match(/[0-9]{14}/);
                chai.expect(res.body.van_app_time).to.match(/[0-9]{14}/);
                chai.expect(res.body.cancel_time).to.match(/[0-9]{14}/);
                chai.expect(res.body.app_no).to.match(/[0-9]+/);

                return done();
            });
    });
});