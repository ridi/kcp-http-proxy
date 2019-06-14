import { DataMapper } from '@aws/dynamodb-data-mapper';
import { PaymentApprovalRequestEntity } from '@root/domain/entities/PaymentApprovalRequestEntity';
import { DynamoDB } from 'aws-sdk';
import { Container } from 'typedi';

export class Database {
    public static client = new DynamoDB({
        region: 'ap-northeast-2',
        endpoint: process.env.DYNAMODB_ENDPOINT,
    });

    public static async connect(): Promise<void> {
        const mapper = new DataMapper({
            client: Database.client,
        });

        await mapper.ensureTableExists(PaymentApprovalRequestEntity, { readCapacityUnits: 5, writeCapacityUnits: 5 }).then(() => {
            console.debug('Table created.');
        });

        Container.set(DataMapper, mapper);
    }
}
