import * as THREE from 'three';
import TypedArrayHelper from './TypedArrayHelper';
type TypedArray = Int8Array | Uint8Array | Uint8ClampedArray | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array | Float64Array;
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
    static typeSizeMap: Record<TypeSizeKey, number>;
    constructor(type: keyof typeof ShaderAttribute.typeSizeMap, dynamicBuffer: boolean, arrayType?: TypedArrayConstructor);
    /**
     * Calculate the minimum and maximum update range for this buffer attribute using
     * component size independant min and max values.
     *
     * @param {Number} min The start of the range to mark as needing an update.
     * @param {Number} max The end of the range to mark as needing an update.
     */
    setUpdateRange(min: number, max: number): void;
    /**
     * Calculate the number of indices that this attribute should mark as needing
     * updating. Also marks the attribute as needing an update.
     */
    flagUpdate(): void;
    /**
     * Reset the index update counts for this attribute
     */
    resetUpdateRange(): void;
    resetDynamic(): void;
    /**
     * Perform a splice operation on this attribute's buffer.
     * @param  {Number} start The start index of the splice. Will be multiplied by the number of components for this attribute.
     * @param  {Number} end The end index of the splice. Will be multiplied by the number of components for this attribute.
     */
    splice(start: number, end: number): void;
    forceUpdateAll(): void;
    /**
     * Make sure this attribute has a typed array associated with it.
     *
     * If it does, then it will ensure the typed array is of the correct size.
     *
     * If not, a new TypedArrayHelper instance will be created.
     *
     * @param  {Number} size The size of the typed array to create or update to.
     */
    _ensureTypedArray(size: number): void;
    /**
     * Creates a THREE.BufferAttribute instance if one doesn't exist already.
     *
     * Ensures a typed array is present by calling _ensureTypedArray() first.
     *
     * If a buffer attribute exists already, then it will be marked as needing an update.
     *
     * @param  {Number} size The size of the typed array to create if one doesn't exist, or resize existing array to.
     */
    _createBufferAttribute(size: number): void;
    /**
     * Returns the length of the typed array associated with this attribute.
     * @return {Number} The length of the typed array. Will be 0 if no typed array has been created yet.
     */
    getLength(): number;
}
export {};
