export abstract class AbstractCommand {
    readonly is_tax_deductible: boolean;

    protected constructor(is_tax_deductible: boolean) {
        this.is_tax_deductible = is_tax_deductible;
    }
};