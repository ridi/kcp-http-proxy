import { DataMapper } from "@aws/dynamodb-data-mapper";
import { DynamoDB } from "aws-sdk";
import { Container } from "typedi";
import { PaymentRequestEntity } from "./api/domain/entity/PaymentRequestEntity";

export class Database {
    static async connect(): Promise<void> {
        const client = new DynamoDB({
            region: process.env.AWS_REGION || "ap-northeast-2",
            endpoint: process.env.AWS_DYNAMO_DB_ENDPOINT || "http://dynamo:8000"            
        });

        const mapper = new DataMapper({
            client: client,
            tableNamePrefix: "t_"
        });

        await mapper.ensureTableExists(PaymentRequestEntity, { readCapacityUnits: 5, writeCapacityUnits: 5 }).then(() => {
            console.debug("Table created.");
        });

        Container.set(DataMapper, mapper);
    }
}

