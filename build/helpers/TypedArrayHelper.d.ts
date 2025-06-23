/**
 * A helper class for TypedArrays.
 *
 * Allows for easy resizing, assignment of various component-based
 * types (Vector2s, Vector3s, Vector4s, Mat3s, Mat4s),
 * as well as Colors (where components are `r`, `g`, `b`),
 * Numbers, and setting from other TypedArrays.
 *
 * @author JackXie60
 * @constructor
 * @param {Function} TypedArrayConstructor The constructor to use (Float32Array, Uint8Array, etc.)
 * @param {Number} size                 The size of the array to create
 * @param {Number} componentSize        The number of components per-value (ie. 3 for a vec3, 9 for a Mat3, etc.)
 * @param {Number} indexOffset          The index in the array from which to start assigning values. Default `0` if none provided
 */
type TypedArray = Int8Array | Uint8Array | Uint8ClampedArray | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array | Float64Array;
type TypedArrayConstructor = new (...args: any[]) => TypedArray;
interface Vector2 {
    x: number;
    y: number;
}
interface Vector3 {
    x: number;
    y: number;
    z: number;
}
interface Vector4 {
    x: number;
    y: number;
    z: number;
    w: number;
}
interface Color {
    r: number;
    g: number;
    b: number;
}
interface Matrix3 {
    elements: TypedArray;
}
interface Matrix4 {
    elements: TypedArray;
}
declare class TypedArrayHelper {
    componentSize: number;
    size: number;
    TypedArrayConstructor: TypedArrayConstructor;
    array: TypedArray;
    indexOffset: number;
    constructor(TypedArrayConstructor?: TypedArrayConstructor, size?: number, componentSize?: number, indexOffset?: number);
    setSize(size: number, noComponentMultiply?: boolean): this | undefined;
    /**
     * Shrinks the internal array.
     *
     * @param  {Number} size The new size of the typed array. Must be smaller than `this.array.length`.
     * @return {TypedArrayHelper}      Instance of this class.
     */
    shrink(size: number): this;
    /**
     * Grows the internal array.
     * @param  {Number} size The new size of the typed array. Must be larger than `this.array.length`.
     * @return {TypedArrayHelper}      Instance of this class.
     */
    grow(size: number): this;
    /**
     * Perform a splice operation on this array's buffer.
     * @param  {Number} start The start index of the splice. Will be multiplied by the number of components for this attribute.
     * @param  {Number} end The end index of the splice. Will be multiplied by the number of components for this attribute.
     * @returns {Object} The TypedArrayHelper instance.
     */
    splice(start: number, end: number): this;
    /**
     * Copies from the given TypedArray into this one, using the index argument
     * as the start position. Alias for `TypedArray.set`. Will automatically resize
     * if the given source array is of a larger size than the internal array.
     *
     * @param {Number} index      The start position from which to copy into this array.
     * @param {TypedArray} array The array from which to copy; the source array.
     * @return {TypedArrayHelper} Instance of this class.
     */
    setFromArray(index: number, array: TypedArray | number[]): this;
    /**
     * Set a Vector2 value at `index`.
     *
     * @param {Number} index The index at which to set the vec2 values from.
     * @param {Vector2} vec2  Any object that has `x` and `y` properties.
     * @return {TypedArrayHelper} Instance of this class.
     */
    setVec2(index: number, vec2: Vector2): this;
    /**
     * Set a Vector2 value using raw components.
     *
     * @param {Number} index The index at which to set the vec2 values from.
     * @param {Number} x     The Vec2's `x` component.
     * @param {Number} y     The Vec2's `y` component.
     * @return {TypedArrayHelper} Instance of this class.
     */
    setVec2Components(index: number, x: number, y: number): this;
    /**
     * Set a Vector3 value at `index`.
     *
     * @param {Number} index The index at which to set the vec3 values from.
     * @param {Vector3} vec2  Any object that has `x`, `y`, and `z` properties.
     * @return {TypedArrayHelper} Instance of this class.
     */
    setVec3(index: number, vec3: Vector3): this;
    /**
     * Set a Vector3 value using raw components.
     *
     * @param {Number} index The index at which to set the vec3 values from.
     * @param {Number} x     The Vec3's `x` component.
     * @param {Number} y     The Vec3's `y` component.
     * @param {Number} z     The Vec3's `z` component.
     * @return {TypedArrayHelper} Instance of this class.
     */
    setVec3Components(index: number, x: number, y: number, z: number): this;
    /**
     * Set a Vector4 value at `index`.
     *
     * @param {Number} index The index at which to set the vec4 values from.
     * @param {Vector4} vec2  Any object that has `x`, `y`, `z`, and `w` properties.
     * @return {TypedArrayHelper} Instance of this class.
     */
    setVec4(index: number, vec4: Vector4): this;
    /**
     * Set a Vector4 value using raw components.
     *
     * @param {Number} index The index at which to set the vec4 values from.
     * @param {Number} x     The Vec4's `x` component.
     * @param {Number} y     The Vec4's `y` component.
     * @param {Number} z     The Vec4's `z` component.
     * @param {Number} w     The Vec4's `w` component.
     * @return {TypedArrayHelper} Instance of this class.
     */
    setVec4Components(index: number, x: number, y: number, z: number, w: number): this;
    /**
     * Set a Matrix3 value at `index`.
     *
     * @param {Number} index The index at which to set the matrix values from.
     * @param {Matrix3} mat3 The 3x3 matrix to set from. Must have a TypedArray property named `elements` to copy from.
     * @return {TypedArrayHelper} Instance of this class.
     */
    setMat3(index: number, mat3: Matrix3): this;
    /**
     * Set a Matrix4 value at `index`.
     *
     * @param {Number} index The index at which to set the matrix values from.
     * @param {Matrix4} mat3 The 4x4 matrix to set from. Must have a TypedArray property named `elements` to copy from.
     * @return {TypedArrayHelper} Instance of this class.
     */
    setMat4(index: number, mat4: Matrix4): this;
    /**
     * Set a Color value at `index`.
     *
     * @param {Number} index The index at which to set the vec3 values from.
     * @param {Color} color  Any object that has `r`, `g`, and `b` properties.
     * @return {TypedArrayHelper} Instance of this class.
     */
    setColor(index: number, color: Color): this;
    /**
     * Set a Number value at `index`.
     *
     * @param {Number} index The index at which to set the vec3 values from.
     * @param {Number} numericValue  The number to assign to this index in the array.
     * @return {TypedArrayHelper} Instance of this class.
     */
    setNumber(index: number, numericValue: number): this;
    /**
     * Returns the value of the array at the given index, taking into account
     * the `indexOffset` property of this class.
     *
     * Note that this function ignores the component size and will just return a
     * single value.
     *
     * @param  {Number} index The index in the array to fetch.
     * @return {Number}       The value at the given index.
     */
    getValueAtIndex(index: number): number;
    /**
     * Returns the component value of the array at the given index, taking into account
     * the `indexOffset` property of this class.
     *
     * If the componentSize is set to 3, then it will return a new TypedArray
     * of length 3.
     *
     * @param  {Number} index The index in the array to fetch.
     * @return {TypedArray}       The component value at the given index.
     */
    getComponentValueAtIndex(index: number): TypedArray;
}
export default TypedArrayHelper;
