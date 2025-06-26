import * as THREE from 'three';
/**
 * A clonable object must have a clone method.
 * Many THREE.js objects are clonable.
 */
export interface Clonable {
    clone(): this;
}
/**
 * A shim interface for a typed array helper used within this utility.
 * It is expected to have methods for setting vector components.
 */
export interface TypedArrayHelper {
    setVec3Components(index: number, x: number, y: number, z: number): void;
    setVec4Components(index: number, x: number, y: number, z: number, w: number): void;
}
/**
 * Represents a shader attribute, which has a typed array associated with it.
 */
export interface ShaderAttribute {
    typedArray: TypedArrayHelper;
}
/**
 * Represents a property that can change over the lifetime of a particle.
 * It has a value and a spread, which can be single values or arrays of values.
 */
export interface ValueOverLifetime<T> {
    _value: T | T[];
    _spread: T | T[];
}
type TypeName = 'string' | 'number' | 'boolean' | 'object';
declare const _default: {
    /**
     * A map of types used by `utils.ensureTypedArg` and
     * `utils.ensureArrayTypedArg` to compare types against.
     *
     * @enum {String}
     */
    types: {
        readonly Boolean: "boolean";
        readonly STRING: "string";
        readonly NUMBER: "number";
        readonly OBJECT: "object";
    };
    /**
     * ensure the given argument adheres to the type requesting,
     * @param  {(boolean|string|number|object)} arg          The value to perform a type-check on.
     * @param  {String} type         The type the `arg` argument should adhere to.
     * @param  {(boolean|string|number|object)} defaultValue A default value to fallback on if the type check fails.
     * @return {(boolean|string|number|object)}              The given value if type check passes, or the default value if it fails.
     */
    ensureTypedArg<T>(arg: unknown, type: TypeName, defaultValue: T): T;
    /**
     * ensure the given array's contents ALL adhere to the provided type,
     * @param  {Array|boolean|string|number|object} arg          The array of values to check type of.
     * @param  {String} type         The type that should be adhered to.
     * @param  {(boolean|string|number|object)} defaultValue A default fallback value.
     * @return {(boolean|string|number|object)}              The given value if type check passes, or the default value if it fails.
     */
    ensureArrayTypedArg<T>(arg: unknown, type: TypeName, defaultValue: T): T;
    /**
     * Ensures the given value is an instance of a constructor function.
     *
     * @param  {Object} arg          The value to check instance of.
     * @param  {Function} instance     The constructor of the instance to check against.
     * @param  {Object} defaultValue A default fallback value if instance check fails
     * @return {Object}              The given value if type check passes, or the default value if it fails.
     */
    ensureInstanceOf<T, U>(arg: unknown, instance: (new (...args: any[]) => T) | undefined, defaultValue: U): T | U;
    /**
     * Given an array of values, ensure the instances of all items in the array
     * matches the given instance constructor falling back to a default value if
     * the check fails.
     *
     * If given value isn't an Array, delegates to `utils.ensureInstanceOf`.
     *
     * @param  {Array|Object} arg          The value to perform the instanceof check on.
     * @param  {Function} instance     The constructor of the instance to check against.
     * @param  {Object} defaultValue A default fallback value if instance check fails
     * @return {Object}              The given value if type check passes, or the default value if it fails.
     */
    ensureArrayInstanceOf<T, U>(arg: unknown, instance: (new (...args: any[]) => T) | undefined, defaultValue: U): T[] | U;
    /**
     * Ensures that any "value-over-lifetime" properties of an emitter are
     * of the correct length (as dictated by `Constans.valueOverLifetimeLength`).
     *
     * Delegates to `utils.interpolateArray` for array resizing.
     *
     * If properties aren't arrays, then property values are put into one.
     *
     * @param  {Object} property  The property of an Emitter instance to check compliance of.
     * @param  {Number} minLength The minimum length of the array to create.
     * @param  {Number} maxLength The maximum length of the array to create.
     */
    ensureValueOverLifetimeCompliance(property: ValueOverLifetime<unknown>, minLength?: number, maxLength?: number): void;
    /**
     * Performs linear interpolation (lerp) on an array.
     *
     * For example, lerping [1, 10], with a `newLength` of 10 will produce [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].
     *
     * Delegates to `utils.lerpTypeAgnostic` to perform the actual
     * interpolation.
     *
     * @param  {Array} srcArray  The array to lerp.
     * @param  {Number} newLength The length the array should be interpolated to.
     * @return {Array}           The interpolated array.
     */
    interpolateArray<T extends number | Clonable>(srcArray: T[], newLength: number): T[];
    /**
     * Clamp a number to between the given min and max values.
     * @param  {Number} value The number to clamp.
     * @param  {Number} min   The minimum value.
     * @param  {Number} max   The maximum value.
     * @return {Number}       The clamped number.
     */
    clamp(value: number, min: number, max: number): number;
    /**
     * If the given value is less than the epsilon value, then return
     * a randomised epsilon value if specified, or just the epsilon value if not.
     * Works for negative numbers as well as positive.
     *
     * @param  {Number} value     The value to perform the operation on.
     * @param  {Boolean} randomise Whether the value should be randomised.
     * @return {Number}           The result of the operation.
     */
    zeroToEpsilon(value: number, randomise?: boolean): number;
    /**
     * Linearly interpolates two values of letious types. The given values
     * must be of the same type for the interpolation to work.
     * @param  {(number|Object)} start The start value of the lerp.
     * @param  {(number|object)} end   The end value of the lerp.
     * @param  {Number} delta The delta posiiton of the lerp operation. Ideally between 0 and 1 (inclusive).
     * @return {(number|object|undefined)}       The result of the operation. Result will be undefined if
     *                                               the start and end arguments aren't a supported type, or
     *                                               if their types do not match.
     */
    lerpTypeAgnostic(start: number | THREE.Vector2 | THREE.Vector3 | THREE.Vector4 | THREE.Color, end: number | THREE.Vector2 | THREE.Vector3 | THREE.Vector4 | THREE.Color, delta: number): number | THREE.Vector2 | THREE.Vector3 | THREE.Vector4 | THREE.Color | undefined;
    /**
     * Perform a linear interpolation operation on two numbers.
     * @param  {Number} start The start value.
     * @param  {Number} end   The end value.
     * @param  {Number} delta The position to interpolate to.
     * @return {Number}       The result of the lerp operation.
     */
    lerp(start: number, end: number, delta: number): number;
    /**
     * Rounds a number to a nearest multiple.
     *
     * @param  {Number} n        The number to round.
     * @param  {Number} multiple The multiple to round to.
     * @return {Number}          The result of the round operation.
     */
    roundToNearestMultiple(n: number, multiple: number): number;
    /**
     * Check if all items in an array are equal. Uses strict equality.
     *
     * @param  {Array} array The array of values to check equality of.
     * @return {Boolean}       Whether the array's values are all equal or not.
     */
    arrayValuesAreEqual(array: any[]): boolean;
    /**
     * Given a start value and a spread value, create and return a random
     * number.
     * @param  {Number} base   The start value.
     * @param  {Number} spread The size of the random letiance to apply.
     * @return {Number}        A randomised number.
     */
    randomFloat(base: number, spread: number): number;
    /**
     * Given an ShaderAttribute instance, and letious other settings,
     * assign values to the attribute's array in a `vec3` format.
     *
     * @param  {Object} attribute   The instance of ShaderAttribute to save the result to.
     * @param  {Number} index       The offset in the attribute's TypedArray to save the result from.
     * @param  {Object} base        THREE.Vector3 instance describing the start value.
     * @param  {Object} spread      THREE.Vector3 instance describing the random letiance to apply to the start value.
     * @param  {Object} spreadClamp THREE.Vector3 instance describing the multiples to clamp the randomness to.
     */
    randomVector3(attribute: ShaderAttribute, index: number, base: THREE.Vector3, spread: THREE.Vector3, spreadClamp?: THREE.Vector3): void;
    /**
     * Given an Shader attribute instance, and letious other settings,
     * assign Color values to the attribute.
     * @param  {Object} attribute The instance of ShaderAttribute to save the result to.
     * @param  {Number} index     The offset in the attribute's TypedArray to save the result from.
     * @param  {Object} base      THREE.Color instance describing the start color.
     * @param  {Object} spread    THREE.Vector3 instance describing the random letiance to apply to the start color.
     */
    randomColor(attribute: ShaderAttribute, index: number, base: THREE.Color, spread: THREE.Vector3): void;
    randomColorAsHex: (this: {
        clamp: (value: number, min: number, max: number) => number;
    }, attribute: ShaderAttribute, index: number, base: THREE.Color[], spread: THREE.Vector3[]) => void;
    /**
     * Given an ShaderAttribute instance, and letious other settings,
     * assign values to the attribute's array in a `vec3` format.
     *
     * @param  {Object} attribute   The instance of ShaderAttribute to save the result to.
     * @param  {Number} index       The offset in the attribute's TypedArray to save the result from.
     * @param  {Object} start       THREE.Vector3 instance describing the start line position.
     * @param  {Object} end         THREE.Vector3 instance describing the end line position.
     */
    randomVector3OnLine(attribute: ShaderAttribute, index: number, start: THREE.Vector3, end: THREE.Vector3): void;
    /**
     * Given an Shader attribute instance, and letious other settings,
     * assign Color values to the attribute.
     * @param  {Object} attribute The instance of ShaderAttribute to save the result to.
     * @param  {Number} index     The offset in the attribute's TypedArray to save the result from.
     * @param  {Object} base      THREE.Color instance describing the start color.
     * @param  {Object} spread    THREE.Vector3 instance describing the random letiance to apply to the start color.
     */
    /**
     * Assigns a random vector 3 value to an ShaderAttribute instance, projecting the
     * given values onto a sphere.
     *
     * @param  {Object} attribute The instance of ShaderAttribute to save the result to.
     * @param  {Number} index     The offset in the attribute's TypedArray to save the result from.
     * @param  {Object} base              THREE.Vector3 instance describing the origin of the transform.
     * @param  {Number} radius            The radius of the sphere to project onto.
     * @param  {Number} radiusSpread      The amount of randomness to apply to the projection result
     * @param  {Object} radiusScale       THREE.Vector3 instance describing the scale of each axis of the sphere.
     * @param  {Number} radiusSpreadClamp What numeric multiple the projected value should be clamped to.
     */
    randomVector3OnSphere(attribute: ShaderAttribute, index: number, base: THREE.Vector3, radius: number, radiusSpread: number, radiusScale: THREE.Vector3, radiusSpreadClamp: number): void;
    seededRandom(seed: number): number;
    /**
     * Assigns a random vector 3 value to an ShaderAttribute instance, projecting the
     * given values onto a 2d-disc.
     *
     * @param  {Object} attribute The instance of ShaderAttribute to save the result to.
     * @param  {Number} index     The offset in the attribute's TypedArray to save the result from.
     * @param  {Object} base              THREE.Vector3 instance describing the origin of the transform.
     * @param  {Number} radius            The radius of the sphere to project onto.
     * @param  {Number} radiusSpread      The amount of randomness to apply to the projection result
     * @param  {Object} radiusScale       THREE.Vector3 instance describing the scale of each axis of the disc. The z-component is ignored.
     * @param  {Number} radiusSpreadClamp What numeric multiple the projected value should be clamped to.
     */
    randomVector3OnDisc(attribute: ShaderAttribute, index: number, base: THREE.Vector3, radius: number, radiusSpread: number, radiusScale: THREE.Vector3, radiusSpreadClamp: number): void;
    randomDirectionVector3OnSphere: (this: {
        randomFloat: (base: number, spread: number) => number;
    }, attribute: ShaderAttribute, index: number, posX: number, posY: number, posZ: number, emitterPosition: THREE.Vector3, speed: number, speedSpread: number) => void;
    randomDirectionVector3OnDisc: (this: {
        randomFloat: (base: number, spread: number) => number;
    }, attribute: ShaderAttribute, index: number, posX: number, posY: number, posZ: number, emitterPosition: THREE.Vector3, speed: number, speedSpread: number) => void;
    getPackedRotationAxis: (axis: THREE.Vector3, axisSpread: THREE.Vector3) => number;
};
export default _default;
