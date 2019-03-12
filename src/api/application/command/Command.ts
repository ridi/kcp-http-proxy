import { CommandType } from "../command/CommandType";
import { Mode } from "../../common/config";

export abstract class Command {
    readonly mode: Mode;
    readonly type: CommandType;

    protected constructor(mode: Mode, type: CommandType) {
        this.mode = mode;
        this.type = type;
    }
};