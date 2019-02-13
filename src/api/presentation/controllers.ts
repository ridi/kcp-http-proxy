import { Response } from "express";
import { Body, ContentType, Delete, Get, HttpCode, JsonController, Param, Post, QueryParams, Res } from "routing-controllers";
import { OpenAPI, ResponseSchema } from "routing-controllers-openapi";
import { Inject } from "typedi";
import { AuthKeyRequestResult, PaymentApprovalResult, PaymentCancellationResult } from "../application/results";
import { KcpService } from "../application/services";
import { AuthKeyRequest, ReceiptLinkRequest, RequestValidator, PaymentApprovalRequest, PaymentCancellationRequest, InvalidRequestException } from "./requests";
import { Mode } from "../common/config";
import { AuthKeyRequestCommand, PaymentApprovalCommand, PaymentCancellationCommand } from "../application/commands";

@JsonController("/kcp")
export class KcpController {
    @Inject()
    kcpService: KcpService;

    @Inject()
    requestValidator: RequestValidator;

    @OpenAPI({ description: "KCP 영수증 URL" })
    @HttpCode(200)
    @ContentType("application/json")
    @Get("/receipt/link")
    getCardReceiptUrl(@QueryParams() req: ReceiptLinkRequest, @Res() res: Response): Promise<Response> {
        const { mode, ...params } = req;
        const pairs: string = Object.entries(params).map(([key, val]) => `${key}=${val}`).join('&');

        let link = `https://admin8.kcp.co.kr/assist/bill.BillActionNew.do?${pairs}`;
        if (mode === Mode.DEV) {
            link = `https://testadmin8.kcp.co.kr/assist/bill.BillActionNew.do?${pairs}`;    
        }
        
        return Promise.resolve(res.send({ linkUrl: link }));
    }

    @ResponseSchema(AuthKeyRequestResult, { description: "카드등록을 위한 배치키 발급요청" })
    @HttpCode(200)
    @ContentType("application/json")
    @Post("/auth/key")
    async requestAuthKey(@Body() req: AuthKeyRequest, @Res() res: Response): Promise<Response> {   
        try {
            await this.requestValidator.validate(req);

            const command = new AuthKeyRequestCommand(
                req.mode,
                req.cardNumber,
                req.cardExpiryDate,
                req.cardTaxNumber,
                req.cardPassword
            );

            const result: AuthKeyRequestResult = await this.kcpService.requestAuthKey(command);
            return Promise.resolve(res.send(result));
        } catch (error) {
            return Promise.resolve(this.handleError(error, res));
        }
    }

    @ResponseSchema(PaymentApprovalResult, { description: "결제요청" })
    @HttpCode(200)
    @ContentType("application/json")
    @Post("/payment/approval")
    async approvePayment(@Body() req: PaymentApprovalRequest, @Res() res: Response): Promise<Response> {
        try {
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
            return Promise.resolve(res.send(result));
        } catch (error) {
            return Promise.resolve(this.handleError(error, res));
        }
    }

    @ResponseSchema(PaymentCancellationResult, { description: "결제취소" })
    @HttpCode(200)
    @ContentType("application/json")
    @Delete("/payment/cancel/:txId")
    async cancelPayment(@Param("txId") txId: string, @QueryParams() req: PaymentCancellationRequest, @Res() res: Response): Promise<Response> {
        req.txId = txId;

        try {
            await this.requestValidator.validate(req);

            const command = new PaymentCancellationCommand(req.mode, req.txId, req.reason)

            const result: PaymentCancellationResult = await this.kcpService.cancelPayment(command);
            return Promise.resolve(res.send(result));
        } catch (error) {
            return Promise.resolve(this.handleError(error, res));
        }
    }

    handleError(error: Error, res: Response): Response {
        if (error instanceof InvalidRequestException) {
            const ex = error as InvalidRequestException;
            return res.status(400).send({ errors: ex.errors });
        }
        return res.status(500).send(error);
    }
}