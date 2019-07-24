export const ASCII = {
    RECORD_SEPARATOR: String.fromCharCode(30),
    UNIT_SEPARATOR: String.fromCharCode(31),
};

export const RADIX = {
    DECIMAL: 10,
};

export const PAY_PLUS_STATUS = {
    ALREADY_CANCELED: '8133',
    OK: '0000',
};

export const KCP_PAYMENT_APPROVAL_REQUEST_TABLE = `kcp-payment-approval-requests-${process.env.APP_ENV}`;

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
