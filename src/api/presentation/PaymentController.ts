import { AuthKeyRequestCommand } from "@app/application/command/AuthKeyRequestCommand";
import { PaymentApprovalCommand } from "@app/application/command/PaymentApprovalCommand";
import { PaymentCancellationCommand } from "@app/application/command/PaymentCancellationCommand";
import { IKcpAppService } from "@app/application/IKcpAppService";
import { KcpAppService } from "@app/application/KcpAppService";
import { PaymentApprovalResult } from "@app/domain/result/PaymentApprovalResult";
import { PaymentAuthKeyResult } from "@app/domain/result/PaymentAuthKeyResult";
import { PaymentCancellationResult } from "@app/domain/result/PaymentCancellationResult";
import { AuthKeyRequest } from "@app/presentation/request/AuthKeyRequest";
import { PaymentApprovalRequest } from "@app/presentation/request/PaymentApprovalRequest";
import { PaymentCancellationRequest } from "@app/presentation/request/PaymentCancellationRequest";
import { RequestValidator } from "@app/presentation/request/RequestValidator";
import { Response } from "express";
import { Body, Delete, HttpCode, JsonController, Param, Post, Res } from "routing-controllers";
import { ResponseSchema } from "routing-controllers-openapi";
import { Inject } from "typedi";

@JsonController()
export class PaymentController {
    @Inject(type => KcpAppService)
    kcpService: IKcpAppService;

    @Inject()
    requestValidator: RequestValidator;

    @ResponseSchema(PaymentAuthKeyResult)
    @HttpCode(201)
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