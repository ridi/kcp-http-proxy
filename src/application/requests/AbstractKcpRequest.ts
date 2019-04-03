import { IsBoolean, IsOptional } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';

export abstract class AbstractKcpRequest {
    @JSONSchema({ description: '소득공제여부' })
    @IsBoolean()
    @IsOptional()
    public is_tax_deductible?: boolean = false;
}
