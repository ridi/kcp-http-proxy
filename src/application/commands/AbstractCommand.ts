import { Config } from '@root/common/config';

export abstract class AbstractCommand {
    readonly config: Config;

    protected constructor(config: Config) {
        this.config = config;
    }
};