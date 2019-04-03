import { AbstractKcpRequest } from '@root/application/requests/AbstractKcpRequest';
import { IsEmail, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';

@JSONSchema({
    description: '결제 요청',
    required: [ 'batch_key', 'order_no', 'product_name', 'product_amount', 'buyer_name', 'buyer_email' ],
})
export class PaymentApprovalRequest extends AbstractKcpRequest {
    @JSONSchema({ description: '배치키' })
    @IsNotEmpty({ message: '배치키는 필수값입니다.'})
    public batch_key: string;

    @JSONSchema({ description: '가맹점 주문번호' })
    @IsNotEmpty({ message: '거래번호는 필수값입니다.' })
    public order_no: string;

    @JSONSchema({ description: '결제 상품명' })
    @IsNotEmpty({ message: '상품명은 필수값입니다.' })
    public product_name: string;

    @JSONSchema({ description: '결제 상품 금액' })
    @IsNotEmpty({ message: '상품금액은 필수값입니다.' })
    public product_amount: number;

    @JSONSchema({ description: '상품 구매자 이름' })
    @IsNotEmpty({ message: '구매자 이름은 필수값입니다.' })
    public buyer_name: string;

    @JSONSchema({ description: '상품 구매자 이메일 주소' })
    @IsNotEmpty({ message: '구매자 이메일 주소는 필수값입니다.' })
    @IsEmail()
    public buyer_email: string;

    @JSONSchema({ description: '할부 개월수' })
    @IsNumber()
    @IsOptional()
    public installment_months: number = 0;
}
