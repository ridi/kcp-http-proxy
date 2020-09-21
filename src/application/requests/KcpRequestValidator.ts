import { AbstractKcpRequest } from '@root/application/requests/AbstractKcpRequest';
import { InvalidRequestError } from '@root/errors/InvalidRequestError';
import { validate } from 'class-validator';
import { Service } from 'typedi';

@Service()
export class KcpRequestValidator {
  public validate(request: AbstractKcpRequest): Promise<string> {
    return validate(request)
      .then((errors) => {
        if (errors.length > 0) {
          const resolvedErrors: object = {};

          for (const error of errors) {
            resolvedErrors[error.property] = Object.entries(error.constraints)
              .map(([_, val]) => val)
              .join('/n');
          }

          return Promise.reject(new InvalidRequestError(JSON.stringify(resolvedErrors)));
        }
        return Promise.resolve('pass');
      });
  }
}
