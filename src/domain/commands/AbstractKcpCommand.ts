
export abstract class AbstractKcpCommand {
    readonly isTaxDeductible: boolean;

    protected constructor(isTaxDeductible: boolean) {
        this.isTaxDeductible = isTaxDeductible || false;
    }
};