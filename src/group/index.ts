import utils from '../utils/index';
import * as THREE from 'three'
import Constants, { DEFAULT_SYSTEM_DELTA } from '../constants/index';
import ShaderAttribute from '../helpers/ShaderAttribute'
import shaders from '../shaders/shaders';
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
class Group {
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
    _poolCreationSettings: GroupOptions | null;
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

    constructor(options: GroupOptions) {
        const types = utils.types;

        options = utils.ensureTypedArg(options, types.OBJECT, {});
        options.texture = utils.ensureTypedArg(options.texture, types.OBJECT, {});

        this.uuid = THREE.MathUtils.generateUUID();

        // If no `deltaTime` value is passed to the `Group.tick` function,
        // the value of this property will be used to advance the simulation.
        this.fixedTimeStep = utils.ensureTypedArg(options.fixedTimeStep, types.NUMBER, DEFAULT_SYSTEM_DELTA);

        // Set properties used in the uniforms map, starting with the
        // texture stuff.
        this.texture = options.texture.value || null;
        this.textureFrames = options.texture.frames || new THREE.Vector2(1, 1);
        this.textureFrameCount = utils.ensureTypedArg(options.texture.frameCount, types.NUMBER, this.textureFrames.x * this.textureFrames.y);
        this.textureLoop = utils.ensureTypedArg(options.texture.loop, types.NUMBER, 1);
        this.textureFrames.max(new THREE.Vector2(1, 1));

        this.hasPerspective = utils.ensureTypedArg(options.hasPerspective, types.Boolean, true);
        this.colorize = utils.ensureTypedArg(options.colorize, types.Boolean, true);

        this.maxParticleCount = utils.ensureTypedArg(options.maxParticleCount, types.NUMBER, null);

        // Set properties used to define the ShaderMaterial's appearance.
        this.blending = utils.ensureTypedArg(options.blending, types.NUMBER, THREE.AdditiveBlending);
        this.transparent = utils.ensureTypedArg(options.transparent, types.Boolean, true);
        this.alphaTest = utils.ensureTypedArg(options.alphaTest, types.NUMBER, 0.0);
        this.depthWrite = utils.ensureTypedArg(options.depthWrite, types.Boolean, false);
        this.depthTest = utils.ensureTypedArg(options.depthTest, types.Boolean, true);
        this.fog = utils.ensureTypedArg(options.fog, types.Boolean, true);
        this.scale = utils.ensureTypedArg(options.scale, types.NUMBER, 300);

        // Where emitter's go to curl up in a warm blanket and live
        // out their days.
        this.emitters = [];
        this.emitterIDs = [];

        // Create properties for use by the emitter pooling functions.
        this._pool = [];
        this._poolCreationSettings = null;
        this._createNewWhenPoolEmpty = 0;

        // Whether all attributes should be forced to updated
        // their entire buffer contents on the next tick.
        //
        // Used when an emitter is removed.
        this._attributesNeedRefresh = false;
        this._attributesNeedDynamicReset = false;

        this.particleCount = 0;

        // Map of uniforms to be applied to the ShaderMaterial instance.
        this.uniforms = {
            tex: {
                type: 't',
                value: this.texture
            },
            textureAnimation: {
                type: 'v4',
                value: new THREE.Vector4(
                    this.textureFrames.x,
                    this.textureFrames.y,
                    this.textureFrameCount,
                    Math.max(Math.abs(this.textureLoop), 1.0)
                )
            },
            fogColor: {
                type: 'c',
                value: this.fog ? new THREE.Color() : null
            },
            fogNear: {
                type: 'f',
                value: 10
            },
            fogFar: {
                type: 'f',
                value: 200
            },
            fogDensity: {
                type: 'f',
                value: 0.5
            },
            deltaTime: {
                type: 'f',
                value: 0
            },
            runTime: {
                type: 'f',
                value: 0
            },
            scale: {
                type: 'f',
                value: this.scale
            }
        };

        // Add some defines into the mix...
        this.defines = {
            HAS_PERSPECTIVE: this.hasPerspective,
            COLORIZE: this.colorize,
            VALUE_OVER_LIFETIME_LENGTH: Constants.valueOverLifetimeLength,

            SHOULD_ROTATE_TEXTURE: false,
            SHOULD_ROTATE_PARTICLES: false,
            SHOULD_WIGGLE_PARTICLES: false,

            SHOULD_CALCULATE_SPRITE: this.textureFrames.x > 1 || this.textureFrames.y > 1
        };

        // Map of all attributes to be applied to the particles.
        //
        // See ShaderAttribute for a bit more info on this bit.
        this.attributes = {
            position: new ShaderAttribute('v3', true),
            acceleration: new ShaderAttribute('v4', true), // w component is drag
            velocity: new ShaderAttribute('v3', true),
            rotation: new ShaderAttribute('v4', true),
            rotationCenter: new ShaderAttribute('v3', true),
            params: new ShaderAttribute('v4', true), // Holds (alive, age, delay, wiggle)
            size: new ShaderAttribute('v4', true),
            angle: new ShaderAttribute('v4', true),
            color: new ShaderAttribute('v4', true),
            opacity: new ShaderAttribute('v4', true)
        };

        this.attributeKeys = Object.keys(this.attributes);
        this.attributeCount = this.attributeKeys.length;

        // Create the ShaderMaterial instance that'll help render the
        // particles.
        this.material = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: shaders.vertex,
            fragmentShader: shaders.fragment,
            blending: this.blending,
            transparent: this.transparent,
            alphaTest: this.alphaTest,
            depthWrite: this.depthWrite,
            depthTest: this.depthTest,
            defines: this.defines,
            fog: this.fog
        });

        // Create the BufferGeometry and Points instances, ensuring
        // the geometry and material are given to the latter.
        this.geometry = new THREE.BufferGeometry();
        this.mesh = new THREE.Points(this.geometry, this.material);

        if (this.maxParticleCount === null) {
            console.warn('Group: No maxParticleCount specified. Adding emitters after rendering will probably cause errors.');
        }
    }

    _updateDefines() {
        const emitters = this.emitters;
        let emitter;
        const defines = this.defines;

        for (let i = emitters.length - 1; i >= 0; --i) {
            emitter = emitters[i];

            // Only do angle calculation if there's no spritesheet defined.
            //
            // Saves calculations being done and then overwritten in the shaders.
            if (!defines.SHOULD_CALCULATE_SPRITE) {
                defines.SHOULD_ROTATE_TEXTURE = defines.SHOULD_ROTATE_TEXTURE || !!Math.max(
                    Math.max.apply(null, emitter.angle.value),
                    Math.max.apply(null, emitter.angle.spread)
                );
            }

            defines.SHOULD_ROTATE_PARTICLES = defines.SHOULD_ROTATE_PARTICLES || !!Math.max(
                emitter.rotation.angle,
                emitter.rotation.angleSpread
            );

            defines.SHOULD_WIGGLE_PARTICLES = defines.SHOULD_WIGGLE_PARTICLES || !!Math.max(
                emitter.wiggle.value,
                emitter.wiggle.spread
            );
        }

        this.material.needsUpdate = true;
    }

    _applyAttributesToGeometry() {
        const attributes = this.attributes;
        const geometry = this.geometry;
        const geometryAttributes = geometry.attributes;
        let attribute, geometryAttribute;

        Object.keys(attributes).forEach(attr => {
            attribute = attributes[attr as keyof typeof attributes];
            geometryAttribute = geometryAttributes[attr];

            // Update the array if this attribute exists on the geometry.
            //
            // This needs to be done because the attribute's typed array might have
            // been resized and reinstantiated, and might now be looking at a
            // different ArrayBuffer, so reference needs updating.
            if (geometryAttribute) {
                geometryAttribute.array = attribute.typedArray.array;
            }

            // // Add the attribute to the geometry if it doesn't already exist.
            else {
                geometry.setAttribute(attr, attribute.bufferAttribute);
            }

            // Mark the attribute as needing an update the next time a frame is rendered.
            attribute.bufferAttribute.needsUpdate = true;
        })

        // Mark the draw range on the geometry. This will ensure
        // only the values in the attribute buffers that are
        // associated with a particle will be used in THREE's
        // render cycle.
        this.geometry.setDrawRange(0, this.particleCount);
    }

    /**
     * Adds an Emitter instance to this group, creating particle values and
     * assigning them to this group's shader attributes.
     *
     * @param {Emitter} emitter The emitter to add to this group.
     */
    addEmitter(emitter: Emitter) {
        // Ensure an actual emitter instance is passed here.
        //
        // Decided not to throw here, just in case a scene's
        // rendering would be paused. Logging an error instead
        // of stopping execution if exceptions aren't caught.
        if (emitter instanceof Emitter === false) {
            console.error('`emitter` argument must be instance of Emitter. Was provided with:', emitter);
            return;
        }

        // If the emitter already exists as a member of this group, then
        // stop here, we don't want to add it again.
        else if (this.emitterIDs.indexOf(emitter.uuid) > -1) {
            console.error('Emitter already exists in this group. Will not add again.');
            return;
        }

        // And finally, if the emitter is a member of another group,
        // don't add it to this group.
        else if (emitter.group !== null) {
            console.error('Emitter already belongs to another group. Will not add to requested group.');
            return;
        }

        const attributes = this.attributes;
        const start = this.particleCount;
        const end = start + emitter.particleCount;

        // Update this group's particle count.
        this.particleCount = end;

        // Emit a warning if the emitter being added will exceed the buffer sizes specified.
        if (this.maxParticleCount !== null && this.particleCount > this.maxParticleCount) {
            console.warn('Group: maxParticleCount exceeded. Requesting', this.particleCount, 'particles, can support only', this.maxParticleCount);
        }

        // Set the `particlesPerSecond` value (PPS) on the emitter.
        // It's used to determine how many particles to release
        // on a per-frame basis.
        emitter._calculatePPSValue(emitter.maxAge._value + emitter.maxAge._spread);
        emitter._setBufferUpdateRanges(this.attributeKeys);

        // Store the offset value in the TypedArray attributes for this emitter.
        emitter._setAttributeOffset(start);

        // Save a reference to this group on the emitter so it knows
        // where it belongs.
        emitter.group = this;

        // Store reference to the attributes on the emitter for
        // easier access during the emitter's tick function.
        emitter.attributes = this.attributes;

        // Ensure the attributes and their BufferAttributes exist, and their
        // TypedArrays are of the correct size.
        for (const attr in attributes) {
            // eslint-disable-next-line no-prototype-builtins
            if (attributes.hasOwnProperty(attr)) {
                // When creating a buffer, pass through the maxParticle count
                // if one is specified.
                attributes[attr as keyof typeof attributes]._createBufferAttribute(
                    this.maxParticleCount !== null
                        ? this.maxParticleCount
                        : this.particleCount
                );
            }
        }

        // Loop through each particle this emitter wants to have, and create the attributes values,
        // storing them in the TypedArrays that each attribute holds.
        for (let i = start; i < end; ++i) {
            emitter._assignPositionValue(i);
            emitter._assignForceValue(i, 'velocity');
            emitter._assignForceValue(i, 'acceleration');
            emitter._assignAbsLifetimeValue(i, 'opacity');
            emitter._assignAbsLifetimeValue(i, 'size');
            emitter._assignAngleValue(i);
            emitter._assignRotationValue(i);
            emitter._assignParamsValue(i);
            emitter._assignColorValue(i);
        }

        // Update the geometry and make sure the attributes are referencing
        // the typed arrays properly.
        this._applyAttributesToGeometry();

        // Store this emitter in this group's emitter's store.
        this.emitters.push(emitter);
        this.emitterIDs.push(emitter.uuid);

        // Update certain flags to enable shader calculations only if they're necessary.
        this._updateDefines();

        // Update the material since defines might have changed
        this.material.needsUpdate = true;
        this.geometry.needsUpdate = true;
        this._attributesNeedRefresh = true;

        // Return the group to enable chaining.
        return this;
    }

    /**
     * Removes an Emitter instance from this group. When called,
     * all particle's belonging to the given emitter will be instantly
     * removed from the scene.
     *
     * @param {Emitter} emitter The emitter to add to this group.
     */
    removeEmitter(emitter: Emitter) {
        const emitterIndex = this.emitterIDs.indexOf(emitter, this.uuid);

        // Ensure an actual emitter instance is passed here.
        //
        // Decided not to throw here, just in case a scene's
        // rendering would be paused. Logging an error instead
        // of stopping execution if exceptions aren't caught.
        if (emitter instanceof Emitter === false) {
            console.error('`emitter` argument must be instance of Emitter. Was provided with:', emitter);
            return;
        }
        else if (emitterIndex === -1) {
            console.error('Emitter does not exist in this group. Will not remove.');
            return;
        }

        // Kill all particles by marking them as dead
        // and their age as 0.
        const start = emitter.attributeOffset;
        const end = start + emitter.particleCount;
        const params = this.attributes.params.typedArray;

        // Set alive and age to zero.
        for (let i = start; i < end; ++i) {
            params.array[i * 4] = 0.0;
            params.array[i * 4 + 1] = 0.0;
        }

        // Remove the emitter from this group's "store".
        this.emitters.splice(emitterIndex, 1);
        this.emitterIDs.splice(emitterIndex, 1);

        // Remove this emitter's attribute values from all shader attributes.
        // The `.splice()` call here also marks each attribute's buffer
        // as needing to update it's entire contents.
        for (const attr in this.attributes) {
            // eslint-disable-next-line no-prototype-builtins
            if (this.attributes.hasOwnProperty(attr)) {
                this.attributes[attr as keyof typeof this.attributes].splice(start, end);
            }
        }

        // Ensure this group's particle count is correct.
        this.particleCount -= emitter.particleCount;

        // Call the emitter's remove method.
        emitter._onRemove();

        // Set a flag to indicate that the attribute buffers should
        // be updated in their entirety on the next frame.
        this._attributesNeedRefresh = true;
    }

    /**
     * Fetch a single emitter instance from the pool.
     * If there are no objects in the pool, a new emitter will be
     * created if specified.
     *
     * @return {Emitter|null}
     */
    getFromPool() {
        const pool = this._pool;
        const createNew = this._createNewWhenPoolEmpty;

        if (pool.length) {
            return pool.pop();
        }
        else if (createNew) {
            const emitter = new Emitter(this._poolCreationSettings);

            this.addEmitter(emitter);

            return emitter;
        }

        return null;
    }

    /**
     * Release an emitter into the pool.
     *
     * @param  {ShaderParticleEmitter} emitter
     * @return {Group} This group instance.
     */
    releaseIntoPool(emitter: Emitter) {
        if (emitter instanceof Emitter === false) {
            console.error('Argument is not instanceof Emitter:', emitter);
            return;
        }

        emitter.reset();
        this._pool.unshift(emitter);

        return this;
    }

    getPool() {
        return this._pool;
    }

    /**
     * Add a pool of emitters to this particle group
     *
     * @param {Number} numEmitters      The number of emitters to add to the pool.
     * @param {EmitterOptions|Array} emitterOptions  An object, or array of objects, describing the options to pass to each emitter.
     * @param {Boolean} createNew       Should a new emitter be created if the pool runs out?
     * @return {Group} This group instance.
     */
    addPool(numEmitters: number, emitterOptions: EmitterOptions | EmitterOptions[], createNew: boolean) {
        let emitter;
        // Save relevant settings and flags.
        this._poolCreationSettings = emitterOptions;
        this._createNewWhenPoolEmpty = !!createNew;

        // Create the emitters, add them to this group and the pool.
        for (let i = 0; i < numEmitters; ++i) {
            if (Array.isArray(emitterOptions)) {
                emitter = new Emitter(emitterOptions[i]);
            }
            else {
                emitter = new Emitter(emitterOptions);
            }
            this.addEmitter(emitter);
            this.releaseIntoPool(emitter);
        }

        return this;
    }

    _triggerSingleEmitter(pos: THREE.Vector3) {
        const emitter = this.getFromPool(),
            self = this;

        if (emitter === null) {
            console.log('Group pool ran out.');
            return;
        }

        // TODO:
        // - Make sure buffers are update with thus new position.
        if (pos instanceof THREE.Vector3) {
            emitter.position.value.copy(pos);

            // Trigger the setter for this property to force an
            // update to the emitter's position attribute.
            emitter.position.value = emitter.position.value;
        }

        emitter.enable();

        setTimeout(function () {
            emitter.disable();
            self.releaseIntoPool(emitter);
        }, (Math.max(emitter.duration, (emitter.maxAge.value + emitter.maxAge.spread))) * 1000);

        return this;
    }

    /**
     * Set a given number of emitters as alive, with an optional position
     * vector3 to move them to.
     *
     * @param  {Number} numEmitters The number of emitters to activate
     * @param  {Object} [position=undefined] A THREE.Vector3 instance describing the position to activate the emitter(s) at.
     * @return {Group} This group instance.
     */
    triggerPoolEmitter(numEmitters: number, position: THREE.Vector3) {
        if (typeof numEmitters === 'number' && numEmitters > 1) {
            for (let i = 0; i < numEmitters; ++i) {
                this._triggerSingleEmitter(position);
            }
        }
        else {
            this._triggerSingleEmitter(position);
        }

        return this;
    }

    _updateUniforms(dt: number) {
        this.uniforms.runTime.value += dt;
        this.uniforms.deltaTime.value = dt;
    }

    _resetBufferRanges() {
        const keys = this.attributeKeys;
        const attrs = this.attributes;
        let i = this.attributeCount - 1;

        for (i; i >= 0; --i) {
            attrs[keys[i]].resetUpdateRange();
        }
    }

    _updateBuffers(emitter: Emitter) {
        const keys = this.attributeKeys;
        const attrs = this.attributes;
        const emitterRanges = emitter.bufferUpdateRanges;
        let i = this.attributeCount - 1;
        let key, emitterAttr, attr;

        for (i; i >= 0; --i) {
            key = keys[i];
            emitterAttr = emitterRanges[key];
            attr = attrs[key];
            attr.setUpdateRange(emitterAttr.min, emitterAttr.max);
            attr.flagUpdate();
        }
    }

    /**
     * Simulate all the emitter's belonging to this group, updating
     * attribute values along the way.
     * @param  {Number} [dt=Group's `fixedTimeStep` value] The number of seconds to simulate the group's emitters for (deltaTime)
     */
    update(dt: number) {
        const emitters = this.emitters;
        const numEmitters = emitters.length;
        const deltaTime = dt || this.fixedTimeStep;
        const keys = this.attributeKeys;
        const attrs = this.attributes;
        let i;

        // Update uniform values.
        this._updateUniforms(deltaTime);

        // Reset buffer update ranges on the shader attributes.
        this._resetBufferRanges();

        // If nothing needs updating, then stop here.
        if (
            numEmitters === 0 &&
            this._attributesNeedRefresh === false &&
            this._attributesNeedDynamicReset === false
        ) {
            return;
        }

        // Loop through each emitter in this group and
        // simulate it, then update the shader attribute
        // buffers.
        for (let i = 0, emitter; i < numEmitters; ++i) {
            emitter = emitters[i];
            emitter.update(deltaTime);
            this._updateBuffers(emitter);
        }

        // If the shader attributes have been refreshed,
        // then the dynamic properties of each buffer
        // attribute will need to be reset back to
        // what they should be.
        if (this._attributesNeedDynamicReset === true) {
            i = this.attributeCount - 1;

            for (i; i >= 0; --i) {
                attrs[keys[i]].resetDynamic();
            }

            this._attributesNeedDynamicReset = false;
        }

        // If this group's shader attributes need a full refresh
        // then mark each attribute's buffer attribute as
        // needing so.
        if (this._attributesNeedRefresh === true) {
            i = this.attributeCount - 1;

            for (i; i >= 0; --i) {
                attrs[keys[i]].forceUpdateAll();
            }

            this._attributesNeedRefresh = false;
            this._attributesNeedDynamicReset = true;
        }
    }

    dispose() {
        this.geometry.dispose();
        this.material.dispose();
        return this;
    }
}

export default Group;