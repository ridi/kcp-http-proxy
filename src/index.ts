import { Application } from "express";
import "reflect-metadata";
import { App } from "./app";
import { Database } from "./database";

(async () => {
    const app: Application = App.init();
    
    // run server        
    const port = process.env.APP_PORT || 3000;        
    const server = app.listen(port, () => {
        console.log(`listening on port ${port}`);
    });

    // connect database
    await Database.connect().then(() => {
        console.info("DB connected");
        module.exports = app;
    }).catch(err => {
        console.error(err);
        server.close();
    });
})();