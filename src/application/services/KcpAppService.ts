import { PaymentApprovalRequest } from '@root/application/requests/PaymentApprovalRequest';
import { PaymentBatchKeyRequest } from '@root/application/requests/PaymentBatchKeyRequest';
import { PaymentCancellationRequest } from '@root/application/requests/PaymentCancellationRequest';
import { KcpConfig, KcpSite } from '@root/common/config';
import { ASCII, PAY_PLUS_STATUS } from '@root/common/constants';
import { AbstractKcpCommand } from '@root/domain/commands/AbstractKcpCommand';
import { PaymentApprovalCommand } from '@root/domain/commands/PaymentApprovalCommand';
import { PaymentBatchKeyCommand } from '@root/domain/commands/PaymentBatchKeyCommand';
import { PaymentCancellationCommand } from '@root/domain/commands/PaymentCancellationCommand';
import { PaymentApprovalRequestEntity } from '@root/domain/entities/PaymentApprovalRequestEntity';
import { PaymentApprovalRequestRepository } from '@root/domain/entities/PaymentApprovalRequestRepository';
import { PaymentApprovalResult, PaymentApprovalResultType } from '@root/domain/entities/PaymentApprovalResult';
import { PaymentBatchKeyResult, PaymentBatchKeyResultType } from '@root/domain/entities/PaymentBatchKeyResult';
import { PaymentCancellationResult, PaymentCancellationResultType } from '@root/domain/entities/PaymentCancellationResult';
import { KcpComandActuator } from '@root/domain/kcp/KcpCommandActuator';
import { AlreadyLockedError } from '@root/errors/AlreadyLockedError';
import { InvalidRequestError } from '@root/errors/InvalidRequestError';
import { PayPlusError } from '@root/errors/PayPlusError';
import { Redis } from '@root/redis';
import * as Sentry from '@sentry/node';
import * as hash from 'object-hash';
import { Lock, LockError } from 'redlock';
import Container, { Inject, Service } from 'typedi';

@Service()
export class KcpAppService {
    @Inject()
    private approvalRepository: PaymentApprovalRequestRepository;

    @Inject()
    private commandActuator: KcpComandActuator;

    @Inject('sentry.loggable')
    private sentryLoggable: boolean;

    private async executeCommand(command: AbstractKcpCommand): Promise<PaymentBatchKeyResult | PaymentApprovalResult | PaymentCancellationResult> {
        return this.commandActuator.actuate(command)
            .then((output) => {
                const outputObject = {};
                output.split(ASCII.UNIT_SEPARATOR).map((keyValueString) => {
                    const key_value: string[] = keyValueString.split('=');
                    outputObject[key_value[0]] = key_value[1];
                });

                if (outputObject['res_cd'] !== PAY_PLUS_STATUS.OK) {
                    throw new PayPlusError(outputObject['res_cd'], outputObject['res_msg']);
                }

                switch (command.constructor) {
                    case PaymentBatchKeyCommand: {
                        return PaymentBatchKeyResult.parse(outputObject as PaymentBatchKeyResultType);
                    }
                    case PaymentApprovalCommand: {
                        return PaymentApprovalResult.parse(outputObject as PaymentApprovalResultType);
                    }
                    case PaymentCancellationCommand: {
                        return PaymentCancellationResult.parse(outputObject as PaymentCancellationResultType);
                    }
                    default: {
                        console.error('Unknown Command', command);
                        throw new InvalidRequestError();
                    }
                }
            }).catch((error) => {
                if (this.sentryLoggable) {
                    Sentry.captureException(error);
                }
                throw error;
            });
    }

    private async getSuccessfulPaymentApprovalResult(command: PaymentApprovalCommand): Promise<any> {
        const config: KcpConfig = Container.get(KcpConfig);
        const site: KcpSite = config.site(command.isTaxDeductible);
        const hashId = hash({
            siteCode: site.code,
            batchKey: command.batchKey,
            orderNo: command.orderNo,
            productAmount: command.productAmount,
        });
        const found: PaymentApprovalRequestEntity = await this.getPaymentApprovalRequestEntity(hashId);
        const result = found.results.find((r) => r.code === PAY_PLUS_STATUS.OK);
        if (result) {
            const { created_at, ...rest } = result;
            return { found, result: rest };
        }
        return { found };
    }

    private async getPaymentApprovalRequestEntity(id: string): Promise<PaymentApprovalRequestEntity> {
        let found: PaymentApprovalRequestEntity | null = await this.approvalRepository.getPaymentApprovalRequestById(id);
        if (!found) {
            const request = new PaymentApprovalRequestEntity();
            request.id = id;
            found = await this.approvalRepository.savePaymentApprovalRequest(request);
        }
        if (!found.results) {
            found.results = [];
        }
        return found;
    }

    public async requestBatchKey(req: PaymentBatchKeyRequest): Promise<PaymentBatchKeyResult> {
        const command = new PaymentBatchKeyCommand(
            req.is_tax_deductible,
            req.card_no,
            req.card_expiry_date,
            req.card_tax_no,
            req.card_password,
        );
        return await this.executeCommand(command) as PaymentBatchKeyResult;
    }

    public async approvePayment(req: PaymentApprovalRequest): Promise<PaymentApprovalResult> {
        const command = new PaymentApprovalCommand(
            req.is_tax_deductible,
            req.batch_key,
            req.order_no,
            req.product_name,
            req.product_amount,
            req.buyer_name,
            req.buyer_email,
            '',
            '',
            req.installment_months,
        );

        const config: KcpConfig = Container.get(KcpConfig);
        const site: KcpSite = config.site(command.isTaxDeductible);
        const key = hash({
            siteCode: site.code,
            batchKey: command.batchKey,
            orderNo: command.orderNo,
            productAmount: command.productAmount,
        });
        const ttl = 3000 * 60 * 60;
        let lock: Lock;

        try {
            lock = await Redis.redlock.lock(`locks:kcp:${key}`, ttl);

            // caching result
            const { found, result } = await this.getSuccessfulPaymentApprovalResult(command);
            if (result) {
                return result;
            }

            // execute pp_cli
            const newResult = await this.executeCommand(command) as PaymentApprovalResult;

            // persist result
            found.results.push(newResult);
            await this.approvalRepository.savePaymentApprovalRequest(found);
            return newResult;
        } catch (err) {
            if (err instanceof LockError) {
                throw new AlreadyLockedError(JSON.stringify({
                    isTaxDeductible: command.isTaxDeductible,
                    batchKey: command.batchKey,
                    orderNo: command.orderNo,
                    productAmount: command.productAmount,
                }));
            }
            throw err;
        } finally {
            if (lock && lock instanceof Lock) {
                lock.unlock();
            }
        }
    }

    public async cancelPayment(req: PaymentCancellationRequest): Promise<PaymentCancellationResult> {
        const command = new PaymentCancellationCommand(req.is_tax_deductible, req.tno, req.reason);
        return await this.executeCommand(command) as PaymentCancellationResult;
    }
}
