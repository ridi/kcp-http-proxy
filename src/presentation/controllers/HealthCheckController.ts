
import { Response } from 'express';
import { Get, JsonController, Res, ContentType } from 'routing-controllers';
import { Inject } from 'typedi';
import { DataMapper } from '@aws/dynamodb-data-mapper';

@JsonController('/health')
export class HealthCheckController {
    @Inject(type => DataMapper)
    dataMapper: DataMapper;

    @Get('')
    @ContentType('text/html')
    index(@Res() res: Response) {
        //TODO check database connection
        //TODO check kcp connection
        return res.status(200).send('ok');
    }
}