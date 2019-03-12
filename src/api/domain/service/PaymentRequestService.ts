import * as hash from "object-hash";
import { Inject, Service } from "typedi";
import { CommandType } from "../../application/command/CommandType";
import { Mode } from "../../common/config";
import { PayPlusStatus } from "../../common/constants";
import { IPaymentRequestRepository } from "../../domain/entity/IPaymentRequestRepository";
import { PaymentApprovalResultEntity } from "../../domain/entity/PaymentApprovalResultEntity";
import { PaymentAuthKeyResultEntity } from "../../domain/entity/PaymentAuthKeyResultEntity";
import { PaymentCancellationResultEntity } from "../../domain/entity/PaymentCancellationResultEntity";
import { PaymentRequestEntity } from "../../domain/entity/PaymentRequestEntity";
import { IPaymentRequestService } from "../../domain/service/IPaymentRequestService";
import { TypeOrmPaymentRequestRepository } from "../../infra/repository/TypeOrmPaymentRequestRepository";

@Service()
export class PaymentRequestService implements IPaymentRequestService {
    @Inject(type => TypeOrmPaymentRequestRepository)
    requestRepository: IPaymentRequestRepository;
    
    async getPaymentAuthKeyResult(mode: Mode, card_number: string, card_expiry_date: string, card_tax_no: string, card_password: string): Promise<PaymentAuthKeyResultEntity | null> {
        const hashed = hash({
            card_number: card_number,
            card_expiry_date: card_expiry_date,
            card_tax_no: card_tax_no,
            card_password: card_password
        });

        const requestEntity: PaymentRequestEntity | undefined = await this.requestRepository.getPaymentRequest(CommandType.REQUEST_AUTH_KEY, mode, hashed);
        if (requestEntity && requestEntity.auth_key_results) {
            for (const result of requestEntity.auth_key_results) {
                if (result.code === PayPlusStatus.OK) {
                    return result;
                }
            }
        }
        return null;
    }

    async getPaymentApprovalResult(mode: Mode, bill_key: string, order_no: string, product_amount: number): Promise<PaymentApprovalResultEntity | null> {
        const hashed = hash({
            bill_key: bill_key,
            order_no: order_no,
            product_amount: product_amount
        });

        const requestEntity: PaymentRequestEntity | undefined = await this.requestRepository.getPaymentRequest(CommandType.PAYMENT_APPROVAL, mode, hashed);
        if (requestEntity && requestEntity.approval_results) {
            for (const result of requestEntity.approval_results) {
                if (result.code === PayPlusStatus.OK) {
                    return result;
                }
            }
        }
        return null;
    }

    async getPaymentCancellationResult(mode: Mode, tno: string): Promise<PaymentCancellationResultEntity | null> {
        const hashed = hash({ tno: tno });

        const requestEntity: PaymentRequestEntity | undefined = await this.requestRepository.getPaymentRequest(CommandType.PAYMENT_CANCELLATION, mode, hashed);
        if (requestEntity && requestEntity.cancel_results) {
            for (const result of requestEntity.cancel_results) {
                if (result.code === PayPlusStatus.OK) {
                    return result;
                }
            }
        }
        return null;
    }

    async saveResultToRequest(request: PaymentRequestEntity, result: PaymentAuthKeyResultEntity | PaymentApprovalResultEntity | PaymentCancellationResultEntity): Promise<PaymentRequestEntity> {
        if (!request.auth_key_results) {
            request.auth_key_results = [];
        }

        switch(request.command_type) {
            case CommandType.REQUEST_AUTH_KEY: {
                request.auth_key_results.push(result as PaymentAuthKeyResultEntity);
                break;
            }
            case CommandType.PAYMENT_APPROVAL: {
                request.approval_results.push(result as PaymentApprovalResultEntity);
                break;
            }
            case CommandType.PAYMENT_CANCELLATION: {
                request.cancel_results.push(result as PaymentCancellationResultEntity);
                break;
            }
        }

        return this.requestRepository.savePaymentRequest(request);
    }
}