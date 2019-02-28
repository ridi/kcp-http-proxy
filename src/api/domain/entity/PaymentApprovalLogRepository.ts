import { PaymentApprovalRequestLogEntity } from "./PaymentApprovalRequestLogEntity";

export interface PaymentApprovalLogRepository {
    findRequestLogById(id: number): Promise<PaymentApprovalRequestLogEntity | undefined>;
    
    findRequestLog(bill_key: string, order_no: string, product_amount: number): Promise<PaymentApprovalRequestLogEntity | undefined>;

    saveRequestLog(requestLog: PaymentApprovalRequestLogEntity): Promise<PaymentApprovalRequestLogEntity>;
}