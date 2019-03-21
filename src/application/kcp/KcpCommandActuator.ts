import { AbstractCommand } from '@root/application/commands/AbstractCommand';
import { PaymentApprovalCommand } from '@root/application/commands/PaymentApprovalCommand';
import { PaymentAuthKeyCommand } from '@root/application/commands/PaymentAuthKeyCommand';
import { PaymentCancellationCommand } from '@root/application/commands/PaymentCancellationCommand';
import { Config } from '@root/common/config';
import { Ascii } from '@root/common/constants';
import { exec, ExecException } from 'child_process';
import * as iconv from 'iconv-lite';
import { Service } from 'typedi';

@Service()
export class KcpComandActuator {
    private config: Config;

    actuate(command: AbstractCommand): Promise<string> {
        this.config = command.config;
        switch (command.constructor) {
            case PaymentAuthKeyCommand: {
                return this.requestBatchKey((command as PaymentAuthKeyCommand));
            }
            case PaymentApprovalCommand: {
                return this.batchOrder((command as PaymentApprovalCommand));
            }
            case PaymentCancellationCommand: {
                return this.cancelTransaction((command as PaymentCancellationCommand));
            }
            default:
                throw 'Unknown Kcp Command';
        }
    }

    private requestBatchKey(command: PaymentAuthKeyCommand): Promise<string> {
        const payx_data = [
            `payx_data=`,
            `${Ascii.RecordSeparator}card=card_mny=`,
            `card_tx_type=${this.config.code.request.batchKey.cardTxType}`,
            `card_no=${command.card_number}`,
            `card_expiry=${command.card_expiry_date}`,
            `card_taxno=${command.card_tax_no}`,
            `card_pwd=${command.card_password}`,
            `${Ascii.RecordSeparator}auth=sign_txtype=${this.config.code.request.batchKey.signTxType}`,
            `group_id=${this.config.groupId}`,
            `${Ascii.RecordSeparator}`
        ].join(Ascii.UnitSeparator);
        
        const pp_cli_arg = {
            payx_data: payx_data
        };

        return this.executePayPlusClient(this.config.code.request.batchKey.txCode, pp_cli_arg);
    }

    private batchOrder(command: PaymentApprovalCommand): Promise<string> {
        const payx_data = [
            `payx_data=common=amount=${command.goods_price}`,
            `currency=${this.config.code.currency.KRW}`,
            `escw_mod=${this.config.code.escrowUse.No}`,
            `${Ascii.RecordSeparator}card=card_mny=${command.goods_price}`,
            `card_tx_type=${this.config.code.request.txApproval.cardTxType}`,
            `quota=${command.installment_months.toString().padStart(2, '0')}`,
            `bt_group_id=${this.config.groupId}`,
            `bt_batch_key=${command.batch_key}`,
            `${Ascii.RecordSeparator}`
        ].join(Ascii.UnitSeparator);

        const ordr_data = [
            `ordr_data=ordr_idxx=${command.order_id}`,
            `good_name=${command.goods_name}`,
            `good_mny=${command.goods_price}`,
            `buyr_name=${command.buyer_name}`,
            `buyr_tel1=${command.buyer_tel1}`,
            `buyr_tel2=${command.buyer_tel2}`,
            `buyr_mail=${command.buyer_email}`,
            ''
        ].join(Ascii.UnitSeparator);

        const pp_cli_arg = {
            ordr_idx: command.order_id,
            payx_data: payx_data,
            ordr_data: ordr_data
        };

        return this.executePayPlusClient(this.config.code.request.txApproval.txCode, pp_cli_arg);
    }

    private cancelTransaction(command: PaymentCancellationCommand): Promise<string> {
        const data = [
            `mod_data=tno=${command.tno}`,
            `mod_type=${this.config.code.request.txCancellation.modType.full}`,
            `mod_desc='${command.reason}'`,
            ''
        ].join(Ascii.UnitSeparator);

        const pp_cli_arg = {
            modx_data: data
        };
        
        return this.executePayPlusClient(this.config.code.request.txCancellation.txCode, pp_cli_arg);
    }

    private executePayPlusClient(txCode: string, ppCliArg: object): Promise<string> {
        const commandArgument: CommandArgument = Object.assign(
            new CommandArgument(),
            {
                home: this.config.modulePath,
                site_cd: this.config.siteCode,
                site_key: this.config.siteKey,
                tx_cd: txCode,
                pa_url: this.config.gwUrl,
                pa_port: 8090
            },            
            ppCliArg,
            {
                log_level: this.config.log.level,
                log_path: this.config.log.path,
                opt: this.config.options.encoding.EUC_KR //UTF_8 적용시 '결제 요청 처리(payments)'에서 인식이 안 됨
            }
        );

        const command = `${this.config.modulePath} -h ${commandArgument.flatten(',')}`;

        return new Promise((resolve, reject) => {
            exec(command, { encoding: 'euckr' }, (error: ExecException, stdout: Buffer, stderr) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(iconv.decode(stdout, 'euc-kr').trim());
            });
        });
    }
}

class CommandArgument {
    flatten(separator: string): string {
        return Object.keys(this).map(key => `${key}=${this[key]}`).join(separator);
    }
}