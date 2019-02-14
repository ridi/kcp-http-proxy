import { Response } from "express";
import { Body, ContentType, Delete, Get, HttpCode, JsonController, Param, Post, QueryParams, Res, UseBefore } from "routing-controllers";
import { OpenAPI, ResponseSchema } from "routing-controllers-openapi";
import { Inject } from "typedi";
import { AuthKeyRequestCommand } from "../application/command/AuthKeyRequestCommand";
import { PaymentApprovalCommand } from "../application/command/PaymentApprovalCommand";
import { PaymentCancellationCommand } from "../application/command/PaymentCancellationCommand";
import { KcpService } from "../application/KcpService";
import { AuthKeyRequestResult } from "../application/result/AuthKeyRequestResult";
import { FailedResult } from "../application/result/FailedResult";
import { PaymentApprovalResult } from "../application/result/PaymentApprovalResult";
import { PaymentCancellationResult } from "../application/result/PaymentCancellationResult";
import { Mode } from "../common/config";
import { AccessibleMiddleware } from "./AccessibleMiddleware";
import { AuthKeyRequest } from "./request/AuthKeyRequest";
import { InvalidRequestException } from "./request/InvalidRequestException";
import { PaymentApprovalRequest } from "./request/PaymentApprovalRequest";
import { PaymentCancellationRequest } from "./request/PaymentCancellationRequest";
import { ReceiptLinkRequest } from "./request/ReceiptLinkRequest";
import { RequestValidator } from "./request/RequestValidator";

@JsonController("/kcp")
export class KcpController {
    @Inject()
    kcpService: KcpService;

    @Inject()
    requestValidator: RequestValidator;

    @OpenAPI({ description: "KCP 영수증 URL" })
    @HttpCode(200)
    @ContentType("application/json")
    @UseBefore(AccessibleMiddleware)
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
    @UseBefore(AccessibleMiddleware)
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

            const result: FailedResult | AuthKeyRequestResult = await this.kcpService.requestAuthKey(command);
            if (result instanceof AuthKeyRequestResult) {
                return Promise.resolve(res.send(result));
            }
            
            const failed: FailedResult = result as FailedResult;
            if (failed.code === "500") {
                return Promise.resolve(res.status(500).send(failed));        
            }
            return Promise.resolve(res.status(400).send(failed));
        } catch (error) {
            return Promise.resolve(this.handleError(error, res));
        }
    }

    @ResponseSchema(PaymentApprovalResult, { description: "결제요청" })
    @HttpCode(200)
    @ContentType("application/json")
    @UseBefore(AccessibleMiddleware)
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

            const result: FailedResult | PaymentApprovalResult = await this.kcpService.approvePayment(command);
            if (result instanceof PaymentApprovalResult) {
                return Promise.resolve(res.send(result));
            }
            
            const failed: FailedResult = result as FailedResult;
            if (failed.code === "500") {
                return Promise.resolve(res.status(500).send(failed));        
            }
            return Promise.resolve(res.status(400).send(failed));
        } catch (error) {
            return Promise.resolve(this.handleError(error, res));
        }
    }

    @ResponseSchema(PaymentCancellationResult, { description: "결제취소" })
    @HttpCode(200)
    @ContentType("application/json")
    @UseBefore(AccessibleMiddleware)
    @Delete("/payment/cancel/:txId")
    async cancelPayment(@Param("txId") txId: string, @QueryParams() req: PaymentCancellationRequest, @Res() res: Response): Promise<Response> {
        req.txId = txId;

        try {
            await this.requestValidator.validate(req);

            const command = new PaymentCancellationCommand(req.mode, req.txId, req.reason)

            const result: FailedResult | PaymentCancellationResult = await this.kcpService.cancelPayment(command);
            if (result instanceof PaymentCancellationResult) {
                return Promise.resolve(res.send(result));
            }
            
            const failed: FailedResult = result as FailedResult;
            if (failed.code === "500") {
                return Promise.resolve(res.status(500).send(failed));        
            }
            return Promise.resolve(res.status(400).send(failed));
        } catch (error) {
            return Promise.resolve(this.handleError(error, res));
        }
    }

    handleError(error: Error, res: Response): Response {
        if (error instanceof InvalidRequestException) {
            const ex = error as InvalidRequestException;
            return res.status(400).send(new FailedResult("400", ex.errors));
        }
        return res.status(500).send(new FailedResult("500", error.message));
    }
}