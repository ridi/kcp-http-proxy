import { RADIX } from '@root/common/constants';
import * as redis from 'redis';
import * as Redlock from 'redlock';

export class Redis {
    public static client = redis.createClient({
        host: process.env.REDIS_HOST || 'redis',
        port: parseInt(process.env.REDIS_PORT, RADIX.DECIMAL) || 6379,
    });

    public static redlock = new Redlock(
        [ Redis.client ],
        {
            driftFactor: 0.01,
            retryCount: 2,
            retryDelay: 200,
            retryJitter: 200,
        },
    );
}
