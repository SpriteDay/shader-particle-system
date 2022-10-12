import * as THREE from 'three';
import TypedArrayHelper from './TypedArrayHelper';

export default class ShaderAttribute {
    constructor(type, dynamicBuffer, arrayType) {
        const typeMap = ShaderAttribute.typeSizeMap;

        this.type = typeof type === 'string' && typeMap.hasOwnProperty(type) ? type : 'f';
        this.componentSize = typeMap[this.type];
        this.arrayType = arrayType || Float32Array;
        this.typedArray = null;
        this.bufferAttribute = null;
        this.dynamicBuffer = !!dynamicBuffer;

        this.updateMin = 0;
        this.updateMax = 0;
    }

    static typeSizeMap = {
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

    /**
     * Calculate the minimum and maximum update range for this buffer attribute using
     * component size independant min and max values.
     *
     * @param {Number} min The start of the range to mark as needing an update.
     * @param {Number} max The end of the range to mark as needing an update.
     */
    setUpdateRange(min, max) {
        this.updateMin = Math.min(min * this.componentSize, this.updateMin * this.componentSize);
        this.updateMax = Math.max(max * this.componentSize, this.updateMax * this.componentSize);
    }

    /**
     * Calculate the number of indices that this attribute should mark as needing
     * updating. Also marks the attribute as needing an update.
     */
    flagUpdate() {
        const attr = this.bufferAttribute;
        const range = attr.updateRange;

        range.offset = this.updateMin;
        range.count = Math.min((this.updateMax - this.updateMin) + this.componentSize, this.typedArray.array.length);
        attr.needsUpdate = true;
    }

    /**
     * Reset the index update counts for this attribute
     */
    resetUpdateRange() {
        this.updateMin = 0;
        this.updateMax = 0;
    }

    resetDynamic() {
        this.bufferAttribute.useage = this.dynamicBuffer
            ? THREE.DynamicDrawUsage
            : THREE.StaticDrawUsage;
    }

    /**
     * Perform a splice operation on this attribute's buffer.
     * @param  {Number} start The start index of the splice. Will be multiplied by the number of components for this attribute.
     * @param  {Number} end The end index of the splice. Will be multiplied by the number of components for this attribute.
     */
    splice(start, end) {
        this.typedArray.splice(start, end);

        this.forceUpdateAll();
    }

    forceUpdateAll() {
        this.bufferAttribute.array = this.typedArray.array;
        this.bufferAttribute.updateRange.offset = 0;
        this.bufferAttribute.updateRange.count = -1;

        this.bufferAttribute.usage = THREE.StaticDrawUsage;
        this.bufferAttribute.needsUpdate = true;
    }

    /**
     * Make sure this attribute has a typed array associated with it.
     *
     * If it does, then it will ensure the typed array is of the correct size.
     *
     * If not, a new SPE.TypedArrayHelper instance will be created.
     *
     * @param  {Number} size The size of the typed array to create or update to.
     */
    _ensureTypedArray(size) {
        if (this.typedArray !== null && this.typedArray.size === size * this.componentSize) {

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
    _createBufferAttribute(size) {
        this._ensureTypedArray(size);

        if (this.bufferAttribute !== null) {
            this.bufferAttribute.array = this.typedArray.array;

            this.bufferAttribute.count = this.bufferAttribute.array.length / this.bufferAttribute.itemSize;
            this.bufferAttribute.needsUpdate = true;
            return;
        }

        this.bufferAttribute = new THREE.BufferAttribute(this.typedArray.array, this.componentSize);

        this.bufferAttribute.usage = this.dynamicBuffer ? THREE.DynamicDrawUsage : THREE.StaticDrawUsage;
    }

    /**
     * Returns the length of the typed array associated with this attribute.
     * @return {Number} The length of the typed array. Will be 0 if no typed array has been created yet.
     */
    getLength() {
        if (this.typedArray === null) {
            return 0;
        }

        return this.typedArray.array.length;
    }
}