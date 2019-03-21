export const Ascii = {
    RecordSeparator: String.fromCharCode(30),
    UnitSeparator: String.fromCharCode(31)
};

export const PayPlusStatus = {
    OK: '0000'
};

export class Profile {
    private static INSTANCES: Map<string, Profile> = new Map([
        ['prod', new Profile('prod')],
        ['dev', new Profile('dev')],
        ['test', new Profile('test')]
    ]);

    static from(v: string): Profile {
        if (this.INSTANCES.get(v)) {
            return this.INSTANCES.get(v) as Profile;
        }
        const profile = new Profile(v);
        this.INSTANCES.set(v, profile);
        return profile;
    }
    static Production = Profile.INSTANCES.get('prod') as Profile;
    static Development = Profile.INSTANCES.get('dev') as Profile;
    static Test = Profile.INSTANCES.get('test') as Profile;

    private __value: string;

    private constructor(v: string) {
        this.__value = v;
    }

    toString(): string {
        return this.__value;
    }

    equals(profile: Profile): boolean {
        return this.__value === profile.__value;
    }
}