import { EntityManager, EntityRepository } from "typeorm";
import { OrmManager } from "typeorm-typedi-extensions";
import { CommandType } from "../../application/command/CommandType";
import { Mode } from "../../common/config";
import { IPaymentRequestRepository } from "../../domain/entity/IPaymentRequestRepository";
import { PaymentApprovalResultEntity } from "../../domain/entity/PaymentApprovalResultEntity";
import { PaymentAuthKeyResultEntity } from "../../domain/entity/PaymentAuthKeyResultEntity";
import { PaymentCancellationResultEntity } from "../../domain/entity/PaymentCancellationResultEntity";
import { PaymentRequestEntity } from "../../domain/entity/PaymentRequestEntity";

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
        let results: PaymentAuthKeyResultEntity[] | PaymentApprovalResultEntity[] | PaymentCancellationResultEntity[];
        switch (request.command_type) {
            case CommandType.REQUEST_AUTH_KEY: {
                results = request.auth_key_results;
                break;
            }
            case CommandType.PAYMENT_APPROVAL: {
                results = request.approval_results;
                break;
            }
            case CommandType.PAYMENT_CANCELLATION: {
                results = request.cancel_results;
                break;
            }
        }

        await this.em.save(PaymentRequestEntity, request);

        if (results && results.length) {
            switch (request.command_type) {
                case CommandType.REQUEST_AUTH_KEY: {
                    results = results as PaymentAuthKeyResultEntity[];
                    results.forEach((res, i) => {
                        res.request = request;
                    });
                    await this.em.save(results);
                    break;
                }
                case CommandType.PAYMENT_APPROVAL: {                    
                    await this.em.save(PaymentApprovalResultEntity, (results as PaymentApprovalResultEntity[]).map(res => {
                        res.request = request;
                        return res;
                    }));
                    break;
                }
                case CommandType.PAYMENT_CANCELLATION: {
                    await this.em.save(PaymentCancellationResultEntity, (results as PaymentCancellationResultEntity[]).map(res => {
                        res.request = request;
                        return res;
                    }));
                    break;
                }
            }
        }

        return this.getPaymentRequestById(request.id);
    }
}