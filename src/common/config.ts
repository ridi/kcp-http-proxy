import { Container } from 'typedi';

export class KcpConfig {
    constructor(site: KcpSite, taxDeductionSite: KcpSite) {
        this.validate([site, taxDeductionSite]);

        this.sites = new Map<string, KcpSite>([
            [KcpSiteMode.Normal, site],
            [KcpSiteMode.TaxDeduction, taxDeductionSite],
        ]);
    }
    
    private sites: Map<string, KcpSite>;

    public readonly code = {
        request: {
            // 배치키(인증키) 발급 요청 코드
            batchKey: {
                txCode: '00300001',// TRANSACTION_CODE_AUTH
                cardTxType: '12100000',// CARD_TRANSACTION_TYPE_AUTH
                signTxType: '0001',// SIGN_TRANSACTION_TYPE_AUTH
            },
            // 결제 승인 요청 코드
            txApproval: {
                txCode: '00100000',// TRANSACTION_CODE_ORDER
                cardTxType: '11511000',// CARD_TRANSACTION_TYPE_BATCH_ORDER
            },
            // 결제 취소 요청 코드
            txCancellation: {
                txCode: '00200000',
                modType: {
                    full: 'STSC',// 승인 금액 전체 취소 MOD_TYPE_CANCEL_ORDER_FULL
                    partial: 'STPC',// 승인 금액 부분 취소 MOD_TYPE_CANCEL_ORDER_PART
                },
            },
        },
        currency: {// 승인금액통화
            KRW: '410',
        },
        escrowUse: {// 에스크로 사용 여부
            No: 'N',
        },
    };
    public readonly log = {
        level: 3,
        path: '/dev/stdout',
    };
    public readonly options = {
        encoding: {
            EUC_KR: 0,
            UTF_8: 1,
        },
    };
    
    public readonly modulePath: string = `${Container.get('app.root')}/../resources/pp_cli`; 
    public readonly gwPort: string = '8090';// KCP 결제 서버 포트
    
    private validate(sites: KcpSite[]): void {
        for (const site of sites) {
            if (!site.code || !site.key || !site.groupId) {
                console.error('KcpSite', site);
                throw new Error('Invalid KCP Site Configuration');
            }
        }
    }

    public site(isTaxDeductible: boolean = false): KcpSite {
        if (isTaxDeductible) {
            return this.sites.get(KcpSiteMode.TaxDeduction);
        }
        return this.sites.get(KcpSiteMode.Normal);
    }
};

enum KcpSiteMode {
    Normal = 'n',
    TaxDeduction = 't',
}

export interface KcpSite {
    code: string;// 상점 코드
    key: string;// 상점 키
    groupId: string;// 상점 그룹 ID
    gwUrl?: string;// KCP 결제 서버 주소
}