import * as Sentry from "@sentry/node";
import { Inject, Service } from 'typedi';
import { Ascii, PayPlusStatus } from '../common/constants';
import { PaymentApprovalResultEntity } from "../domain/entity/PaymentApprovalResultEntity";
import { PaymentAuthKeyResultEntity } from "../domain/entity/PaymentAuthKeyResultEntity";
import { PaymentCancellationResultEntity } from "../domain/entity/PaymentCancellationResultEntity";
import { KcpComandActuator } from '../domain/KcpCommandActuator';
import { PaymentApprovalResultType } from "../domain/result/PaymentApprovalResultType";
import { PaymentAuthKeyResultType } from "../domain/result/PaymentAuthKeyResultType";
import { PaymentCancellationResultType } from "../domain/result/PaymentCancellationResultType";
import { AuthKeyRequestCommand } from "./command/AuthKeyRequestCommand";
import { Command } from "./command/Command";
import { CommandType } from "./command/CommandType";
import { PaymentApprovalCommand } from "./command/PaymentApprovalCommand";
import { PaymentCancellationCommand } from "./command/PaymentCancellationCommand";
import { PaymentApprovalResultDto } from "./dto/PaymentApprovalResultDto";
import { PaymentAuthKeyResultDto } from "./dto/PaymentAuthKeyResultDto";
import { PaymentCancellationResultDto } from "./dto/PaymentCancellationResultDto";
import { InvalidCommandException } from './exception/InvalidCommandException';
import { PayPlusException } from './exception/PayPlusException';
import { PaymentRequestService } from "./PaymentRequestService";
import { IKcpService } from "./IKcpService";

@Service()
export class KcpService implements IKcpService {
    @Inject()
    commandActuator: KcpComandActuator;

    @Inject()
    requestService: PaymentRequestService;

    @Inject("sentry.loggable")
    sentryLoggable: boolean;

    async requestAuthKey(command: AuthKeyRequestCommand): Promise<PaymentAuthKeyResultDto> {
        const entity: any = await this.executeCommand(command);
        const { id, created_at, ...rest } = entity as PaymentAuthKeyResultEntity;
        return Object.assign(new PaymentAuthKeyResultDto(), rest);
    }

    async approvePayment(command: PaymentApprovalCommand): Promise<PaymentApprovalResultDto> {
        const entity: any = await this.executeCommand(command);
        const { id, created_at, ...rest } = entity as PaymentApprovalResultEntity;
        return Object.assign(new PaymentApprovalResultDto(), rest);
    }

    async cancelPayment(command: PaymentCancellationCommand): Promise<PaymentCancellationResultDto> {
        const entity: any = await this.executeCommand(command);
        const { id, created_at, ...rest } = entity as PaymentCancellationResultEntity;
        return Object.assign(new PaymentCancellationResultDto(), rest);
    }

    private executeCommand(command: Command): Promise<PaymentAuthKeyResultEntity | PaymentApprovalResultEntity | PaymentCancellationResultEntity> {
        return this.commandActuator.actuate(command)
            .then(output => {
                const outputObject = {};
                output.split(Ascii.UnitSeparator).map(keyValueString => {
                    const key_value: string[] = keyValueString.split("=");
                    outputObject[key_value[0]] = key_value[1];
                });

                if (outputObject["res_cd"] !== PayPlusStatus.OK) {
                    throw new PayPlusException(outputObject["res_cd"], outputObject["res_msg"] + "\ncommand: " + JSON.stringify(command));
                }

                switch (command.type) {
                    case CommandType.AUTH_KEY_REQ: {
                        return PaymentAuthKeyResultEntity.parse(outputObject as PaymentAuthKeyResultType);
                    }
                    case CommandType.PAY_REQ: {
                        return PaymentApprovalResultEntity.parse(outputObject as PaymentApprovalResultType);
                    }
                    case CommandType.PAY_CANCEL: {
                        return PaymentCancellationResultEntity.parse(outputObject as PaymentCancellationResultType);
                    }
                    default: {
                        throw new InvalidCommandException(`Unknown Command Type: ${command.type}`);
                    }
                }
            }).catch(error => {
                if (this.sentryLoggable) {
                    Sentry.captureException(error);
                }
                throw error;
            });
    }
}