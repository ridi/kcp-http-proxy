import { Config, Mode, TestConfig } from "@app/common/config";
import * as Sentry from "@sentry/node";
import * as bodyParser from "body-parser";
import * as Logger from "bunyan";
import * as createCloudWatchStream from "bunyan-cloudwatch";
import { getFromContainer, MetadataStorage } from "class-validator";
import { validationMetadatasToSchemas } from "class-validator-jsonschema";
import * as dotenv from "dotenv";
import { Application } from "express";
import * as path from "path";
import "reflect-metadata";
import { createExpressServer, getMetadataArgsStorage, useContainer } from "routing-controllers";
import { routingControllersToSpec } from "routing-controllers-openapi";
import * as swaggerUi from "swagger-ui-express";
import { Container } from "typedi";

export class App {
    static init(): Application {
        // load .env
        dotenv.config();
        // enable di container for controller
        useContainer(Container);
        // logger and sentry
        App.configureLogger();
        // set app root path
        Container.set('app.root', path.resolve(__dirname));
        // controllers
        const routingControllersOptions = {
            routePrefix: "/kcp",
            defaultErrorHandler: false,
            controllers: [ __dirname + "/api/presentation/*Controller.*" ],    
            middlewares: [ __dirname + "/api/presentation/middleware/*.*" ]
        };
        const app: Application = createExpressServer(routingControllersOptions);
        // kcp configs
        App.configureKcpEnvironment();
        
        // swagger ui
        App.configureSwaggerDocs(app, routingControllersOptions);

        // to allow json
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({
            extended: false
        }));        

        return app;
    }

    /**
     * set logger and sentry
     */
    private static configureLogger(): void {
        const isProduction: boolean = process.env.APP_MODE === "production";
        // Logger with AWS cloudwatch appednder
        const logStream: any = isProduction 
        ? {
            stream: createCloudWatchStream({
                logGroupName: process.env.AWS_LOG_GROUP || "",
                logStreamName: process.env.AWS_LOG_STREAM_NAME || ""
            }), 
            type: "raw",
            level: "info"
        }
        : {
            stream: process.stderr,
            type: "stream",
            level: "debug" 
        };
        Container.set('logger', Logger.createLogger({
            name: process.env.AWS_LOG_STREAM_NAME || "default",
            streams: [ logStream ]
        }));

        // Sentry
        Container.set("sentry.loggable", isProduction);
        if (isProduction) {
            Sentry.init({
                dsn: process.env.SENTRY_DSN,
                environment: isProduction ? "prod": "test" 
            });
        }
    }

    /**
     * set kcp configuration by mode
     */
    private static configureKcpEnvironment(): void {
        Container.set(`config.kcp.${Mode.DEV}`, new TestConfig());
        Container.set(`config.kcp.${Mode.PROD}`, new Config(
            process.env.KCP_SITE_CODE || "",
            process.env.KCP_SITE_KEY || "",
            process.env.KCP_GROUP_ID || ""
        ));
        Container.set(`config.kcp.${Mode.PROD_TAX}`, new Config(
            process.env.KCP_TAX_DEDUCTION_SITE_CODE || "",
            process.env.KCP_TAX_DEDUCTION_SITE_KEY || "",
            process.env.KCP_TAX_DEDUCTION_GROUP_ID || ""
        ));
    }

    /**
     * set swagger ui
     * @param app
     * @param routingControllersOptions 
     */
    private static configureSwaggerDocs(app: Application, routingControllersOptions: any): void {
        // generate open api schema & swagger ui
        const metadata = (getFromContainer(MetadataStorage) as any).validationMetadatas;
                
        const schemas = validationMetadatasToSchemas(metadata, {
            refPointerPrefix: "#/components/schemas"
        });

        const storage = getMetadataArgsStorage();
        const spec = routingControllersToSpec(storage, routingControllersOptions, {
            components: {
                schemas
            },
            info: {
                description: "Generated with 'routing-controllers-openapi'",
                title: "RIDI KCP Microservice Rest API",
                version: "1.0.0"
            }
        });
        app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(spec));
    }
}