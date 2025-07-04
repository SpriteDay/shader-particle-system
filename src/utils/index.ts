import * as THREE from 'three';

// --- TYPE DEFINITIONS ---

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

export default {
    /**
     * A map of types used by `utils.ensureTypedArg` and
     * `utils.ensureArrayTypedArg` to compare types against.
     *
     * @enum {String}
     */
    types: {
        Boolean: 'boolean',
        STRING: 'string',
        NUMBER: 'number',
        OBJECT: 'object'
    } as const,

    /**
     * ensure the given argument adheres to the type requesting,
     * @param  {(boolean|string|number|object)} arg          The value to perform a type-check on.
     * @param  {String} type         The type the `arg` argument should adhere to.
     * @param  {(boolean|string|number|object)} defaultValue A default value to fallback on if the type check fails.
     * @return {(boolean|string|number|object)}              The given value if type check passes, or the default value if it fails.
     */
    ensureTypedArg<T>(arg: unknown, type: TypeName, defaultValue: T): T {
        if (typeof arg === type) {
            return arg as T;
        }
        else {
            return defaultValue;
        }
    },

    /**
     * ensure the given array's contents ALL adhere to the provided type,
     * @param  {Array|boolean|string|number|object} arg          The array of values to check type of.
     * @param  {String} type         The type that should be adhered to.
     * @param  {(boolean|string|number|object)} defaultValue A default fallback value.
     * @return {(boolean|string|number|object)}              The given value if type check passes, or the default value if it fails.
     */
    ensureArrayTypedArg<T>(arg: unknown, type: TypeName, defaultValue: T): T {
        if (Array.isArray(arg)) {
            for (let i = arg.length - 1; i >= 0; --i) {
                if (typeof arg[i] !== type) {
                    return defaultValue;
                }
            }
            return arg as T;
        }

        return this.ensureTypedArg(arg, type, defaultValue);
    },

    /**
     * Ensures the given value is an instance of a constructor function.
     *
     * @param  {Object} arg          The value to check instance of.
     * @param  {Function} instance     The constructor of the instance to check against.
     * @param  {Object} defaultValue A default fallback value if instance check fails
     * @return {Object}              The given value if type check passes, or the default value if it fails.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ensureInstanceOf<T, U>(arg: unknown, instance: (new (...args: any[]) => T) | undefined, defaultValue: U): T | U {
        if (instance && arg instanceof instance) {
            return arg;
        }
        else if (arg !== undefined && !instance) {
            return arg as T | U;
        }
        else {
            return defaultValue;
        }
    },

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ensureArrayInstanceOf<T, U>(arg: unknown, instance: (new (...args: any[]) => T) | undefined, defaultValue: U): T[] | U {
        if (Array.isArray(arg)) {
            if (instance) {
                for (let i = arg.length - 1; i >= 0; --i) {
                    if (arg[i] instanceof instance === false) {
                        return defaultValue;
                    }
                }
            }
            return arg as T[];
        }

        return this.ensureInstanceOf(arg, instance, defaultValue) as U;
    },

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
    ensureValueOverLifetimeCompliance(
        property: ValueOverLifetime<unknown>,
        minLength = 3,
        maxLength = 3
    ) {
        minLength = minLength || 3;
        maxLength = maxLength || 3;

        // First, ensure both properties are arrays.
        if (Array.isArray(property._value) === false) {
            property._value = [property._value];
        }

        if (Array.isArray(property._spread) === false) {
            property._spread = [property._spread];
        }

        const valueLength = this.clamp((property._value as number[]).length, minLength, maxLength);
        const spreadLength = this.clamp((property._spread as number[]).length, minLength, maxLength);
        const desiredLength = Math.max(valueLength, spreadLength);

        if ((property._value as number[]).length !== desiredLength) {
            property._value = this.interpolateArray(property._value as (number | Clonable)[], desiredLength);
        }

        if ((property._spread as number[]).length !== desiredLength) {
            property._spread = this.interpolateArray(property._spread as (number | Clonable)[], desiredLength);
        }
    },

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
    interpolateArray<T extends number | Clonable>(srcArray: T[], newLength: number): T[] {
        const sourceLength = srcArray.length;
        const newArray = [(typeof srcArray[0] === 'object' ? srcArray[0].clone() : srcArray[0]) as T];
        const factor = (sourceLength - 1) / (newLength - 1);

        for (let i = 1; i < newLength - 1; ++i) {
            const f = i * factor;
            const before = Math.floor(f);
            const after = Math.ceil(f);
            const delta = f - before;

            newArray[i] = this.lerpTypeAgnostic(srcArray[before] as unknown as THREE.Vector3, srcArray[after] as unknown as number | THREE.Vector2 | THREE.Vector3 | THREE.Vector4 | THREE.Color, delta) as T;
        }

        newArray.push(
            (typeof srcArray[sourceLength - 1] === 'object' && (srcArray[sourceLength - 1] as Clonable).clone
                ? (srcArray[sourceLength - 1] as Clonable).clone()
                : srcArray[sourceLength - 1]) as T
        );

        return newArray;
    },

    /**
     * Clamp a number to between the given min and max values.
     * @param  {Number} value The number to clamp.
     * @param  {Number} min   The minimum value.
     * @param  {Number} max   The maximum value.
     * @return {Number}       The clamped number.
     */
    clamp(value: number, min: number, max: number): number {
        return Math.max(min, Math.min(value, max));
    },

    /**
     * If the given value is less than the epsilon value, then return
     * a randomised epsilon value if specified, or just the epsilon value if not.
     * Works for negative numbers as well as positive.
     *
     * @param  {Number} value     The value to perform the operation on.
     * @param  {Boolean} randomise Whether the value should be randomised.
     * @return {Number}           The result of the operation.
     */
    zeroToEpsilon(value: number, randomise?: boolean): number {
        const epsilon = 0.00001;
        let result = value;

        result = randomise ? Math.random() * epsilon * 10 : epsilon;

        if (value < 0 && value > -epsilon) {
            result = -result;
        }

        return result;
    },

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
    lerpTypeAgnostic(
        start: number | THREE.Vector2 | THREE.Vector3 | THREE.Vector4 | THREE.Color,
        end: number | THREE.Vector2 | THREE.Vector3 | THREE.Vector4 | THREE.Color,
        delta: number
    ) {
        const types = this.types;
        let out;

        if (typeof start === types.NUMBER && typeof end === types.NUMBER) {
            return (start as number) + ((end as number - (start as number)) * delta);
        }
        else if (start instanceof THREE.Vector2 && end instanceof THREE.Vector2) {
            out = start.clone();
            out.x = this.lerp(start.x, end.x, delta);
            out.y = this.lerp(start.y, end.y, delta);
            return out;
        }
        else if (start instanceof THREE.Vector3 && end instanceof THREE.Vector3) {
            out = start.clone();
            out.x = this.lerp(start.x, end.x, delta);
            out.y = this.lerp(start.y, end.y, delta);
            out.z = this.lerp(start.z, end.z, delta);
            return out;
        }
        else if (start instanceof THREE.Vector4 && end instanceof THREE.Vector4) {
            out = start.clone();
            out.x = this.lerp(start.x, end.x, delta);
            out.y = this.lerp(start.y, end.y, delta);
            out.z = this.lerp(start.z, end.z, delta);
            out.w = this.lerp(start.w, end.w, delta);
            return out;
        }
        else if (start instanceof THREE.Color && end instanceof THREE.Color) {
            out = start.clone();
            out.r = this.lerp(start.r, end.r, delta);
            out.g = this.lerp(start.g, end.g, delta);
            out.b = this.lerp(start.b, end.b, delta);
            return out;
        }
        else {
            console.warn('Invalid argument types, or argument types do not match:', start, end);
        }
    },

    /**
     * Perform a linear interpolation operation on two numbers.
     * @param  {Number} start The start value.
     * @param  {Number} end   The end value.
     * @param  {Number} delta The position to interpolate to.
     * @return {Number}       The result of the lerp operation.
     */
    lerp(start: number, end: number, delta: number): number {
        return start + ((end - start) * delta);
    },

    /**
     * Rounds a number to a nearest multiple.
     *
     * @param  {Number} n        The number to round.
     * @param  {Number} multiple The multiple to round to.
     * @return {Number}          The result of the round operation.
     */
    roundToNearestMultiple(n: number, multiple: number): number {
        let remainder = 0;

        if (multiple === 0) {
            return n;
        }

        remainder = Math.abs(n) % multiple;

        if (remainder === 0) {
            return n;
        }

        if (n < 0) {
            return -(Math.abs(n) - remainder);
        }

        return n + multiple - remainder;
    },

    /**
     * Check if all items in an array are equal. Uses strict equality.
     *
     * @param  {Array} array The array of values to check equality of.
     * @return {Boolean}       Whether the array's values are all equal or not.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    arrayValuesAreEqual(array: any[]): boolean {
        for (let i = 0; i < array.length - 1; ++i) {
            if (array[i] !== array[i + 1]) {
                return false;
            }
        }

        return true;
    },

    // colorsAreEqual: function() {
    //     let colors = Array.prototype.slice.call( arguments ),
    //         numColors = colors.length;

    //     for ( let i = 0, color1, color2; i < numColors - 1; ++i ) {
    //         color1 = colors[ i ];
    //         color2 = colors[ i + 1 ];

    //         if (
    //             color1.r !== color2.r ||
    //             color1.g !== color2.g ||
    //             color1.b !== color2.b
    //         ) {
    //             return false
    //         }
    //     }

    //     return true;
    // },

    /**
     * Given a start value and a spread value, create and return a random
     * number.
     * @param  {Number} base   The start value.
     * @param  {Number} spread The size of the random letiance to apply.
     * @return {Number}        A randomised number.
     */
    randomFloat(base: number, spread: number): number {
        return base + spread * (Math.random() - 0.5);
    },

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
    randomVector3(attribute: ShaderAttribute, index: number, base: THREE.Vector3, spread: THREE.Vector3, spreadClamp?: THREE.Vector3): void {
        let x = base.x + (Math.random() * spread.x - (spread.x * 0.5)),
            y = base.y + (Math.random() * spread.y - (spread.y * 0.5)),
            z = base.z + (Math.random() * spread.z - (spread.z * 0.5));

        // let x = this.randomFloat( base.x, spread.x ),
        // y = this.randomFloat( base.y, spread.y ),
        // z = this.randomFloat( base.z, spread.z );

        if (spreadClamp) {
            x = -spreadClamp.x * 0.5 + this.roundToNearestMultiple(x, spreadClamp.x);
            y = -spreadClamp.y * 0.5 + this.roundToNearestMultiple(y, spreadClamp.y);
            z = -spreadClamp.z * 0.5 + this.roundToNearestMultiple(z, spreadClamp.z);
        }

        attribute.typedArray.setVec3Components(index, x, y, z);
    },

    /**
     * Given an Shader attribute instance, and letious other settings,
     * assign Color values to the attribute.
     * @param  {Object} attribute The instance of ShaderAttribute to save the result to.
     * @param  {Number} index     The offset in the attribute's TypedArray to save the result from.
     * @param  {Object} base      THREE.Color instance describing the start color.
     * @param  {Object} spread    THREE.Vector3 instance describing the random letiance to apply to the start color.
     */
    randomColor(attribute: ShaderAttribute, index: number, base: THREE.Color, spread: THREE.Vector3): void {
        let r = base.r + (Math.random() * spread.x),
            g = base.g + (Math.random() * spread.y),
            b = base.b + (Math.random() * spread.z);

        r = this.clamp(r, 0, 1);
        g = this.clamp(g, 0, 1);
        b = this.clamp(b, 0, 1);

        attribute.typedArray.setVec3Components(index, r, g, b);
    },

    randomColorAsHex: (function () {
        const workingColor = new THREE.Color();

        /**
         * Assigns a random color value, encoded as a hex value in decimal
         * format, to a ShaderAttribute instance.
         * @param  {Object} attribute The instance of ShaderAttribute to save the result to.
         * @param  {Number} index     The offset in the attribute's TypedArray to save the result from.
         * @param  {Object} base      THREE.Color instance describing the start color.
         * @param  {Object} spread    THREE.Vector3 instance describing the random letiance to apply to the start color.
         */
        return function (this: { clamp: (value: number, min: number, max: number) => number }, attribute: ShaderAttribute, index: number, base: THREE.Color[], spread: THREE.Vector3[]) {
            const numItems = base.length;
            const colors = [];

            for (let i = 0; i < numItems; ++i) {
                const spreadVector = spread[i];

                workingColor.copy(base[i]);

                workingColor.r += (Math.random() * spreadVector.x) - (spreadVector.x * 0.5);
                workingColor.g += (Math.random() * spreadVector.y) - (spreadVector.y * 0.5);
                workingColor.b += (Math.random() * spreadVector.z) - (spreadVector.z * 0.5);

                workingColor.r = this.clamp(workingColor.r, 0, 1);
                workingColor.g = this.clamp(workingColor.g, 0, 1);
                workingColor.b = this.clamp(workingColor.b, 0, 1);

                colors.push(workingColor.getHex());
            }

            attribute.typedArray.setVec4Components(index, colors[0] ?? 0, colors[1] ?? 0, colors[2] ?? 0, colors[3] ?? 0);
        };
    }()),

    /**
     * Given an ShaderAttribute instance, and letious other settings,
     * assign values to the attribute's array in a `vec3` format.
     *
     * @param  {Object} attribute   The instance of ShaderAttribute to save the result to.
     * @param  {Number} index       The offset in the attribute's TypedArray to save the result from.
     * @param  {Object} start       THREE.Vector3 instance describing the start line position.
     * @param  {Object} end         THREE.Vector3 instance describing the end line position.
     */
    randomVector3OnLine(attribute: ShaderAttribute, index: number, start: THREE.Vector3, end: THREE.Vector3): void {
        const pos = start.clone();

        pos.lerp(end, Math.random());

        attribute.typedArray.setVec3Components(index, pos.x, pos.y, pos.z);
    },

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
    randomVector3OnSphere(
        attribute: ShaderAttribute,
        index: number,
        base: THREE.Vector3,
        radius: number,
        radiusSpread: number,
        radiusScale: THREE.Vector3,
        radiusSpreadClamp: number
        // distributionClamp?: unknown
    ): void {
        const depth = 2 * Math.random() - 1;
        const t = 6.2832 * Math.random();
        const r = Math.sqrt(1 - depth * depth);
        let rand = this.randomFloat(radius, radiusSpread);
        let x = 0;
        let y = 0;
        let z = 0;

        if (radiusSpreadClamp) {
            rand = Math.round(rand / radiusSpreadClamp) * radiusSpreadClamp;
        }

        // Set position on sphere
        x = r * Math.cos(t) * rand;
        y = r * Math.sin(t) * rand;
        z = depth * rand;

        // Apply radius scale to this position
        x *= radiusScale.x;
        y *= radiusScale.y;
        z *= radiusScale.z;

        // Translate to the base position.
        x += base.x;
        y += base.y;
        z += base.z;

        // Set the values in the typed array.
        attribute.typedArray.setVec3Components(index, x, y, z);
    },

    seededRandom(seed: number): number {
        const x = Math.sin(seed) * 10000;
        return x - (x | 0);
    },

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
    randomVector3OnDisc(attribute: ShaderAttribute, index: number, base: THREE.Vector3, radius: number, radiusSpread: number, radiusScale: THREE.Vector3, radiusSpreadClamp: number): void {
        const t = 6.2832 * Math.random();
        let rand = Math.abs(this.randomFloat(radius, radiusSpread));
        let x = 0;
        let y = 0;
        let z = 0;

        if (radiusSpreadClamp) {
            rand = Math.round(rand / radiusSpreadClamp) * radiusSpreadClamp;
        }

        // Set position on sphere
        x = Math.cos(t) * rand;
        y = Math.sin(t) * rand;

        // Apply radius scale to this position
        x *= radiusScale.x;
        y *= radiusScale.y;

        // Translate to the base position.
        x += base.x;
        y += base.y;
        z += base.z;

        // Set the values in the typed array.
        attribute.typedArray.setVec3Components(index, x, y, z);
    },

    randomDirectionVector3OnSphere: (function () {
        const v = new THREE.Vector3();

        /**
         * Given an ShaderAttribute instance, create a direction vector from the given
         * position, using `speed` as the magnitude. Values are saved to the attribute.
         *
         * @param  {Object} attribute       The instance of ShaderAttribute to save the result to.
         * @param  {Number} index           The offset in the attribute's TypedArray to save the result from.
         * @param  {Number} posX            The particle's x coordinate.
         * @param  {Number} posY            The particle's y coordinate.
         * @param  {Number} posZ            The particle's z coordinate.
         * @param  {Object} emitterPosition THREE.Vector3 instance describing the emitter's base position.
         * @param  {Number} speed           The magnitude to apply to the vector.
         * @param  {Number} speedSpread     The amount of randomness to apply to the magnitude.
         */
        return function (this: { randomFloat: (base: number, spread: number) => number }, attribute: ShaderAttribute, index: number, posX: number, posY: number, posZ: number, emitterPosition: THREE.Vector3, speed: number, speedSpread: number) {
            v.copy(emitterPosition);

            v.x -= posX;
            v.y -= posY;
            v.z -= posZ;

            v.normalize().multiplyScalar(-this.randomFloat(speed, speedSpread));

            attribute.typedArray.setVec3Components(index, v.x, v.y, v.z);
        };
    }()),

    randomDirectionVector3OnDisc: (function () {
        const v = new THREE.Vector3();

        /**
         * Given an ShaderAttribute instance, create a direction vector from the given
         * position, using `speed` as the magnitude. Values are saved to the attribute.
         *
         * @param  {Object} attribute       The instance of ShaderAttribute to save the result to.
         * @param  {Number} index           The offset in the attribute's TypedArray to save the result from.
         * @param  {Number} posX            The particle's x coordinate.
         * @param  {Number} posY            The particle's y coordinate.
         * @param  {Number} posZ            The particle's z coordinate.
         * @param  {Object} emitterPosition THREE.Vector3 instance describing the emitter's base position.
         * @param  {Number} speed           The magnitude to apply to the vector.
         * @param  {Number} speedSpread     The amount of randomness to apply to the magnitude.
         */
        return function (this: { randomFloat: (base: number, spread: number) => number }, attribute: ShaderAttribute, index: number, posX: number, posY: number, posZ: number, emitterPosition: THREE.Vector3, speed: number, speedSpread: number) {
            v.copy(emitterPosition);

            v.x -= posX;
            v.y -= posY;
            v.z -= posZ;

            v.normalize().multiplyScalar(-this.randomFloat(speed, speedSpread));

            attribute.typedArray.setVec3Components(index, v.x, v.y, 0);
        };
    }()),

    getPackedRotationAxis: (function () {
        const v = new THREE.Vector3();
        const vSpread = new THREE.Vector3();
        const c = new THREE.Color();
        const addOne = new THREE.Vector3(1, 1, 1);

        /**
         * Given a rotation axis, and a rotation axis spread vector,
         * calculate a randomised rotation axis, and pack it into
         * a hexadecimal value represented in decimal form.
         * @param  {Object} axis       THREE.Vector3 instance describing the rotation axis.
         * @param  {Object} axisSpread THREE.Vector3 instance describing the amount of randomness to apply to the rotation axis.
         * @return {Number}            The packed rotation axis, with randomness.
         */
        return function (axis: THREE.Vector3, axisSpread: THREE.Vector3): number {
            v.copy(axis).normalize();
            vSpread.copy(axisSpread).normalize();

            v.x += (-axisSpread.x * 0.5) + (Math.random() * axisSpread.x);
            v.y += (-axisSpread.y * 0.5) + (Math.random() * axisSpread.y);
            v.z += (-axisSpread.z * 0.5) + (Math.random() * axisSpread.z);

            // v.x = Math.abs( v.x );
            // v.y = Math.abs( v.y );
            // v.z = Math.abs( v.z );

            v.normalize().add(addOne).multiplyScalar(0.5);

            c.setRGB(v.x, v.y, v.z);

            return c.getHex();
        };
    }())
};