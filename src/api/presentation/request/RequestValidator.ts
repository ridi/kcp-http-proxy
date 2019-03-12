import { validate } from "class-validator";
import { Service } from "typedi";
import { InvalidRequestException } from "./InvalidRequestException";
import { KcpRequest } from "./KcpRequest";

@Service()
export class RequestValidator {
    validate(request: KcpRequest): Promise<string> {
        return validate(request)
            .then(errors => {
                if (errors.length > 0) {
                    let resolvedErrors: object = {};

                    for (const error of errors) {
                        resolvedErrors[error.property] = Object.entries(error.constraints).map(([_, val]) => val).join("/n");
                    }

                    return Promise.reject(new InvalidRequestException(resolvedErrors));
                }
                return Promise.resolve('pass');
            });
    }
}