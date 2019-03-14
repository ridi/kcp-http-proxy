import * as dotenv from "dotenv";
import "reflect-metadata";
import { App } from "./app";
import { Database } from "./database";
// load .env
dotenv.config();

const app = App.init();
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
});

Database.connect().then(() => {
    console.info("DB connected");
}).catch(err => {
    console.error(err);
    server.close();
})