import * as bodyParser from "body-parser";
import { getFromContainer, MetadataStorage } from "class-validator";
import { validationMetadatasToSchemas } from "class-validator-jsonschema";
import * as dotenv from "dotenv";
import { Application } from "express";
import * as path from "path";
import "reflect-metadata";
import { createExpressServer, getMetadataArgsStorage, useContainer as routingUseContainer } from "routing-controllers";
import { routingControllersToSpec } from "routing-controllers-openapi";
import * as swaggerUi from "swagger-ui-express";
import { Container } from "typedi";
import { Config, Mode, TestConfig } from "./api/common/config";
import * as Logger from "aws-cloudwatch-log";
import * as Raven from "raven";

// load .env
dotenv.config();

// enable di container for controller
routingUseContainer(Container);

// set app root path
Container.set('app.root', path.resolve(__dirname));

// set kcp configuration by mode
Container.set(`config.kcp.${Mode.DEV}`, new TestConfig());
Container.set(`config.kcp.${Mode.PROD}`, new Config(
    process.env.KCP_SITE_CODE,
    process.env.KCP_SITE_KEY,
    process.env.KCP_GROUP_ID
));
Container.set(`config.kcp.${Mode.PROD_TAX}`, new Config(
    process.env.KCP_TAX_DEDUCTION_SITE_CODE,
    process.env.KCP_TAX_DEDUCTION_SITE_KEY,
    process.env.KCP_TAX_DEDUCTION_GROUP_ID
));

// AWS CloudWatch Logger
const loggerConfig = {
    logGroupName: "",
    logStreamName: "",
    region: "",
    accessKeyId: "",
    secretAccessKey: "",
    uploadFreq: 10000,
    local: false
};
Container.set(Logger, new Logger(loggerConfig));

// TODO raven sentry logger//
Raven.config('').install();//TODO

// controllers
const routingControllersOptions = {
    routePrefix: '/kcp',
    defaultErrorHandler: false,
    controllers: [ __dirname + "/api/presentation/*Controller.*" ],    
    middlewares: [ __dirname + "/api/presentation/middleware/*.*" ]
};
// create server
const app: Application = createExpressServer(routingControllersOptions);

// generate open api schema & swagger ui
const metadata = (getFromContainer(MetadataStorage) as any).validationMetadatas;

const schemas = validationMetadatasToSchemas(metadata, {
    refPointerPrefix: "#/components/schemas"
});

const storage = getMetadataArgsStorage();
const spec = routingControllersToSpec(storage, routingControllersOptions, {
    components: {
        schemas,            
        securitySchemes: {
            bearerAuth: {
                description: "JWT Authorization",
                type: "http",
                scheme: "bearer",
                in: "header",
                bearerFormat: "JWT"
            }
        }
    },
    info: {
        description: "Generated with 'routing-controllers-openapi'",
        title: "RIDI KCP Micro-service Rest API",
        version: "1.0.0"
    }
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(spec));

// to allow json
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`listening on port ${port}`);
});

module.exports = app;