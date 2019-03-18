# RIDI KCP Microservice Rest API
## 테스트 실행하기
```shell
make test
```

## 로컬 환경에서 구동하기
```shell
docker-compose up
```
cf. 필요시 docker-compose.yml의 environment를 수정해서 사용

## HealthCheck
### `GET /kcp/health`
#### Response
- Content-Type: text/html
- Statuc Code: **200 OK**

## Payments
### `POST /kcp/payments/auth-key`
결제를 위한 카드 인증(배치)키 요청

#### Body
- Content-Type: application/json

| property | description | type |
| -------- | ----------- | ---- |
| mode | 모드<br><ul><li>개발: dev</li><li>운영: prd</li><li>운영(소득공제): ptx</li></ul> | string |
| card_no | 카드번호 16자리 | string |
| card_expiry_date | 카드유효기간 연월(YYMM) 4자리 | string |
| card_tax_no | 카드인증번호<br><ul><li>개인 - 생년월일 6자리</li><li>법인 - 사업자번호 10자리</li></ul> | string |
| card_password | 카드비밀번호 앞 2자리 | string |

#### Response
- Content-Type: application/json  
- Status Code: **201 Created**

| property | description | type |
| -------- | ----------- | ---- |
| code | 결과 코드 | string |
| is_success | 결과 성공 여부 | boolean |
| message | 결과 메시지 | string |
| card_code | 카드 발급사 코드 | string |
| card_name | 카드 발급사 이름 | string |
| card_bank_code | 카드 발급사 은행 코드 | string |
| van_tx_id | VAN사 거래 번호 | string |
| card_bin_type_01 | | string |
| batch_key | 배치(빌링/인증)키 | string |
| join_code | | string |



### `POST /kcp/payments`  
결제 승인 요청
#### Body
- Content-Type: application/json

| property | description | type |
| -------- | ----------- | ---- |
| mode | 모드<br><ul><li>개발: dev</li><li>운영: prd</li><li>운영(소득공제): ptx</li></ul> | string |
| bill_key | 빌링(인증/배치)키 | string |
| order_no | 가맹점 주문 번호 | string |
| product_name | 결제 상품명 | string |
| product_amount | 결제 상품 금액 | number |
| buyer_name | 상품 구매자 이름 | string |
| buyer_email | 상품 구매자 이메일 주소 | string |

#### Response
- Content-Type: application/json
- Status Code: **200 OK**

| property | description | type |
| -------- | ----------- | ---- |
| code | 결과 코드 | string |
| is_success | 결과 성공 여부 | boolean |
| message | 결과 메시지 | string |
| en_message | 영문 결과 메시지 | string |
| trace_no | KCP 결제 고유 번호 | string |
| pay_method | 사용 결제 수단 | string |
| order_no | 가맹점 주문 번호 | string |
| card_code | 카드 발급사 코드 | string |
| card_name | 카드 이름 | string |
| acqu_code | 카드 매입사 코드 | string |
| acqu_name | 카드 매입사 이름 | string |
| card_no | 카드 번호 | string |
| mcht_tax_no | | string |
| mall_tax_no | 가맹점 인증 번호 | string |
| ca_order_id | | string |
| tno | KCP 거래 번호 | string |
| amount | 총 결제 금액 | number |
| card_amount | 카드 결제 금액 | number |
| coupon_amount | 쿠폰 결제 금액 | number |
| is_escrow | 에스크로 사용 여부 | boolean |
| van_code | VAN사 코드 | string |
| app_time | 결제 승인 시각(yyyyMMddHHmmss) | string |
| van_app_time | VAN사 결제 승인 시각(yyyyMMddHHmmss) | string |
| app_no | 정상 결제 거래의 승인 번호<br>KCP와 카드사에서 공통으로 관리하는 번호 | string |
| bizx_no | | string |
| quota | 할부 개월(0: 일시불, 0~12) | number |
| is_interest_free | 무이자 할부 결제 여부 | boolean |
| pg_tx_id | | string |
| tax_flag | 가맹점에서 제공한 복합 과세 타입 | string |
| tax_amount | 세액 | number |
| tax_free_amount | 비과세액 | number |
| vat_amount | 부가세액 | number |
| is_partial_cancel | 부분 취소 여부 | boolean |
| card_bin_type_01 | | string |
| card_bin_type_02 | | string |
| card_bin_bank_code | | string |
| join_code | | string |



### `DELETE /kcp/payments/{tno}`  
결제 취소 요청
#### Parameter
_ tno : KCP 거래번호

#### Body  
- Content-Type: application/json

| property | description | type |
| -------- | ----------- | ---- |
| mode | 모드<br><ul><li>개발: dev</li><li>운영: prd</li><li>운영(소득공제): ptx</li></ul> | string |
| reason | 결제 취소 사유 | string |

#### Response
- Content-Type: application/json  
- Status Code: **200 OK**

| property | description | type |
| -------- | ----------- | ---- |
| code | 결과 코드 | string |
| is_success | 결과 성공 여부 | boolean |
| message | 결과 메시지 | string |
| en_message | 영문 결과 메시지 | string |
| trace_no | 결제 고유 번호 | string |
| pay_method | 사용 결제 수단 | string |
| order_no | 가맹점 주문 번호 | string |
| card_code | 카드 발급사 코드 | string |
| card_name | 카드 이름 | string |
| acqu_code | 카드 매입사 코드 | string |
| acqu_name | 카드 매입사 이름 | string |
| card_no | 카드 번호 | string |
| mcht_tax_no | | string |
| mall_tax_no | 가맹점 인증 번호 | string |
| ca_order_id | | string |
| tno | KCP 거래번호 | string |
| amount | 총 결제 금액 | number |
| card_amount | 카드 결제 금액 | number |
| coupon_amount | 쿠폰 결제 금액 | number |
| is_escrow | 에스크로 사용 여부 | boolean |
| cancel_gubun | 매입취소/승인취소 구분값 | string |
| van_code | VAN사 코드 | string |
| app_time | 결제 승인 시각(yyyyMMddHHmmss) | string |
| van_app_time | VAN사 결제 승인 시각(yyyyMMddHHmmss) | string |
| cancel_time | 결제 취소 시각(yyyyMMddHHmmss) | string |
| app_no | 정상 결제 거래의 승인 번호<br>KCP와 카드사에서 공통으로 관리하는 번호 | string |
| bizx_no | | string |
| quota | 할부 개월(0: 일시불, 0~12) | number |
| is_interest_free | 무이자 할부 결제 여부 | boolean |
| pg_tx_id | | string |