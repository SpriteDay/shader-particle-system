import * as THREE from 'three';
import ShaderAttribute from '../helpers/ShaderAttribute';
import Emitter, { EmitterOptions } from '../emitter/index';
export interface GroupOptions {
    fixedTimeStep?: number;
    texture?: {
        value?: THREE.Texture;
        frames?: THREE.Vector2;
        frameCount?: number;
        loop?: number;
    };
    hasPerspective?: boolean;
    colorize?: boolean;
    maxParticleCount?: number | null;
    blending?: number;
    transparent?: boolean;
    alphaTest?: number;
    depthWrite?: boolean;
    depthTest?: boolean;
    fog?: boolean;
    scale?: number;
}
declare class Group {
    uuid: string;
    fixedTimeStep: number;
    texture: THREE.Texture | null;
    textureFrames: THREE.Vector2;
    textureFrameCount: number;
    textureLoop: number;
    hasPerspective: boolean;
    colorize: boolean;
    maxParticleCount: number | null;
    blending: THREE.Blending;
    transparent: boolean;
    alphaTest: number;
    depthWrite: boolean;
    depthTest: boolean;
    fog: boolean;
    scale: number;
    emitters: Emitter[];
    emitterIDs: string[];
    _pool: Emitter[];
    _poolCreationSettings: EmitterOptions | EmitterOptions[] | null;
    _createNewWhenPoolEmpty: number;
    _attributesNeedRefresh: boolean;
    _attributesNeedDynamicReset: boolean;
    particleCount: number;
    uniforms: {
        tex: {
            type: string;
            value: THREE.Texture | null;
        };
        textureAnimation: {
            type: string;
            value: THREE.Vector4;
        };
        fogColor: {
            type: string;
            value: THREE.Color | null;
        };
        fogNear: {
            type: string;
            value: number;
        };
        fogFar: {
            type: string;
            value: number;
        };
        fogDensity: {
            type: string;
            value: number;
        };
        deltaTime: {
            type: string;
            value: number;
        };
        runTime: {
            type: string;
            value: number;
        };
        scale: {
            type: string;
            value: number;
        };
    };
    defines: {
        HAS_PERSPECTIVE: boolean;
        COLORIZE: boolean;
        VALUE_OVER_LIFETIME_LENGTH: number;
        SHOULD_ROTATE_TEXTURE: boolean;
        SHOULD_ROTATE_PARTICLES: boolean;
        SHOULD_WIGGLE_PARTICLES: boolean;
        SHOULD_CALCULATE_SPRITE: boolean;
    };
    attributes: {
        position: ShaderAttribute;
        acceleration: ShaderAttribute;
        velocity: ShaderAttribute;
        rotation: ShaderAttribute;
        rotationCenter: ShaderAttribute;
        params: ShaderAttribute;
        size: ShaderAttribute;
        angle: ShaderAttribute;
        color: ShaderAttribute;
        opacity: ShaderAttribute;
    };
    attributeKeys: string[];
    attributeCount: number;
    material: THREE.ShaderMaterial;
    geometry: THREE.BufferGeometry;
    mesh: THREE.Points;
    constructor(options: GroupOptions);
    _updateDefines(): void;
    _applyAttributesToGeometry(): void;
    /**
     * Adds an Emitter instance to this group, creating particle values and
     * assigning them to this group's shader attributes.
     *
     * @param {Emitter} emitter The emitter to add to this group.
     */
    addEmitter(emitter: Emitter): this | undefined;
    /**
     * Removes an Emitter instance from this group. When called,
     * all particle's belonging to the given emitter will be instantly
     * removed from the scene.
     *
     * @param {Emitter} emitter The emitter to add to this group.
     */
    removeEmitter(emitter: Emitter): void;
    /**
     * Fetch a single emitter instance from the pool.
     * If there are no objects in the pool, a new emitter will be
     * created if specified.
     *
     * @return {Emitter|null}
     */
    getFromPool(): Emitter | null | undefined;
    /**
     * Release an emitter into the pool.
     *
     * @param  {ShaderParticleEmitter} emitter
     * @return {Group} This group instance.
     */
    releaseIntoPool(emitter: Emitter): this | undefined;
    getPool(): Emitter[];
    /**
     * Add a pool of emitters to this particle group
     *
     * @param {Number} numEmitters      The number of emitters to add to the pool.
     * @param {EmitterOptions|Array} emitterOptions  An object, or array of objects, describing the options to pass to each emitter.
     * @param {Boolean} createNew       Should a new emitter be created if the pool runs out?
     * @return {Group} This group instance.
     */
    addPool(numEmitters: number, emitterOptions: EmitterOptions | EmitterOptions[], createNew: boolean): this;
    _triggerSingleEmitter(pos: THREE.Vector3): this | undefined;
    /**
     * Set a given number of emitters as alive, with an optional position
     * vector3 to move them to.
     *
     * @param  {Number} numEmitters The number of emitters to activate
     * @param  {Object} [position=undefined] A THREE.Vector3 instance describing the position to activate the emitter(s) at.
     * @return {Group} This group instance.
     */
    triggerPoolEmitter(numEmitters: number, position: THREE.Vector3): this;
    _updateUniforms(dt: number): void;
    _resetBufferRanges(): void;
    _updateBuffers(emitter: Emitter): void;
    /**
     * Simulate all the emitter's belonging to this group, updating
     * attribute values along the way.
     * @param  {Number} [dt=Group's `fixedTimeStep` value] The number of seconds to simulate the group's emitters for (deltaTime)
     */
    update(dt: number): void;
    dispose(): this;
}
export default Group;
