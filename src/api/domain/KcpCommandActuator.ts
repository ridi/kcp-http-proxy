import { exec } from "child_process";
import { Container, Service } from "typedi";
import { AuthKeyRequestCommand, Command, CommandType, PaymentApprovalCommand, PaymentCancellationCommand } from "../application/commands";
import { Config } from "../common/config";

const RecordSeparator: string = String.fromCharCode(30);
const UnitSeparator: string = String.fromCharCode(31);

@Service()
export class KcpComandActuator {
    private config: Config;

    actuate(command: Command): Promise<string> {
        this.config = Container.get(`config.kcp.${command.mode}`);
        switch (command.type) {
            case CommandType.AUTH_KEY_REQ: {
                return this.requestBatchKey((command as AuthKeyRequestCommand));
            }
            case CommandType.PAY_REQ: {
                return this.batchOrder((command as PaymentApprovalCommand));
            }
            case CommandType.PAY_CANCEL: {
                return this.cancelTransaction((command as PaymentCancellationCommand));
            }
            default:
                throw 'Unknown Kcp Command Type';
        }
    }

    private requestBatchKey(command: AuthKeyRequestCommand): Promise<string> {
        const payx_data = [
            `payx_data=`,
            `${RecordSeparator}card=card_mny=`,
            `card_tx_type=${this.config.code.request.batchKey.cardTxType}`,
            `card_no=${command.cardNumber}`,
            `card_expiry=${command.cardExpiryDate}`,
            `card_taxno=${command.cardTaxNumber}`,
            `card_pwd=${command.cardPassword}`,
            `${RecordSeparator}auth=sign_txtype=${this.config.code.request.batchKey.signTxType}`,
            `group_id=${this.config.groupId}`,
            `${RecordSeparator}`
        ].join(UnitSeparator);
        
        const pp_cli_arg = {
            payx_data: payx_data
        };

        return this.executePayPlusClient(this.config.code.request.batchKey.txCode, pp_cli_arg);
    }

    private batchOrder(command: PaymentApprovalCommand): Promise<string> {
        const payx_data = [
            `payx_data=common=amount=${command.goodsPrice}`,
            `currency=${this.config.code.currency.KRW}`,
            `escw_mod=${this.config.code.escrowUse.No}`,
            `${RecordSeparator}card=card_mny=${command.goodsPrice}`,
            `card_tx_type=${this.config.code.request.txApproval.cardTxType}`,
            `quota=${command.installmentMonths}`,
            `bt_group_id=${this.config.groupId}`,
            `bt_batch_key=${command.batchKey}`,
            `${RecordSeparator}`
        ].join(UnitSeparator);

        const ordr_data = [
            `ordr_data=ordr_idxx=${command.orderId}`,
            `good_name=${command.goodsName}`,
            `good_mny=${command.goodsPrice}`,
            `buyr_name=${command.buyerName}`,
            `buyr_tel1=${command.buyerTel1}`,
            `buyr_tel2=${command.buyerTel2}`,
            `buyr_mail=${command.buyerEmail}`,
            ''
        ].join(UnitSeparator);

        const pp_cli_arg = {
            ordr_idx: command.orderId,
            payx_data: payx_data,
            ordr_data: ordr_data
        };

        return this.executePayPlusClient(this.config.code.request.txApproval.txCode, pp_cli_arg);
    }

    private cancelTransaction(command: PaymentCancellationCommand): Promise<string> {
        const data = [
            `mod_data=tno=${command.kcpTno}`,
            `mod_type=${this.config.code.request.txCancellation.modType.full}`,
            `mod_desc='${command.reason}'`,
            ''
        ].join(UnitSeparator);

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
                opt: this.config.options.encoding.UTF_8
            }
        );

        const command = `${this.config.modulePath} -h ${commandArgument.flatten(',')}`;

        return new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(stdout.trim());
            });
        });
    }
}

class CommandArgument {
    flatten(separator: string): string {
        return Object.keys(this).map(key => `${key}=${this[key]}`).join(separator);
    }
}