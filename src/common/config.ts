import { Container } from 'typedi';

export class Config {
    readonly code = {
        request: {
            //배치키(인증키) 발급 요청 코드
            batchKey: {
                txCode: '00300001',//TRANSACTION_CODE_AUTH
                cardTxType: '12100000',//CARD_TRANSACTION_TYPE_AUTH
                signTxType: '0001'//SIGN_TRANSACTION_TYPE_AUTH
            },
            //결제 승인 요청 코드
            txApproval: {
                txCode: '00100000',//TRANSACTION_CODE_ORDER
                cardTxType: '11511000'//CARD_TRANSACTION_TYPE_BATCH_ORDER
            },
            //결제 취소 요청 코드
            txCancellation: {
                txCode: '00200000',
                modType: {
                    full: 'STSC',//승인 금액 전체 취소 MOD_TYPE_CANCEL_ORDER_FULL
                    partial: 'STPC'//승인 금액 부분 취소 MOD_TYPE_CANCEL_ORDER_PART
                }
            },
        },
        currency: {//승인금액통화
            KRW: '410'
        },
        escrowUse: {//에스크로 사용 여부
            No: 'N'
        }
    };
    readonly log = {
        level: 3,
        path: '/dev/stdout'
    };
    readonly options = {
        encoding: {
            EUC_KR: 0,
            UTF_8: 1
        }
    };
    
    readonly modulePath: string = `${Container.get('app.root')}/resources/pp_cli`; 
    readonly gwPort: string = '8090';// KCP 결제 서버 포트
    readonly gwUrl: string;//KCP 결제 서버 주소
    readonly siteCode: string;//상점 코드
    readonly siteKey: string;//상점 키
    readonly groupId: string;//상점 그룹 ID
    readonly isTaxDeductible: boolean;// 문화비 소득 공제 여부

    constructor(siteCode: string, siteKey: string, groupId: string, isTaxDeductible: boolean = false) {
        if (!siteCode || !siteKey || !groupId) {
            throw new Error('siteCode, siteKey and groupId cannot be null or empty');
        }
        this.siteCode = siteCode;
        this.siteKey = siteKey;
        this.groupId = groupId;
        this.gwUrl = this.siteCode === 'BA001' ? 'testpaygw.kcp.co.kr': 'paygw.kcp.co.kr';
        this.isTaxDeductible = isTaxDeductible;
    }
};

export const KCP_CONFIGURATIONS = {
    dev: {//for test
        normal: null,
        tax: null,
    },
    prod: {
        normal: null,
        tax: null
    }
};