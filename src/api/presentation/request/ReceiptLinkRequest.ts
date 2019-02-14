import { IsNotEmpty } from "class-validator";
import { KcpRequest } from "./KcpRequest";

export class ReceiptLinkRequest extends KcpRequest {
    @IsNotEmpty({ message: "" })
    cmd: string;
    
    @IsNotEmpty({ message: "" })
    tno: string;

    @IsNotEmpty({ message: "" })
    order_no: string;

    @IsNotEmpty({ message: "" })
    trade_mony: string;
}