import * as moduleAlias from 'module-alias';

moduleAlias.addAlias('@root', __dirname);

import { KCP_PAYMENT_APPROVAL_REQUEST_TABLE } from '@root/common/constants';
import { Database } from '@root/database';

Database.client.createTable({
  TableName: KCP_PAYMENT_APPROVAL_REQUEST_TABLE,
  ProvisionedThroughput: {
    ReadCapacityUnits: 1,
    WriteCapacityUnits: 1,
  },
  KeySchema: [
    {
      AttributeName: 'id',
      KeyType: 'HASH',
    },
  ],
  AttributeDefinitions: [
    {
      AttributeName: 'id',
      AttributeType: 'S',
    },
  ],
}, (err, data) => {
  if (err) {
    throw err;
  }
  console.log(`DynamoDB table '${KCP_PAYMENT_APPROVAL_REQUEST_TABLE}' is created.`);

  Database.client.updateTimeToLive({
    TableName: KCP_PAYMENT_APPROVAL_REQUEST_TABLE,
    TimeToLiveSpecification: {
      AttributeName: 'ttl',
      Enabled: true,
    },
  }, (awsError, updateTtlOutput) => {
    if (awsError) {
      throw awsError;
    }
    console.log(`DynamoDB table '${KCP_PAYMENT_APPROVAL_REQUEST_TABLE}' is updated to enable ttl.`);
  });
});
