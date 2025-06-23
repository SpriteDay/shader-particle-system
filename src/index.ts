import Group, { GroupOptions } from "./group/index";
import Emitter, { EmitterOptions } from "./emitter/index";
import utils from "./utils/index";
import * as Constants from "./constants/index";
import { distributions } from "./constants/index";

const SPE = {
    Group,
    Emitter,
    utils,
    Constants,
    distributions
};

export default SPE;
export {
    SPE,
    Group,
    Emitter,
    utils,
    Constants,
    distributions
};
export type {
    GroupOptions,
    EmitterOptions
}