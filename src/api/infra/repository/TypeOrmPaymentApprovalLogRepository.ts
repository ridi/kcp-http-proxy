import { EntityManager, EntityRepository } from "typeorm";
import { OrmManager } from "typeorm-typedi-extensions";
import { PaymentApprovalLogRepository } from "../../domain/entity/PaymentApprovalLogRepository";
import { PaymentApprovalRequestLogEntity } from "../../domain/entity/PaymentApprovalRequestLogEntity";

@EntityRepository(PaymentApprovalRequestLogEntity)
export class TypeOrmPaymentApprovalLogRepository implements PaymentApprovalLogRepository {    
    @OrmManager()
    manager: EntityManager;

    findRequestLogById(id: number): Promise<PaymentApprovalRequestLogEntity> {
        return this.manager.findOne(PaymentApprovalRequestLogEntity, { "id": id });
    }
    
    findRequestLog(bill_key: string, order_no: string, product_amount: number): Promise<PaymentApprovalRequestLogEntity | undefined> {
        return this.manager.findOne(PaymentApprovalRequestLogEntity, {
            "bill_key": bill_key,
            "order_no": order_no,
            "product_amount": product_amount
        });
    }

    saveRequestLog(requestLog: PaymentApprovalRequestLogEntity): Promise<PaymentApprovalRequestLogEntity> {
        return this.manager.save(PaymentApprovalRequestLogEntity, requestLog);
    }
}