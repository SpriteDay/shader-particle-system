import Group, { GroupOptions } from "./group/index";
import Emitter, { EmitterOptions } from "./emitter/index";
import utils from "./utils/index";
import * as Constants from "./constants/index";

const SPE = {
    Group,
    Emitter,
    utils,
    Constants
};

export default SPE;
export {
    SPE,
    Group,
    Emitter,
    utils,
    Constants
};
export type {
    GroupOptions,
    EmitterOptions
}