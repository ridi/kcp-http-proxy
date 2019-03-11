import { EntityManager, EntityRepository } from "typeorm";
import { OrmManager } from "typeorm-typedi-extensions";
import { CommandType } from "/application/command/CommandType";
import { Mode } from "/common/config";
import { IPaymentRequestRepository } from "/domain/entity/IPaymentRequestRepository";
import { PaymentApprovalResultEntity } from "/domain/entity/PaymentApprovalResultEntity";
import { PaymentAuthKeyResultEntity } from "/domain/entity/PaymentAuthKeyResultEntity";
import { PaymentCancellationResultEntity } from "/domain/entity/PaymentCancellationResultEntity";
import { PaymentRequestEntity } from "/domain/entity/PaymentRequestEntity";

@EntityRepository()
export class TypeOrmPaymentRequestRepository implements IPaymentRequestRepository {    
    @OrmManager()
    em: EntityManager;

    async getPaymentRequestById(id: number): Promise<PaymentRequestEntity | undefined> {
        return this.em.findOne(PaymentRequestEntity, { "id": id });
    }

    async getPaymentRequest(command_type: CommandType, mode: Mode, hash: string): Promise<PaymentRequestEntity | undefined> {
        return this.em.findOne(PaymentRequestEntity, { "command_type": command_type, "mode": mode, "hash": hash });
    }

    async savePaymentRequest(request: PaymentRequestEntity): Promise<PaymentRequestEntity> {
        const persisted: PaymentRequestEntity = (request.id) ? request : await this.em.save(PaymentRequestEntity, request);

        switch(request.command_type) {
            case CommandType.REQUEST_AUTH_KEY: {
                if (request.auth_key_results && request.auth_key_results.length > 0) {
                    for (const result of request.auth_key_results) {
                        result.request = persisted;
                    }
                    await this.em.save(PaymentAuthKeyResultEntity, request.auth_key_results);
                }
                break;
            }
            case CommandType.PAYMENT_APPROVAL: {
                if (request.approval_results && request.approval_results.length > 0) {
                    for (const result of request.approval_results) {
                        result.request = persisted;
                    }
                    await this.em.save(PaymentApprovalResultEntity, request.approval_results);
                }
                break;
            }
            case CommandType.PAYMENT_CANCELLATION: {
                if (request.cancel_results && request.cancel_results.length > 0) {
                    for (const result of request.cancel_results) {
                        result.request = persisted;
                    }
                    await this.em.save(PaymentCancellationResultEntity, request.cancel_results);
                }
                break;
            }
        }

        return this.getPaymentRequestById(persisted.id);
    }
}