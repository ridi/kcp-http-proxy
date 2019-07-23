import { KcpConfig, KcpSite } from '@root/common/config';
import { ASCII } from '@root/common/constants';
import { AbstractKcpCommand } from '@root/domain/commands/AbstractKcpCommand';
import { KcpLogSanitizer } from '@root/domain/kcp/KcpLogSanitizer';
import { PaymentApprovalCommand } from '@root/domain/commands/PaymentApprovalCommand';
import { PaymentBatchKeyCommand } from '@root/domain/commands/PaymentBatchKeyCommand';
import { PaymentCancellationCommand } from '@root/domain/commands/PaymentCancellationCommand';
import { InvalidRequestError } from '@root/errors/InvalidRequestError';
import { exec, ExecException } from 'child_process';
import * as iconv from 'iconv-lite';
import { Inject, Service } from 'typedi';

@Service()
export class KcpComandActuator {
    @Inject((type) => KcpConfig)
    private config: KcpConfig;

    private requestBatchKey(command: PaymentBatchKeyCommand): Promise<string> {
        const site = this.config.site(command.isTaxDeductible);

        const payx_data = [
            `payx_data=`,
            `${ASCII.RECORD_SEPARATOR}card=card_mny=`,
            `card_tx_type=${this.config.code.request.batchKey.cardTxType}`,
            `card_no=${command.cardNumber}`,
            `card_expiry=${command.cardExpiryDate}`,
            `card_taxno=${command.cardTaxNumber}`,
            `card_pwd=${command.cardPassword}`,
            `${ASCII.RECORD_SEPARATOR}auth=sign_txtype=${this.config.code.request.batchKey.signTxType}`,
            `group_id=${site.groupId}`,
            `${ASCII.RECORD_SEPARATOR}`,
        ].join(ASCII.UNIT_SEPARATOR);

        const pp_cli_arg = { payx_data };

        return this.executePayPlusClient(site, this.config.code.request.batchKey.txCode, pp_cli_arg);
    }

    private batchOrder(command: PaymentApprovalCommand): Promise<string> {
        const site = this.config.site(command.isTaxDeductible);

        const payx_data = [
            `payx_data=common=amount=${command.productAmount}`,
            `currency=${this.config.code.currency.KRW}`,
            `escw_mod=${this.config.code.escrowUse.No}`,
            `${ASCII.RECORD_SEPARATOR}card=card_mny=${command.productAmount}`,
            `card_tx_type=${this.config.code.request.txApproval.cardTxType}`,
            `quota=${command.installmentMonths.toString().padStart(2, '0')}`,
            `bt_group_id=${site.groupId}`,
            `bt_batch_key=${command.batchKey}`,
            `${ASCII.RECORD_SEPARATOR}`,
        ].join(ASCII.UNIT_SEPARATOR);

        const ordr_data = [
            `ordr_data=ordr_idxx=${command.orderNo}`,
            `good_name=${command.productName}`,
            `good_mny=${command.productAmount}`,
            `buyr_name=${command.buyerName}`,
            `buyr_tel1=${command.buyerTel1}`,
            `buyr_tel2=${command.buyerTel2}`,
            `buyr_mail=${command.buyerEmail}`,
            '',
        ].join(ASCII.UNIT_SEPARATOR);

        const pp_cli_arg = {
            ordr_idx: command.orderNo,
            payx_data,
            ordr_data,
        };

        return this.executePayPlusClient(site, this.config.code.request.txApproval.txCode, pp_cli_arg);
    }

    private cancelTransaction(command: PaymentCancellationCommand): Promise<string> {
        const site = this.config.site(command.isTaxDeductible);

        const data = [
            `mod_data=tno=${command.tno}`,
            `mod_type=${this.config.code.request.txCancellation.modType.full}`,
            `mod_desc='${command.reason}'`,
            '',
        ].join(ASCII.UNIT_SEPARATOR);

        const pp_cli_arg = { modx_data: data };

        return this.executePayPlusClient(site, this.config.code.request.txCancellation.txCode, pp_cli_arg);
    }

    private executePayPlusClient(site: KcpSite, txCode: string, ppCliArg: object): Promise<string> {
        const commandArgument: any = Object.assign(
            {
                home: this.config.modulePath,
                site_cd: site.code,
                site_key: site.key,
                tx_cd: txCode,
                pa_url: site.gwUrl,
                pa_port: 8090,
            },
            ppCliArg,
            {
                log_level: this.config.log.level,
                log_path: this.config.log.path,
                opt: this.config.options.encoding.EUC_KR, // UTF_8 적용시 '결제 요청 처리(payments)'에서 인식이 안 됨
            },
        );

        const flattenedCommandArgument = this.flattenCommand(commandArgument, ',');
        const command = `${this.config.modulePath} -h ${flattenedCommandArgument}`;

        return new Promise((resolve, reject) => {
            exec(command, { encoding: 'euckr' }, (error: ExecException | null, stdout: Buffer, stderr: Buffer) => {
                if (error) {
                    reject(error);
                    return;
                }
                if (stderr.length > 0) {
                    console.log(KcpLogSanitizer.sanitize(iconv.decode(stderr, 'euc-kr').trim()));
                }
                resolve(iconv.decode(stdout, 'euc-kr').trim());
            });
        });
    }

    private flattenCommand(command: any, separator: string): string {
        return Object.keys(command).map((key) => `${key}=${command[key]}`).join(separator);
    }

    public actuate(command: AbstractKcpCommand): Promise<string> {
        switch (command.constructor) {
            case PaymentBatchKeyCommand: {
                return this.requestBatchKey((command as PaymentBatchKeyCommand));
            }
            case PaymentApprovalCommand: {
                return this.batchOrder((command as PaymentApprovalCommand));
            }
            case PaymentCancellationCommand: {
                return this.cancelTransaction((command as PaymentCancellationCommand));
            }
            default: {
                console.error('Unknown Command', command);
                throw new InvalidRequestError();
            }
        }
    }
}
