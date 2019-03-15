require("module-alias/register");

import { Application } from "express";
import "reflect-metadata";
import { App } from "@root/app";
import { Database } from "@root/database";


(async () => {
    const app: Application = App.init();
    
    const port = process.env.APP_PORT || 3000;        
    const server = app.listen(port, () => {
        console.info(`listening on port ${port}`);
    });
    
    await Database.connect().then(() => {
        console.info("DB connected");
    }).catch(err => {
        console.error(err);
        server.close();
    });
})();