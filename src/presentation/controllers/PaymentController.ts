import { AuthKeyRequestCommand } from "@root/application/command/AuthKeyRequestCommand";
import { PaymentApprovalCommand } from "@root/application/command/PaymentApprovalCommand";
import { PaymentCancellationCommand } from "@root/application/command/PaymentCancellationCommand";
import { KcpAppService } from "@root/application/services/KcpAppService";
import { PaymentApprovalResult } from "@root/domain/result/PaymentApprovalResult";
import { PaymentAuthKeyResult } from "@root/domain/result/PaymentAuthKeyResult";
import { PaymentCancellationResult } from "@root/domain/result/PaymentCancellationResult";
import { PaymentApprovalRequest } from "@root/presentation/request/PaymentApprovalRequest";
import { PaymentAuthKeyRequest } from "@root/presentation/request/PaymentAuthKeyRequest";
import { PaymentCancellationRequest } from "@root/presentation/request/PaymentCancellationRequest";
import { KcpRequestValidator } from "@root/presentation/requests/KcpRequestValidator";
import { Response } from "express";
import { Body, Delete, HttpCode, JsonController, Param, Post, Res } from "routing-controllers";
import { ResponseSchema } from "routing-controllers-openapi";
import { Inject } from "typedi";

@JsonController()
export class PaymentController {
    @Inject(type => KcpAppService)
    kcpService: KcpAppService;

    @Inject()
    requestValidator: KcpRequestValidator;

    @ResponseSchema(PaymentAuthKeyResult)
    @HttpCode(201)
    @Post("/payments/auth-key")
    async requestAuthKey(@Body() req: PaymentAuthKeyRequest, @Res() res: Response): Promise<PaymentAuthKeyResult> {  
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
            '',
            req.installment_months
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