export abstract class AbstractKcpCommand {
  protected constructor(isTaxDeductible: boolean) {
    this.isTaxDeductible = isTaxDeductible || false;
  }

  public readonly isTaxDeductible: boolean;
}
