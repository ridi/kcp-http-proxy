import { PaymentApprovalCommand } from '@root/application/commands/PaymentApprovalCommand';
import { PaymentAuthKeyCommand } from '@root/application/commands/PaymentAuthKeyCommand';
import { PaymentCancellationCommand } from '@root/application/commands/PaymentCancellationCommand';
import { PaymentApprovalResult } from '@root/application/domain/PaymentApprovalResult';
import { PaymentAuthKeyResult } from '@root/application/domain/PaymentAuthKeyResult';
import { PaymentCancellationResult } from '@root/application/domain/PaymentCancellationResult';
import { KcpAppService } from '@root/application/services/KcpAppService';
import { Config, KCP_CONFIGURATIONS } from '@root/common/config';
import { Profile } from '@root/common/constants';
import { AbstractKcpRequest } from '@root/presentation/requests/AbstractKcpRequest';
import { KcpRequestValidator } from '@root/presentation/requests/KcpRequestValidator';
import { PaymentApprovalRequest } from '@root/presentation/requests/PaymentApprovalRequest';
import { PaymentAuthKeyRequest } from '@root/presentation/requests/PaymentAuthKeyRequest';
import { PaymentCancellationRequest } from '@root/presentation/requests/PaymentCancellationRequest';
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

    @Inject('profile')
    profile: Profile;

    @ResponseSchema(PaymentAuthKeyResult)
    @HttpCode(201)
    @Post('/payments/auth-key')
    async requestAuthKey(@Body() req: PaymentAuthKeyRequest, @Res() res: Response): Promise<PaymentAuthKeyResult> {  
        req.config = this.getConfigByProfile(req);

        await this.requestValidator.validate(req);

        const command = new PaymentAuthKeyCommand(
            req.config,
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
    @Post('/payments')
    async approvePayment(@Body() req: PaymentApprovalRequest, @Res() res: Response): Promise<PaymentApprovalResult> {
        req.config = this.getConfigByProfile(req);

        await this.requestValidator.validate(req);
        
        const command = new PaymentApprovalCommand(
            req.config,
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
    @Delete('/payments/:kcp_tno')
    async cancelPayment(@Param('kcp_tno') kcp_tno: string, @Body() req: PaymentCancellationRequest, @Res() res: Response): Promise<PaymentCancellationResult> {
        req.tno = kcp_tno;
        req.config = this.getConfigByProfile(req);

        await this.requestValidator.validate(req);

        const command = new PaymentCancellationCommand(req.config, req.tno, req.reason)

        const result: PaymentCancellationResult = await this.kcpService.cancelPayment(command);
        return result;
    }

    private getConfigByProfile(req: AbstractKcpRequest): Config {
        return this.profile.equals(Profile.Production) 
            ? (req.is_tax_deductible ? KCP_CONFIGURATIONS.prod.tax : KCP_CONFIGURATIONS.prod.normal)
            : KCP_CONFIGURATIONS.dev.normal;
    }
}