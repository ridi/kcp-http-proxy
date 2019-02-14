
import { Response } from "express";
import { Get, JsonController, Res } from "routing-controllers";

@JsonController("/health")
export class HealthCheckController {

    @Get("/")
    index(@Res() res: Response) {
        return res.status(200).send({ message: "ok" });
    }
}