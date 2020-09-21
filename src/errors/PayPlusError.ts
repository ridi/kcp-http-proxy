export class PayPlusError extends Error {
  constructor(res_cd: string = '', res_msg: string) {
    super(res_msg);
    this.code = res_cd;
  }

  public readonly code: string;
}
