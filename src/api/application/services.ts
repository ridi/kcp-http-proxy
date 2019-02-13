import { Inject, Service } from 'typedi';
import { KcpComandActuator } from '../domain/KcpCommandActuator';
import { AuthKeyRequestCommand, PaymentApprovalCommand, PaymentCancellationCommand } from './commands';
import { AuthKeyRequestResult, PaymentApprovalResult, PaymentCancellationResult } from './results';

@Service()
export class KcpService {
    @Inject()
    commandActuator: KcpComandActuator;

    requestAuthKey(command: AuthKeyRequestCommand): Promise<AuthKeyRequestResult> {
        return this.commandActuator.actuate(command)
            .then(output => {
                console.log('OUTPUT\n', output);
                let result = new AuthKeyRequestResult();
                // parse output to result
                return Promise.resolve(result);
            })
            .catch(error => Promise.reject(error));
    }

    approvePayment(command: PaymentApprovalCommand): Promise<PaymentApprovalResult> {
        return this.commandActuator.actuate(command)
            .then(output => {
                let result = new PaymentApprovalResult();
                // parse output to result
                return Promise.resolve(result);
            })
            .catch(error => Promise.reject(error));
    }

    cancelPayment(command: PaymentCancellationCommand): Promise<PaymentCancellationResult> {
        return this.commandActuator.actuate(command)
            .then(output => {
                let result = new PaymentCancellationResult();
                // parse output to result
                return Promise.resolve(result);
            })
            .catch(error => Promise.reject(error));
    }
}