import * as moduleAlias from 'module-alias';
moduleAlias.addAlias('@root', __dirname);

import { App } from '@root/app';
import { getFromContainer, MetadataStorage } from 'class-validator';
import { validationMetadatasToSchemas } from 'class-validator-jsonschema';
import * as fs from 'fs';
import * as Handlebars from 'handlebars';
import * as path from 'path';
import 'reflect-metadata';
import { getMetadataArgsStorage } from 'routing-controllers';
import { routingControllersToSpec } from 'routing-controllers-openapi';

App.init();

const routingControllersOptions = {
    defaultErrorHandler: false,
    controllers: [ __dirname + '/presentation/controllers/*Controller.*' ],
    middlewares: [ __dirname + '/presentation/middlewares/*Middleware.*' ],
};
const metadata = (getFromContainer(MetadataStorage) as any).validationMetadatas;

const schemas = validationMetadatasToSchemas(metadata, {
    refPointerPrefix: '#/components/schemas',
});

const storage = getMetadataArgsStorage();
const specification = routingControllersToSpec(storage, routingControllersOptions, {
    components: {
        schemas,
    },
    info: {
        description: 'Generated with routing-controllers-openapi',
        title: 'RIDI KCP Http Proxy Rest API',
        version: '0.0.1',
    },
});
fs.readFile(path.join(__dirname, '/../docs/init.hbs'), 'utf-8', (error, source) => {
    Handlebars.registerHelper('swaggerSpecification', (spec) => spec);

    const template = Handlebars.compile(source);
    const initJs = template({ content: JSON.stringify(specification) });

    fs.writeFile(path.join(__dirname, '/../docs/init.js'), initJs, (err) => {
        console.error(err);
    });
});
