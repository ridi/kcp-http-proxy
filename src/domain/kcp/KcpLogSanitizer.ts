export class KcpLogSanitizer {
    public static sanitize(log: string) {
        return log.replace(/card_no=(\d{6})\d+\u001f/, 'card_no=$1\*\u001f')
            .replace(/batch_key=.+\u001f/, 'batch_key=\*\u001f');
    }
}
