import { AbstractKcpRequest } from '@root/application/requests/AbstractKcpRequest';
import { IsNotEmpty, IsNumber, IsOptional, IsDefined } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';

@JSONSchema({
    description: '결제 요청',
    required: [ 'batch_key', 'order_no', 'product_name', 'product_amount', 'buyer_name', 'buyer_email' ],
})
export class PaymentApprovalRequest extends AbstractKcpRequest {
    @JSONSchema({ description: '배치키' })
    @IsNotEmpty({ message: 'batch_key는 필수 값입니다.'})
    public batch_key: string;

    @JSONSchema({ description: '가맹점 주문번호' })
    @IsNotEmpty({ message: 'order_no는 필수 값입니다.' })
    public order_no: string;

    @JSONSchema({ description: '결제 상품명' })
    @IsNotEmpty({ message: 'product_name은 필수 값입니다.' })
    public product_name: string;

    @JSONSchema({ description: '결제 상품 금액' })
    @IsNotEmpty({ message: 'product_amount는 필수 값입니다.' })
    @IsNumber()
    public product_amount: number;

    @JSONSchema({ description: '상품 구매자 이름' })
    @IsDefined()
    public buyer_name: string;

    @JSONSchema({ description: '상품 구매자 이메일 주소' })
    @IsDefined()
    public buyer_email: string;

    @JSONSchema({ description: '할부 개월 수' })
    @IsNumber()
    @IsOptional()
    public installment_months: number = 0;
}
