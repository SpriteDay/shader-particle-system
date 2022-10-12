import * as THREE from 'three';
import utils from '../utils/index'
import SPE from '../group/spe'

class Emitter {
    constructor(options) {
        const types = utils.types;
        const lifetimeLength = SPE.valueOverLifetimeLength;

        options = utils.ensureTypedArg(options, types.OBJECT, {});
        options.position = utils.ensureTypedArg(options.position, types.OBJECT, {});
        options.velocity = utils.ensureTypedArg(options.velocity, types.OBJECT, {});
        options.acceleration = utils.ensureTypedArg(options.acceleration, types.OBJECT, {});
        options.radius = utils.ensureTypedArg(options.radius, types.OBJECT, {});
        options.drag = utils.ensureTypedArg(options.drag, types.OBJECT, {});
        options.rotation = utils.ensureTypedArg(options.rotation, types.OBJECT, {});
        options.color = utils.ensureTypedArg(options.color, types.OBJECT, {});
        options.opacity = utils.ensureTypedArg(options.opacity, types.OBJECT, {});
        options.size = utils.ensureTypedArg(options.size, types.OBJECT, {});
        options.angle = utils.ensureTypedArg(options.angle, types.OBJECT, {});
        options.wiggle = utils.ensureTypedArg(options.wiggle, types.OBJECT, {});
        options.maxAge = utils.ensureTypedArg(options.maxAge, types.OBJECT, {});

        if (options.onParticleSpawn) {
            console.warn('onParticleSpawn has been removed. Please set properties directly to alter values at runtime.');
        }

        this.uuid = THREE.MathUtils.generateUUID();
        this.type = utils.ensureTypedArg(options.type, types.NUMBER, SPE.distributions.BOX);

        this.position = {
            _value: utils.ensureInstanceOf(options.position.value, THREE.Vector3, new THREE.Vector3()),
            _spread: utils.ensureInstanceOf(options.position.spread, THREE.Vector3, new THREE.Vector3()),
            _spreadClamp: utils.ensureInstanceOf(options.position.spreadClamp, THREE.Vector3, new THREE.Vector3()),
            _distribution: utils.ensureTypedArg(options.position.distribution, types.NUMBER, this.type),
            _randomise: utils.ensureTypedArg(options.position.randomise, types.BOOLEAN, false),
            _radius: utils.ensureTypedArg(options.position.radius, types.NUMBER, 10),
            _radiusScale: utils.ensureInstanceOf(options.position.radiusScale, THREE.Vector3, new THREE.Vector3(1, 1, 1)),
            _distributionClamp: utils.ensureTypedArg(options.position.distributionClamp, types.NUMBER, 0)
        }

        this.velocity = {
            _value: utils.ensureInstanceOf(options.velocity.value, THREE.Vector3, new THREE.Vector3()),
            _spread: utils.ensureInstanceOf(options.velocity.spread, THREE.Vector3, new THREE.Vector3()),
            _distribution: utils.ensureTypedArg(options.velocity.distribution, types.NUMBER, this.type),
            _randomise: utils.ensureTypedArg(options.position.randomise, types.BOOLEAN, false)
        };

        this.acceleration = {
            _value: utils.ensureInstanceOf(options.acceleration.value, THREE.Vector3, new THREE.Vector3()),
            _spread: utils.ensureInstanceOf(options.acceleration.spread, THREE.Vector3, new THREE.Vector3()),
            _distribution: utils.ensureTypedArg(options.acceleration.distribution, types.NUMBER, this.type),
            _randomise: utils.ensureTypedArg(options.position.randomise, types.BOOLEAN, false)
        };

        this.drag = {
            _value: utils.ensureTypedArg(options.drag.value, types.NUMBER, 0),
            _spread: utils.ensureTypedArg(options.drag.spread, types.NUMBER, 0),
            _randomise: utils.ensureTypedArg(options.position.randomise, types.BOOLEAN, false)
        };

        this.wiggle = {
            _value: utils.ensureTypedArg(options.wiggle.value, types.NUMBER, 0),
            _spread: utils.ensureTypedArg(options.wiggle.spread, types.NUMBER, 0)
        };

        this.rotation = {
            _axis: utils.ensureInstanceOf(options.rotation.axis, THREE.Vector3, new THREE.Vector3(0.0, 1.0, 0.0)),
            _axisSpread: utils.ensureInstanceOf(options.rotation.axisSpread, THREE.Vector3, new THREE.Vector3()),
            _angle: utils.ensureTypedArg(options.rotation.angle, types.NUMBER, 0),
            _angleSpread: utils.ensureTypedArg(options.rotation.angleSpread, types.NUMBER, 0),
            _static: utils.ensureTypedArg(options.rotation.static, types.BOOLEAN, false),
            _center: utils.ensureInstanceOf(options.rotation.center, THREE.Vector3, this.position._value.clone()),
            _randomise: utils.ensureTypedArg(options.position.randomise, types.BOOLEAN, false)
        };

        this.maxAge = {
            _value: utils.ensureTypedArg(options.maxAge.value, types.NUMBER, 2),
            _spread: utils.ensureTypedArg(options.maxAge.spread, types.NUMBER, 0)
        };

        // The following properties can support either single values, or an array of values that change
        // the property over a particle's lifetime (value over lifetime).
        this.color = {
            _value: utils.ensureArrayInstanceOf(options.color.value, THREE.Color, new THREE.Color()),
            _spread: utils.ensureArrayInstanceOf(options.color.spread, THREE.Vector3, new THREE.Vector3()),
            _randomise: utils.ensureTypedArg(options.position.randomise, types.BOOLEAN, false)
        };

        this.opacity = {
            _value: utils.ensureArrayTypedArg(options.opacity.value, types.NUMBER, 1),
            _spread: utils.ensureArrayTypedArg(options.opacity.spread, types.NUMBER, 0),
            _randomise: utils.ensureTypedArg(options.position.randomise, types.BOOLEAN, false)
        };

        this.size = {
            _value: utils.ensureArrayTypedArg(options.size.value, types.NUMBER, 1),
            _spread: utils.ensureArrayTypedArg(options.size.spread, types.NUMBER, 0),
            _randomise: utils.ensureTypedArg(options.position.randomise, types.BOOLEAN, false)
        };

        this.angle = {
            _value: utils.ensureArrayTypedArg(options.angle.value, types.NUMBER, 0),
            _spread: utils.ensureArrayTypedArg(options.angle.spread, types.NUMBER, 0),
            _randomise: utils.ensureTypedArg(options.position.randomise, types.BOOLEAN, false)
        };

        // Assign renaining option values.
        this.particleCount = utils.ensureTypedArg(options.particleCount, types.NUMBER, 100);
        this.duration = utils.ensureTypedArg(options.duration, types.NUMBER, null);
        this.isStatic = utils.ensureTypedArg(options.isStatic, types.BOOLEAN, false);
        this.activeMultiplier = utils.ensureTypedArg(options.activeMultiplier, types.NUMBER, 1);
        this.direction = utils.ensureTypedArg(options.direction, types.NUMBER, 1);

        // Whether this emitter is alive or not.
        this.alive = utils.ensureTypedArg(options.alive, types.BOOLEAN, true);

        // The following properties are set internally and are not
        // user-controllable.
        this.particlesPerSecond = 0;

        // The current particle index for which particles should
        // be marked as active on the next update cycle.
        this.activationIndex = 0;

        // The offset in the typed arrays this emitter's
        // particle's values will start at
        this.attributeOffset = 0;

        // The end of the range in the attribute buffers
        this.attributeEnd = 0;

        // Holds the time the emitter has been alive for.
        this.age = 0.0;

        // Holds the number of currently-alive particles
        this.activeParticleCount = 0.0;

        // Holds a reference to this emitter's group once
        // it's added to one.
        this.group = null;

        // Holds a reference to this emitter's group's attributes object
        // for easier access.
        this.attributes = null;

        // Holds a reference to the params attribute's typed array
        // for quicker access.
        this.paramsArray = null;

        // A set of flags to determine whether particular properties
        // should be re-randomised when a particle is reset.
        //
        // If a `randomise` property is given, this is preferred.
        // Otherwise, it looks at whether a spread value has been
        // given.
        //
        // It allows randomization to be turned off as desired. If
        // all randomization is turned off, then I'd expect a performance
        // boost as no attribute buffers (excluding the `params`)
        // would have to be re-passed to the GPU each frame (since nothing
        // except the `params` attribute would have changed).
        this.resetFlags = {
            // params: utils.ensureTypedArg( options.maxAge.randomise, types.BOOLEAN, !!options.maxAge.spread ) ||
            //     utils.ensureTypedArg( options.wiggle.randomise, types.BOOLEAN, !!options.wiggle.spread ),
            position: utils.ensureTypedArg(options.position.randomise, types.BOOLEAN, false) ||
                utils.ensureTypedArg(options.radius.randomise, types.BOOLEAN, false),
            velocity: utils.ensureTypedArg(options.velocity.randomise, types.BOOLEAN, false),
            acceleration: utils.ensureTypedArg(options.acceleration.randomise, types.BOOLEAN, false) ||
                utils.ensureTypedArg(options.drag.randomise, types.BOOLEAN, false),
            rotation: utils.ensureTypedArg(options.rotation.randomise, types.BOOLEAN, false),
            rotationCenter: utils.ensureTypedArg(options.rotation.randomise, types.BOOLEAN, false),
            size: utils.ensureTypedArg(options.size.randomise, types.BOOLEAN, false),
            color: utils.ensureTypedArg(options.color.randomise, types.BOOLEAN, false),
            opacity: utils.ensureTypedArg(options.opacity.randomise, types.BOOLEAN, false),
            angle: utils.ensureTypedArg(options.angle.randomise, types.BOOLEAN, false)
        };

        this.updateFlags = {};
        this.updateCounts = {};

        // A map to indicate which emitter parameters should update
        // which attribute.
        this.updateMap = {
            maxAge: 'params',
            position: 'position',
            velocity: 'velocity',
            acceleration: 'acceleration',
            drag: 'acceleration',
            wiggle: 'params',
            rotation: 'rotation',
            size: 'size',
            color: 'color',
            opacity: 'opacity',
            angle: 'angle'
        };

        for (var i in this.updateMap) {
            if (this.updateMap.hasOwnProperty(i)) {
                this.updateCounts[this.updateMap[i]] = 0.0;
                this.updateFlags[this.updateMap[i]] = false;
                this._createGetterSetters(this[i], i);
            }
        }

        this.bufferUpdateRanges = {};
        this.attributeKeys = null;
        this.attributeCount = 0;

        // Ensure that the value-over-lifetime property objects above
        // have value and spread properties that are of the same length.
        //
        // Also, for now, make sure they have a length of 3 (min/max arguments here).
        utils.ensureValueOverLifetimeCompliance(this.color, lifetimeLength, lifetimeLength);
        utils.ensureValueOverLifetimeCompliance(this.opacity, lifetimeLength, lifetimeLength);
        utils.ensureValueOverLifetimeCompliance(this.size, lifetimeLength, lifetimeLength);
        utils.ensureValueOverLifetimeCompliance(this.angle, lifetimeLength, lifetimeLength);
    }

    _createGetterSetters(propObj, propName) {
        const self = this;
        Object.keys(propObj).forEach(key => {
            const name = key.replace('_', '');
            Object.defineProperty(propObj, name, {
                get() {
                    return this[key]
                },
                set(value) {
                    const mapName = self.updateMap[propName];
                    const prevValue = this[key];
                    const length = SPE.valueOverLifetimeLength;

                    if (key === '_rotationCenter') {
                        self.updateFlags.rotationCenter = true;
                        this.updateCounts.rotationCenter = 0.0;
                    }
                    else if (prop === '_randomise') {
                        self.resetFlags[mapName] = value;
                    }
                    else {
                        self.updateFlags[mapName] = true;
                        self.updateCounts[mapName] = 0.0;
                    }

                    self.group._updateDefines();

                    this[key] = value;

                    // If the previous value was an array, then make
                    // sure the provided value is interpolated correctly.
                    if (Array.isArray(prevValue)) {
                        utils.ensureValueOverLifetimeCompliance(self[propName], length, length);
                    }
                }
            })
        })
    }

    _setBufferUpdateRanges(keys) {
        this.attributeKeys = keys;
        this.attributeCount = keys.length;

        for (let i = this.attributeCount - 1; i >= 0; --i) {
            this.bufferUpdateRanges[keys[i]] = {
                min: Number.POSITIVE_INFINITY,
                max: Number.NEGATIVE_INFINITY
            };
        }
    }

    _calculatePPSValue(groupMaxAge) {
        const particleCount = this.particleCount;

        // Calculate the `particlesPerSecond` value for this emitter. It's used
        // when determining which particles should die and which should live to
        // see another day. Or be born, for that matter. The "God" property.
        if (this.duration) {
            this.particlesPerSecond = particleCount / (groupMaxAge < this.duration ? groupMaxAge : this.duration);
        }
        else {
            this.particlesPerSecond = particleCount / groupMaxAge;
        }
    }

    _setAttributeOffset(startIndex) {
        this.attributeOffset = startIndex;
        this.activationIndex = startIndex;
        this.activationEnd = startIndex + this.particleCount;
    }

    _assignValue(prop, index) {
        switch (prop) {
            case 'position':
                this._assignPositionValue(index);
                break;

            case 'velocity':
            case 'acceleration':
                this._assignForceValue(index, prop);
                break;

            case 'size':
            case 'opacity':
                this._assignAbsLifetimeValue(index, prop);
                break;

            case 'angle':
                this._assignAngleValue(index);
                break;

            case 'params':
                this._assignParamsValue(index);
                break;

            case 'rotation':
                this._assignRotationValue(index);
                break;

            case 'color':
                this._assignColorValue(index);
                break;
        }
    }

    _assignPositionValue(index) {
        const distributions = SPE.distributions;
        const prop = this.position;
        const attr = this.attributes.position;
        const value = prop._value;
        const spread = prop._spread;
        const distribution = prop.distribution;

        switch (distribution) {
            case distributions.BOX:
                utils.randomVector3(attr, index, value, spread, prop._spreadClamp);
                break;

            case distributions.SPHERE:
                utils.randomVector3OnSphere(attr, index, value, prop._radius, prop._spread.x, prop._radiusScale, prop._spreadClamp.x, prop._distributionClamp || this.particleCount);
                break;

            case distributions.DISC:
                utils.randomVector3OnDisc(attr, index, value, prop._radius, prop._spread.x, prop._radiusScale, prop._spreadClamp.x);
                break;

            case distributions.LINE:
                utils.randomVector3OnLine(attr, index, value, spread);
                break;
        }
    }

    _assignForceValue(index, attrName) {
        const distributions = SPE.distributions;
        const prop = this[attrName];
        const value = prop._value;
        const spread = prop._spread;
        const distribution = prop._distribution;

        let pos, positionX, positionY, positionZ, i;

        switch (distribution) {
            case distributions.BOX:
                utils.randomVector3(this.attributes[attrName], index, value, spread);
                break;

            case distributions.SPHERE:
                pos = this.attributes.position.typedArray.array;
                i = index * 3;

                // Ensure position values aren't zero, otherwise no force will be
                // applied.
                // positionX = utils.zeroToEpsilon( pos[ i ], true );
                // positionY = utils.zeroToEpsilon( pos[ i + 1 ], true );
                // positionZ = utils.zeroToEpsilon( pos[ i + 2 ], true );
                positionX = pos[i];
                positionY = pos[i + 1];
                positionZ = pos[i + 2];

                utils.randomDirectionVector3OnSphere(
                    this.attributes[attrName], index,
                    positionX, positionY, positionZ,
                    this.position._value,
                    prop._value.x,
                    prop._spread.x
                );
                break;

            case distributions.DISC:
                pos = this.attributes.position.typedArray.array;
                i = index * 3;

                // Ensure position values aren't zero, otherwise no force will be
                // applied.
                // positionX = utils.zeroToEpsilon( pos[ i ], true );
                // positionY = utils.zeroToEpsilon( pos[ i + 1 ], true );
                // positionZ = utils.zeroToEpsilon( pos[ i + 2 ], true );
                positionX = pos[i];
                positionY = pos[i + 1];
                positionZ = pos[i + 2];

                utils.randomDirectionVector3OnDisc(
                    this.attributes[attrName], index,
                    positionX, positionY, positionZ,
                    this.position._value,
                    prop._value.x,
                    prop._spread.x
                );
                break;

            case distributions.LINE:
                utils.randomVector3OnLine(this.attributes[attrName], index, value, spread);
                break;
        }
        if (attrName === 'acceleration') {
            var drag = utils.clamp(utils.randomFloat(this.drag._value, this.drag._spread), 0, 1);
            this.attributes.acceleration.typedArray.array[index * 4 + 3] = drag;
        }
    }

    _assignAbsLifetimeValue(index, propName) {
        const array = this.attributes[propName].typedArray;
        const prop = this[propName];
        let value;

        if (utils.arrayValuesAreEqual(prop._value) && utils.arrayValuesAreEqual(prop._spread)) {
            value = Math.abs(utils.randomFloat(prop._value[0], prop._spread[0]));
            array.setVec4Components(index, value, value, value, value);
        }
        else {
            array.setVec4Components(index,
                Math.abs(utils.randomFloat(prop._value[0], prop._spread[0])),
                Math.abs(utils.randomFloat(prop._value[1], prop._spread[1])),
                Math.abs(utils.randomFloat(prop._value[2], prop._spread[2])),
                Math.abs(utils.randomFloat(prop._value[3], prop._spread[3]))
            );
        }
    }

    _assignAngleValue(index) {
        const array = this.attributes.angle.typedArray;
        const prop = this.angle;
        let value;

        if (utils.arrayValuesAreEqual(prop._value) && utils.arrayValuesAreEqual(prop._spread)) {
            value = utils.randomFloat(prop._value[0], prop._spread[0]);
            array.setVec4Components(index, value, value, value, value);
        }
        else {
            array.setVec4Components(index,
                utils.randomFloat(prop._value[0], prop._spread[0]),
                utils.randomFloat(prop._value[1], prop._spread[1]),
                utils.randomFloat(prop._value[2], prop._spread[2]),
                utils.randomFloat(prop._value[3], prop._spread[3])
            );
        }
    }

    _assignParamsValue(index) {
        this.attributes.params.typedArray.setVec4Components(index,
            this.isStatic ? 1 : 0,
            0.0,
            Math.abs(utils.randomFloat(this.maxAge._value, this.maxAge._spread)),
            utils.randomFloat(this.wiggle._value, this.wiggle._spread)
        );
    }

    _assignRotationValue(index) {
        this.attributes.rotation.typedArray.setVec3Components(index,
            utils.getPackedRotationAxis(this.rotation._axis, this.rotation._axisSpread),
            utils.randomFloat(this.rotation._angle, this.rotation._angleSpread),
            this.rotation._static ? 0 : 1
        );

        this.attributes.rotationCenter.typedArray.setVec3(index, this.rotation._center);
    }

    _assignColorValue(index) {
        utils.randomColorAsHex(this.attributes.color, index, this.color._value, this.color._spread);
    }

    _resetParticle(index) {
        const resetFlags = this.resetFlags;
        const updateFlags = this.updateFlags;
        const updateCounts = this.updateCounts;
        const keys = this.attributeKeys;
        let key, updateFlag;

        for (let i = this.attributeCount - 1; i >= 0; --i) {
            key = keys[i];
            updateFlag = updateFlags[key];

            if (resetFlags[key] === true || updateFlag === true) {
                this._assignValue(key, index);
                this._updateAttributeUpdateRange(key, index);

                if (updateFlag === true && updateCounts[key] === this.particleCount) {
                    updateFlags[key] = false;
                    updateCounts[key] = 0.0;
                }
                else if (updateFlag === true) {
                    ++updateCounts[key];
                }
            }
        }
    }

    _updateAttributeUpdateRange(attr, i) {
        const ranges = this.bufferUpdateRanges[attr];

        ranges.min = Math.min(i, ranges.min);
        ranges.max = Math.max(i, ranges.max);
    }

    _resetBufferRanges() {
        const ranges = this.bufferUpdateRanges;
        const keys = this.bufferUpdateKeys;
        let i = this.bufferUpdateCount - 1;
        let key;

        for (i; i >= 0; --i) {
            key = keys[i];
            ranges[key].min = Number.POSITIVE_INFINITY;
            ranges[key].max = Number.NEGATIVE_INFINITY;
        }
    }

    _onRemove() {
        this.particlesPerSecond = 0;
        this.attributeOffset = 0;
        this.activationIndex = 0;
        this.activeParticleCount = 0;
        this.group = null;
        this.attributes = null;
        this.paramsArray = null;
        this.age = 0.0;
    }

    _decrementParticleCount() {
        --this.activeParticleCount;
    }

    _incrementParticleCount() {
        ++this.activeParticleCount;
    }

    _checkParticleAges(start, end, params, dt) {
        for (let i = end - 1, index, maxAge, age, alive; i >= start; --i) {
            index = i * 4;

            alive = params[index];

            if (alive === 0.0) {
                continue;
            }

            // Increment age
            age = params[index + 1];
            maxAge = params[index + 2];

            if (this.direction === 1) {
                age += dt;

                if (age >= maxAge) {
                    age = 0.0;
                    alive = 0.0;
                    this._decrementParticleCount();
                }
            }
            else {
                age -= dt;

                if (age <= 0.0) {
                    age = maxAge;
                    alive = 0.0;
                    this._decrementParticleCount();
                }
            }

            params[index] = alive;
            params[index + 1] = age;

            this._updateAttributeUpdateRange('params', i);
        }
    }

    _activateParticles(activationStart, activationEnd, params, dtPerParticle) {
        const direction = this.direction;

        for (var i = activationStart, index, dtValue; i < activationEnd; ++i) {
            index = i * 4;

            if (params[index] !== 0.0 && this.particleCount !== 1) {
                continue;
            }

            // Increment the active particle count.
            this._incrementParticleCount();

            // Mark the particle as alive.
            params[index] = 1.0;

            // Reset the particle
            this._resetParticle(i);

            // Move each particle being activated to
            // it's actual position in time.
            //
            // This stops particles being 'clumped' together
            // when frame rates are on the lower side of 60fps
            // or not constant (a very real possibility!)
            dtValue = dtPerParticle * (i - activationStart)
            params[index + 1] = direction === -1 ? params[index + 2] - dtValue : dtValue;

            this._updateAttributeUpdateRange('params', i);
        }
    }

    tick(dt) {
        if (this.isStatic) {
            return;
        }

        if (this.paramsArray === null) {
            this.paramsArray = this.attributes.params.typedArray.array;
        }

        const start = this.attributeOffset;
        const end = start + this.particleCount;
        const params = this.paramsArray;
        const ppsDt = this.particlesPerSecond * this.activeMultiplier * dt;
        const activationIndex = this.activationIndex;

        // Reset the buffer update indices.
        this._resetBufferRanges();

        // Increment age for those particles that are alive,
        // and kill off any particles whose age is over the limit.
        this._checkParticleAges(start, end, params, dt);

        // If the emitter is dead, reset the age of the emitter to zero,
        // ready to go again if required
        if (this.alive === false) {
            this.age = 0.0;
            return;
        }

        // If the emitter has a specified lifetime and we've exceeded it,
        // mark the emitter as dead.
        if (this.duration !== null && this.age > this.duration) {
            this.alive = false;
            this.age = 0.0;
            return;
        }

        const activationStart = this.particleCount === 1 ? activationIndex : (activationIndex | 0);
        const activationEnd = Math.min(activationStart + ppsDt, this.activationEnd);
        const activationCount = activationEnd - this.activationIndex | 0;
        const dtPerParticle = activationCount > 0 ? dt / activationCount : 0;

        this._activateParticles(activationStart, activationEnd, params, dtPerParticle);

        // Move the activation window forward, soldier.
        this.activationIndex += ppsDt;

        if (this.activationIndex > end) {
            this.activationIndex = start;
        }

        // Increment the age of the emitter.
        this.age += dt;
    }

    reset(force) {
        this.age = 0.0;
        this.alive = false;

        if (force === true) {
            const start = this.attributeOffset;
            const end = start + this.particleCount;
            const array = this.paramsArray;
            const attr = this.attributes.params.bufferAttribute;

            for (let i = end - 1, index; i >= start; --i) {
                index = i * 4;

                array[index] = 0.0;
                array[index + 1] = 0.0;
            }

            attr.updateRange.offset = 0;
            attr.updateRange.count = -1;
            attr.needsUpdate = true;
        }

        return this;
    }

    /**
     * Enables the emitter. If not already enabled, the emitter
     * will start emitting particles.
     *
     * @return {Emitter} This emitter instance.
     */
    enable() {
        this.alive = true;
        return this;
    }

    /**
     * Disables th emitter, but does not instantly remove it's
     * particles fromt the scene. When called, the emitter will be
     * 'switched off' and just stop emitting. Any particle's alive will
     * be allowed to finish their lifecycle.
     *
     * @return {Emitter} This emitter instance.
     */
    disable() {
        this.alive = false;
        return this;
    };

    /**
     * Remove this emitter from it's parent group (if it has been added to one).
     * Delgates to SPE.group.prototype.removeEmitter().
     *
     * When called, all particle's belonging to this emitter will be instantly
     * removed from the scene.
     *
     * @return {Emitter} This emitter instance.
     */
    remove() {
        'use strict';
        if (this.group !== null) {
            this.group.removeEmitter(this);
        }
        else {
            console.error('Emitter does not belong to a group, cannot remove.');
        }

        return this;
    };
}

export default Emitter;