import { Response } from "express";
import { Body, Delete, HttpCode, JsonController, Param, Post, Res, UseBefore } from "routing-controllers";
import { ResponseSchema } from "routing-controllers-openapi";
import { Inject } from "typedi";
import { AuthKeyRequestCommand } from "../application/command/AuthKeyRequestCommand";
import { PaymentApprovalCommand } from "../application/command/PaymentApprovalCommand";
import { PaymentCancellationCommand } from "../application/command/PaymentCancellationCommand";
import { PaymentApprovalResult } from "../domain/result/PaymentApprovalResult";
import { PaymentAuthKeyResult } from "../domain/result/PaymentAuthKeyResult";
import { PaymentCancellationResult } from "../domain/result/PaymentCancellationResult";
import { IKcpAppService } from "../application/IKcpAppService";
import { KcpAppService } from "../application/KcpAppService";
import { Authorized } from "../presentation/middleware/Authorized";
import { AuthKeyRequest } from "../presentation/request/AuthKeyRequest";
import { PaymentApprovalRequest } from "../presentation/request/PaymentApprovalRequest";
import { PaymentCancellationRequest } from "../presentation/request/PaymentCancellationRequest";
import { RequestValidator } from "../presentation/request/RequestValidator";

@JsonController()
export class PaymentController {
    @Inject(type => KcpAppService)
    kcpService: IKcpAppService;

    @Inject()
    requestValidator: RequestValidator;

    @ResponseSchema(PaymentAuthKeyResult)
    @HttpCode(201)
    @UseBefore(Authorized)
    @Post("/payments/auth-key")
    async requestAuthKey(@Body() req: AuthKeyRequest, @Res() res: Response): Promise<PaymentAuthKeyResult> {  
        await this.requestValidator.validate(req);

        const command = new AuthKeyRequestCommand(
            req.mode,
            req.card_no,
            req.card_expiry_date,
            req.card_tax_no,
            req.card_password
        );

        const result: PaymentAuthKeyResult = await this.kcpService.requestAuthKey(command);
        return result;
    }
    
    @ResponseSchema(PaymentApprovalResult)
    @HttpCode(200)
    @UseBefore(Authorized)
    @Post("/payments")
    async approvePayment(@Body() req: PaymentApprovalRequest, @Res() res: Response): Promise<PaymentApprovalResult> {
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
        return result;
    }

    @ResponseSchema(PaymentCancellationResult)
    @UseBefore(Authorized)
    @HttpCode(200)
    @Delete("/payments/:kcp_tno")
    async cancelPayment(@Param("kcp_tno") kcp_tno: string, @Body() req: PaymentCancellationRequest, @Res() res: Response): Promise<PaymentCancellationResult> {
        req.tno = kcp_tno;

        await this.requestValidator.validate(req);

        const command = new PaymentCancellationCommand(req.mode, req.tno, req.reason)

        const result: PaymentCancellationResult = await this.kcpService.cancelPayment(command);
        return result;
    }
}