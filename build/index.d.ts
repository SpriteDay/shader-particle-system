import Group, { GroupOptions } from "./group/index";
import Emitter, { EmitterOptions } from "./emitter/index";
import utils from "./utils/index";
import * as Constants from "./constants/index";
import { distributions } from "./constants/index";
declare const SPE: {
    Group: typeof Group;
    Emitter: typeof Emitter;
    utils: {
        types: {
            readonly Boolean: "boolean";
            readonly STRING: "string";
            readonly NUMBER: "number";
            readonly OBJECT: "object";
        };
        ensureTypedArg<T>(arg: unknown, type: "string" | "number" | "boolean" | "object", defaultValue: T): T;
        ensureArrayTypedArg<T>(arg: unknown, type: "string" | "number" | "boolean" | "object", defaultValue: T): T;
        ensureInstanceOf<T, U>(arg: unknown, instance: (new (...args: any[]) => T) | undefined, defaultValue: U): T | U;
        ensureArrayInstanceOf<T, U>(arg: unknown, instance: (new (...args: any[]) => T) | undefined, defaultValue: U): T[] | U;
        ensureValueOverLifetimeCompliance(property: import("./utils/index").ValueOverLifetime<unknown>, minLength?: number, maxLength?: number): void;
        interpolateArray<T extends number | import("./utils/index").Clonable>(srcArray: T[], newLength: number): T[];
        clamp(value: number, min: number, max: number): number;
        zeroToEpsilon(value: number, randomise?: boolean): number;
        lerpTypeAgnostic(start: number | import("three").Vector2 | import("three").Vector3 | import("three").Vector4 | import("three").Color, end: number | import("three").Vector2 | import("three").Vector3 | import("three").Vector4 | import("three").Color, delta: number): number | import("three").Vector2 | import("three").Vector3 | import("three").Vector4 | import("three").Color | undefined;
        lerp(start: number, end: number, delta: number): number;
        roundToNearestMultiple(n: number, multiple: number): number;
        arrayValuesAreEqual(array: any[]): boolean;
        randomFloat(base: number, spread: number): number;
        randomVector3(attribute: import("./utils/index").ShaderAttribute, index: number, base: import("three").Vector3, spread: import("three").Vector3, spreadClamp?: import("three").Vector3): void;
        randomColor(attribute: import("./utils/index").ShaderAttribute, index: number, base: import("three").Color, spread: import("three").Vector3): void;
        randomColorAsHex: (this: {
            clamp: (value: number, min: number, max: number) => number;
        }, attribute: import("./utils/index").ShaderAttribute, index: number, base: import("three").Color[], spread: import("three").Vector3[]) => void;
        randomVector3OnLine(attribute: import("./utils/index").ShaderAttribute, index: number, start: import("three").Vector3, end: import("three").Vector3): void;
        randomVector3OnSphere(attribute: import("./utils/index").ShaderAttribute, index: number, base: import("three").Vector3, radius: number, radiusSpread: number, radiusScale: import("three").Vector3, radiusSpreadClamp: number): void;
        seededRandom(seed: number): number;
        randomVector3OnDisc(attribute: import("./utils/index").ShaderAttribute, index: number, base: import("three").Vector3, radius: number, radiusSpread: number, radiusScale: import("three").Vector3, radiusSpreadClamp: number): void;
        randomDirectionVector3OnSphere: (this: {
            randomFloat: (base: number, spread: number) => number;
        }, attribute: import("./utils/index").ShaderAttribute, index: number, posX: number, posY: number, posZ: number, emitterPosition: import("three").Vector3, speed: number, speedSpread: number) => void;
        randomDirectionVector3OnDisc: (this: {
            randomFloat: (base: number, spread: number) => number;
        }, attribute: import("./utils/index").ShaderAttribute, index: number, posX: number, posY: number, posZ: number, emitterPosition: import("three").Vector3, speed: number, speedSpread: number) => void;
        getPackedRotationAxis: (axis: import("three").Vector3, axisSpread: import("three").Vector3) => number;
    };
    Constants: typeof Constants;
    distributions: {
        BOX: number;
        SPHERE: number;
        DISC: number;
        LINE: number;
    };
};
export default SPE;
export { SPE, Group, Emitter, utils, Constants, distributions };
export type { GroupOptions, EmitterOptions };
