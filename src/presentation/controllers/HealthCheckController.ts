
import { Response } from "express";
import { Get, JsonController, Res, ContentType } from "routing-controllers";

@JsonController("/health")
export class HealthCheckController {
    @Get("")
    @ContentType("text/html")
    index(@Res() res: Response) {
        //TODO check database connection
        //TODO check kcp connection
        return res.status(200).send("ok");
    }
}