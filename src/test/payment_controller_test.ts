import * as moduleAlias from 'module-alias';
moduleAlias.addAlias('@root', __dirname + '/..');

import { App } from '@root/app';
import { Database } from '@root/database';
import * as chai from 'chai';
import { Application } from 'express';
import { Redis } from '@root/redis';

chai.use(require('chai-http'));

describe('payments controller test', async () => {
    const app: Application = App.init();
    const port = 80;
    const server = app.listen(port, () => {
        console.info('Server is running...');
    });

    const given = {
        credit_card: {// shinhan card mock
            card_no: '4499140000000000',
            card_expiry_date: '7912',
            card_tax_no: '000101',
            card_password: '00',
        },
        order: {
            id: `t${new Date().getTime()}`,
            product: {
                name: '테스트 상품',
                amount: 10000,
            },
            user: {
                name: '테스터',
                email: 'payment-test@ridi.com',
            },
        },
    };
    
    const stored = {
        batch_key: null,
        approved: null,
    };

    before('Connect Database', async () => {
        await Database.connect().then(() => {
            console.info('Database is connected');
        }).catch(err => {
            console.error('Failed to connnect database', err);
            throw err;
        });
    });

    it('배치키 요청 201 상태 반환', (done) => {
        chai.request(app)
            .post('/payments/batch-key')
            .send({
                card_no: given.credit_card.card_no,
                card_expiry_date: given.credit_card.card_expiry_date,
                card_tax_no: given.credit_card.card_tax_no,
                card_password: given.credit_card.card_password,
            })
            .end((_, res) => {
                chai.expect(res).to.have.status(201);
                chai.expect(res.body.code).to.equal('0000');
                chai.expect(res.body.card_code).to.equal('CCLG');
                chai.expect(res.body.card_name).to.equal('신한카드');
                chai.expect(res.body.batch_key).to.match(/[0-9A-Za-z]+/);

                stored.batch_key = res.body.batch_key;
                return done();
            });
    });

    it('결제 요청 200 상태 반환', (done) => {
        chai.request(app)
            .post('/payments')
            .send({
                batch_key: stored.batch_key,
                order_no: given.order.id,
                product_name: given.order.product.name,
                product_amount: given.order.product.amount,
                buyer_name: given.order.user.name,
                buyer_email: given.order.user.email,
                installment_months: 0,
            })
            .end((_, res) => {
                chai.expect(res).to.have.status(200);     
                chai.expect(res.body.code).to.equal('0000');
                chai.expect(res.body.pay_method).to.equal('PACA');
                chai.expect(res.body.order_no).to.equal(given.order.id);
                chai.expect(res.body.card_code).to.equal('CCLG');
                chai.expect(res.body.card_name).to.equal('신한카드');
                chai.expect(res.body.acquirer_code).to.equal('CCLG');
                chai.expect(res.body.acquirer_name).to.equal('신한카드');
                chai.expect(res.body.card_no).to.equal(given.credit_card.card_no);
                chai.expect(res.body.merchant_tax_no).to.match(/[0-9]+/);
                chai.expect(res.body.mall_tax_no).to.match(/[0-9]+/);
                chai.expect(res.body.ca_order_id).to.equal(given.order.id);
                chai.expect(res.body.tno).to.match(/[0-9]+/);
                chai.expect(res.body.amount).to.equal(given.order.product.amount);
                chai.expect(res.body.card_amount).to.equal(given.order.product.amount);
                chai.expect(res.body.coupon_amount).to.equal(0);
                chai.expect(res.body.is_escrow).to.equal(false);
                chai.expect(res.body.van_code).to.equal('VNKC');
                chai.expect(res.body.approval_time).to.match(/[0-9]{14}/);
                chai.expect(res.body.van_approval_time).to.match(/[0-9]{14}/);
                chai.expect(res.body.approval_no).to.match(/[0-9]+/);
                chai.expect(res.body.tax_flag).to.equal('TG03');
                chai.expect(res.body.tax_amount).to.equal(9090);
                chai.expect(res.body.tax_free_amount).to.equal(0);
                chai.expect(res.body.vat_amount).to.equal(910);
                chai.expect(res.body.is_partial_cancel).to.equal(true);
        
                stored.approved = res.body;
                return done();
            });
    });

    it('중복 결제 요청 200 상태 반환', (done) => {
        chai.request(app)
            .post('/payments')
            .send({
                batch_key: stored.batch_key,
                order_no: given.order.id,
                product_name: given.order.product.name,
                product_amount: given.order.product.amount,
                buyer_name: given.order.user.name,
                buyer_email: given.order.user.email,
                installment_months: 0,
            })
            .end((_, res) => {
                chai.expect(res).to.have.status(200);
                // 기결제와 동일한지 idempotence 확인
                Object.keys(stored.approved)
                    .forEach(key => chai.expect(res.body[key]).to.equal(stored.approved[key]));
                return done();
            });
    });
    
    it('결제 취소 200 상태 반환', (done) => {
        chai.request(app)
            .del(`/payments/${stored.approved.tno}`)
            .send({
                reason: '결제 취소 테스트',
            })
            .end((_, res) => {
                chai.expect(res).to.have.status(200);
                chai.expect(res.body.code).to.equal('0000');
                chai.expect(res.body.pay_method).to.equal('PACA');
                chai.expect(res.body.order_no).to.equal(given.order.id);
                chai.expect(res.body.card_code).to.equal('CCLG');
                chai.expect(res.body.card_name).to.equal('신한카드');
                chai.expect(res.body.acquirer_code).to.equal('CCLG');
                chai.expect(res.body.acquirer_name).to.equal('신한카드');
                chai.expect(res.body.merchant_tax_no).to.match(/[0-9]+/);
                chai.expect(res.body.mall_tax_no).to.match(/[0-9]+/);
                chai.expect(res.body.ca_order_id).to.equal(given.order.id);
                chai.expect(res.body.tno).to.equal(stored.approved['tno']);
                chai.expect(res.body.amount).to.equal(given.order.product.amount);
                chai.expect(res.body.card_amount).to.equal(given.order.product.amount);
                chai.expect(res.body.coupon_amount).to.equal(0);
                chai.expect(res.body.is_escrow).to.equal(false);
                chai.expect(res.body.cancel_gubun).to.equal('B');
                chai.expect(res.body.van_code).to.equal('VNKC');
                chai.expect(res.body.approval_time).to.match(/[0-9]{14}/);
                chai.expect(res.body.van_approval_time).to.match(/[0-9]{14}/);
                chai.expect(res.body.cancel_time).to.match(/[0-9]{14}/);
                chai.expect(res.body.approval_no).to.match(/[0-9]+/);

                return done();
            });
    });

    after(() => {
        if (server) {
            console.info('Closing Server...');
            Redis.client.quit();
            server.close();
        }
    });
}).timeout(10000);