import { InvalidRequestError } from "@root/errors/InvalidRequestError";
import { validate } from "class-validator";
import { Service } from "typedi";
import { AbstractKcpRequest } from "./AbstractKcpRequest";

@Service()
export class KcpRequestValidator {
    validate(request: AbstractKcpRequest): Promise<string> {
        return validate(request)
            .then(errors => {
                if (errors.length > 0) {
                    let resolvedErrors: object = {};

                    for (const error of errors) {
                        resolvedErrors[error.property] = Object.entries(error.constraints).map(([_, val]) => val).join("/n");
                    }

                    return Promise.reject(new InvalidRequestError(resolvedErrors));
                }
                return Promise.resolve("pass");
            });
    }
}