import { Response } from "express";
import { Body, Delete, JsonController, Param, Post, QueryParams, Res, UseBefore } from "routing-controllers";
import { ResponseSchema } from "routing-controllers-openapi";
import { Inject } from "typedi";
import { AuthKeyRequestCommand } from "../application/command/AuthKeyRequestCommand";
import { PaymentApprovalCommand } from "../application/command/PaymentApprovalCommand";
import { PaymentCancellationCommand } from "../application/command/PaymentCancellationCommand";
import { KcpService } from "../application/KcpService";
import { AuthKeyRequestResult } from "../application/result/AuthKeyRequestResult";
import { PaymentApprovalResult } from "../application/result/PaymentApprovalResult";
import { PaymentCancellationResult } from "../application/result/PaymentCancellationResult";
import { AuthKeyRequest } from "./request/AuthKeyRequest";
import { PaymentApprovalRequest } from "./request/PaymentApprovalRequest";
import { PaymentCancellationRequest } from "./request/PaymentCancellationRequest";
import { RequestValidator } from "./request/RequestValidator";
import { Authorized } from "./middleware/Authorized";
import { ApiPath, ApiOperationPost, SwaggerDefinitionConstant } from "swagger-express-ts";

@ApiPath({
    path: "/api/kcp",
    name: "KCP"
})
@JsonController("/kcp")
export class KcpController {
    @Inject()
    kcpService: KcpService;

    @Inject()
    requestValidator: RequestValidator;

    @ResponseSchema(AuthKeyRequestResult, { description: "카드등록을 위한 배치키 발급요청" })    
    @UseBefore(Authorized)
    @Post("/auth/key")
    async requestAuthKey(@Body() req: AuthKeyRequest, @Res() res: Response): Promise<Response> {  
        await this.requestValidator.validate(req);

        const command = new AuthKeyRequestCommand(
            req.mode,
            req.cardNumber,
            req.cardExpiryDate,
            req.cardTaxNumber,
            req.cardPassword
        );

        const result: AuthKeyRequestResult = await this.kcpService.requestAuthKey(command);
        return res.json(result);
    }

    @ResponseSchema(PaymentApprovalResult, { description: "결제요청" })
    @Post("/payment/approval")
    async approvePayment(@Body() req: PaymentApprovalRequest, @Res() res: Response): Promise<Response> {
        await this.requestValidator.validate(req);
        
        const command = new PaymentApprovalCommand(
            req.mode,
            req.billKey,
            req.txId,
            req.productName,
            req.productAmount,
            req.buyerName,
            req.buyerEmail,
            '',
            ''
        );

        const result: PaymentApprovalResult = await this.kcpService.approvePayment(command);
        return res.json(result);
    }

    @ResponseSchema(PaymentCancellationResult, { description: "결제취소" })
    @Delete("/payment/cancel/:txId")
    async cancelPayment(@Param("txId") txId: string, @QueryParams() req: PaymentCancellationRequest, @Res() res: Response): Promise<Response> {
        req.txId = txId;

        await this.requestValidator.validate(req);

        const command = new PaymentCancellationCommand(req.mode, req.txId, req.reason)

        const result: PaymentCancellationResult = await this.kcpService.cancelPayment(command);
        return res.json(result);
    }
}