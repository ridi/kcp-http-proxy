import { Config, KCP_CONFIGURATIONS } from '@root/common/config';
import * as Sentry from '@sentry/node';
import * as bodyParser from 'body-parser';
import * as Logger from 'bunyan';
import * as createCloudWatchStream from 'bunyan-cloudwatch';
import { getFromContainer, MetadataStorage } from 'class-validator';
import { validationMetadatasToSchemas } from 'class-validator-jsonschema';
import * as dotenv from 'dotenv';
import { Application } from 'express';
import * as path from 'path';
import 'reflect-metadata';
import { createExpressServer, getMetadataArgsStorage, useContainer } from 'routing-controllers';
import { routingControllersToSpec } from 'routing-controllers-openapi';
import * as swaggerUi from 'swagger-ui-express';
import { Container } from 'typedi';
import { Profile } from './common/constants';

export class App {
    static init(): Application {
        // load .env
        dotenv.config();

        useContainer(Container);

        Container.set('app.root', path.resolve(__dirname));
        Container.set('profile', Profile.from((process.env.profile || 'dev'));
        App.configureLogger();
        App.configureKcpEnvironment();

        // create server
        const routingControllersOptions = {
            routePrefix: '/kcp',
            defaultErrorHandler: false,
            controllers: [ __dirname + '/presentation/controllers/*Controller.*' ],    
            middlewares: [ __dirname + '/presentation/middlewares/*Middleware.*' ]
        };
        const app: Application = createExpressServer(routingControllersOptions);
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({
            extended: false
        }));

        App.configureSwaggerDocs(app, routingControllersOptions);

        return app;
    }

    /**
     * set logger and sentry
     */
    private static configureLogger(): void {
        const profile = Container.get('profile') as Profile;
        // Logger with AWS cloudwatch appednder TODO ECS 컨테이너의 Logging Driver를 awslogs로 설정
        const logStream: any = profile.equals(Profile.Production) 
        ? {
            stream: createCloudWatchStream({
                logGroupName: process.env.aws_log_group || '',
                logStreamName: process.env.aws_log_stream_name || ''
            }), 
            type: 'raw',
            level: 'info'
        }
        : {
            stream: process.stderr,
            type: 'stream',
            level: 'debug' 
        };
        Container.set('logger', Logger.createLogger({
            name: process.env.aws_log_stream_name || 'default',
            streams: [ logStream ]
        }));

        // Sentry
        Container.set('sentry.loggable', profile.equals(Profile.Production));
        if (Container.get('sentry.loggable')) {
            Sentry.init({
                dsn: process.env.sentry_dsn,
                environment: profile.toString()
            });
        }
    }

    /**
     * set kcp configuration by mode
     */
    private static configureKcpEnvironment(): void {
        KCP_CONFIGURATIONS.dev = {
            normal: new Config('BA001', '2T5.LgLrH--wbufUOvCqSNT__', 'BA0011000348'),
            tax: new Config('BA001', '2T5.LgLrH--wbufUOvCqSNT__', 'BA0011000348')
        };
        if (process.env.KCP_SITE_CODE) {
            KCP_CONFIGURATIONS.prod.normal = new Config(
                process.env.KCP_SITE_CODE || '',
                process.env.KCP_SITE_KEY || '',
                process.env.KCP_GROUP_ID|| '',
                false
            );
        }
        if (process.env.KCP_TAX_DEDUCTION_SITE_CODE) {
            KCP_CONFIGURATIONS.prod.tax = new Config(
                process.env.KCP_TAX_DEDUCTION_SITE_CODE || '',
                process.env.KCP_TAX_DEDUCTION_SITE_KEY || '',
                process.env.KCP_TAX_DEDUCTION_SITE_GROUP_ID|| '',
                true
            );
        }
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
            refPointerPrefix: '#/components/schemas'
        });

        const storage = getMetadataArgsStorage();
        const spec = routingControllersToSpec(storage, routingControllersOptions, {
            components: {
                schemas
            },
            info: {
                description: 'Generated with \"routing-controllers-openapi\"',
                title: 'RIDI KCP Http Proxy Rest API',
                version: '1.0.0'
            }
        });
        app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(spec));
    }
}