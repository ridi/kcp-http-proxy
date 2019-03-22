export const Ascii = {
    RecordSeparator: String.fromCharCode(30),
    UnitSeparator: String.fromCharCode(31)
};

export const PayPlusStatus = {
    OK: '0000'
};

export enum Profile {
    Production = 'prod',
    Development = 'dev',
    Test = 'test'
};

export class Profiles {
    static from(value: string): Profile {
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