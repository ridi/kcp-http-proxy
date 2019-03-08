import { Container } from "typedi";
import { Connection, createConnection, useContainer } from "typeorm";

export class Database {
    static connect(): Promise<Connection> {
        useContainer(Container);
        
        return createConnection({
            type: "mysql",
            host: process.env.APP_DATABASE_HOST,
            port: parseInt(process.env.APP_DATABASE_PORT || "3306"),
            username: process.env.APP_DATABASE_USER,
            password: process.env.APP_DATABASE_PASSWORD,
            database: process.env.APP_DATABASE_NAME,
            entities: [
                `${__dirname}/api/**/entity/*Entity.*`
            ],
            synchronize: true,
            logging: true,
            charset: "utf8"
        }).then(connection => {
            console.log('Connected');
            return connection;
        }).catch(error => {
            console.log('Failed to connect', error);
            throw error;
        });
    }
}

