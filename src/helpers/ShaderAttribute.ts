import * as THREE from 'three';
import TypedArrayHelper from './TypedArrayHelper';

type TypedArray =
    | Int8Array
    | Uint8Array
    | Uint8ClampedArray
    | Int16Array
    | Uint16Array
    | Int32Array
    | Uint32Array
    | Float32Array
    | Float64Array;

type TypedArrayConstructor = new (...args: unknown[]) => TypedArray;

type TypeSizeKey = "f" | "v2" | "v3" | "v4" | "c" | "m3" | "m4";

export default class ShaderAttribute {
    type: TypeSizeKey;
    componentSize: number;
    arrayType: TypedArrayConstructor;
    typedArray: TypedArrayHelper | null;
    bufferAttribute: THREE.BufferAttribute | null;
    dynamicBuffer: boolean;
    updateMin: number;
    updateMax: number;

    static typeSizeMap: Record<TypeSizeKey, number> = {
        /**
        * Float
        * @type {Number}
        */
        f: 1,

        /**
         * Vec2
         * @type {Number}
         */
        v2: 2,

        /**
         * Vec3
         * @type {Number}
         */
        v3: 3,

        /**
         * Vec4
         * @type {Number}
         */
        v4: 4,

        /**
         * Color
         * @type {Number}
         */
        c: 3,

        /**
         * Mat3
         * @type {Number}
         */
        m3: 9,

        /**
         * Mat4
         * @type {Number}
         */
        m4: 16
    }

    constructor(type: keyof typeof ShaderAttribute.typeSizeMap, dynamicBuffer: boolean, arrayType?: TypedArrayConstructor) {
        const typeMap = ShaderAttribute.typeSizeMap;

        this.type = typeof type === 'string' && Object.prototype.hasOwnProperty.call(typeMap, type) ? type : 'f';
        this.componentSize = typeMap[this.type];
        this.arrayType = arrayType || Float32Array;
        this.typedArray = null;
        this.bufferAttribute = null;
        this.dynamicBuffer = !!dynamicBuffer;

        this.updateMin = 0;
        this.updateMax = 0;
    }

    /**
     * Calculate the minimum and maximum update range for this buffer attribute using
     * component size independant min and max values.
     *
     * @param {Number} min The start of the range to mark as needing an update.
     * @param {Number} max The end of the range to mark as needing an update.
     */
    setUpdateRange(min: number, max: number): void {
        this.updateMin = Math.min(min * this.componentSize, this.updateMin * this.componentSize);
        this.updateMax = Math.max(max * this.componentSize, this.updateMax * this.componentSize);
    }

    /**
     * Calculate the number of indices that this attribute should mark as needing
     * updating. Also marks the attribute as needing an update.
     */
    flagUpdate(): void {
        const attr = this.bufferAttribute;

        if (!attr || !this.typedArray) {
            return;
        }

        attr.clearUpdateRanges();
        attr.addUpdateRange(this.updateMin, Math.min((this.updateMax - this.updateMin) + this.componentSize, this.typedArray.array.length));
        attr.needsUpdate = true;
    }

    /**
     * Reset the index update counts for this attribute
     */
    resetUpdateRange(): void {
        this.updateMin = 0;
        this.updateMax = 0;
    }

    resetDynamic(): void {
        if (!this.bufferAttribute) {
            return;
        }
        this.bufferAttribute.usage = this.dynamicBuffer
            ? THREE.DynamicDrawUsage
            : THREE.StaticDrawUsage;
    }

    /**
     * Perform a splice operation on this attribute's buffer.
     * @param  {Number} start The start index of the splice. Will be multiplied by the number of components for this attribute.
     * @param  {Number} end The end index of the splice. Will be multiplied by the number of components for this attribute.
     */
    splice(start: number, end: number): void {
        if (!this.typedArray) {
            return;
        }
        this.typedArray.splice(start, end);

        this.forceUpdateAll();
    }

    forceUpdateAll(): void {
        if (!this.bufferAttribute || !this.typedArray) {
            return;
        }

        this.bufferAttribute.array = this.typedArray.array;
        this.bufferAttribute.clearUpdateRanges();
        this.bufferAttribute.addUpdateRange(0, -1);

        this.bufferAttribute.usage = THREE.StaticDrawUsage;
        this.bufferAttribute.needsUpdate = true;
    }

    /**
     * Make sure this attribute has a typed array associated with it.
     *
     * If it does, then it will ensure the typed array is of the correct size.
     *
     * If not, a new TypedArrayHelper instance will be created.
     *
     * @param  {Number} size The size of the typed array to create or update to.
     */
    _ensureTypedArray(size: number): void {
        if (this.typedArray !== null && this.typedArray.size === size * this.componentSize) {
            // empty
        }
        else if (this.typedArray !== null && this.typedArray.size !== size) {
            this.typedArray.setSize(size);
        }
        else if (this.typedArray === null) {
            this.typedArray = new TypedArrayHelper(this.arrayType, size, this.componentSize);
        }
    }

    /**
     * Creates a THREE.BufferAttribute instance if one doesn't exist already.
     *
     * Ensures a typed array is present by calling _ensureTypedArray() first.
     *
     * If a buffer attribute exists already, then it will be marked as needing an update.
     *
     * @param  {Number} size The size of the typed array to create if one doesn't exist, or resize existing array to.
     */
    _createBufferAttribute(size: number): void {
        this._ensureTypedArray(size);

        if (this.bufferAttribute !== null) {
            if (this.typedArray) {
                this.bufferAttribute.set(this.typedArray.array);
            }

            this.bufferAttribute.needsUpdate = true;
            return;
        }

        this.bufferAttribute = new THREE.BufferAttribute(this.typedArray!.array, this.componentSize);

        this.bufferAttribute.usage = this.dynamicBuffer ? THREE.DynamicDrawUsage : THREE.StaticDrawUsage;
    }

    /**
     * Returns the length of the typed array associated with this attribute.
     * @return {Number} The length of the typed array. Will be 0 if no typed array has been created yet.
     */
    getLength(): number {
        if (this.typedArray === null) {
            return 0;
        }

        return this.typedArray.array.length;
    }
}