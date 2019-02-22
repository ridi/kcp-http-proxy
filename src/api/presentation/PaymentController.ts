import { Response } from "express";
import { Body, Delete, JsonController, Param, Post, Res, UseBefore, HttpCode } from "routing-controllers";
import { ResponseSchema } from "routing-controllers-openapi";
import { Inject } from "typedi";
import { AuthKeyRequestCommand } from "../application/command/AuthKeyRequestCommand";
import { PaymentApprovalCommand } from "../application/command/PaymentApprovalCommand";
import { PaymentCancellationCommand } from "../application/command/PaymentCancellationCommand";
import { KcpService } from "../application/KcpService";
import { AuthKeyRequestResult } from "../application/result/AuthKeyRequestResult";
import { PaymentApprovalResult } from "../application/result/PaymentApprovalResult";
import { PaymentCancellationResult } from "../application/result/PaymentCancellationResult";
import { Authorized } from "./middleware/Authorized";
import { AuthKeyRequest } from "./request/AuthKeyRequest";
import { PaymentApprovalRequest } from "./request/PaymentApprovalRequest";
import { PaymentCancellationRequest } from "./request/PaymentCancellationRequest";
import { RequestValidator } from "./request/RequestValidator";

@JsonController("/payments")
export class PaymentController {
    @Inject()
    kcpService: KcpService;

    @Inject()
    requestValidator: RequestValidator;

    @ResponseSchema(AuthKeyRequestResult)
    @HttpCode(201)
    @UseBefore(Authorized)
    @Post("/auth-key")
    async requestAuthKey(@Body() req: AuthKeyRequest, @Res() res: Response): Promise<AuthKeyRequestResult> {  
        await this.requestValidator.validate(req);

        const command = new AuthKeyRequestCommand(
            req.mode,
            req.card_no,
            req.card_expiry_date,
            req.card_tax_no,
            req.card_password
        );

        const result: AuthKeyRequestResult = await this.kcpService.requestAuthKey(command);
        return result;
    }
    
    @ResponseSchema(PaymentApprovalResult)
    @HttpCode(200)
    @UseBefore(Authorized)
    @Post("/approve")
    async approvePayment(@Body() req: PaymentApprovalRequest, @Res() res: Response): Promise<Response> {
        await this.requestValidator.validate(req);
        
        const command = new PaymentApprovalCommand(
            req.mode,
            req.bill_key,
            req.order_no,
            req.product_name,
            req.product_amount,
            req.buyer_name,
            req.buyer_email,
            '',
            ''
        );

        const result: PaymentApprovalResult = await this.kcpService.approvePayment(command);
        return res.json(result);
    }

    @ResponseSchema(PaymentCancellationResult)
    @UseBefore(Authorized)
    @HttpCode(200)
    @Delete("/:kcp_tno/cancel")
    async cancelPayment(@Param("kcp_tno") kcp_tno: string, @Body() req: PaymentCancellationRequest, @Res() res: Response): Promise<Response> {
        req.trace_no = kcp_tno;

        await this.requestValidator.validate(req);

        const command = new PaymentCancellationCommand(req.mode, req.trace_no, req.reason)

        const result: PaymentCancellationResult = await this.kcpService.cancelPayment(command);
        return res.json(result);
    }
}