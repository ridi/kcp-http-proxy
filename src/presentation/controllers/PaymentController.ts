import { PaymentApprovalResult } from '@root/domain/entities/PaymentApprovalResult';
import { PaymentBatchKeyResult } from '@root/domain/entities/PaymentBatchKeyResult';
import { KcpRequestValidator } from '@root/application/requests/KcpRequestValidator';
import { PaymentApprovalRequest } from '@root/application/requests/PaymentApprovalRequest';
import { PaymentBatchKeyRequest } from '@root/application/requests/PaymentBatchKeyRequest';
import { PaymentCancellationRequest } from '@root/application/requests/PaymentCancellationRequest';
import { KcpAppService } from '@root/application/services/KcpAppService';
import { PaymentCancellationResult } from '@root/domain/entities/PaymentCancellationResult';
import { Response } from 'express';
import { Body, Delete, HttpCode, JsonController, Param, Post, Res } from 'routing-controllers';
import { ResponseSchema } from 'routing-controllers-openapi';
import { Inject } from 'typedi';

@JsonController()
export class PaymentController {
    @Inject(type => KcpAppService)
    kcpService: KcpAppService;

    @Inject()
    requestValidator: KcpRequestValidator;

    @ResponseSchema(PaymentBatchKeyResult)
    @HttpCode(201)
    @Post('/payments/batch-key')
    async requestBatchKey(@Body() req: PaymentBatchKeyRequest, @Res() res: Response): Promise<PaymentBatchKeyResult> {
        await this.requestValidator.validate(req);

        const result: PaymentBatchKeyResult = await this.kcpService.requestAuthKey(req);
        return result;
    }
    
    @ResponseSchema(PaymentApprovalResult)
    @HttpCode(200)
    @Post('/payments')
    async approvePayment(@Body() req: PaymentApprovalRequest, @Res() res: Response): Promise<PaymentApprovalResult> {
        await this.requestValidator.validate(req);

        const result: PaymentApprovalResult = await this.kcpService.approvePayment(req);
        return result;
    }

    @ResponseSchema(PaymentCancellationResult)
    @HttpCode(200)
    @Delete('/payments/:kcp_tno')
    async cancelPayment(@Param('kcp_tno') kcp_tno: string, @Body() req: PaymentCancellationRequest, @Res() res: Response): Promise<PaymentCancellationResult> {
        req.tno = kcp_tno;

        await this.requestValidator.validate(req);

        const result: PaymentCancellationResult = await this.kcpService.cancelPayment(req);
        return result;
    }
}