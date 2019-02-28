import { Container } from "typedi";

export enum Mode {
    DEV = 'dev',
    PROD = 'prd',
    PROD_TAX = 'ptx'//production - tax deduction
};

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
            KRW: "410"
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

    constructor(siteCode: string, siteKey: string, groupId: string) {
        if (!siteCode || !siteKey || !groupId) {
            throw new Error("siteCode, siteKey and groupId cannot be null or empty");
        }
        this.siteCode = siteCode;
        this.siteKey = siteKey;
        this.groupId = groupId;
        this.gwUrl = this.constructor.name.startsWith('Test') ? 'testpaygw.kcp.co.kr': 'paygw.kcp.co.kr';
    }
};

export class TestConfig extends Config {
    constructor() {
        super('BA001', '2T5.LgLrH--wbufUOvCqSNT__', 'BA0011000348');
    }
}