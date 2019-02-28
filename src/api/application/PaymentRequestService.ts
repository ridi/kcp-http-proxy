import { Inject, Service } from "typedi";
import { PayPlusStatus } from "../common/constants";
import { PaymentApprovalLogRepository } from "../domain/entity/PaymentApprovalLogRepository";
import { PaymentApprovalRequestLogEntity } from "../domain/entity/PaymentApprovalRequestLogEntity";
import { TypeOrmPaymentApprovalLogRepository } from "../infra/repository/TypeOrmPaymentApprovalLogRepository";
import { PaymentApprovalResult } from "./result/PaymentApprovalResult";
import { PaymentApprovalResultLogEntity } from "../domain/entity/PaymentApprovalResultLogEntity";

@Service()
export class PaymentRequestService {
    @Inject(type => TypeOrmPaymentApprovalLogRepository)
    paymentApprovalLogRepo: PaymentApprovalLogRepository;

    async findApprovalResult(bill_key: string, order_no: string, product_amount: number): Promise<PaymentApprovalResult | null> {
        const reqLog: PaymentApprovalRequestLogEntity | undefined = await this.paymentApprovalLogRepo.findRequestLog(bill_key, order_no, product_amount);
        if (reqLog) {
            for (const resultEntity of (reqLog as PaymentApprovalRequestLogEntity).results) {
                if (resultEntity.code === PayPlusStatus.OK) {
                    const { request, ...rest } = resultEntity;
                    return (rest as PaymentApprovalResult);
                }
            }
        }
        return null;
    }

    async saveRequetLog(bill_key: string, order_no: string, product_amount: number): Promise<number> {
        const entity: PaymentApprovalRequestLogEntity = new PaymentApprovalRequestLogEntity();
        entity.bill_key = bill_key;
        entity.order_no = order_no;
        entity.product_amount = product_amount;
        const resultEntity: PaymentApprovalRequestLogEntity = await this.paymentApprovalLogRepo.saveRequestLog(entity);
        return resultEntity.id;
    }

    async addResultToRequestLog(requestLogId: number, result: PaymentApprovalResult): Promise<void> {
        const resultEntity: PaymentApprovalResultLogEntity = Object.assign(
            new PaymentApprovalResultLogEntity(),
            result
        );

        const requestLog: PaymentApprovalRequestLogEntity = await this.paymentApprovalLogRepo.findRequestLogById(requestLogId);
        resultEntity.request = requestLog;
        if (!requestLog.results) {
            requestLog.results = [];
        }
        requestLog.results.push(resultEntity);

        await this.paymentApprovalLogRepo.saveRequestLog(requestLog);
    }
}