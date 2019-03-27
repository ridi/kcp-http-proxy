require('module-alias/register');

import { App } from '@root/app';
import { Database } from '@root/database';
import { Application } from 'express';
import 'reflect-metadata';

(async () => {
    const app: Application = App.init();
    
    const port = process.env.PORT || 3000;        
    const server = app.listen(port, () => {
        console.info(`listening on port ${port}`);
    });
    
    await Database.connect().then(() => {
        console.info('DB connected');
    }).catch(err => {
        console.error(err);
        server.close();
    });
})();