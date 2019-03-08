import { Response } from "express";
import { Body, Delete, HttpCode, JsonController, Param, Post, Res, UseBefore } from "routing-controllers";
import { ResponseSchema } from "routing-controllers-openapi";
import { Inject } from "typedi";
import { AuthKeyRequestCommand } from "../application/command/AuthKeyRequestCommand";
import { PaymentApprovalCommand } from "../application/command/PaymentApprovalCommand";
import { PaymentCancellationCommand } from "../application/command/PaymentCancellationCommand";
import { PaymentApprovalResultDto } from "../application/dto/PaymentApprovalResultDto";
import { PaymentAuthKeyResultDto } from "../application/dto/PaymentAuthKeyResultDto";
import { PaymentCancellationResultDto } from "../application/dto/PaymentCancellationResultDto";
import { IKcpService } from "../application/IKcpService";
import { KcpService } from "../application/KcpService";
import { Authorized } from "./middleware/Authorized";
import { AuthKeyRequest } from "./request/AuthKeyRequest";
import { PaymentApprovalRequest } from "./request/PaymentApprovalRequest";
import { PaymentCancellationRequest } from "./request/PaymentCancellationRequest";
import { RequestValidator } from "./request/RequestValidator";

@JsonController()
export class PaymentController {
    @Inject(type => KcpService)
    kcpService: IKcpService;

    @Inject()
    requestValidator: RequestValidator;

    @ResponseSchema(PaymentAuthKeyResultDto)
    @HttpCode(201)
    @UseBefore(Authorized)
    @Post("/payments/auth-key")
    async requestAuthKey(@Body() req: AuthKeyRequest, @Res() res: Response): Promise<PaymentAuthKeyResultDto> {  
        await this.requestValidator.validate(req);

        const command = new AuthKeyRequestCommand(
            req.mode,
            req.card_no,
            req.card_expiry_date,
            req.card_tax_no,
            req.card_password
        );

        const result: PaymentAuthKeyResultDto = await this.kcpService.requestAuthKey(command);
        return result;
    }
    
    @ResponseSchema(PaymentApprovalResultDto)
    @HttpCode(200)
    @UseBefore(Authorized)
    @Post("/payments")
    async approvePayment(@Body() req: PaymentApprovalRequest, @Res() res: Response): Promise<PaymentApprovalResultDto> {
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

        const result: PaymentApprovalResultDto = await this.kcpService.approvePayment(command);
        return result;
    }

    @ResponseSchema(PaymentCancellationResultDto)
    @UseBefore(Authorized)
    @HttpCode(200)
    @Delete("/payments/:kcp_tno")
    async cancelPayment(@Param("kcp_tno") kcp_tno: string, @Body() req: PaymentCancellationRequest, @Res() res: Response): Promise<PaymentCancellationResultDto> {
        req.trace_no = kcp_tno;

        await this.requestValidator.validate(req);

        const command = new PaymentCancellationCommand(req.mode, req.trace_no, req.reason)

        const result: PaymentCancellationResultDto = await this.kcpService.cancelPayment(command);
        return result;
    }
}