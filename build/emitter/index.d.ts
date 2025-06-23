import * as THREE from 'three';
import type Group from '../group';
interface ShaderAttribute {
    typedArray: {
        array: number[];
        setVec3Components: (index: number, x: number, y: number, z: number) => void;
        setVec4Components: (index: number, x: number, y: number, z: number, w: number) => void;
        setVec3: (index: number, vec: THREE.Vector3) => void;
    };
    bufferAttribute: {
        updateRange: {
            offset: number;
            count: number;
        };
        needsUpdate: boolean;
    };
}
export interface EmitterOptions {
    type?: number;
    position?: {
        value?: THREE.Vector3;
        spread?: THREE.Vector3;
        spreadClamp?: THREE.Vector3;
        distribution?: number;
        randomise?: boolean;
        radius?: number;
        radiusScale?: THREE.Vector3;
        distributionClamp?: number;
    };
    velocity?: {
        value?: THREE.Vector3;
        spread?: THREE.Vector3;
        distribution?: number;
        randomise?: boolean;
    };
    acceleration?: {
        value?: THREE.Vector3;
        spread?: THREE.Vector3;
        distribution?: number;
        randomise?: boolean;
    };
    radius?: {
        randomise?: boolean;
    };
    drag?: {
        value?: number;
        spread?: number;
        randomise?: boolean;
    };
    rotation?: {
        axis?: THREE.Vector3;
        axisSpread?: THREE.Vector3;
        angle?: number;
        angleSpread?: number;
        static?: boolean;
        center?: THREE.Vector3;
        randomise?: boolean;
    };
    color?: {
        value?: THREE.Color | THREE.Color[];
        spread?: THREE.Vector3 | THREE.Vector3[];
        randomise?: boolean;
    };
    opacity?: {
        value?: number | number[];
        spread?: number | number[];
        randomise?: boolean;
    };
    size?: {
        value?: number | number[];
        spread?: number | number[];
        randomise?: boolean;
    };
    angle?: {
        value?: number | number[];
        spread?: number | number[];
        randomise?: boolean;
    };
    wiggle?: {
        value?: number;
        spread?: number;
    };
    maxAge?: {
        value?: number;
        spread?: number;
    };
    onParticleSpawn?: () => void;
    particleCount?: number;
    duration?: number | null;
    isStatic?: boolean;
    activeMultiplier?: number;
    direction?: number;
    alive?: boolean;
}
interface Position {
    _value: THREE.Vector3;
    _spread: THREE.Vector3;
    _spreadClamp: THREE.Vector3;
    _distribution: number;
    _randomise: boolean;
    _radius: number;
    _radiusScale: THREE.Vector3;
    _distributionClamp: number;
}
interface Velocity {
    _value: THREE.Vector3;
    _spread: THREE.Vector3;
    _distribution: number;
    _randomise: boolean;
}
interface Acceleration {
    _value: THREE.Vector3;
    _spread: THREE.Vector3;
    _distribution: number;
    _randomise: boolean;
}
interface Drag {
    _value: number;
    _spread: number;
    _randomise: boolean;
}
interface Wiggle {
    _value: number;
    _spread: number;
}
interface Rotation {
    _axis: THREE.Vector3;
    _axisSpread: THREE.Vector3;
    _angle: number;
    _angleSpread: number;
    _static: boolean;
    _center: THREE.Vector3;
    _randomise: boolean;
}
interface MaxAge {
    _value: number;
    _spread: number;
}
interface Color {
    _value: THREE.Color | THREE.Color[];
    _spread: THREE.Vector3 | THREE.Vector3[];
    _randomise: boolean;
}
interface Opacity {
    _value: number | number[];
    _spread: number | number[];
    _randomise: boolean;
}
interface Size {
    _value: number | number[];
    _spread: number | number[];
    _randomise: boolean;
}
interface Angle {
    _value: number | number[];
    _spread: number | number[];
    _randomise: boolean;
}
declare class Emitter {
    uuid: string;
    type: number;
    position: Position;
    velocity: Velocity;
    acceleration: Acceleration;
    drag: Drag;
    wiggle: Wiggle;
    rotation: Rotation;
    maxAge: MaxAge;
    color: Color;
    opacity: Opacity;
    size: Size;
    angle: Angle;
    particleCount: number;
    duration: number | null;
    isStatic: boolean;
    activeMultiplier: number;
    direction: number;
    alive: boolean;
    particlesPerSecond: number;
    activationIndex: number;
    attributeOffset: number;
    age: number;
    activeParticleCount: number;
    group: Group | null;
    attributes: Record<string, ShaderAttribute> | null;
    paramsArray: number[] | null;
    resetFlags: {
        [key: string]: boolean;
    };
    updateFlags: {
        [key: string]: boolean;
    };
    updateCounts: {
        [key: string]: number;
    };
    updateMap: {
        [key: string]: string;
    };
    bufferUpdateRanges: {
        [key: string]: {
            min: number;
            max: number;
        };
    };
    attributeKeys: string[] | null;
    attributeCount: number;
    activationEnd: number;
    constructor(options: EmitterOptions);
    _createGetterSetters<T extends object>(propObj: T, propName: string): void;
    _setBufferUpdateRanges(keys: string[]): void;
    _calculatePPSValue(groupMaxAge: number): void;
    _setAttributeOffset(startIndex: number): void;
    _assignValue(prop: string, index: number): void;
    _assignPositionValue(index: number): void;
    _assignForceValue(index: number, attrName: 'velocity' | 'acceleration'): void;
    _assignAbsLifetimeValue(index: number, propName: 'size' | 'opacity'): void;
    _assignAngleValue(index: number): void;
    _assignParamsValue(index: number): void;
    _assignRotationValue(index: number): void;
    _assignColorValue(index: number): void;
    _resetParticle(index: number): void;
    _updateAttributeUpdateRange(attr: string, i: number): void;
    _resetBufferRanges(): void;
    _onRemove(): void;
    _decrementParticleCount(): void;
    _incrementParticleCount(): void;
    _checkParticleAges(start: number, end: number, params: number[], dt: number): void;
    _activateParticles(activationStart: number, activationEnd: number, params: number[], dtPerParticle: number): void;
    update(dt: number): void;
    reset(force?: boolean): this | undefined;
    /**
     * Enables the emitter. If not already enabled, the emitter
     * will start emitting particles.
     *
     * @return {Emitter} This emitter instance.
     */
    enable(): this;
    /**
     * Disables th emitter, but does not instantly remove it's
     * particles fromt the scene. When called, the emitter will be
     * 'switched off' and just stop emitting. Any particle's alive will
     * be allowed to finish their lifecycle.
     *
     * @return {Emitter} This emitter instance.
     */
    disable(): this;
    /**
     * Remove this emitter from it's parent group (if it has been added to one).
     *
     * When called, all particle's belonging to this emitter will be instantly
     * removed from the scene.
     *
     * @return {Emitter} This emitter instance.
     */
    remove(): this;
}
export default Emitter;
