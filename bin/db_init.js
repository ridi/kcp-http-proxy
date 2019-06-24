require('module-alias/register');

const Database = require('@root/database').Database;
const { KCP_PAYMENT_APPROVAL_REQUEST_LOCK_TABLE, KCP_PAYMENT_APPROVAL_REQUEST_TABLE } = require('@root/common/constants');

Database.client.createTable({
    TableName: KCP_PAYMENT_APPROVAL_REQUEST_LOCK_TABLE,
    ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1
    },
    KeySchema: [
        {
            AttributeName: 'id',
            KeyType: 'HASH',
        }
    ],
    AttributeDefinitions: [
        {
            AttributeName: 'id',
            AttributeType: 'S',
        }
    ],
}, function (err, data) {
    if (err) {
        throw err;
    }
    console.log(`DynamoDB table '${KCP_PAYMENT_APPROVAL_REQUEST_LOCK_TABLE}' is created.`)
});
Database.client.createTable({
    TableName: KCP_PAYMENT_APPROVAL_REQUEST_TABLE,
    ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1
    },
    KeySchema: [
        {
            AttributeName: 'id',
            KeyType: 'HASH',
        }
    ],
    AttributeDefinitions: [
        {
            AttributeName: 'id',
            AttributeType: 'S',
        }
    ],
}, function (err, data) {
    if (err) {
        throw err;
    }
    console.log(`DynamoDB table '${KCP_PAYMENT_APPROVAL_REQUEST_TABLE}' is created.`)
});
