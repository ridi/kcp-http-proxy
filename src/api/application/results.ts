export class AuthKeyRequestResult {
    isSuccess: boolean;
    code: string;
    message: string;
    billKey: string;
    cardIssuerCode: string;
}

export class PaymentApprovalResult {
    isSuccess: boolean;
    code: string;
    message: string;
    transactionId?: string;
    amount?: number;
    approvedAt?: Date;
}

export class PaymentCancellationResult {
    isSuccess: boolean;
    code: string;
    message: string;
    amount?: number;
    canceledAt?: Date;
}