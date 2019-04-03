import { KcpRequestValidator } from '@root/application/requests/KcpRequestValidator';
import { PaymentApprovalRequest } from '@root/application/requests/PaymentApprovalRequest';
import { PaymentBatchKeyRequest } from '@root/application/requests/PaymentBatchKeyRequest';
import { PaymentCancellationRequest } from '@root/application/requests/PaymentCancellationRequest';
import { KcpAppService } from '@root/application/services/KcpAppService';
import { PaymentApprovalResult } from '@root/domain/entities/PaymentApprovalResult';
import { PaymentBatchKeyResult } from '@root/domain/entities/PaymentBatchKeyResult';
import { PaymentCancellationResult } from '@root/domain/entities/PaymentCancellationResult';
import { Response } from 'express';
import { Body, Delete, HttpCode, JsonController, Param, Post, Res, UseBefore } from 'routing-controllers';
import { ResponseSchema } from 'routing-controllers-openapi';
import { Inject } from 'typedi';
import { RequestLoggingMiddleware } from '../middlewares/RequestLoggingMiddleware';

@JsonController()
export class PaymentController {
    @Inject(type => KcpAppService)
    private kcpService: KcpAppService;

    @Inject()
    private requestValidator: KcpRequestValidator;

    @ResponseSchema(PaymentBatchKeyResult)
    @UseBefore(RequestLoggingMiddleware)
    @HttpCode(201)
    @Post('/payments/batch-key')
    public async requestBatchKey(@Body() req: PaymentBatchKeyRequest, @Res() res: Response): Promise<PaymentBatchKeyResult> {
        await this.requestValidator.validate(req);

        const result: PaymentBatchKeyResult = await this.kcpService.requestBatchKey(req);
        return result;
    }
    
    @ResponseSchema(PaymentApprovalResult)
    @UseBefore(RequestLoggingMiddleware)
    @HttpCode(200)
    @Post('/payments')
    public async approvePayment(@Body() req: PaymentApprovalRequest, @Res() res: Response): Promise<PaymentApprovalResult> {
        await this.requestValidator.validate(req);

        const result: PaymentApprovalResult = await this.kcpService.approvePayment(req);
        return result;
    }

    @ResponseSchema(PaymentCancellationResult)
    @UseBefore(RequestLoggingMiddleware)
    @HttpCode(200)
    @Delete('/payments/:kcp_tno')
    public async cancelPayment(@Param('kcp_tno') kcp_tno: string, @Body() req: PaymentCancellationRequest, @Res() res: Response): Promise<PaymentCancellationResult> {
        req.tno = kcp_tno;

        await this.requestValidator.validate(req);

        const result: PaymentCancellationResult = await this.kcpService.cancelPayment(req);
        return result;
    }
}