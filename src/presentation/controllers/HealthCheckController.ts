import { KcpAppService } from '@root/application/services/KcpAppService';
import { Database } from '@root/database';
import { TABLE_NAME as PaymentApprovalRequestEntityTableName } from '@root/domain/entities/PaymentApprovalRequestEntity';
import { DatabaseConnectionError } from '@root/errors/DatabaseConnectionError';
import { MessageResponse } from '@root/presentation/models/MessageResponse';
import { AWSError } from 'aws-sdk';
import { ListTablesOutput } from 'aws-sdk/clients/dynamodb';
import { PromiseResult } from 'aws-sdk/lib/request';
import { Get, HttpCode, JsonController } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import { Inject } from 'typedi';

@JsonController('/health')
export class HealthCheckController {
    @Inject()
    private kcpSerivce: KcpAppService;

    private async checkDatabaseConnection(): Promise<void> {
        try {
            const result: PromiseResult<ListTablesOutput, AWSError> = await Database.client.listTables().promise();
            const found = result.TableNames.find((table) => table === PaymentApprovalRequestEntityTableName) || false;
            if (!found) {
                throw new Error(`Table ${PaymentApprovalRequestEntityTableName} doesn't exist.`);
            }
        } catch (err) {
            console.error('Database Connection Error', err);
            throw new DatabaseConnectionError();
        }
    }

    @OpenAPI({ responses: {
        200: {
            content: {
                'application/json': {
                    schema: { $ref: '#/components/schemas/MessageResponse' },
                    example: { message: 'OK' },
                },
            },
        },
        503: {
            content: {
                'application/json': {
                    schema: { $ref: '#/components/schemas/MessageResponse' },
                    example: { message: 'Database Connection Error' },
                },
            },
        },
    }})
    @HttpCode(200)
    @Get('')
    public async index(): Promise<MessageResponse> {
        await this.checkDatabaseConnection();
        return new MessageResponse('OK');
    }
}
