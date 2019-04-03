import { PaymentBatchKeyRequest } from '@root/application/requests/PaymentBatchKeyRequest';
import { KcpAppService } from '@root/application/services/KcpAppService';
import { PAY_PLUS_STATUS } from '@root/common/constants';
import { Database } from '@root/database';
import { TABLE_NAME as PaymentApprovalRequestEntityTableName } from '@root/domain/entities/PaymentApprovalRequestEntity';
import { DatabaseConnectionError } from '@root/errors/DatabaseConnectionError';
import { KcpConnectionError } from '@root/errors/KcpConnectionError';
import { AWSError } from 'aws-sdk';
import { ListTablesOutput } from 'aws-sdk/clients/dynamodb';
import { PromiseResult } from 'aws-sdk/lib/request';
import { ContentType, Get, HttpCode, JsonController } from 'routing-controllers';
import { Inject } from 'typedi';

@JsonController('/health')
export class HealthCheckController {
    @Inject()
    private kcpSerivce: KcpAppService;

    private async checkDatabaseConnection(): Promise<void> {
        try {
            const result:PromiseResult<ListTablesOutput, AWSError> = await Database.client.listTables().promise();
            const found = result.TableNames.find(table => table === PaymentApprovalRequestEntityTableName) || false;
            if (!found) {
                throw new Error(`Table ${PaymentApprovalRequestEntityTableName} doesn't exist.`);
            }
        } catch (err) {
            console.error('Database Connection Error', err);
            throw new DatabaseConnectionError();
        }
    }

    private async checkKcpConnection(): Promise<void> {
        const dummyRequest = new PaymentBatchKeyRequest();
        dummyRequest.card_no = '4499140000000000';
        dummyRequest.card_expiry_date = '7912';
        dummyRequest.card_tax_no = '000101';
        dummyRequest.card_password = '00';

        try {
            const result = await this.kcpSerivce.requestBatchKey(dummyRequest);
            if (!result || result.code !== PAY_PLUS_STATUS.OK) {
                throw new Error('Invalid KCP Response');
            }
        } catch (err) {
            console.error('KCP Connection Error', err);
            throw new KcpConnectionError();
        }
    }

    @ContentType('text/plain')
    @HttpCode(200)
    @Get('')
    public async index(): Promise<string> {
        await this.checkDatabaseConnection();
        await this.checkKcpConnection();
        return 'OK';
    }
}