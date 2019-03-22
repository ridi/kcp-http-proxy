import { KcpConfig, KcpSite } from '@root/common/config';
import { Profile, Profiles } from '@root/common/constants';
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

export class App {
    static init(): Application {
        const profile = Profiles.from(process.env.PROFILE || 'dev');
        // load .env
        dotenv.config();

        useContainer(Container);

        Container.set('app.root', path.resolve(__dirname));
        Container.set('profile', profile);
        
        App.configureLogger(profile);
        App.configureKcpEnvironment(profile);

        // create server
        const routingControllersOptions = {
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
    private static configureLogger(profile: Profile): void {
        // Logger with AWS cloudwatch appednder TODO ECS 컨테이너의 Logging Driver를 awslogs로 설정
        const logStream: any = profile === Profile.Production
        ? {
            stream: createCloudWatchStream({
                logGroupName: process.env.AWS_LOG_GROUP || '',
                logStreamName: process.env.AWS_LOG_STREAM_NAME || ''
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
            name: process.env.AWS_LOG_STREAM_NAME || 'default',
            streams: [ logStream ]
        }));

        // Sentry
        Container.set('sentry.loggable', profile === Profile.Production);
        if (Container.get('sentry.loggable')) {
            Sentry.init({
                dsn: process.env.SENTRY_DSN,
                environment: profile.toString()
            });
        }
    }

    /**
     * set kcp configuration by mode
     */
    private static configureKcpEnvironment(profile: Profile): void {
        if (profile === Profile.Production) {
            const kcpConfig = new KcpConfig({
                code: process.env.KCP_SITE_CODE,
                key: process.env.KCP_SITE_KEY,
                groupId: process.env.KCP_GROUP_ID,
                gwUrl: 'paygw.kcp.co.kr'
            }, {
                code: process.env.KCP_TAX_DEDUCTION_SITE_CODE,
                key: process.env.KCP_TAX_DEDUCTION_SITE_KEY,
                groupId: process.env.KCP_TAX_DEDUCTION_SITE_GROUP_ID,
                gwUrl: 'paygw.kcp.co.kr'
            });
            Container.set(KcpConfig, kcpConfig);
        } else {
            const site: KcpSite = {
                code: 'BA001',
                key: '2T5.LgLrH--wbufUOvCqSNT__',
                groupId: 'BA0011000348',
                gwUrl: 'testpaygw.kcp.co.kr'
            };
            const kcpConfig = new KcpConfig(site, site);
            Container.set(KcpConfig, kcpConfig);
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