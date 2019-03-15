import * as chai from "chai";
import { Application } from "express";
import { Mode } from "../../api/common/config";
import { App } from "../../app";
import { Database } from "../../database";

chai.use(require("chai-http"));

const app: Application = App.init();        
const port = process.env.APP_PORT || 3000;
app.listen(port);

const given = {
    credit_card: {// shinhan card mock
        card_no: "4499140000000000",
        card_expiry_date: "7912",
        card_tax_no: "000101",
        card_password: "00"
    },
    order: {
        id: `t${new Date().getTime()}`,
        product: {
            name: "테스트 상품",
            amount: 10000
        },
        user: {
            name: "테스터",
            email: "payment-test@ridi.com"
        }
    }
};

const stored = {
    auth_key: null,
    tno: null,
};

describe("payments controller test", async () => {
    before("connect db", async () => {
        await Database.connect().then(() => {
            console.info("DB connected");
        }).catch(err => {
            console.error(err);
            throw err;
        });
    });

    it("배치키 요청 201 상태 반환", (done) => {
        chai.request(app)
            .post("/kcp/payments/auth-key")
            .send({
                card_no: given.credit_card.card_no,
                card_expiry_date: given.credit_card.card_expiry_date,
                card_tax_no: given.credit_card.card_tax_no,
                card_password: given.credit_card.card_password,
                mode: Mode.DEV
            })
            .end((_, res) => {
                chai.expect(res).to.have.status(201);
                chai.expect(res.body.code).to.equal("0000");
                chai.expect(res.body.is_success).to.be.true;
                chai.expect(res.body.card_code).to.equal("CCLG");
                chai.expect(res.body.card_name).to.equal("신한카드");
                chai.expect(res.body.batch_key).to.match(/[0-9A-Za-z]+/);

                stored.auth_key = res.body.batch_key;
                return done();
            });
    });

    it("결제 요청 200 상태 반환", (done) => {
        let request = {
            bill_key: stored.auth_key,
            order_no: given.order.id,
            product_name: given.order.product.name,
            product_amount: given.order.product.amount,
            buyer_name: given.order.user.name,
            buyer_email: given.order.user.email,
            mode: Mode.DEV
        };
        
        chai.request(app)
            .post("/kcp/payments")
            .send(request)
            .end((_, res) => {
                chai.expect(res).to.have.status(200);     
                chai.expect(res.body.code).to.equal("0000");
                chai.expect(res.body.is_success).to.be.true;
                chai.expect(res.body.pay_method).to.equal("PACA");
                chai.expect(res.body.order_no).to.equal(given.order.id);
                chai.expect(res.body.card_code).to.equal("CCLG");
                chai.expect(res.body.card_name).to.equal("신한카드");
                chai.expect(res.body.acqu_code).to.equal("CCLG");
                chai.expect(res.body.acqu_name).to.equal("신한카드");
                chai.expect(res.body.card_no).to.equal(given.credit_card.card_no);
                chai.expect(res.body.mcht_taxno).to.match(/[0-9]+/);
                chai.expect(res.body.mall_taxno).to.match(/[0-9]+/);
                chai.expect(res.body.ca_order_id).to.equal(given.order.id);
                chai.expect(res.body.tno).to.match(/[0-9]+/);
                chai.expect(res.body.amount).to.equal(request.product_amount);
                chai.expect(res.body.card_amount).to.equal(request.product_amount);
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

                stored.tno = res.body.tno;
                return done();
            });
    });
    
    it("결제 취소 200 상태 반환", (done) => {
        chai.request(app)
            .del(`/kcp/payments/${stored.tno}`)
            .send({
                reason: "결제 취소 테스트",
                mode: Mode.DEV
            })
            .end((_, res) => {
                chai.expect(res).to.have.status(200);
                chai.expect(res.body.code).to.equal("0000");
                chai.expect(res.body.is_success).to.be.true;
                chai.expect(res.body.pay_method).to.equal("PACA");
                chai.expect(res.body.order_no).to.equal(given.order.id);
                chai.expect(res.body.card_code).to.equal("CCLG");
                chai.expect(res.body.card_name).to.equal("신한카드");
                chai.expect(res.body.acqu_code).to.equal("CCLG");
                chai.expect(res.body.acqu_name).to.equal("신한카드");
                chai.expect(res.body.mcht_taxno).to.match(/[0-9]+/);
                chai.expect(res.body.mall_taxno).to.match(/[0-9]+/);
                chai.expect(res.body.ca_order_id).to.equal(given.order.id);
                chai.expect(res.body.tno).to.equal(stored.tno);
                chai.expect(res.body.amount).to.equal(given.order.product.amount);
                chai.expect(res.body.card_amount).to.equal(given.order.product.amount);
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
}).timeout(10000);

