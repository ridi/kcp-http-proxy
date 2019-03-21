import { InvalidRequestError } from '@root/errors/InvalidRequestError';
import { AbstractKcpRequest } from '@root/presentation/requests/AbstractKcpRequest';
import { validate } from 'class-validator';
import { Service } from 'typedi';

@Service()
export class KcpRequestValidator {
    validate(request: AbstractKcpRequest): Promise<string> {
        if (!request.config)   {
           return Promise.reject(new Error('Server has a problem==================='));
        } else {
            if (!request.config.gwUrl.startsWith('test')) {
                return Promise.reject(new Error('Server has a problem........................'));
            }
        }
        
        return validate(request)
            .then(errors => {
                if (errors.length > 0) {
                    let resolvedErrors: object = {};

                    for (const error of errors) {
                        resolvedErrors[error.property] = Object.entries(error.constraints).map(([_, val]) => val).join('/n');
                    }

                    return Promise.reject(new InvalidRequestError(resolvedErrors));
                }
                return Promise.resolve('pass');
            });
    }
}