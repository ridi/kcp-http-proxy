export const ASCII = {
    RECORD_SEPARATOR: String.fromCharCode(30),
    UNIT_SEPARATOR: String.fromCharCode(31),
};

export const RADIX = {
    BINARY: 2,
    DECIMAL: 10,
};

export const PAY_PLUS_STATUS = {
    OK: '0000',
};

export enum Profile {
    Production = 'prod',
    Development = 'dev',
    Test = 'test',
}

export class Profiles {
    public static from(value: string): Profile {
        switch (value) {
            case Profile.Production:
                return Profile.Production;
            case Profile.Development:
                return Profile.Development;
            case Profile.Test:
                return Profile.Test;
            default:
                return Profile.Development;
        }
    }
}
