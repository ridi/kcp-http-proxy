import { AbstractKcpRequest } from '@root/application/requests/AbstractKcpRequest';
import { Matches } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';

@JSONSchema({
  description: '결제를 위한 카드 인증(배치)키 요청',
  required: ['card_no', 'card_expiry_date', 'card_tax_no', 'card_password'],
})
export class PaymentBatchKeyRequest extends AbstractKcpRequest {
  @JSONSchema({ description: '카드 번호', example: '1234567855550000' })
  @Matches(/^\d{13,16}$/, {
    message: '카드 번호가 올바르지 않습니다. 카드 번호는 공백 없이 숫자만 가능합니다.',
  })
  public card_no: string;

  @JSONSchema({ description: '카드 유효기간 연월(YYMM) 4자리', example: '2908' })
  @Matches(/^\d{2}(0[1-9]|1[0-2])$/, {
    message: '카드 유효기간이 올바르지 않습니다. 카드 유효기간은 연/월(YYMM) 4자리 숫자입니다.',
  })
  public card_expiry_date: string;

  @JSONSchema({ description: '카드 인증번호 - 개인: 생년월일 6자리, 법인: 사업자번호 10자리', examples: ['790701', '1000000000'] })
  @Matches(/^(\d{2}(0[1-9]|1[0-2])(0[1-9]|[1-2][0-9]|3[0-1]))|\d{10}$/, {
    message: '카드 인증번호가 올바르지 않습니다. 카드 인증번호는 생년월일 6자리(개인) 혹은 사업자 번호 10자리(법인)입니다.',
  })
  public card_tax_no: string;

  @JSONSchema({ description: '카드 비밀번호 앞 2자리', example: '00' })
  @Matches(/^\d{2}$/, {
    message: '카드 비밀번호가 올바르지 않습니다. 카드 비밀번호 앞 2자리를 입력해주십시오.',
  })
  public card_password: string;
}
