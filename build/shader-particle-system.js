(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('three')) :
  typeof define === 'function' && define.amd ? define(['three'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global["shader-particle-system"] = factory(global.THREE));
})(this, (function (THREE) { 'use strict';

  function _interopNamespace(e) {
    if (e && e.__esModule) return e;
    var n = Object.create(null);
    if (e) {
      Object.keys(e).forEach(function (k) {
        if (k !== 'default') {
          var d = Object.getOwnPropertyDescriptor(e, k);
          Object.defineProperty(n, k, d.get ? d : {
            enumerable: true,
            get: function () { return e[k]; }
          });
        }
      });
    }
    n["default"] = e;
    return Object.freeze(n);
  }

  var THREE__namespace = /*#__PURE__*/_interopNamespace(THREE);

  function _typeof(obj) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof(obj);
  }
  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }
  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }

  var utils = {
    /**
     * A map of types used by `SPE.utils.ensureTypedArg` and
     * `SPE.utils.ensureArrayTypedArg` to compare types against.
     *
     * @enum {String}
     */
    types: {
      Boolean: 'boolean',
      STRING: 'string',
      NUMBER: 'number',
      OBJECT: 'object'
    },
    /**
     * ensure the given argument adheres to the type requesting,
     * @param  {(boolean|string|number|object)} arg          The value to perform a type-check on.
     * @param  {String} type         The type the `arg` argument should adhere to.
     * @param  {(boolean|string|number|object)} defaultValue A default value to fallback on if the type check fails.
     * @return {(boolean|string|number|object)}              The given value if type check passes, or the default value if it fails.
     */ensureTypedArg: function ensureTypedArg(arg, type, defaultValue) {
      if (_typeof(arg) === type) {
        return arg;
      } else {
        return defaultValue;
      }
    },
    /**
     * ensure the given array's contents ALL adhere to the provided type,
     * @param  {Array|boolean|string|number|object} arg          The array of values to check type of.
     * @param  {String} type         The type that should be adhered to.
     * @param  {(boolean|string|number|object)} defaultValue A default fallback value.
     * @return {(boolean|string|number|object)}              The given value if type check passes, or the default value if it fails.
     */ensureArrayTypedArg: function ensureArrayTypedArg(arg, type, defaultValue) {
      if (Array.isArray(arg)) {
        for (var i = arg.length - 1; i >= 0; --i) {
          if (_typeof(arg[i]) !== type) {
            return defaultValue;
          }
        }
        return arg;
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
     */ensureInstanceOf: function ensureInstanceOf(arg, instance, defaultValue) {
      if (arg !== undefined) {
        return arg;
      } else {
        return defaultValue;
      }
    },
    /**
     * Given an array of values, ensure the instances of all items in the array
     * matches the given instance constructor falling back to a default value if
     * the check fails.
     *
     * If given value isn't an Array, delegates to `SPE.utils.ensureInstanceOf`.
     *
     * @param  {Array|Object} arg          The value to perform the instanceof check on.
     * @param  {Function} instance     The constructor of the instance to check against.
     * @param  {Object} defaultValue A default fallback value if instance check fails
     * @return {Object}              The given value if type check passes, or the default value if it fails.
     */ensureArrayInstanceOf: function ensureArrayInstanceOf(arg, instance, defaultValue) {
      if (Array.isArray(arg)) {
        for (var i = arg.length - 1; i >= 0; --i) {
          if (instance !== undefined && arg[i] instanceof instance === false) {
            return defaultValue;
          }
        }
        return arg;
      }
      return this.ensureInstanceOf(arg, instance, defaultValue);
    },
    /**
     * Ensures that any "value-over-lifetime" properties of an emitter are
     * of the correct length (as dictated by `SPE.valueOverLifetimeLength`).
     *
     * Delegates to `SPE.utils.interpolateArray` for array resizing.
     *
     * If properties aren't arrays, then property values are put into one.
     *
     * @param  {Object} property  The property of an SPE.Emitter instance to check compliance of.
     * @param  {Number} minLength The minimum length of the array to create.
     * @param  {Number} maxLength The maximum length of the array to create.
     */ensureValueOverLifetimeCompliance: function ensureValueOverLifetimeCompliance(property, minLength, maxLength) {
      minLength = minLength || 3;
      maxLength = maxLength || 3;

      // First, ensure both properties are arrays.
      if (Array.isArray(property._value) === false) {
        property._value = [property._value];
      }
      if (Array.isArray(property._spread) === false) {
        property._spread = [property._spread];
      }
      var valueLength = this.clamp(property._value.length, minLength, maxLength),
        spreadLength = this.clamp(property._spread.length, minLength, maxLength),
        desiredLength = Math.max(valueLength, spreadLength);
      if (property._value.length !== desiredLength) {
        property._value = this.interpolateArray(property._value, desiredLength);
      }
      if (property._spread.length !== desiredLength) {
        property._spread = this.interpolateArray(property._spread, desiredLength);
      }
    },
    /**
     * Performs linear interpolation (lerp) on an array.
     *
     * For example, lerping [1, 10], with a `newLength` of 10 will produce [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].
     *
     * Delegates to `SPE.utils.lerpTypeAgnostic` to perform the actual
     * interpolation.
     *
     * @param  {Array} srcArray  The array to lerp.
     * @param  {Number} newLength The length the array should be interpolated to.
     * @return {Array}           The interpolated array.
     */interpolateArray: function interpolateArray(srcArray, newLength) {
      var sourceLength = srcArray.length,
        newArray = [typeof srcArray[0].clone === 'function' ? srcArray[0].clone() : srcArray[0]],
        factor = (sourceLength - 1) / (newLength - 1);
      for (var i = 1; i < newLength - 1; ++i) {
        var f = i * factor,
          before = Math.floor(f),
          after = Math.ceil(f),
          delta = f - before;
        newArray[i] = this.lerpTypeAgnostic(srcArray[before], srcArray[after], delta);
      }
      newArray.push(typeof srcArray[sourceLength - 1].clone === 'function' ? srcArray[sourceLength - 1].clone() : srcArray[sourceLength - 1]);
      return newArray;
    },
    /**
     * Clamp a number to between the given min and max values.
     * @param  {Number} value The number to clamp.
     * @param  {Number} min   The minimum value.
     * @param  {Number} max   The maximum value.
     * @return {Number}       The clamped number.
     */clamp: function clamp(value, min, max) {
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
     */zeroToEpsilon: function zeroToEpsilon(value, randomise) {
      var epsilon = 0.00001,
        result = value;
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
     */lerpTypeAgnostic: function lerpTypeAgnostic(start, end, delta) {
      var types = this.types,
        out;
      if (_typeof(start) === types.NUMBER && _typeof(end) === types.NUMBER) {
        return start + (end - start) * delta;
      } else if (start instanceof THREE__namespace.Vector2 && end instanceof THREE__namespace.Vector2) {
        out = start.clone();
        out.x = this.lerp(start.x, end.x, delta);
        out.y = this.lerp(start.y, end.y, delta);
        return out;
      } else if (start instanceof THREE__namespace.Vector3 && end instanceof THREE__namespace.Vector3) {
        out = start.clone();
        out.x = this.lerp(start.x, end.x, delta);
        out.y = this.lerp(start.y, end.y, delta);
        out.z = this.lerp(start.z, end.z, delta);
        return out;
      } else if (start instanceof THREE__namespace.Vector4 && end instanceof THREE__namespace.Vector4) {
        out = start.clone();
        out.x = this.lerp(start.x, end.x, delta);
        out.y = this.lerp(start.y, end.y, delta);
        out.z = this.lerp(start.z, end.z, delta);
        out.w = this.lerp(start.w, end.w, delta);
        return out;
      } else if (start instanceof THREE__namespace.Color && end instanceof THREE__namespace.Color) {
        out = start.clone();
        out.r = this.lerp(start.r, end.r, delta);
        out.g = this.lerp(start.g, end.g, delta);
        out.b = this.lerp(start.b, end.b, delta);
        return out;
      } else {
        console.warn('Invalid argument types, or argument types do not match:', start, end);
      }
    },
    /**
     * Perform a linear interpolation operation on two numbers.
     * @param  {Number} start The start value.
     * @param  {Number} end   The end value.
     * @param  {Number} delta The position to interpolate to.
     * @return {Number}       The result of the lerp operation.
     */lerp: function lerp(start, end, delta) {
      return start + (end - start) * delta;
    },
    /**
     * Rounds a number to a nearest multiple.
     *
     * @param  {Number} n        The number to round.
     * @param  {Number} multiple The multiple to round to.
     * @return {Number}          The result of the round operation.
     */roundToNearestMultiple: function roundToNearestMultiple(n, multiple) {
      var remainder = 0;
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
     */arrayValuesAreEqual: function arrayValuesAreEqual(array) {
      for (var i = 0; i < array.length - 1; ++i) {
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
    randomFloat: function randomFloat(base, spread) {
      return base + spread * (Math.random() - 0.5);
    },
    /**
     * Given an SPE.ShaderAttribute instance, and letious other settings,
     * assign values to the attribute's array in a `vec3` format.
     *
     * @param  {Object} attribute   The instance of SPE.ShaderAttribute to save the result to.
     * @param  {Number} index       The offset in the attribute's TypedArray to save the result from.
     * @param  {Object} base        THREE.Vector3 instance describing the start value.
     * @param  {Object} spread      THREE.Vector3 instance describing the random letiance to apply to the start value.
     * @param  {Object} spreadClamp THREE.Vector3 instance describing the multiples to clamp the randomness to.
     */randomVector3: function randomVector3(attribute, index, base, spread, spreadClamp) {
      var x = base.x + (Math.random() * spread.x - spread.x * 0.5),
        y = base.y + (Math.random() * spread.y - spread.y * 0.5),
        z = base.z + (Math.random() * spread.z - spread.z * 0.5);

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
     * Given an SPE.Shader attribute instance, and letious other settings,
     * assign Color values to the attribute.
     * @param  {Object} attribute The instance of SPE.ShaderAttribute to save the result to.
     * @param  {Number} index     The offset in the attribute's TypedArray to save the result from.
     * @param  {Object} base      THREE.Color instance describing the start color.
     * @param  {Object} spread    THREE.Vector3 instance describing the random letiance to apply to the start color.
     */randomColor: function randomColor(attribute, index, base, spread) {
      var r = base.r + Math.random() * spread.x,
        g = base.g + Math.random() * spread.y,
        b = base.b + Math.random() * spread.z;
      r = this.clamp(r, 0, 1);
      g = this.clamp(g, 0, 1);
      b = this.clamp(b, 0, 1);
      attribute.typedArray.setVec3Components(index, r, g, b);
    },
    randomColorAsHex: function () {
      var workingColor = new THREE__namespace.Color();

      /**
       * Assigns a random color value, encoded as a hex value in decimal
       * format, to a SPE.ShaderAttribute instance.
       * @param  {Object} attribute The instance of SPE.ShaderAttribute to save the result to.
       * @param  {Number} index     The offset in the attribute's TypedArray to save the result from.
       * @param  {Object} base      THREE.Color instance describing the start color.
       * @param  {Object} spread    THREE.Vector3 instance describing the random letiance to apply to the start color.
       */
      return function (attribute, index, base, spread) {
        var numItems = base.length,
          colors = [];
        for (var i = 0; i < numItems; ++i) {
          var spreadVector = spread[i];
          workingColor.copy(base[i]);
          workingColor.r += Math.random() * spreadVector.x - spreadVector.x * 0.5;
          workingColor.g += Math.random() * spreadVector.y - spreadVector.y * 0.5;
          workingColor.b += Math.random() * spreadVector.z - spreadVector.z * 0.5;
          workingColor.r = this.clamp(workingColor.r, 0, 1);
          workingColor.g = this.clamp(workingColor.g, 0, 1);
          workingColor.b = this.clamp(workingColor.b, 0, 1);
          colors.push(workingColor.getHex());
        }
        attribute.typedArray.setVec4Components(index, colors[0], colors[1], colors[2], colors[3]);
      };
    }(),
    /**
     * Given an SPE.ShaderAttribute instance, and letious other settings,
     * assign values to the attribute's array in a `vec3` format.
     *
     * @param  {Object} attribute   The instance of SPE.ShaderAttribute to save the result to.
     * @param  {Number} index       The offset in the attribute's TypedArray to save the result from.
     * @param  {Object} start       THREE.Vector3 instance describing the start line position.
     * @param  {Object} end         THREE.Vector3 instance describing the end line position.
     */randomVector3OnLine: function randomVector3OnLine(attribute, index, start, end) {
      var pos = start.clone();
      pos.lerp(end, Math.random());
      attribute.typedArray.setVec3Components(index, pos.x, pos.y, pos.z);
    },
    /**
     * Given an SPE.Shader attribute instance, and letious other settings,
     * assign Color values to the attribute.
     * @param  {Object} attribute The instance of SPE.ShaderAttribute to save the result to.
     * @param  {Number} index     The offset in the attribute's TypedArray to save the result from.
     * @param  {Object} base      THREE.Color instance describing the start color.
     * @param  {Object} spread    THREE.Vector3 instance describing the random letiance to apply to the start color.
     */
    /**
     * Assigns a random vector 3 value to an SPE.ShaderAttribute instance, projecting the
     * given values onto a sphere.
     *
     * @param  {Object} attribute The instance of SPE.ShaderAttribute to save the result to.
     * @param  {Number} index     The offset in the attribute's TypedArray to save the result from.
     * @param  {Object} base              THREE.Vector3 instance describing the origin of the transform.
     * @param  {Number} radius            The radius of the sphere to project onto.
     * @param  {Number} radiusSpread      The amount of randomness to apply to the projection result
     * @param  {Object} radiusScale       THREE.Vector3 instance describing the scale of each axis of the sphere.
     * @param  {Number} radiusSpreadClamp What numeric multiple the projected value should be clamped to.
     */
    randomVector3OnSphere: function randomVector3OnSphere(attribute, index, base, radius, radiusSpread, radiusScale, radiusSpreadClamp, distributionClamp) {
      var depth = 2 * Math.random() - 1,
        t = 6.2832 * Math.random(),
        r = Math.sqrt(1 - depth * depth),
        rand = this.randomFloat(radius, radiusSpread),
        x = 0,
        y = 0,
        z = 0;
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
    seededRandom: function seededRandom(seed) {
      var x = Math.sin(seed) * 10000;
      return x - (x | 0);
    },
    /**
     * Assigns a random vector 3 value to an SPE.ShaderAttribute instance, projecting the
     * given values onto a 2d-disc.
     *
     * @param  {Object} attribute The instance of SPE.ShaderAttribute to save the result to.
     * @param  {Number} index     The offset in the attribute's TypedArray to save the result from.
     * @param  {Object} base              THREE.Vector3 instance describing the origin of the transform.
     * @param  {Number} radius            The radius of the sphere to project onto.
     * @param  {Number} radiusSpread      The amount of randomness to apply to the projection result
     * @param  {Object} radiusScale       THREE.Vector3 instance describing the scale of each axis of the disc. The z-component is ignored.
     * @param  {Number} radiusSpreadClamp What numeric multiple the projected value should be clamped to.
     */randomVector3OnDisc: function randomVector3OnDisc(attribute, index, base, radius, radiusSpread, radiusScale, radiusSpreadClamp) {
      var t = 6.2832 * Math.random(),
        rand = Math.abs(this.randomFloat(radius, radiusSpread)),
        x = 0,
        y = 0,
        z = 0;
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
    randomDirectionVector3OnSphere: function () {
      var v = new THREE__namespace.Vector3();

      /**
       * Given an SPE.ShaderAttribute instance, create a direction vector from the given
       * position, using `speed` as the magnitude. Values are saved to the attribute.
       *
       * @param  {Object} attribute       The instance of SPE.ShaderAttribute to save the result to.
       * @param  {Number} index           The offset in the attribute's TypedArray to save the result from.
       * @param  {Number} posX            The particle's x coordinate.
       * @param  {Number} posY            The particle's y coordinate.
       * @param  {Number} posZ            The particle's z coordinate.
       * @param  {Object} emitterPosition THREE.Vector3 instance describing the emitter's base position.
       * @param  {Number} speed           The magnitude to apply to the vector.
       * @param  {Number} speedSpread     The amount of randomness to apply to the magnitude.
       */
      return function (attribute, index, posX, posY, posZ, emitterPosition, speed, speedSpread) {
        v.copy(emitterPosition);
        v.x -= posX;
        v.y -= posY;
        v.z -= posZ;
        v.normalize().multiplyScalar(-this.randomFloat(speed, speedSpread));
        attribute.typedArray.setVec3Components(index, v.x, v.y, v.z);
      };
    }(),
    randomDirectionVector3OnDisc: function () {
      var v = new THREE__namespace.Vector3();

      /**
       * Given an SPE.ShaderAttribute instance, create a direction vector from the given
       * position, using `speed` as the magnitude. Values are saved to the attribute.
       *
       * @param  {Object} attribute       The instance of SPE.ShaderAttribute to save the result to.
       * @param  {Number} index           The offset in the attribute's TypedArray to save the result from.
       * @param  {Number} posX            The particle's x coordinate.
       * @param  {Number} posY            The particle's y coordinate.
       * @param  {Number} posZ            The particle's z coordinate.
       * @param  {Object} emitterPosition THREE.Vector3 instance describing the emitter's base position.
       * @param  {Number} speed           The magnitude to apply to the vector.
       * @param  {Number} speedSpread     The amount of randomness to apply to the magnitude.
       */
      return function (attribute, index, posX, posY, posZ, emitterPosition, speed, speedSpread) {
        v.copy(emitterPosition);
        v.x -= posX;
        v.y -= posY;
        v.z -= posZ;
        v.normalize().multiplyScalar(-this.randomFloat(speed, speedSpread));
        attribute.typedArray.setVec3Components(index, v.x, v.y, 0);
      };
    }(),
    getPackedRotationAxis: function () {
      var v = new THREE__namespace.Vector3(),
        vSpread = new THREE__namespace.Vector3(),
        c = new THREE__namespace.Color(),
        addOne = new THREE__namespace.Vector3(1, 1, 1);

      /**
       * Given a rotation axis, and a rotation axis spread vector,
       * calculate a randomised rotation axis, and pack it into
       * a hexadecimal value represented in decimal form.
       * @param  {Object} axis       THREE.Vector3 instance describing the rotation axis.
       * @param  {Object} axisSpread THREE.Vector3 instance describing the amount of randomness to apply to the rotation axis.
       * @return {Number}            The packed rotation axis, with randomness.
       */
      return function (axis, axisSpread) {
        v.copy(axis).normalize();
        vSpread.copy(axisSpread).normalize();
        v.x += -axisSpread.x * 0.5 + Math.random() * axisSpread.x;
        v.y += -axisSpread.y * 0.5 + Math.random() * axisSpread.y;
        v.z += -axisSpread.z * 0.5 + Math.random() * axisSpread.z;

        // v.x = Math.abs( v.x );
        // v.y = Math.abs( v.y );
        // v.z = Math.abs( v.z );

        v.normalize().add(addOne).multiplyScalar(0.5);
        c.setRGB(v.x, v.y, v.z);
        return c.getHex();
      };
    }()
  };

  var SPE = {
    /**
     * A map of supported distribution types
     * @enum {Number}
     */
    distributions: {
      /**
       * Values will be distributed within a box.
       * @type {Number}
       */
      BOX: 1,
      /**
       * Values will be distributed on a sphere.
       * @type {Number}
       */
      SPHERE: 2,
      /**
       * Values will be distributed on a 2d-disc shape.
       * @type {Number}
       */
      DISC: 3,
      /**
       * Values will be distributed along a line.
       * @type {Number}
       */
      LINE: 4
    },
    /**
     * Set this value to however many 'steps' you
     * want value-over-lifetime properties to have.
     *
     * It's adjustable to fix an interpolation problem:
     *
     * Assuming you specify an opacity value as [0, 1, 0]
     *      and the `valueOverLifetimeLength` is 4, then the
     *      opacity value array will be reinterpolated to
     *      be [0, 0.66, 0.66, 0].
     *   This isn't ideal, as particles would never reach
     *   full opacity.
     *
     * NOTE:
     *     This property affects the length of ALL
     *       value-over-lifetime properties for ALL
     *       emitters and ALL groups.
     *
     *     Only values >= 3 && <= 4 are allowed.
     *
     * @type {Number}
     */
    valueOverLifetimeLength: 4
  };

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
   */var TypedArrayHelper = /*#__PURE__*/function () {
    function TypedArrayHelper(TypedArrayConstructor, size, componentSize, indexOffset) {
      _classCallCheck(this, TypedArrayHelper);
      this.componentSize = componentSize || 1;
      this.size = size || 1;
      this.TypedArrayConstructor = TypedArrayConstructor || Float32Array;
      this.array = new TypedArrayConstructor(size * this.componentSize);
      this.indexOffset = indexOffset || 0;
    }
    _createClass(TypedArrayHelper, [{
      key: "setSize",
      value: function setSize(size, noComponentMultiply) {
        var currentArraySize = this.array.length;
        if (!noComponentMultiply) {
          size = size * this.componentSize;
        }
        if (size < currentArraySize) {
          return this.shrink(size);
        } else if (size > currentArraySize) {
          return this.grow(size);
        }
        console.info('TypedArray is already of size:', size + '.', 'Will not resize.');
      }

      /**
       * Shrinks the internal array.
       *
       * @param  {Number} size The new size of the typed array. Must be smaller than `this.array.length`.
       * @return {TypedArrayHelper}      Instance of this class.
       */
    }, {
      key: "shrink",
      value: function shrink(size) {
        this.array = this.array.subarray(0, size);
        this.size = size;
        return this;
      }

      /**
       * Grows the internal array.
       * @param  {Number} size The new size of the typed array. Must be larger than `this.array.length`.
       * @return {TypedArrayHelper}      Instance of this class.
       */
    }, {
      key: "grow",
      value: function grow(size) {
        var newArray = new this.TypedArrayConstructor(size);
        newArray.set(this.array);
        this.array = newArray;
        this.size = size;
        return this;
      }

      /**
       * Perform a splice operation on this array's buffer.
       * @param  {Number} start The start index of the splice. Will be multiplied by the number of components for this attribute.
       * @param  {Number} end The end index of the splice. Will be multiplied by the number of components for this attribute.
       * @returns {Object} The TypedArrayHelper instance.
       */
    }, {
      key: "splice",
      value: function splice(start, end) {
        var startOffset = start * this.componentSize;
        var endOffset = end * this.componentSize;
        var data = [];
        var size = this.array.length;
        for (var i = 0; i < size; ++i) {
          if (i < startOffset || i > endOffset) {
            data.push(this.array[i]);
          }
        }
        this.setFromArray(0, data);
        return this;
      }

      /**
       * Copies from the given TypedArray into this one, using the index argument
       * as the start position. Alias for `TypedArray.set`. Will automatically resize
       * if the given source array is of a larger size than the internal array.
       *
       * @param {Number} index      The start position from which to copy into this array.
       * @param {TypedArray} array The array from which to copy; the source array.
       * @return {TypedArrayHelper} Instance of this class.
       */
    }, {
      key: "setFromArray",
      value: function setFromArray(index, array) {
        var sourceArraySize = array.length;
        var newSize = index + sourceArraySize;
        if (newSize > this.array.length) {
          this.grow(newSize);
        } else if (newSize < this.array.length) {
          this.shrink(newSize);
        }
        this.array.set(array, this.indexOffset + index);
        return this;
      }

      /**
       * Set a Vector2 value at `index`.
       *
       * @param {Number} index The index at which to set the vec2 values from.
       * @param {Vector2} vec2  Any object that has `x` and `y` properties.
       * @return {TypedArrayHelper} Instance of this class.
       */
    }, {
      key: "setVec2",
      value: function setVec2(index, vec2) {
        return this.setVec2Components(index, vec2.x, vec2.y);
      }

      /**
       * Set a Vector2 value using raw components.
       *
       * @param {Number} index The index at which to set the vec2 values from.
       * @param {Number} x     The Vec2's `x` component.
       * @param {Number} y     The Vec2's `y` component.
       * @return {TypedArrayHelper} Instance of this class.
       */
    }, {
      key: "setVec2Components",
      value: function setVec2Components(index, x, y) {

        var array = this.array,
          i = this.indexOffset + index * this.componentSize;
        array[i] = x;
        array[i + 1] = y;
        return this;
      }
    }, {
      key: "setVec3",
      value:
      /**
       * Set a Vector3 value at `index`.
       *
       * @param {Number} index The index at which to set the vec3 values from.
       * @param {Vector3} vec2  Any object that has `x`, `y`, and `z` properties.
       * @return {TypedArrayHelper} Instance of this class.
       */
      function setVec3(index, vec3) {
        return this.setVec3Components(index, vec3.x, vec3.y, vec3.z);
      }

      /**
       * Set a Vector3 value using raw components.
       *
       * @param {Number} index The index at which to set the vec3 values from.
       * @param {Number} x     The Vec3's `x` component.
       * @param {Number} y     The Vec3's `y` component.
       * @param {Number} z     The Vec3's `z` component.
       * @return {TypedArrayHelper} Instance of this class.
       */
    }, {
      key: "setVec3Components",
      value: function setVec3Components(index, x, y, z) {
        var array = this.array;
        var i = this.indexOffset + index * this.componentSize;
        array[i] = x;
        array[i + 1] = y;
        array[i + 2] = z;
        return this;
      }

      /**
       * Set a Vector4 value at `index`.
       *
       * @param {Number} index The index at which to set the vec4 values from.
       * @param {Vector4} vec2  Any object that has `x`, `y`, `z`, and `w` properties.
       * @return {TypedArrayHelper} Instance of this class.
       */
    }, {
      key: "setVec4",
      value: function setVec4(index, vec4) {
        return this.setVec4Components(index, vec4.x, vec4.y, vec4.z, vec4.w);
      }

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
    }, {
      key: "setVec4Components",
      value: function setVec4Components(index, x, y, z, w) {
        var array = this.array;
        var i = this.indexOffset + index * this.componentSize;
        array[i] = x;
        array[i + 1] = y;
        array[i + 2] = z;
        array[i + 3] = w;
        return this;
      }

      /**
       * Set a Matrix3 value at `index`.
       *
       * @param {Number} index The index at which to set the matrix values from.
       * @param {Matrix3} mat3 The 3x3 matrix to set from. Must have a TypedArray property named `elements` to copy from.
       * @return {TypedArrayHelper} Instance of this class.
       */
    }, {
      key: "setMat3",
      value: function setMat3(index, mat3) {
        return this.setFromArray(this.indexOffset + index * this.componentSize, mat3.elements);
      }

      /**
       * Set a Matrix4 value at `index`.
       *
       * @param {Number} index The index at which to set the matrix values from.
       * @param {Matrix4} mat3 The 4x4 matrix to set from. Must have a TypedArray property named `elements` to copy from.
       * @return {TypedArrayHelper} Instance of this class.
       */
    }, {
      key: "setMat4",
      value: function setMat4(index, mat4) {
        return this.setFromArray(this.indexOffset + index * this.componentSize, mat4.elements);
      }

      /**
       * Set a Color value at `index`.
       *
       * @param {Number} index The index at which to set the vec3 values from.
       * @param {Color} color  Any object that has `r`, `g`, and `b` properties.
       * @return {TypedArrayHelper} Instance of this class.
       */
    }, {
      key: "setColor",
      value: function setColor(index, color) {
        return this.setVec3Components(index, color.r, color.g, color.b);
      }

      /**
       * Set a Number value at `index`.
       *
       * @param {Number} index The index at which to set the vec3 values from.
       * @param {Number} numericValue  The number to assign to this index in the array.
       * @return {TypedArrayHelper} Instance of this class.
       */
    }, {
      key: "setNumber",
      value: function setNumber(index, numericValue) {
        this.array[this.indexOffset + index * this.componentSize] = numericValue;
        return this;
      }

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
    }, {
      key: "getValueAtIndex",
      value: function getValueAtIndex(index) {
        return this.array[this.indexOffset + index];
      }

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
    }, {
      key: "getComponentValueAtIndex",
      value: function getComponentValueAtIndex(index) {
        return this.array.subarray(this.indexOffset + index * this.componentSize);
      }
    }]);
    return TypedArrayHelper;
  }();

  var ShaderAttribute = /*#__PURE__*/function () {
    function ShaderAttribute(type, dynamicBuffer, arrayType) {
      _classCallCheck(this, ShaderAttribute);
      var typeMap = ShaderAttribute.typeSizeMap;
      this.type = typeof type === 'string' && typeMap.hasOwnProperty(type) ? type : 'f';
      this.componentSize = typeMap[this.type];
      this.arrayType = arrayType || Float32Array;
      this.typedArray = null;
      this.bufferAttribute = null;
      this.dynamicBuffer = !!dynamicBuffer;
      this.updateMin = 0;
      this.updateMax = 0;
    }
    _createClass(ShaderAttribute, [{
      key: "setUpdateRange",
      value:
      /**
       * Calculate the minimum and maximum update range for this buffer attribute using
       * component size independant min and max values.
       *
       * @param {Number} min The start of the range to mark as needing an update.
       * @param {Number} max The end of the range to mark as needing an update.
       */
      function setUpdateRange(min, max) {
        this.updateMin = Math.min(min * this.componentSize, this.updateMin * this.componentSize);
        this.updateMax = Math.max(max * this.componentSize, this.updateMax * this.componentSize);
      }

      /**
       * Calculate the number of indices that this attribute should mark as needing
       * updating. Also marks the attribute as needing an update.
       */
    }, {
      key: "flagUpdate",
      value: function flagUpdate() {
        var attr = this.bufferAttribute;
        var range = attr.updateRange;
        range.offset = this.updateMin;
        range.count = Math.min(this.updateMax - this.updateMin + this.componentSize, this.typedArray.array.length);
        attr.needsUpdate = true;
      }

      /**
       * Reset the index update counts for this attribute
       */
    }, {
      key: "resetUpdateRange",
      value: function resetUpdateRange() {
        this.updateMin = 0;
        this.updateMax = 0;
      }
    }, {
      key: "resetDynamic",
      value: function resetDynamic() {
        this.bufferAttribute.useage = this.dynamicBuffer ? THREE__namespace.DynamicDrawUsage : THREE__namespace.StaticDrawUsage;
      }

      /**
       * Perform a splice operation on this attribute's buffer.
       * @param  {Number} start The start index of the splice. Will be multiplied by the number of components for this attribute.
       * @param  {Number} end The end index of the splice. Will be multiplied by the number of components for this attribute.
       */
    }, {
      key: "splice",
      value: function splice(start, end) {
        this.typedArray.splice(start, end);
        this.forceUpdateAll();
      }
    }, {
      key: "forceUpdateAll",
      value: function forceUpdateAll() {
        this.bufferAttribute.array = this.typedArray.array;
        this.bufferAttribute.updateRange.offset = 0;
        this.bufferAttribute.updateRange.count = -1;
        this.bufferAttribute.usage = THREE__namespace.StaticDrawUsage;
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
    }, {
      key: "_ensureTypedArray",
      value: function _ensureTypedArray(size) {
        if (this.typedArray !== null && this.typedArray.size === size * this.componentSize) ; else if (this.typedArray !== null && this.typedArray.size !== size) {
          this.typedArray.setSize(size);
        } else if (this.typedArray === null) {
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
    }, {
      key: "_createBufferAttribute",
      value: function _createBufferAttribute(size) {
        this._ensureTypedArray(size);
        if (this.bufferAttribute !== null) {
          this.bufferAttribute.array = this.typedArray.array;
          this.bufferAttribute.count = this.bufferAttribute.array.length / this.bufferAttribute.itemSize;
          this.bufferAttribute.needsUpdate = true;
          return;
        }
        this.bufferAttribute = new THREE__namespace.BufferAttribute(this.typedArray.array, this.componentSize);
        this.bufferAttribute.usage = this.dynamicBuffer ? THREE__namespace.DynamicDrawUsage : THREE__namespace.StaticDrawUsage;
      }

      /**
       * Returns the length of the typed array associated with this attribute.
       * @return {Number} The length of the typed array. Will be 0 if no typed array has been created yet.
       */
    }, {
      key: "getLength",
      value: function getLength() {
        if (this.typedArray === null) {
          return 0;
        }
        return this.typedArray.array.length;
      }
    }]);
    return ShaderAttribute;
  }();
  ShaderAttribute.typeSizeMap = {
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
  };

  var shaderChunks = {
    // Register color-packing define statements.
    defines: ['#define PACKED_COLOR_SIZE 256.0', '#define PACKED_COLOR_DIVISOR 255.0'].join('\n'),
    // All uniforms used by vertex / fragment shaders
    uniforms: ['uniform float deltaTime;', 'uniform float runTime;', 'uniform sampler2D tex;', 'uniform vec4 textureAnimation;', 'uniform float scale;'].join('\n'),
    // All attributes used by the vertex shader.
    //
    // Note that some attributes are squashed into other ones:
    //
    // * Drag is acceleration.w
    attributes: ['attribute vec4 acceleration;', 'attribute vec3 velocity;', 'attribute vec4 rotation;', 'attribute vec3 rotationCenter;', 'attribute vec4 params;', 'attribute vec4 size;', 'attribute vec4 angle;', 'attribute vec4 color;', 'attribute vec4 opacity;'].join('\n'),
    //
    varyings: ['varying vec4 vColor;', '#ifdef SHOULD_ROTATE_TEXTURE', '    varying float vAngle;', '#endif', '#ifdef SHOULD_CALCULATE_SPRITE', '    varying vec4 vSpriteSheet;', '#endif'].join('\n'),
    // Branch-avoiding comparison fns
    // - http://theorangeduck.com/page/avoiding-shader-conditionals
    branchAvoidanceFunctions: ['float when_gt(float x, float y) {', '    return max(sign(x - y), 0.0);', '}', 'float when_lt(float x, float y) {', '    return min( max(1.0 - sign(x - y), 0.0), 1.0 );', '}', 'float when_eq( float x, float y ) {', '    return 1.0 - abs( sign( x - y ) );', '}', 'float when_ge(float x, float y) {', '  return 1.0 - when_lt(x, y);', '}', 'float when_le(float x, float y) {', '  return 1.0 - when_gt(x, y);', '}',
    // Branch-avoiding logical operators
    // (to be used with above comparison fns)
    'float and(float a, float b) {', '    return a * b;', '}', 'float or(float a, float b) {', '    return min(a + b, 1.0);', '}'].join('\n'),
    // From:
    // - http://stackoverflow.com/a/12553149
    // - https://stackoverflow.com/questions/22895237/hexadecimal-to-rgb-values-in-webgl-shader
    unpackColor: ['vec3 unpackColor( in float hex ) {', '   vec3 c = vec3( 0.0 );', '   float r = mod( (hex / PACKED_COLOR_SIZE / PACKED_COLOR_SIZE), PACKED_COLOR_SIZE );', '   float g = mod( (hex / PACKED_COLOR_SIZE), PACKED_COLOR_SIZE );', '   float b = mod( hex, PACKED_COLOR_SIZE );', '   c.r = r / PACKED_COLOR_DIVISOR;', '   c.g = g / PACKED_COLOR_DIVISOR;', '   c.b = b / PACKED_COLOR_DIVISOR;', '   return c;', '}'].join('\n'),
    unpackRotationAxis: ['vec3 unpackRotationAxis( in float hex ) {', '   vec3 c = vec3( 0.0 );', '   float r = mod( (hex / PACKED_COLOR_SIZE / PACKED_COLOR_SIZE), PACKED_COLOR_SIZE );', '   float g = mod( (hex / PACKED_COLOR_SIZE), PACKED_COLOR_SIZE );', '   float b = mod( hex, PACKED_COLOR_SIZE );', '   c.r = r / PACKED_COLOR_DIVISOR;', '   c.g = g / PACKED_COLOR_DIVISOR;', '   c.b = b / PACKED_COLOR_DIVISOR;', '   c *= vec3( 2.0 );', '   c -= vec3( 1.0 );', '   return c;', '}'].join('\n'),
    floatOverLifetime: ['float getFloatOverLifetime( in float positionInTime, in vec4 attr ) {', '    highp float value = 0.0;', '    float deltaAge = positionInTime * float( VALUE_OVER_LIFETIME_LENGTH - 1 );', '    float fIndex = 0.0;', '    float shouldApplyValue = 0.0;',
    // This might look a little odd, but it's faster in the testing I've done than using branches.
    // Uses basic maths to avoid branching.
    //
    // Take a look at the branch-avoidance functions defined above,
    // and be sure to check out The Orange Duck site where I got this
    // from (link above).

    // Fix for static emitters (age is always zero).
    '    value += attr[ 0 ] * when_eq( deltaAge, 0.0 );', '', '    for( int i = 0; i < VALUE_OVER_LIFETIME_LENGTH - 1; ++i ) {', '       fIndex = float( i );', '       shouldApplyValue = and( when_gt( deltaAge, fIndex ), when_le( deltaAge, fIndex + 1.0 ) );', '       value += shouldApplyValue * mix( attr[ i ], attr[ i + 1 ], deltaAge - fIndex );', '    }', '', '    return value;', '}'].join('\n'),
    colorOverLifetime: ['vec3 getColorOverLifetime( in float positionInTime, in vec3 color1, in vec3 color2, in vec3 color3, in vec3 color4 ) {', '    vec3 value = vec3( 0.0 );', '    value.x = getFloatOverLifetime( positionInTime, vec4( color1.x, color2.x, color3.x, color4.x ) );', '    value.y = getFloatOverLifetime( positionInTime, vec4( color1.y, color2.y, color3.y, color4.y ) );', '    value.z = getFloatOverLifetime( positionInTime, vec4( color1.z, color2.z, color3.z, color4.z ) );', '    return value;', '}'].join('\n'),
    paramFetchingFunctions: ['float getAlive() {', '   return params.x;', '}', 'float getAge() {', '   return params.y;', '}', 'float getMaxAge() {', '   return params.z;', '}', 'float getWiggle() {', '   return params.w;', '}'].join('\n'),
    forceFetchingFunctions: ['vec4 getPosition( in float age ) {', '   return modelViewMatrix * vec4( position, 1.0 );', '}', 'vec3 getVelocity( in float age ) {', '   return velocity * age;', '}', 'vec3 getAcceleration( in float age ) {', '   return acceleration.xyz * age;', '}'].join('\n'),
    rotationFunctions: [
    // Huge thanks to:
    // - http://www.neilmendoza.com/glsl-rotation-about-an-arbitrary-axis/
    '#ifdef SHOULD_ROTATE_PARTICLES', '   mat4 getRotationMatrix( in vec3 axis, in float angle) {', '       axis = normalize(axis);', '       float s = sin(angle);', '       float c = cos(angle);', '       float oc = 1.0 - c;', '', '       return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,', '                   oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,', '                   oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,', '                   0.0,                                0.0,                                0.0,                                1.0);', '   }', '', '   vec3 getRotation( in vec3 pos, in float positionInTime ) {', '      if( rotation.y == 0.0 ) {', '           return pos;', '      }', '', '      vec3 axis = unpackRotationAxis( rotation.x );', '      vec3 center = rotationCenter;', '      vec3 translated;', '      mat4 rotationMatrix;', '      float angle = 0.0;', '      angle += when_eq( rotation.z, 0.0 ) * rotation.y;', '      angle += when_gt( rotation.z, 0.0 ) * mix( 0.0, rotation.y, positionInTime );', '      translated = rotationCenter - pos;', '      rotationMatrix = getRotationMatrix( axis, angle );', '      return center - vec3( rotationMatrix * vec4( translated, 0.0 ) );', '   }', '#endif'].join('\n'),
    // Fragment chunks
    rotateTexture: ['    vec2 vUv = vec2( gl_PointCoord.x, 1.0 - gl_PointCoord.y );', '', '    #ifdef SHOULD_ROTATE_TEXTURE', '       float x = gl_PointCoord.x - 0.5;', '       float y = 1.0 - gl_PointCoord.y - 0.5;', '       float c = cos( -vAngle );', '       float s = sin( -vAngle );', '       vUv = vec2( c * x + s * y + 0.5, c * y - s * x + 0.5 );', '    #endif', '',
    // Spritesheets overwrite angle calculations.
    '    #ifdef SHOULD_CALCULATE_SPRITE', '        float framesX = vSpriteSheet.x;', '        float framesY = vSpriteSheet.y;', '        float columnNorm = vSpriteSheet.z;', '        float rowNorm = vSpriteSheet.w;', '        vUv.x = gl_PointCoord.x * framesX + columnNorm;', '        vUv.y = 1.0 - (gl_PointCoord.y * framesY + rowNorm);', '    #endif', '', '    vec4 rotatedTexture = texture2D( tex, vUv );'].join('\n')
  };

  var shaders = {
    vertex: [shaderChunks.defines, shaderChunks.uniforms, shaderChunks.attributes, shaderChunks.varyings, THREE__namespace.ShaderChunk.common, THREE__namespace.ShaderChunk.logdepthbuf_pars_vertex, THREE__namespace.ShaderChunk.fog_pars_fragment, shaderChunks.branchAvoidanceFunctions, shaderChunks.unpackColor, shaderChunks.unpackRotationAxis, shaderChunks.floatOverLifetime, shaderChunks.colorOverLifetime, shaderChunks.paramFetchingFunctions, shaderChunks.forceFetchingFunctions, shaderChunks.rotationFunctions, 'void main() {',
    //
    // Setup...
    //
    '    highp float age = getAge();', '    highp float alive = getAlive();', '    highp float maxAge = getMaxAge();', '    highp float positionInTime = (age / maxAge);', '    highp float isAlive = when_gt( alive, 0.0 );', '    #ifdef SHOULD_WIGGLE_PARTICLES', '        float wiggleAmount = positionInTime * getWiggle();', '        float wiggleSin = isAlive * sin( wiggleAmount );', '        float wiggleCos = isAlive * cos( wiggleAmount );', '    #endif',
    //
    // Forces
    //

    // Get forces & position
    '    vec3 vel = getVelocity( age );', '    vec3 accel = getAcceleration( age );', '    vec3 force = vec3( 0.0 );', '    vec3 pos = vec3( position );',
    // Calculate the required drag to apply to the forces.
    '    float drag = 1.0 - (positionInTime * 0.5) * acceleration.w;',
    // Integrate forces...
    '    force += vel;', '    force *= drag;', '    force += accel * age;', '    pos += force;',
    // Wiggly wiggly wiggle!
    '    #ifdef SHOULD_WIGGLE_PARTICLES', '        pos.x += wiggleSin;', '        pos.y += wiggleCos;', '        pos.z += wiggleSin;', '    #endif',
    // Rotate the emitter around it's central point
    '    #ifdef SHOULD_ROTATE_PARTICLES', '        pos = getRotation( pos, positionInTime );', '    #endif',
    // Convert pos to a world-space value
    '    vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );',
    // Determine point size.
    '    highp float pointSize = getFloatOverLifetime( positionInTime, size ) * isAlive;',
    // Determine perspective
    '    #ifdef HAS_PERSPECTIVE', '        float perspective = scale / length( mvPosition.xyz );', '    #else', '        float perspective = 1.0;', '    #endif',
    // Apply perpective to pointSize value
    '    float pointSizePerspective = pointSize * perspective;',
    //
    // Appearance
    //

    // Determine color and opacity for this particle
    '    #ifdef COLORIZE', '       vec3 c = isAlive * getColorOverLifetime(', '           positionInTime,', '           unpackColor( color.x ),', '           unpackColor( color.y ),', '           unpackColor( color.z ),', '           unpackColor( color.w )', '       );', '    #else', '       vec3 c = vec3(1.0);', '    #endif', '    float o = isAlive * getFloatOverLifetime( positionInTime, opacity );',
    // Assign color to vColor varying.
    '    vColor = vec4( c, o );',
    // Determine angle
    '    #ifdef SHOULD_ROTATE_TEXTURE', '        vAngle = isAlive * getFloatOverLifetime( positionInTime, angle );', '    #endif',
    // If this particle is using a sprite-sheet as a texture, we'll have to figure out
    // what frame of the texture the particle is using at it's current position in time.
    '    #ifdef SHOULD_CALCULATE_SPRITE', '        float framesX = textureAnimation.x;', '        float framesY = textureAnimation.y;', '        float loopCount = textureAnimation.w;', '        float totalFrames = textureAnimation.z;', '        float frameNumber = mod( (positionInTime * loopCount) * totalFrames, totalFrames );', '        float column = floor(mod( frameNumber, framesX ));', '        float row = floor( (frameNumber - column) / framesX );', '        float columnNorm = column / framesX;', '        float rowNorm = row / framesY;', '        vSpriteSheet.x = 1.0 / framesX;', '        vSpriteSheet.y = 1.0 / framesY;', '        vSpriteSheet.z = columnNorm;', '        vSpriteSheet.w = rowNorm;', '    #endif',
    //
    // Write values
    //

    // Set PointSize according to size at current point in time.
    '    gl_PointSize = pointSizePerspective;', '    gl_Position = projectionMatrix * mvPosition;', THREE__namespace.ShaderChunk.logdepthbuf_vertex, '}'].join('\n'),
    fragment: [shaderChunks.uniforms, THREE__namespace.ShaderChunk.common, THREE__namespace.ShaderChunk.fog_pars_fragment, THREE__namespace.ShaderChunk.logdepthbuf_pars_fragment, shaderChunks.varyings, shaderChunks.branchAvoidanceFunctions, 'void main() {', '    vec3 outgoingLight = vColor.xyz;', '    ', '    #ifdef ALPHATEST', '       if ( vColor.w < float(ALPHATEST) ) discard;', '    #endif', shaderChunks.rotateTexture, THREE__namespace.ShaderChunk.logdepthbuf_fragment, '    outgoingLight = vColor.xyz * rotatedTexture.xyz;', '    gl_FragColor = vec4( outgoingLight.xyz, rotatedTexture.w * vColor.w );', THREE__namespace.ShaderChunk.fog_fragment, '}'].join('\n')
  };

  var Emitter = /*#__PURE__*/function () {
    function Emitter(options) {
      _classCallCheck(this, Emitter);
      var types = utils.types;
      var lifetimeLength = SPE.valueOverLifetimeLength;
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
      this.uuid = THREE__namespace.MathUtils.generateUUID();
      this.type = utils.ensureTypedArg(options.type, types.NUMBER, SPE.distributions.BOX);
      this.position = {
        _value: utils.ensureInstanceOf(options.position.value, THREE__namespace.Vector3, new THREE__namespace.Vector3()),
        _spread: utils.ensureInstanceOf(options.position.spread, THREE__namespace.Vector3, new THREE__namespace.Vector3()),
        _spreadClamp: utils.ensureInstanceOf(options.position.spreadClamp, THREE__namespace.Vector3, new THREE__namespace.Vector3()),
        _distribution: utils.ensureTypedArg(options.position.distribution, types.NUMBER, this.type),
        _randomise: utils.ensureTypedArg(options.position.randomise, types.BOOLEAN, false),
        _radius: utils.ensureTypedArg(options.position.radius, types.NUMBER, 10),
        _radiusScale: utils.ensureInstanceOf(options.position.radiusScale, THREE__namespace.Vector3, new THREE__namespace.Vector3(1, 1, 1)),
        _distributionClamp: utils.ensureTypedArg(options.position.distributionClamp, types.NUMBER, 0)
      };
      this.velocity = {
        _value: utils.ensureInstanceOf(options.velocity.value, THREE__namespace.Vector3, new THREE__namespace.Vector3()),
        _spread: utils.ensureInstanceOf(options.velocity.spread, THREE__namespace.Vector3, new THREE__namespace.Vector3()),
        _distribution: utils.ensureTypedArg(options.velocity.distribution, types.NUMBER, this.type),
        _randomise: utils.ensureTypedArg(options.position.randomise, types.BOOLEAN, false)
      };
      this.acceleration = {
        _value: utils.ensureInstanceOf(options.acceleration.value, THREE__namespace.Vector3, new THREE__namespace.Vector3()),
        _spread: utils.ensureInstanceOf(options.acceleration.spread, THREE__namespace.Vector3, new THREE__namespace.Vector3()),
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
        _axis: utils.ensureInstanceOf(options.rotation.axis, THREE__namespace.Vector3, new THREE__namespace.Vector3(0.0, 1.0, 0.0)),
        _axisSpread: utils.ensureInstanceOf(options.rotation.axisSpread, THREE__namespace.Vector3, new THREE__namespace.Vector3()),
        _angle: utils.ensureTypedArg(options.rotation.angle, types.NUMBER, 0),
        _angleSpread: utils.ensureTypedArg(options.rotation.angleSpread, types.NUMBER, 0),
        _static: utils.ensureTypedArg(options.rotation["static"], types.BOOLEAN, false),
        _center: utils.ensureInstanceOf(options.rotation.center, THREE__namespace.Vector3, this.position._value.clone()),
        _randomise: utils.ensureTypedArg(options.position.randomise, types.BOOLEAN, false)
      };
      this.maxAge = {
        _value: utils.ensureTypedArg(options.maxAge.value, types.NUMBER, 2),
        _spread: utils.ensureTypedArg(options.maxAge.spread, types.NUMBER, 0)
      };

      // The following properties can support either single values, or an array of values that change
      // the property over a particle's lifetime (value over lifetime).
      this.color = {
        _value: utils.ensureArrayInstanceOf(options.color.value, THREE__namespace.Color, new THREE__namespace.Color()),
        _spread: utils.ensureArrayInstanceOf(options.color.spread, THREE__namespace.Vector3, new THREE__namespace.Vector3()),
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
        position: utils.ensureTypedArg(options.position.randomise, types.BOOLEAN, false) || utils.ensureTypedArg(options.radius.randomise, types.BOOLEAN, false),
        velocity: utils.ensureTypedArg(options.velocity.randomise, types.BOOLEAN, false),
        acceleration: utils.ensureTypedArg(options.acceleration.randomise, types.BOOLEAN, false) || utils.ensureTypedArg(options.drag.randomise, types.BOOLEAN, false),
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
    _createClass(Emitter, [{
      key: "_createGetterSetters",
      value: function _createGetterSetters(propObj, propName) {
        var self = this;
        Object.keys(propObj).forEach(function (key) {
          var name = key.replace('_', '');
          Object.defineProperty(propObj, name, {
            get: function get() {
              return this[key];
            },
            set: function set(value) {
              var mapName = self.updateMap[propName];
              var prevValue = this[key];
              var length = SPE.valueOverLifetimeLength;
              if (key === '_rotationCenter') {
                self.updateFlags.rotationCenter = true;
                this.updateCounts.rotationCenter = 0.0;
              } else if (prop === '_randomise') {
                self.resetFlags[mapName] = value;
              } else {
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
          });
        });
      }
    }, {
      key: "_setBufferUpdateRanges",
      value: function _setBufferUpdateRanges(keys) {
        this.attributeKeys = keys;
        this.attributeCount = keys.length;
        for (var i = this.attributeCount - 1; i >= 0; --i) {
          this.bufferUpdateRanges[keys[i]] = {
            min: Number.POSITIVE_INFINITY,
            max: Number.NEGATIVE_INFINITY
          };
        }
      }
    }, {
      key: "_calculatePPSValue",
      value: function _calculatePPSValue(groupMaxAge) {
        var particleCount = this.particleCount;

        // Calculate the `particlesPerSecond` value for this emitter. It's used
        // when determining which particles should die and which should live to
        // see another day. Or be born, for that matter. The "God" property.
        if (this.duration) {
          this.particlesPerSecond = particleCount / (groupMaxAge < this.duration ? groupMaxAge : this.duration);
        } else {
          this.particlesPerSecond = particleCount / groupMaxAge;
        }
      }
    }, {
      key: "_setAttributeOffset",
      value: function _setAttributeOffset(startIndex) {
        this.attributeOffset = startIndex;
        this.activationIndex = startIndex;
        this.activationEnd = startIndex + this.particleCount;
      }
    }, {
      key: "_assignValue",
      value: function _assignValue(prop, index) {
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
    }, {
      key: "_assignPositionValue",
      value: function _assignPositionValue(index) {
        var distributions = SPE.distributions;
        var prop = this.position;
        var attr = this.attributes.position;
        var value = prop._value;
        var spread = prop._spread;
        var distribution = prop.distribution;
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
    }, {
      key: "_assignForceValue",
      value: function _assignForceValue(index, attrName) {
        var distributions = SPE.distributions;
        var prop = this[attrName];
        var value = prop._value;
        var spread = prop._spread;
        var distribution = prop._distribution;
        var pos, positionX, positionY, positionZ, i;
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
            utils.randomDirectionVector3OnSphere(this.attributes[attrName], index, positionX, positionY, positionZ, this.position._value, prop._value.x, prop._spread.x);
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
            utils.randomDirectionVector3OnDisc(this.attributes[attrName], index, positionX, positionY, positionZ, this.position._value, prop._value.x, prop._spread.x);
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
    }, {
      key: "_assignAbsLifetimeValue",
      value: function _assignAbsLifetimeValue(index, propName) {
        var array = this.attributes[propName].typedArray;
        var prop = this[propName];
        var value;
        if (utils.arrayValuesAreEqual(prop._value) && utils.arrayValuesAreEqual(prop._spread)) {
          value = Math.abs(utils.randomFloat(prop._value[0], prop._spread[0]));
          array.setVec4Components(index, value, value, value, value);
        } else {
          array.setVec4Components(index, Math.abs(utils.randomFloat(prop._value[0], prop._spread[0])), Math.abs(utils.randomFloat(prop._value[1], prop._spread[1])), Math.abs(utils.randomFloat(prop._value[2], prop._spread[2])), Math.abs(utils.randomFloat(prop._value[3], prop._spread[3])));
        }
      }
    }, {
      key: "_assignAngleValue",
      value: function _assignAngleValue(index) {
        var array = this.attributes.angle.typedArray;
        var prop = this.angle;
        var value;
        if (utils.arrayValuesAreEqual(prop._value) && utils.arrayValuesAreEqual(prop._spread)) {
          value = utils.randomFloat(prop._value[0], prop._spread[0]);
          array.setVec4Components(index, value, value, value, value);
        } else {
          array.setVec4Components(index, utils.randomFloat(prop._value[0], prop._spread[0]), utils.randomFloat(prop._value[1], prop._spread[1]), utils.randomFloat(prop._value[2], prop._spread[2]), utils.randomFloat(prop._value[3], prop._spread[3]));
        }
      }
    }, {
      key: "_assignParamsValue",
      value: function _assignParamsValue(index) {
        this.attributes.params.typedArray.setVec4Components(index, this.isStatic ? 1 : 0, 0.0, Math.abs(utils.randomFloat(this.maxAge._value, this.maxAge._spread)), utils.randomFloat(this.wiggle._value, this.wiggle._spread));
      }
    }, {
      key: "_assignRotationValue",
      value: function _assignRotationValue(index) {
        this.attributes.rotation.typedArray.setVec3Components(index, utils.getPackedRotationAxis(this.rotation._axis, this.rotation._axisSpread), utils.randomFloat(this.rotation._angle, this.rotation._angleSpread), this.rotation._static ? 0 : 1);
        this.attributes.rotationCenter.typedArray.setVec3(index, this.rotation._center);
      }
    }, {
      key: "_assignColorValue",
      value: function _assignColorValue(index) {
        utils.randomColorAsHex(this.attributes.color, index, this.color._value, this.color._spread);
      }
    }, {
      key: "_resetParticle",
      value: function _resetParticle(index) {
        var resetFlags = this.resetFlags;
        var updateFlags = this.updateFlags;
        var updateCounts = this.updateCounts;
        var keys = this.attributeKeys;
        var key, updateFlag;
        for (var i = this.attributeCount - 1; i >= 0; --i) {
          key = keys[i];
          updateFlag = updateFlags[key];
          if (resetFlags[key] === true || updateFlag === true) {
            this._assignValue(key, index);
            this._updateAttributeUpdateRange(key, index);
            if (updateFlag === true && updateCounts[key] === this.particleCount) {
              updateFlags[key] = false;
              updateCounts[key] = 0.0;
            } else if (updateFlag === true) {
              ++updateCounts[key];
            }
          }
        }
      }
    }, {
      key: "_updateAttributeUpdateRange",
      value: function _updateAttributeUpdateRange(attr, i) {
        var ranges = this.bufferUpdateRanges[attr];
        ranges.min = Math.min(i, ranges.min);
        ranges.max = Math.max(i, ranges.max);
      }
    }, {
      key: "_resetBufferRanges",
      value: function _resetBufferRanges() {
        var ranges = this.bufferUpdateRanges;
        var keys = this.bufferUpdateKeys;
        var i = this.bufferUpdateCount - 1;
        var key;
        for (i; i >= 0; --i) {
          key = keys[i];
          ranges[key].min = Number.POSITIVE_INFINITY;
          ranges[key].max = Number.NEGATIVE_INFINITY;
        }
      }
    }, {
      key: "_onRemove",
      value: function _onRemove() {
        this.particlesPerSecond = 0;
        this.attributeOffset = 0;
        this.activationIndex = 0;
        this.activeParticleCount = 0;
        this.group = null;
        this.attributes = null;
        this.paramsArray = null;
        this.age = 0.0;
      }
    }, {
      key: "_decrementParticleCount",
      value: function _decrementParticleCount() {
        --this.activeParticleCount;
      }
    }, {
      key: "_incrementParticleCount",
      value: function _incrementParticleCount() {
        ++this.activeParticleCount;
      }
    }, {
      key: "_checkParticleAges",
      value: function _checkParticleAges(start, end, params, dt) {
        for (var i = end - 1, index, maxAge, age, alive; i >= start; --i) {
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
          } else {
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
    }, {
      key: "_activateParticles",
      value: function _activateParticles(activationStart, activationEnd, params, dtPerParticle) {
        var direction = this.direction;
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
          dtValue = dtPerParticle * (i - activationStart);
          params[index + 1] = direction === -1 ? params[index + 2] - dtValue : dtValue;
          this._updateAttributeUpdateRange('params', i);
        }
      }
    }, {
      key: "tick",
      value: function tick(dt) {
        if (this.isStatic) {
          return;
        }
        if (this.paramsArray === null) {
          this.paramsArray = this.attributes.params.typedArray.array;
        }
        var start = this.attributeOffset;
        var end = start + this.particleCount;
        var params = this.paramsArray;
        var ppsDt = this.particlesPerSecond * this.activeMultiplier * dt;
        var activationIndex = this.activationIndex;

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
        var activationStart = this.particleCount === 1 ? activationIndex : activationIndex | 0;
        var activationEnd = Math.min(activationStart + ppsDt, this.activationEnd);
        var activationCount = activationEnd - this.activationIndex | 0;
        var dtPerParticle = activationCount > 0 ? dt / activationCount : 0;
        this._activateParticles(activationStart, activationEnd, params, dtPerParticle);

        // Move the activation window forward, soldier.
        this.activationIndex += ppsDt;
        if (this.activationIndex > end) {
          this.activationIndex = start;
        }

        // Increment the age of the emitter.
        this.age += dt;
      }
    }, {
      key: "reset",
      value: function reset(force) {
        this.age = 0.0;
        this.alive = false;
        if (force === true) {
          var start = this.attributeOffset;
          var end = start + this.particleCount;
          var array = this.paramsArray;
          var attr = this.attributes.params.bufferAttribute;
          for (var i = end - 1, index; i >= start; --i) {
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
    }, {
      key: "enable",
      value: function enable() {
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
    }, {
      key: "disable",
      value: function disable() {
        this.alive = false;
        return this;
      }
    }, {
      key: "remove",
      value:
      /**
       * Remove this emitter from it's parent group (if it has been added to one).
       * Delgates to SPE.group.prototype.removeEmitter().
       *
       * When called, all particle's belonging to this emitter will be instantly
       * removed from the scene.
       *
       * @return {Emitter} This emitter instance.
       */
      function remove() {

        if (this.group !== null) {
          this.group.removeEmitter(this);
        } else {
          console.error('Emitter does not belong to a group, cannot remove.');
        }
        return this;
      }
    }]);
    return Emitter;
  }();

  var Group = /*#__PURE__*/function () {
    function Group(options) {
      _classCallCheck(this, Group);
      var types = utils.types;
      options = utils.ensureTypedArg(options, types.OBJECT, {});
      options.texture = utils.ensureTypedArg(options.texture, types.OBJECT, {});
      this.uuid = THREE__namespace.MathUtils.generateUUID();

      // If no `deltaTime` value is passed to the `SPE.Group.tick` function,
      // the value of this property will be used to advance the simulation.
      this.fixedTimeStep = utils.ensureTypedArg(options.fixedTimeStep, types.NUMBER, 0.016);

      // Set properties used in the uniforms map, starting with the
      // texture stuff.
      this.texture = options.texture.value || null;
      this.textureFrames = options.texture.frames || new THREE__namespace.Vector2(1, 1);
      this.textureFrameCount = utils.ensureTypedArg(options.texture.frameCount, types.NUMBER, this.textureFrames.x * this.textureFrames.y);
      this.textureLoop = utils.ensureTypedArg(options.texture.loop, types.NUMBER, 1);
      this.textureFrames.max(new THREE__namespace.Vector2(1, 1));
      this.hasPerspective = utils.ensureTypedArg(options.hasPerspective, types.BOOLEAN, true);
      this.colorize = utils.ensureTypedArg(options.colorize, types.BOOLEAN, true);
      this.maxParticleCount = utils.ensureTypedArg(options.maxParticleCount, types.NUMBER, null);

      // Set properties used to define the ShaderMaterial's appearance.
      this.blending = utils.ensureTypedArg(options.blending, types.NUMBER, THREE__namespace.AdditiveBlending);
      this.transparent = utils.ensureTypedArg(options.transparent, types.BOOLEAN, true);
      this.alphaTest = parseFloat(utils.ensureTypedArg(options.alphaTest, types.NUMBER, 0.0));
      this.depthWrite = utils.ensureTypedArg(options.depthWrite, types.BOOLEAN, false);
      this.depthTest = utils.ensureTypedArg(options.depthTest, types.BOOLEAN, true);
      this.fog = utils.ensureTypedArg(options.fog, types.BOOLEAN, true);
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
          value: new THREE__namespace.Vector4(this.textureFrames.x, this.textureFrames.y, this.textureFrameCount, Math.max(Math.abs(this.textureLoop), 1.0))
        },
        fogColor: {
          type: 'c',
          value: this.fog ? new THREE__namespace.Color() : null
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
        VALUE_OVER_LIFETIME_LENGTH: SPE.valueOverLifetimeLength,
        SHOULD_ROTATE_TEXTURE: false,
        SHOULD_ROTATE_PARTICLES: false,
        SHOULD_WIGGLE_PARTICLES: false,
        SHOULD_CALCULATE_SPRITE: this.textureFrames.x > 1 || this.textureFrames.y > 1
      };

      // Map of all attributes to be applied to the particles.
      //
      // See SPE.ShaderAttribute for a bit more info on this bit.
      this.attributes = {
        position: new ShaderAttribute('v3', true),
        acceleration: new ShaderAttribute('v4', true),
        // w component is drag
        velocity: new ShaderAttribute('v3', true),
        rotation: new ShaderAttribute('v4', true),
        rotationCenter: new ShaderAttribute('v3', true),
        params: new ShaderAttribute('v4', true),
        // Holds (alive, age, delay, wiggle)
        size: new ShaderAttribute('v4', true),
        angle: new ShaderAttribute('v4', true),
        color: new ShaderAttribute('v4', true),
        opacity: new ShaderAttribute('v4', true)
      };
      this.attributeKeys = Object.keys(this.attributes);
      this.attributeCount = this.attributeKeys.length;

      // Create the ShaderMaterial instance that'll help render the
      // particles.
      this.material = new THREE__namespace.ShaderMaterial({
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
      this.geometry = new THREE__namespace.BufferGeometry();
      this.mesh = new THREE__namespace.Points(this.geometry, this.material);
      if (this.maxParticleCount === null) {
        console.warn('SPE.Group: No maxParticleCount specified. Adding emitters after rendering will probably cause errors.');
      }
    }
    _createClass(Group, [{
      key: "_updateDefines",
      value: function _updateDefines() {
        var emitters = this.emitters;
        var emitter;
        var defines = this.defines;
        for (var i = emitters.length - 1; i >= 0; --i) {
          emitter = emitters[i];

          // Only do angle calculation if there's no spritesheet defined.
          //
          // Saves calculations being done and then overwritten in the shaders.
          if (!defines.SHOULD_CALCULATE_SPRITE) {
            defines.SHOULD_ROTATE_TEXTURE = defines.SHOULD_ROTATE_TEXTURE || !!Math.max(Math.max.apply(null, emitter.angle.value), Math.max.apply(null, emitter.angle.spread));
          }
          defines.SHOULD_ROTATE_PARTICLES = defines.SHOULD_ROTATE_PARTICLES || !!Math.max(emitter.rotation.angle, emitter.rotation.angleSpread);
          defines.SHOULD_WIGGLE_PARTICLES = defines.SHOULD_WIGGLE_PARTICLES || !!Math.max(emitter.wiggle.value, emitter.wiggle.spread);
        }
        this.material.needsUpdate = true;
      }
    }, {
      key: "_applyAttributesToGeometry",
      value: function _applyAttributesToGeometry() {
        var attributes = this.attributes;
        var geometry = this.geometry;
        var geometryAttributes = geometry.attributes;
        var attribute, geometryAttribute;
        Object.keys(attributes).forEach(function (attr) {
          attribute = attributes[attr];
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
        });

        // Mark the draw range on the geometry. This will ensure
        // only the values in the attribute buffers that are
        // associated with a particle will be used in THREE's
        // render cycle.
        this.geometry.setDrawRange(0, this.particleCount);
      }

      /**
       * Adds an SPE.Emitter instance to this group, creating particle values and
       * assigning them to this group's shader attributes.
       *
       * @param {Emitter} emitter The emitter to add to this group.
       */
    }, {
      key: "addEmitter",
      value: function addEmitter(emitter) {
        // Ensure an actual emitter instance is passed here.
        //
        // Decided not to throw here, just in case a scene's
        // rendering would be paused. Logging an error instead
        // of stopping execution if exceptions aren't caught.
        if (emitter instanceof Emitter === false) {
          console.error('`emitter` argument must be instance of SPE.Emitter. Was provided with:', emitter);
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
        var attributes = this.attributes;
        var start = this.particleCount;
        var end = start + emitter.particleCount;

        // Update this group's particle count.
        this.particleCount = end;

        // Emit a warning if the emitter being added will exceed the buffer sizes specified.
        if (this.maxParticleCount !== null && this.particleCount > this.maxParticleCount) {
          console.warn('SPE.Group: maxParticleCount exceeded. Requesting', this.particleCount, 'particles, can support only', this.maxParticleCount);
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
        for (var attr in attributes) {
          if (attributes.hasOwnProperty(attr)) {
            // When creating a buffer, pass through the maxParticle count
            // if one is specified.
            attributes[attr]._createBufferAttribute(this.maxParticleCount !== null ? this.maxParticleCount : this.particleCount);
          }
        }

        // Loop through each particle this emitter wants to have, and create the attributes values,
        // storing them in the TypedArrays that each attribute holds.
        for (var i = start; i < end; ++i) {
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
        this._updateDefines(emitter);

        // Update the material since defines might have changed
        this.material.needsUpdate = true;
        this.geometry.needsUpdate = true;
        this._attributesNeedRefresh = true;

        // Return the group to enable chaining.
        return this;
      }

      /**
       * Removes an SPE.Emitter instance from this group. When called,
       * all particle's belonging to the given emitter will be instantly
       * removed from the scene.
       *
       * @param {Emitter} emitter The emitter to add to this group.
       */
    }, {
      key: "removeEmitter",
      value: function removeEmitter(emitter) {
        var emitterIndex = this.emitterIDs.indexOf(emitter, this.uuid);

        // Ensure an actual emitter instance is passed here.
        //
        // Decided not to throw here, just in case a scene's
        // rendering would be paused. Logging an error instead
        // of stopping execution if exceptions aren't caught.
        if (emitter instanceof Emitter === false) {
          console.error('`emitter` argument must be instance of SPE.Emitter. Was provided with:', emitter);
          return;
        } else if (emitterIndex === -1) {
          console.error('Emitter does not exist in this group. Will not remove.');
          return;
        }

        // Kill all particles by marking them as dead
        // and their age as 0.
        var start = emitter.attributeOffset;
        var end = start + emitter.particleCount;
        var params = this.attributes.params.typedArray;

        // Set alive and age to zero.
        for (var i = start; i < end; ++i) {
          params.array[i * 4] = 0.0;
          params.array[i * 4 + 1] = 0.0;
        }

        // Remove the emitter from this group's "store".
        this.emitters.splice(emitterIndex, 1);
        this.emitterIDs.splice(emitterIndex, 1);

        // Remove this emitter's attribute values from all shader attributes.
        // The `.splice()` call here also marks each attribute's buffer
        // as needing to update it's entire contents.
        for (var attr in this.attributes) {
          if (this.attributes.hasOwnProperty(attr)) {
            this.attributes[attr].splice(start, end);
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
    }, {
      key: "getFromPool",
      value: function getFromPool() {
        var pool = this._pool;
        var createNew = this._createNewWhenPoolEmpty;
        if (pool.length) {
          return pool.pop();
        } else if (createNew) {
          var emitter = new Emitter(this._poolCreationSettings);
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
    }, {
      key: "releaseIntoPool",
      value: function releaseIntoPool(emitter) {
        if (emitter instanceof Emitter === false) {
          console.error('Argument is not instanceof SPE.Emitter:', emitter);
          return;
        }
        emitter.reset();
        this._pool.unshift(emitter);
        return this;
      }
    }, {
      key: "getPool",
      value: function getPool() {
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
    }, {
      key: "addPool",
      value: function addPool(numEmitters, emitterOptions, createNew) {
        var emitter;
        // Save relevant settings and flags.
        this._poolCreationSettings = emitterOptions;
        this._createNewWhenPoolEmpty = !!createNew;

        // Create the emitters, add them to this group and the pool.
        for (var i = 0; i < numEmitters; ++i) {
          if (Array.isArray(emitterOptions)) {
            emitter = new SPE.Emitter(emitterOptions[i]);
          } else {
            emitter = new SPE.Emitter(emitterOptions);
          }
          this.addEmitter(emitter);
          this.releaseIntoPool(emitter);
        }
        return this;
      }
    }, {
      key: "_triggerSingleEmitter",
      value: function _triggerSingleEmitter(pos) {
        var emitter = this.getFromPool(),
          self = this;
        if (emitter === null) {
          console.log('SPE.Group pool ran out.');
          return;
        }

        // TODO:
        // - Make sure buffers are update with thus new position.
        if (pos instanceof THREE__namespace.Vector3) {
          emitter.position.value.copy(pos);

          // Trigger the setter for this property to force an
          // update to the emitter's position attribute.
          emitter.position.value = emitter.position.value;
        }
        emitter.enable();
        setTimeout(function () {
          emitter.disable();
          self.releaseIntoPool(emitter);
        }, Math.max(emitter.duration, emitter.maxAge.value + emitter.maxAge.spread) * 1000);
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
    }, {
      key: "triggerPoolEmitter",
      value: function triggerPoolEmitter(numEmitters, position) {
        if (typeof numEmitters === 'number' && numEmitters > 1) {
          for (var i = 0; i < numEmitters; ++i) {
            this._triggerSingleEmitter(position);
          }
        } else {
          this._triggerSingleEmitter(position);
        }
        return this;
      }
    }, {
      key: "_updateUniforms",
      value: function _updateUniforms(dt) {
        this.uniforms.runTime.value += dt;
        this.uniforms.deltaTime.value = dt;
      }
    }, {
      key: "_resetBufferRanges",
      value: function _resetBufferRanges() {
        var keys = this.attributeKeys;
        var attrs = this.attributes;
        var i = this.attributeCount - 1;
        for (i; i >= 0; --i) {
          attrs[keys[i]].resetUpdateRange();
        }
      }
    }, {
      key: "_updateBuffers",
      value: function _updateBuffers(emitter) {
        var keys = this.attributeKeys;
        var attrs = this.attributes;
        var emitterRanges = emitter.bufferUpdateRanges;
        var i = this.attributeCount - 1;
        var key, emitterAttr, attr;
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
    }, {
      key: "tick",
      value: function tick(dt) {
        var emitters = this.emitters;
        var numEmitters = emitters.length;
        var deltaTime = dt || this.fixedTimeStep;
        var keys = this.attributeKeys;
        var attrs = this.attributes;
        var i;

        // Update uniform values.
        this._updateUniforms(deltaTime);

        // Reset buffer update ranges on the shader attributes.
        this._resetBufferRanges();

        // If nothing needs updating, then stop here.
        if (numEmitters === 0 && this._attributesNeedRefresh === false && this._attributesNeedDynamicReset === false) {
          return;
        }

        // Loop through each emitter in this group and
        // simulate it, then update the shader attribute
        // buffers.
        for (var _i = 0, emitter; _i < numEmitters; ++_i) {
          emitter = emitters[_i];
          emitter.tick(deltaTime);
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
    }, {
      key: "dispose",
      value: function dispose() {
        this.geometry.dispose();
        this.material.dispose();
        return this;
      }
    }]);
    return Group;
  }();

  Group.Emitter = Emitter;
  Group.utils = utils;
  Group.SPE = SPE;

  return Group;

}));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hhZGVyLXBhcnRpY2xlLXN5c3RlbS5qcyIsInNvdXJjZXMiOlsiLi4vc3JjL3V0aWxzL2luZGV4LmpzIiwiLi4vc3JjL2dyb3VwL3NwZS5qcyIsIi4uL3NyYy9oZWxwZXJzL1R5cGVkQXJyYXlIZWxwZXIuanMiLCIuLi9zcmMvaGVscGVycy9TaGFkZXJBdHRyaWJ1dGUuanMiLCIuLi9zcmMvc2hhZGVycy9zaGFkZXJDaHVua3MuanMiLCIuLi9zcmMvc2hhZGVycy9zaGFkZXJzLmpzIiwiLi4vc3JjL2VtaXR0ZXIvaW5kZXguanMiLCIuLi9zcmMvZ3JvdXAvaW5kZXguanMiLCIuLi9zcmMvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgVEhSRUUgZnJvbSAndGhyZWUnO1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gICAgLyoqXG4gICAgICogQSBtYXAgb2YgdHlwZXMgdXNlZCBieSBgU1BFLnV0aWxzLmVuc3VyZVR5cGVkQXJnYCBhbmRcbiAgICAgKiBgU1BFLnV0aWxzLmVuc3VyZUFycmF5VHlwZWRBcmdgIHRvIGNvbXBhcmUgdHlwZXMgYWdhaW5zdC5cbiAgICAgKlxuICAgICAqIEBlbnVtIHtTdHJpbmd9XG4gICAgICovXG4gICAgdHlwZXM6IHtcblxuICAgICAgICBCb29sZWFuOiAnYm9vbGVhbicsXG5cbiAgICAgICAgU1RSSU5HOiAnc3RyaW5nJyxcblxuICAgICAgICBOVU1CRVI6ICdudW1iZXInLFxuXG4gICAgICAgIE9CSkVDVDogJ29iamVjdCdcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogZW5zdXJlIHRoZSBnaXZlbiBhcmd1bWVudCBhZGhlcmVzIHRvIHRoZSB0eXBlIHJlcXVlc3RpbmcsXG4gICAgICogQHBhcmFtICB7KGJvb2xlYW58c3RyaW5nfG51bWJlcnxvYmplY3QpfSBhcmcgICAgICAgICAgVGhlIHZhbHVlIHRvIHBlcmZvcm0gYSB0eXBlLWNoZWNrIG9uLlxuICAgICAqIEBwYXJhbSAge1N0cmluZ30gdHlwZSAgICAgICAgIFRoZSB0eXBlIHRoZSBgYXJnYCBhcmd1bWVudCBzaG91bGQgYWRoZXJlIHRvLlxuICAgICAqIEBwYXJhbSAgeyhib29sZWFufHN0cmluZ3xudW1iZXJ8b2JqZWN0KX0gZGVmYXVsdFZhbHVlIEEgZGVmYXVsdCB2YWx1ZSB0byBmYWxsYmFjayBvbiBpZiB0aGUgdHlwZSBjaGVjayBmYWlscy5cbiAgICAgKiBAcmV0dXJuIHsoYm9vbGVhbnxzdHJpbmd8bnVtYmVyfG9iamVjdCl9ICAgICAgICAgICAgICBUaGUgZ2l2ZW4gdmFsdWUgaWYgdHlwZSBjaGVjayBwYXNzZXMsIG9yIHRoZSBkZWZhdWx0IHZhbHVlIGlmIGl0IGZhaWxzLlxuICAgICAqL1xuICAgIGVuc3VyZVR5cGVkQXJnKGFyZywgdHlwZSwgZGVmYXVsdFZhbHVlKSB7XG4gICAgICAgIGlmICh0eXBlb2YgYXJnID09PSB0eXBlKSB7XG4gICAgICAgICAgICByZXR1cm4gYXJnO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGRlZmF1bHRWYWx1ZTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBlbnN1cmUgdGhlIGdpdmVuIGFycmF5J3MgY29udGVudHMgQUxMIGFkaGVyZSB0byB0aGUgcHJvdmlkZWQgdHlwZSxcbiAgICAgKiBAcGFyYW0gIHtBcnJheXxib29sZWFufHN0cmluZ3xudW1iZXJ8b2JqZWN0fSBhcmcgICAgICAgICAgVGhlIGFycmF5IG9mIHZhbHVlcyB0byBjaGVjayB0eXBlIG9mLlxuICAgICAqIEBwYXJhbSAge1N0cmluZ30gdHlwZSAgICAgICAgIFRoZSB0eXBlIHRoYXQgc2hvdWxkIGJlIGFkaGVyZWQgdG8uXG4gICAgICogQHBhcmFtICB7KGJvb2xlYW58c3RyaW5nfG51bWJlcnxvYmplY3QpfSBkZWZhdWx0VmFsdWUgQSBkZWZhdWx0IGZhbGxiYWNrIHZhbHVlLlxuICAgICAqIEByZXR1cm4geyhib29sZWFufHN0cmluZ3xudW1iZXJ8b2JqZWN0KX0gICAgICAgICAgICAgIFRoZSBnaXZlbiB2YWx1ZSBpZiB0eXBlIGNoZWNrIHBhc3Nlcywgb3IgdGhlIGRlZmF1bHQgdmFsdWUgaWYgaXQgZmFpbHMuXG4gICAgICovXG4gICAgZW5zdXJlQXJyYXlUeXBlZEFyZyhhcmcsIHR5cGUsIGRlZmF1bHRWYWx1ZSkge1xuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShhcmcpKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gYXJnLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBhcmdbaV0gIT09IHR5cGUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRlZmF1bHRWYWx1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gYXJnO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuZW5zdXJlVHlwZWRBcmcoYXJnLCB0eXBlLCBkZWZhdWx0VmFsdWUpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBFbnN1cmVzIHRoZSBnaXZlbiB2YWx1ZSBpcyBhbiBpbnN0YW5jZSBvZiBhIGNvbnN0cnVjdG9yIGZ1bmN0aW9uLlxuICAgICAqXG4gICAgICogQHBhcmFtICB7T2JqZWN0fSBhcmcgICAgICAgICAgVGhlIHZhbHVlIHRvIGNoZWNrIGluc3RhbmNlIG9mLlxuICAgICAqIEBwYXJhbSAge0Z1bmN0aW9ufSBpbnN0YW5jZSAgICAgVGhlIGNvbnN0cnVjdG9yIG9mIHRoZSBpbnN0YW5jZSB0byBjaGVjayBhZ2FpbnN0LlxuICAgICAqIEBwYXJhbSAge09iamVjdH0gZGVmYXVsdFZhbHVlIEEgZGVmYXVsdCBmYWxsYmFjayB2YWx1ZSBpZiBpbnN0YW5jZSBjaGVjayBmYWlsc1xuICAgICAqIEByZXR1cm4ge09iamVjdH0gICAgICAgICAgICAgIFRoZSBnaXZlbiB2YWx1ZSBpZiB0eXBlIGNoZWNrIHBhc3Nlcywgb3IgdGhlIGRlZmF1bHQgdmFsdWUgaWYgaXQgZmFpbHMuXG4gICAgICovXG4gICAgZW5zdXJlSW5zdGFuY2VPZihhcmcsIGluc3RhbmNlLCBkZWZhdWx0VmFsdWUpIHtcbiAgICAgICAgaWYgKGFyZyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gYXJnO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGRlZmF1bHRWYWx1ZTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHaXZlbiBhbiBhcnJheSBvZiB2YWx1ZXMsIGVuc3VyZSB0aGUgaW5zdGFuY2VzIG9mIGFsbCBpdGVtcyBpbiB0aGUgYXJyYXlcbiAgICAgKiBtYXRjaGVzIHRoZSBnaXZlbiBpbnN0YW5jZSBjb25zdHJ1Y3RvciBmYWxsaW5nIGJhY2sgdG8gYSBkZWZhdWx0IHZhbHVlIGlmXG4gICAgICogdGhlIGNoZWNrIGZhaWxzLlxuICAgICAqXG4gICAgICogSWYgZ2l2ZW4gdmFsdWUgaXNuJ3QgYW4gQXJyYXksIGRlbGVnYXRlcyB0byBgU1BFLnV0aWxzLmVuc3VyZUluc3RhbmNlT2ZgLlxuICAgICAqXG4gICAgICogQHBhcmFtICB7QXJyYXl8T2JqZWN0fSBhcmcgICAgICAgICAgVGhlIHZhbHVlIHRvIHBlcmZvcm0gdGhlIGluc3RhbmNlb2YgY2hlY2sgb24uXG4gICAgICogQHBhcmFtICB7RnVuY3Rpb259IGluc3RhbmNlICAgICBUaGUgY29uc3RydWN0b3Igb2YgdGhlIGluc3RhbmNlIHRvIGNoZWNrIGFnYWluc3QuXG4gICAgICogQHBhcmFtICB7T2JqZWN0fSBkZWZhdWx0VmFsdWUgQSBkZWZhdWx0IGZhbGxiYWNrIHZhbHVlIGlmIGluc3RhbmNlIGNoZWNrIGZhaWxzXG4gICAgICogQHJldHVybiB7T2JqZWN0fSAgICAgICAgICAgICAgVGhlIGdpdmVuIHZhbHVlIGlmIHR5cGUgY2hlY2sgcGFzc2VzLCBvciB0aGUgZGVmYXVsdCB2YWx1ZSBpZiBpdCBmYWlscy5cbiAgICAgKi9cbiAgICBlbnN1cmVBcnJheUluc3RhbmNlT2YoYXJnLCBpbnN0YW5jZSwgZGVmYXVsdFZhbHVlKSB7XG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KGFyZykpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSBhcmcubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgICAgICAgICBpZiAoaW5zdGFuY2UgIT09IHVuZGVmaW5lZCAmJiBhcmdbaV0gaW5zdGFuY2VvZiBpbnN0YW5jZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRlZmF1bHRWYWx1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBhcmc7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5lbnN1cmVJbnN0YW5jZU9mKGFyZywgaW5zdGFuY2UsIGRlZmF1bHRWYWx1ZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEVuc3VyZXMgdGhhdCBhbnkgXCJ2YWx1ZS1vdmVyLWxpZmV0aW1lXCIgcHJvcGVydGllcyBvZiBhbiBlbWl0dGVyIGFyZVxuICAgICAqIG9mIHRoZSBjb3JyZWN0IGxlbmd0aCAoYXMgZGljdGF0ZWQgYnkgYFNQRS52YWx1ZU92ZXJMaWZldGltZUxlbmd0aGApLlxuICAgICAqXG4gICAgICogRGVsZWdhdGVzIHRvIGBTUEUudXRpbHMuaW50ZXJwb2xhdGVBcnJheWAgZm9yIGFycmF5IHJlc2l6aW5nLlxuICAgICAqXG4gICAgICogSWYgcHJvcGVydGllcyBhcmVuJ3QgYXJyYXlzLCB0aGVuIHByb3BlcnR5IHZhbHVlcyBhcmUgcHV0IGludG8gb25lLlxuICAgICAqXG4gICAgICogQHBhcmFtICB7T2JqZWN0fSBwcm9wZXJ0eSAgVGhlIHByb3BlcnR5IG9mIGFuIFNQRS5FbWl0dGVyIGluc3RhbmNlIHRvIGNoZWNrIGNvbXBsaWFuY2Ugb2YuXG4gICAgICogQHBhcmFtICB7TnVtYmVyfSBtaW5MZW5ndGggVGhlIG1pbmltdW0gbGVuZ3RoIG9mIHRoZSBhcnJheSB0byBjcmVhdGUuXG4gICAgICogQHBhcmFtICB7TnVtYmVyfSBtYXhMZW5ndGggVGhlIG1heGltdW0gbGVuZ3RoIG9mIHRoZSBhcnJheSB0byBjcmVhdGUuXG4gICAgICovXG4gICAgZW5zdXJlVmFsdWVPdmVyTGlmZXRpbWVDb21wbGlhbmNlKHByb3BlcnR5LCBtaW5MZW5ndGgsIG1heExlbmd0aCkge1xuICAgICAgICBtaW5MZW5ndGggPSBtaW5MZW5ndGggfHwgMztcbiAgICAgICAgbWF4TGVuZ3RoID0gbWF4TGVuZ3RoIHx8IDM7XG5cbiAgICAgICAgLy8gRmlyc3QsIGVuc3VyZSBib3RoIHByb3BlcnRpZXMgYXJlIGFycmF5cy5cbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkocHJvcGVydHkuX3ZhbHVlKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHByb3BlcnR5Ll92YWx1ZSA9IFsgcHJvcGVydHkuX3ZhbHVlIF07XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShwcm9wZXJ0eS5fc3ByZWFkKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHByb3BlcnR5Ll9zcHJlYWQgPSBbIHByb3BlcnR5Ll9zcHJlYWQgXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCB2YWx1ZUxlbmd0aCA9IHRoaXMuY2xhbXAocHJvcGVydHkuX3ZhbHVlLmxlbmd0aCwgbWluTGVuZ3RoLCBtYXhMZW5ndGgpLFxuICAgICAgICAgICAgc3ByZWFkTGVuZ3RoID0gdGhpcy5jbGFtcChwcm9wZXJ0eS5fc3ByZWFkLmxlbmd0aCwgbWluTGVuZ3RoLCBtYXhMZW5ndGgpLFxuICAgICAgICAgICAgZGVzaXJlZExlbmd0aCA9IE1hdGgubWF4KHZhbHVlTGVuZ3RoLCBzcHJlYWRMZW5ndGgpO1xuXG4gICAgICAgIGlmIChwcm9wZXJ0eS5fdmFsdWUubGVuZ3RoICE9PSBkZXNpcmVkTGVuZ3RoKSB7XG4gICAgICAgICAgICBwcm9wZXJ0eS5fdmFsdWUgPSB0aGlzLmludGVycG9sYXRlQXJyYXkocHJvcGVydHkuX3ZhbHVlLCBkZXNpcmVkTGVuZ3RoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwcm9wZXJ0eS5fc3ByZWFkLmxlbmd0aCAhPT0gZGVzaXJlZExlbmd0aCkge1xuICAgICAgICAgICAgcHJvcGVydHkuX3NwcmVhZCA9IHRoaXMuaW50ZXJwb2xhdGVBcnJheShwcm9wZXJ0eS5fc3ByZWFkLCBkZXNpcmVkTGVuZ3RoKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBQZXJmb3JtcyBsaW5lYXIgaW50ZXJwb2xhdGlvbiAobGVycCkgb24gYW4gYXJyYXkuXG4gICAgICpcbiAgICAgKiBGb3IgZXhhbXBsZSwgbGVycGluZyBbMSwgMTBdLCB3aXRoIGEgYG5ld0xlbmd0aGAgb2YgMTAgd2lsbCBwcm9kdWNlIFsxLCAyLCAzLCA0LCA1LCA2LCA3LCA4LCA5LCAxMF0uXG4gICAgICpcbiAgICAgKiBEZWxlZ2F0ZXMgdG8gYFNQRS51dGlscy5sZXJwVHlwZUFnbm9zdGljYCB0byBwZXJmb3JtIHRoZSBhY3R1YWxcbiAgICAgKiBpbnRlcnBvbGF0aW9uLlxuICAgICAqXG4gICAgICogQHBhcmFtICB7QXJyYXl9IHNyY0FycmF5ICBUaGUgYXJyYXkgdG8gbGVycC5cbiAgICAgKiBAcGFyYW0gIHtOdW1iZXJ9IG5ld0xlbmd0aCBUaGUgbGVuZ3RoIHRoZSBhcnJheSBzaG91bGQgYmUgaW50ZXJwb2xhdGVkIHRvLlxuICAgICAqIEByZXR1cm4ge0FycmF5fSAgICAgICAgICAgVGhlIGludGVycG9sYXRlZCBhcnJheS5cbiAgICAgKi9cbiAgICAgaW50ZXJwb2xhdGVBcnJheSAoc3JjQXJyYXksIG5ld0xlbmd0aCkge1xuICAgICAgICBsZXQgc291cmNlTGVuZ3RoID0gc3JjQXJyYXkubGVuZ3RoLFxuICAgICAgICAgICAgbmV3QXJyYXkgPSBbIHR5cGVvZiBzcmNBcnJheVsgMCBdLmNsb25lID09PSAnZnVuY3Rpb24nID8gc3JjQXJyYXlbIDAgXS5jbG9uZSgpIDogc3JjQXJyYXlbIDAgXSBdLFxuICAgICAgICAgICAgZmFjdG9yID0gKHNvdXJjZUxlbmd0aCAtIDEpIC8gKG5ld0xlbmd0aCAtIDEpO1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAxOyBpIDwgbmV3TGVuZ3RoIC0gMTsgKytpKSB7XG4gICAgICAgICAgICBsZXQgZiA9IGkgKiBmYWN0b3IsXG4gICAgICAgICAgICAgICAgYmVmb3JlID0gTWF0aC5mbG9vcihmKSxcbiAgICAgICAgICAgICAgICBhZnRlciA9IE1hdGguY2VpbChmKSxcbiAgICAgICAgICAgICAgICBkZWx0YSA9IGYgLSBiZWZvcmU7XG5cbiAgICAgICAgICAgIG5ld0FycmF5WyBpIF0gPSB0aGlzLmxlcnBUeXBlQWdub3N0aWMoc3JjQXJyYXlbIGJlZm9yZSBdLCBzcmNBcnJheVsgYWZ0ZXIgXSwgZGVsdGEpO1xuICAgICAgICB9XG5cbiAgICAgICAgbmV3QXJyYXkucHVzaChcbiAgICAgICAgICAgIHR5cGVvZiBzcmNBcnJheVsgc291cmNlTGVuZ3RoIC0gMSBdLmNsb25lID09PSAnZnVuY3Rpb24nXG4gICAgICAgICAgICA/IHNyY0FycmF5WyBzb3VyY2VMZW5ndGggLSAxIF0uY2xvbmUoKVxuICAgICAgICAgICAgOiBzcmNBcnJheVsgc291cmNlTGVuZ3RoIC0gMSBdXG4gICAgICAgICk7XG5cbiAgICAgICAgcmV0dXJuIG5ld0FycmF5O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDbGFtcCBhIG51bWJlciB0byBiZXR3ZWVuIHRoZSBnaXZlbiBtaW4gYW5kIG1heCB2YWx1ZXMuXG4gICAgICogQHBhcmFtICB7TnVtYmVyfSB2YWx1ZSBUaGUgbnVtYmVyIHRvIGNsYW1wLlxuICAgICAqIEBwYXJhbSAge051bWJlcn0gbWluICAgVGhlIG1pbmltdW0gdmFsdWUuXG4gICAgICogQHBhcmFtICB7TnVtYmVyfSBtYXggICBUaGUgbWF4aW11bSB2YWx1ZS5cbiAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9ICAgICAgIFRoZSBjbGFtcGVkIG51bWJlci5cbiAgICAgKi9cbiAgICAgY2xhbXAodmFsdWUsIG1pbiwgbWF4KSB7XG4gICAgICAgIHJldHVybiBNYXRoLm1heChtaW4sIE1hdGgubWluKHZhbHVlLCBtYXgpKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSWYgdGhlIGdpdmVuIHZhbHVlIGlzIGxlc3MgdGhhbiB0aGUgZXBzaWxvbiB2YWx1ZSwgdGhlbiByZXR1cm5cbiAgICAgKiBhIHJhbmRvbWlzZWQgZXBzaWxvbiB2YWx1ZSBpZiBzcGVjaWZpZWQsIG9yIGp1c3QgdGhlIGVwc2lsb24gdmFsdWUgaWYgbm90LlxuICAgICAqIFdvcmtzIGZvciBuZWdhdGl2ZSBudW1iZXJzIGFzIHdlbGwgYXMgcG9zaXRpdmUuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gIHtOdW1iZXJ9IHZhbHVlICAgICBUaGUgdmFsdWUgdG8gcGVyZm9ybSB0aGUgb3BlcmF0aW9uIG9uLlxuICAgICAqIEBwYXJhbSAge0Jvb2xlYW59IHJhbmRvbWlzZSBXaGV0aGVyIHRoZSB2YWx1ZSBzaG91bGQgYmUgcmFuZG9taXNlZC5cbiAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9ICAgICAgICAgICBUaGUgcmVzdWx0IG9mIHRoZSBvcGVyYXRpb24uXG4gICAgICovXG4gICAgemVyb1RvRXBzaWxvbih2YWx1ZSwgcmFuZG9taXNlKSB7XG4gICAgICAgIGxldCBlcHNpbG9uID0gMC4wMDAwMSxcbiAgICAgICAgICAgIHJlc3VsdCA9IHZhbHVlO1xuXG4gICAgICAgIHJlc3VsdCA9IHJhbmRvbWlzZSA/IE1hdGgucmFuZG9tKCkgKiBlcHNpbG9uICogMTAgOiBlcHNpbG9uO1xuXG4gICAgICAgIGlmICh2YWx1ZSA8IDAgJiYgdmFsdWUgPiAtZXBzaWxvbikge1xuICAgICAgICAgICAgcmVzdWx0ID0gLXJlc3VsdDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIExpbmVhcmx5IGludGVycG9sYXRlcyB0d28gdmFsdWVzIG9mIGxldGlvdXMgdHlwZXMuIFRoZSBnaXZlbiB2YWx1ZXNcbiAgICAgKiBtdXN0IGJlIG9mIHRoZSBzYW1lIHR5cGUgZm9yIHRoZSBpbnRlcnBvbGF0aW9uIHRvIHdvcmsuXG4gICAgICogQHBhcmFtICB7KG51bWJlcnxPYmplY3QpfSBzdGFydCBUaGUgc3RhcnQgdmFsdWUgb2YgdGhlIGxlcnAuXG4gICAgICogQHBhcmFtICB7KG51bWJlcnxvYmplY3QpfSBlbmQgICBUaGUgZW5kIHZhbHVlIG9mIHRoZSBsZXJwLlxuICAgICAqIEBwYXJhbSAge051bWJlcn0gZGVsdGEgVGhlIGRlbHRhIHBvc2lpdG9uIG9mIHRoZSBsZXJwIG9wZXJhdGlvbi4gSWRlYWxseSBiZXR3ZWVuIDAgYW5kIDEgKGluY2x1c2l2ZSkuXG4gICAgICogQHJldHVybiB7KG51bWJlcnxvYmplY3R8dW5kZWZpbmVkKX0gICAgICAgVGhlIHJlc3VsdCBvZiB0aGUgb3BlcmF0aW9uLiBSZXN1bHQgd2lsbCBiZSB1bmRlZmluZWQgaWZcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhlIHN0YXJ0IGFuZCBlbmQgYXJndW1lbnRzIGFyZW4ndCBhIHN1cHBvcnRlZCB0eXBlLCBvclxuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiB0aGVpciB0eXBlcyBkbyBub3QgbWF0Y2guXG4gICAgICovXG4gICAgbGVycFR5cGVBZ25vc3RpYyhzdGFydCwgZW5kLCBkZWx0YSkge1xuICAgICAgICBsZXQgdHlwZXMgPSB0aGlzLnR5cGVzLFxuICAgICAgICAgICAgb3V0O1xuXG4gICAgICAgIGlmICh0eXBlb2Ygc3RhcnQgPT09IHR5cGVzLk5VTUJFUiAmJiB0eXBlb2YgZW5kID09PSB0eXBlcy5OVU1CRVIpIHtcbiAgICAgICAgICAgIHJldHVybiBzdGFydCArICgoZW5kIC0gc3RhcnQpICogZGVsdGEpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHN0YXJ0IGluc3RhbmNlb2YgVEhSRUUuVmVjdG9yMiAmJiBlbmQgaW5zdGFuY2VvZiBUSFJFRS5WZWN0b3IyKSB7XG4gICAgICAgICAgICBvdXQgPSBzdGFydC5jbG9uZSgpO1xuICAgICAgICAgICAgb3V0LnggPSB0aGlzLmxlcnAoc3RhcnQueCwgZW5kLngsIGRlbHRhKTtcbiAgICAgICAgICAgIG91dC55ID0gdGhpcy5sZXJwKHN0YXJ0LnksIGVuZC55LCBkZWx0YSk7XG4gICAgICAgICAgICByZXR1cm4gb3V0O1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHN0YXJ0IGluc3RhbmNlb2YgVEhSRUUuVmVjdG9yMyAmJiBlbmQgaW5zdGFuY2VvZiBUSFJFRS5WZWN0b3IzKSB7XG4gICAgICAgICAgICBvdXQgPSBzdGFydC5jbG9uZSgpO1xuICAgICAgICAgICAgb3V0LnggPSB0aGlzLmxlcnAoc3RhcnQueCwgZW5kLngsIGRlbHRhKTtcbiAgICAgICAgICAgIG91dC55ID0gdGhpcy5sZXJwKHN0YXJ0LnksIGVuZC55LCBkZWx0YSk7XG4gICAgICAgICAgICBvdXQueiA9IHRoaXMubGVycChzdGFydC56LCBlbmQueiwgZGVsdGEpO1xuICAgICAgICAgICAgcmV0dXJuIG91dDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChzdGFydCBpbnN0YW5jZW9mIFRIUkVFLlZlY3RvcjQgJiYgZW5kIGluc3RhbmNlb2YgVEhSRUUuVmVjdG9yNCkge1xuICAgICAgICAgICAgb3V0ID0gc3RhcnQuY2xvbmUoKTtcbiAgICAgICAgICAgIG91dC54ID0gdGhpcy5sZXJwKHN0YXJ0LngsIGVuZC54LCBkZWx0YSk7XG4gICAgICAgICAgICBvdXQueSA9IHRoaXMubGVycChzdGFydC55LCBlbmQueSwgZGVsdGEpO1xuICAgICAgICAgICAgb3V0LnogPSB0aGlzLmxlcnAoc3RhcnQueiwgZW5kLnosIGRlbHRhKTtcbiAgICAgICAgICAgIG91dC53ID0gdGhpcy5sZXJwKHN0YXJ0LncsIGVuZC53LCBkZWx0YSk7XG4gICAgICAgICAgICByZXR1cm4gb3V0O1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHN0YXJ0IGluc3RhbmNlb2YgVEhSRUUuQ29sb3IgJiYgZW5kIGluc3RhbmNlb2YgVEhSRUUuQ29sb3IpIHtcbiAgICAgICAgICAgIG91dCA9IHN0YXJ0LmNsb25lKCk7XG4gICAgICAgICAgICBvdXQuciA9IHRoaXMubGVycChzdGFydC5yLCBlbmQuciwgZGVsdGEpO1xuICAgICAgICAgICAgb3V0LmcgPSB0aGlzLmxlcnAoc3RhcnQuZywgZW5kLmcsIGRlbHRhKTtcbiAgICAgICAgICAgIG91dC5iID0gdGhpcy5sZXJwKHN0YXJ0LmIsIGVuZC5iLCBkZWx0YSk7XG4gICAgICAgICAgICByZXR1cm4gb3V0O1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdJbnZhbGlkIGFyZ3VtZW50IHR5cGVzLCBvciBhcmd1bWVudCB0eXBlcyBkbyBub3QgbWF0Y2g6Jywgc3RhcnQsIGVuZCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUGVyZm9ybSBhIGxpbmVhciBpbnRlcnBvbGF0aW9uIG9wZXJhdGlvbiBvbiB0d28gbnVtYmVycy5cbiAgICAgKiBAcGFyYW0gIHtOdW1iZXJ9IHN0YXJ0IFRoZSBzdGFydCB2YWx1ZS5cbiAgICAgKiBAcGFyYW0gIHtOdW1iZXJ9IGVuZCAgIFRoZSBlbmQgdmFsdWUuXG4gICAgICogQHBhcmFtICB7TnVtYmVyfSBkZWx0YSBUaGUgcG9zaXRpb24gdG8gaW50ZXJwb2xhdGUgdG8uXG4gICAgICogQHJldHVybiB7TnVtYmVyfSAgICAgICBUaGUgcmVzdWx0IG9mIHRoZSBsZXJwIG9wZXJhdGlvbi5cbiAgICAgKi9cbiAgICBsZXJwKHN0YXJ0LCBlbmQsIGRlbHRhKSB7XG4gICAgICAgIHJldHVybiBzdGFydCArICgoZW5kIC0gc3RhcnQpICogZGVsdGEpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSb3VuZHMgYSBudW1iZXIgdG8gYSBuZWFyZXN0IG11bHRpcGxlLlxuICAgICAqXG4gICAgICogQHBhcmFtICB7TnVtYmVyfSBuICAgICAgICBUaGUgbnVtYmVyIHRvIHJvdW5kLlxuICAgICAqIEBwYXJhbSAge051bWJlcn0gbXVsdGlwbGUgVGhlIG11bHRpcGxlIHRvIHJvdW5kIHRvLlxuICAgICAqIEByZXR1cm4ge051bWJlcn0gICAgICAgICAgVGhlIHJlc3VsdCBvZiB0aGUgcm91bmQgb3BlcmF0aW9uLlxuICAgICAqL1xuICAgIHJvdW5kVG9OZWFyZXN0TXVsdGlwbGUobiwgbXVsdGlwbGUpIHtcbiAgICAgICAgbGV0IHJlbWFpbmRlciA9IDA7XG5cbiAgICAgICAgaWYgKG11bHRpcGxlID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gbjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJlbWFpbmRlciA9IE1hdGguYWJzKG4pICUgbXVsdGlwbGU7XG5cbiAgICAgICAgaWYgKHJlbWFpbmRlciA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIG47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobiA8IDApIHtcbiAgICAgICAgICAgIHJldHVybiAtKE1hdGguYWJzKG4pIC0gcmVtYWluZGVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBuICsgbXVsdGlwbGUgLSByZW1haW5kZXI7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENoZWNrIGlmIGFsbCBpdGVtcyBpbiBhbiBhcnJheSBhcmUgZXF1YWwuIFVzZXMgc3RyaWN0IGVxdWFsaXR5LlxuICAgICAqXG4gICAgICogQHBhcmFtICB7QXJyYXl9IGFycmF5IFRoZSBhcnJheSBvZiB2YWx1ZXMgdG8gY2hlY2sgZXF1YWxpdHkgb2YuXG4gICAgICogQHJldHVybiB7Qm9vbGVhbn0gICAgICAgV2hldGhlciB0aGUgYXJyYXkncyB2YWx1ZXMgYXJlIGFsbCBlcXVhbCBvciBub3QuXG4gICAgICovXG4gICAgYXJyYXlWYWx1ZXNBcmVFcXVhbChhcnJheSkge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFycmF5Lmxlbmd0aCAtIDE7ICsraSkge1xuICAgICAgICAgICAgaWYgKGFycmF5WyBpIF0gIT09IGFycmF5WyBpICsgMSBdKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSxcblxuICAgIC8vIGNvbG9yc0FyZUVxdWFsOiBmdW5jdGlvbigpIHtcbiAgICAvLyAgICAgbGV0IGNvbG9ycyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKCBhcmd1bWVudHMgKSxcbiAgICAvLyAgICAgICAgIG51bUNvbG9ycyA9IGNvbG9ycy5sZW5ndGg7XG5cbiAgICAvLyAgICAgZm9yICggbGV0IGkgPSAwLCBjb2xvcjEsIGNvbG9yMjsgaSA8IG51bUNvbG9ycyAtIDE7ICsraSApIHtcbiAgICAvLyAgICAgICAgIGNvbG9yMSA9IGNvbG9yc1sgaSBdO1xuICAgIC8vICAgICAgICAgY29sb3IyID0gY29sb3JzWyBpICsgMSBdO1xuXG4gICAgLy8gICAgICAgICBpZiAoXG4gICAgLy8gICAgICAgICAgICAgY29sb3IxLnIgIT09IGNvbG9yMi5yIHx8XG4gICAgLy8gICAgICAgICAgICAgY29sb3IxLmcgIT09IGNvbG9yMi5nIHx8XG4gICAgLy8gICAgICAgICAgICAgY29sb3IxLmIgIT09IGNvbG9yMi5iXG4gICAgLy8gICAgICAgICApIHtcbiAgICAvLyAgICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAvLyAgICAgICAgIH1cbiAgICAvLyAgICAgfVxuXG4gICAgLy8gICAgIHJldHVybiB0cnVlO1xuICAgIC8vIH0sXG5cbiAgICAvKipcbiAgICAgKiBHaXZlbiBhIHN0YXJ0IHZhbHVlIGFuZCBhIHNwcmVhZCB2YWx1ZSwgY3JlYXRlIGFuZCByZXR1cm4gYSByYW5kb21cbiAgICAgKiBudW1iZXIuXG4gICAgICogQHBhcmFtICB7TnVtYmVyfSBiYXNlICAgVGhlIHN0YXJ0IHZhbHVlLlxuICAgICAqIEBwYXJhbSAge051bWJlcn0gc3ByZWFkIFRoZSBzaXplIG9mIHRoZSByYW5kb20gbGV0aWFuY2UgdG8gYXBwbHkuXG4gICAgICogQHJldHVybiB7TnVtYmVyfSAgICAgICAgQSByYW5kb21pc2VkIG51bWJlci5cbiAgICAgKi9cbiAgICByYW5kb21GbG9hdChiYXNlLCBzcHJlYWQpIHtcbiAgICAgICAgcmV0dXJuIGJhc2UgKyBzcHJlYWQgKiAoTWF0aC5yYW5kb20oKSAtIDAuNSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdpdmVuIGFuIFNQRS5TaGFkZXJBdHRyaWJ1dGUgaW5zdGFuY2UsIGFuZCBsZXRpb3VzIG90aGVyIHNldHRpbmdzLFxuICAgICAqIGFzc2lnbiB2YWx1ZXMgdG8gdGhlIGF0dHJpYnV0ZSdzIGFycmF5IGluIGEgYHZlYzNgIGZvcm1hdC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSAge09iamVjdH0gYXR0cmlidXRlICAgVGhlIGluc3RhbmNlIG9mIFNQRS5TaGFkZXJBdHRyaWJ1dGUgdG8gc2F2ZSB0aGUgcmVzdWx0IHRvLlxuICAgICAqIEBwYXJhbSAge051bWJlcn0gaW5kZXggICAgICAgVGhlIG9mZnNldCBpbiB0aGUgYXR0cmlidXRlJ3MgVHlwZWRBcnJheSB0byBzYXZlIHRoZSByZXN1bHQgZnJvbS5cbiAgICAgKiBAcGFyYW0gIHtPYmplY3R9IGJhc2UgICAgICAgIFRIUkVFLlZlY3RvcjMgaW5zdGFuY2UgZGVzY3JpYmluZyB0aGUgc3RhcnQgdmFsdWUuXG4gICAgICogQHBhcmFtICB7T2JqZWN0fSBzcHJlYWQgICAgICBUSFJFRS5WZWN0b3IzIGluc3RhbmNlIGRlc2NyaWJpbmcgdGhlIHJhbmRvbSBsZXRpYW5jZSB0byBhcHBseSB0byB0aGUgc3RhcnQgdmFsdWUuXG4gICAgICogQHBhcmFtICB7T2JqZWN0fSBzcHJlYWRDbGFtcCBUSFJFRS5WZWN0b3IzIGluc3RhbmNlIGRlc2NyaWJpbmcgdGhlIG11bHRpcGxlcyB0byBjbGFtcCB0aGUgcmFuZG9tbmVzcyB0by5cbiAgICAgKi9cbiAgICByYW5kb21WZWN0b3IzKGF0dHJpYnV0ZSwgaW5kZXgsIGJhc2UsIHNwcmVhZCwgc3ByZWFkQ2xhbXApIHtcbiAgICAgICAgbGV0IHggPSBiYXNlLnggKyAoTWF0aC5yYW5kb20oKSAqIHNwcmVhZC54IC0gKHNwcmVhZC54ICogMC41KSksXG4gICAgICAgICAgICB5ID0gYmFzZS55ICsgKE1hdGgucmFuZG9tKCkgKiBzcHJlYWQueSAtIChzcHJlYWQueSAqIDAuNSkpLFxuICAgICAgICAgICAgeiA9IGJhc2UueiArIChNYXRoLnJhbmRvbSgpICogc3ByZWFkLnogLSAoc3ByZWFkLnogKiAwLjUpKTtcblxuICAgICAgICAvLyBsZXQgeCA9IHRoaXMucmFuZG9tRmxvYXQoIGJhc2UueCwgc3ByZWFkLnggKSxcbiAgICAgICAgLy8geSA9IHRoaXMucmFuZG9tRmxvYXQoIGJhc2UueSwgc3ByZWFkLnkgKSxcbiAgICAgICAgLy8geiA9IHRoaXMucmFuZG9tRmxvYXQoIGJhc2Uueiwgc3ByZWFkLnogKTtcblxuICAgICAgICBpZiAoc3ByZWFkQ2xhbXApIHtcbiAgICAgICAgICAgIHggPSAtc3ByZWFkQ2xhbXAueCAqIDAuNSArIHRoaXMucm91bmRUb05lYXJlc3RNdWx0aXBsZSh4LCBzcHJlYWRDbGFtcC54KTtcbiAgICAgICAgICAgIHkgPSAtc3ByZWFkQ2xhbXAueSAqIDAuNSArIHRoaXMucm91bmRUb05lYXJlc3RNdWx0aXBsZSh5LCBzcHJlYWRDbGFtcC55KTtcbiAgICAgICAgICAgIHogPSAtc3ByZWFkQ2xhbXAueiAqIDAuNSArIHRoaXMucm91bmRUb05lYXJlc3RNdWx0aXBsZSh6LCBzcHJlYWRDbGFtcC56KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGF0dHJpYnV0ZS50eXBlZEFycmF5LnNldFZlYzNDb21wb25lbnRzKGluZGV4LCB4LCB5LCB6KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2l2ZW4gYW4gU1BFLlNoYWRlciBhdHRyaWJ1dGUgaW5zdGFuY2UsIGFuZCBsZXRpb3VzIG90aGVyIHNldHRpbmdzLFxuICAgICAqIGFzc2lnbiBDb2xvciB2YWx1ZXMgdG8gdGhlIGF0dHJpYnV0ZS5cbiAgICAgKiBAcGFyYW0gIHtPYmplY3R9IGF0dHJpYnV0ZSBUaGUgaW5zdGFuY2Ugb2YgU1BFLlNoYWRlckF0dHJpYnV0ZSB0byBzYXZlIHRoZSByZXN1bHQgdG8uXG4gICAgICogQHBhcmFtICB7TnVtYmVyfSBpbmRleCAgICAgVGhlIG9mZnNldCBpbiB0aGUgYXR0cmlidXRlJ3MgVHlwZWRBcnJheSB0byBzYXZlIHRoZSByZXN1bHQgZnJvbS5cbiAgICAgKiBAcGFyYW0gIHtPYmplY3R9IGJhc2UgICAgICBUSFJFRS5Db2xvciBpbnN0YW5jZSBkZXNjcmliaW5nIHRoZSBzdGFydCBjb2xvci5cbiAgICAgKiBAcGFyYW0gIHtPYmplY3R9IHNwcmVhZCAgICBUSFJFRS5WZWN0b3IzIGluc3RhbmNlIGRlc2NyaWJpbmcgdGhlIHJhbmRvbSBsZXRpYW5jZSB0byBhcHBseSB0byB0aGUgc3RhcnQgY29sb3IuXG4gICAgICovXG4gICAgcmFuZG9tQ29sb3IoYXR0cmlidXRlLCBpbmRleCwgYmFzZSwgc3ByZWFkKSB7XG4gICAgICAgIGxldCByID0gYmFzZS5yICsgKE1hdGgucmFuZG9tKCkgKiBzcHJlYWQueCksXG4gICAgICAgICAgICBnID0gYmFzZS5nICsgKE1hdGgucmFuZG9tKCkgKiBzcHJlYWQueSksXG4gICAgICAgICAgICBiID0gYmFzZS5iICsgKE1hdGgucmFuZG9tKCkgKiBzcHJlYWQueik7XG5cbiAgICAgICAgciA9IHRoaXMuY2xhbXAociwgMCwgMSk7XG4gICAgICAgIGcgPSB0aGlzLmNsYW1wKGcsIDAsIDEpO1xuICAgICAgICBiID0gdGhpcy5jbGFtcChiLCAwLCAxKTtcblxuICAgICAgICBhdHRyaWJ1dGUudHlwZWRBcnJheS5zZXRWZWMzQ29tcG9uZW50cyhpbmRleCwgciwgZywgYik7XG4gICAgfSxcblxuICAgIHJhbmRvbUNvbG9yQXNIZXg6IChmdW5jdGlvbigpIHtcbiAgICAgICAgbGV0IHdvcmtpbmdDb2xvciA9IG5ldyBUSFJFRS5Db2xvcigpO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBBc3NpZ25zIGEgcmFuZG9tIGNvbG9yIHZhbHVlLCBlbmNvZGVkIGFzIGEgaGV4IHZhbHVlIGluIGRlY2ltYWxcbiAgICAgICAgICogZm9ybWF0LCB0byBhIFNQRS5TaGFkZXJBdHRyaWJ1dGUgaW5zdGFuY2UuXG4gICAgICAgICAqIEBwYXJhbSAge09iamVjdH0gYXR0cmlidXRlIFRoZSBpbnN0YW5jZSBvZiBTUEUuU2hhZGVyQXR0cmlidXRlIHRvIHNhdmUgdGhlIHJlc3VsdCB0by5cbiAgICAgICAgICogQHBhcmFtICB7TnVtYmVyfSBpbmRleCAgICAgVGhlIG9mZnNldCBpbiB0aGUgYXR0cmlidXRlJ3MgVHlwZWRBcnJheSB0byBzYXZlIHRoZSByZXN1bHQgZnJvbS5cbiAgICAgICAgICogQHBhcmFtICB7T2JqZWN0fSBiYXNlICAgICAgVEhSRUUuQ29sb3IgaW5zdGFuY2UgZGVzY3JpYmluZyB0aGUgc3RhcnQgY29sb3IuXG4gICAgICAgICAqIEBwYXJhbSAge09iamVjdH0gc3ByZWFkICAgIFRIUkVFLlZlY3RvcjMgaW5zdGFuY2UgZGVzY3JpYmluZyB0aGUgcmFuZG9tIGxldGlhbmNlIHRvIGFwcGx5IHRvIHRoZSBzdGFydCBjb2xvci5cbiAgICAgICAgICovXG4gICAgICAgIHJldHVybiBmdW5jdGlvbihhdHRyaWJ1dGUsIGluZGV4LCBiYXNlLCBzcHJlYWQpIHtcbiAgICAgICAgICAgIGxldCBudW1JdGVtcyA9IGJhc2UubGVuZ3RoLFxuICAgICAgICAgICAgICAgIGNvbG9ycyA9IFtdO1xuXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG51bUl0ZW1zOyArK2kpIHtcbiAgICAgICAgICAgICAgICBsZXQgc3ByZWFkVmVjdG9yID0gc3ByZWFkWyBpIF07XG5cbiAgICAgICAgICAgICAgICB3b3JraW5nQ29sb3IuY29weShiYXNlWyBpIF0pO1xuXG4gICAgICAgICAgICAgICAgd29ya2luZ0NvbG9yLnIgKz0gKE1hdGgucmFuZG9tKCkgKiBzcHJlYWRWZWN0b3IueCkgLSAoc3ByZWFkVmVjdG9yLnggKiAwLjUpO1xuICAgICAgICAgICAgICAgIHdvcmtpbmdDb2xvci5nICs9IChNYXRoLnJhbmRvbSgpICogc3ByZWFkVmVjdG9yLnkpIC0gKHNwcmVhZFZlY3Rvci55ICogMC41KTtcbiAgICAgICAgICAgICAgICB3b3JraW5nQ29sb3IuYiArPSAoTWF0aC5yYW5kb20oKSAqIHNwcmVhZFZlY3Rvci56KSAtIChzcHJlYWRWZWN0b3IueiAqIDAuNSk7XG5cbiAgICAgICAgICAgICAgICB3b3JraW5nQ29sb3IuciA9IHRoaXMuY2xhbXAod29ya2luZ0NvbG9yLnIsIDAsIDEpO1xuICAgICAgICAgICAgICAgIHdvcmtpbmdDb2xvci5nID0gdGhpcy5jbGFtcCh3b3JraW5nQ29sb3IuZywgMCwgMSk7XG4gICAgICAgICAgICAgICAgd29ya2luZ0NvbG9yLmIgPSB0aGlzLmNsYW1wKHdvcmtpbmdDb2xvci5iLCAwLCAxKTtcblxuICAgICAgICAgICAgICAgIGNvbG9ycy5wdXNoKHdvcmtpbmdDb2xvci5nZXRIZXgoKSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGF0dHJpYnV0ZS50eXBlZEFycmF5LnNldFZlYzRDb21wb25lbnRzKGluZGV4LCBjb2xvcnNbIDAgXSwgY29sb3JzWyAxIF0sIGNvbG9yc1sgMiBdLCBjb2xvcnNbIDMgXSk7XG4gICAgICAgIH07XG4gICAgfSgpKSxcblxuICAgIC8qKlxuICAgICAqIEdpdmVuIGFuIFNQRS5TaGFkZXJBdHRyaWJ1dGUgaW5zdGFuY2UsIGFuZCBsZXRpb3VzIG90aGVyIHNldHRpbmdzLFxuICAgICAqIGFzc2lnbiB2YWx1ZXMgdG8gdGhlIGF0dHJpYnV0ZSdzIGFycmF5IGluIGEgYHZlYzNgIGZvcm1hdC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSAge09iamVjdH0gYXR0cmlidXRlICAgVGhlIGluc3RhbmNlIG9mIFNQRS5TaGFkZXJBdHRyaWJ1dGUgdG8gc2F2ZSB0aGUgcmVzdWx0IHRvLlxuICAgICAqIEBwYXJhbSAge051bWJlcn0gaW5kZXggICAgICAgVGhlIG9mZnNldCBpbiB0aGUgYXR0cmlidXRlJ3MgVHlwZWRBcnJheSB0byBzYXZlIHRoZSByZXN1bHQgZnJvbS5cbiAgICAgKiBAcGFyYW0gIHtPYmplY3R9IHN0YXJ0ICAgICAgIFRIUkVFLlZlY3RvcjMgaW5zdGFuY2UgZGVzY3JpYmluZyB0aGUgc3RhcnQgbGluZSBwb3NpdGlvbi5cbiAgICAgKiBAcGFyYW0gIHtPYmplY3R9IGVuZCAgICAgICAgIFRIUkVFLlZlY3RvcjMgaW5zdGFuY2UgZGVzY3JpYmluZyB0aGUgZW5kIGxpbmUgcG9zaXRpb24uXG4gICAgICovXG4gICAgcmFuZG9tVmVjdG9yM09uTGluZShhdHRyaWJ1dGUsIGluZGV4LCBzdGFydCwgZW5kKSB7XG4gICAgICAgIGxldCBwb3MgPSBzdGFydC5jbG9uZSgpO1xuXG4gICAgICAgIHBvcy5sZXJwKGVuZCwgTWF0aC5yYW5kb20oKSk7XG5cbiAgICAgICAgYXR0cmlidXRlLnR5cGVkQXJyYXkuc2V0VmVjM0NvbXBvbmVudHMoaW5kZXgsIHBvcy54LCBwb3MueSwgcG9zLnopO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHaXZlbiBhbiBTUEUuU2hhZGVyIGF0dHJpYnV0ZSBpbnN0YW5jZSwgYW5kIGxldGlvdXMgb3RoZXIgc2V0dGluZ3MsXG4gICAgICogYXNzaWduIENvbG9yIHZhbHVlcyB0byB0aGUgYXR0cmlidXRlLlxuICAgICAqIEBwYXJhbSAge09iamVjdH0gYXR0cmlidXRlIFRoZSBpbnN0YW5jZSBvZiBTUEUuU2hhZGVyQXR0cmlidXRlIHRvIHNhdmUgdGhlIHJlc3VsdCB0by5cbiAgICAgKiBAcGFyYW0gIHtOdW1iZXJ9IGluZGV4ICAgICBUaGUgb2Zmc2V0IGluIHRoZSBhdHRyaWJ1dGUncyBUeXBlZEFycmF5IHRvIHNhdmUgdGhlIHJlc3VsdCBmcm9tLlxuICAgICAqIEBwYXJhbSAge09iamVjdH0gYmFzZSAgICAgIFRIUkVFLkNvbG9yIGluc3RhbmNlIGRlc2NyaWJpbmcgdGhlIHN0YXJ0IGNvbG9yLlxuICAgICAqIEBwYXJhbSAge09iamVjdH0gc3ByZWFkICAgIFRIUkVFLlZlY3RvcjMgaW5zdGFuY2UgZGVzY3JpYmluZyB0aGUgcmFuZG9tIGxldGlhbmNlIHRvIGFwcGx5IHRvIHRoZSBzdGFydCBjb2xvci5cbiAgICAgKi9cblxuICAgIC8qKlxuICAgICAqIEFzc2lnbnMgYSByYW5kb20gdmVjdG9yIDMgdmFsdWUgdG8gYW4gU1BFLlNoYWRlckF0dHJpYnV0ZSBpbnN0YW5jZSwgcHJvamVjdGluZyB0aGVcbiAgICAgKiBnaXZlbiB2YWx1ZXMgb250byBhIHNwaGVyZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSAge09iamVjdH0gYXR0cmlidXRlIFRoZSBpbnN0YW5jZSBvZiBTUEUuU2hhZGVyQXR0cmlidXRlIHRvIHNhdmUgdGhlIHJlc3VsdCB0by5cbiAgICAgKiBAcGFyYW0gIHtOdW1iZXJ9IGluZGV4ICAgICBUaGUgb2Zmc2V0IGluIHRoZSBhdHRyaWJ1dGUncyBUeXBlZEFycmF5IHRvIHNhdmUgdGhlIHJlc3VsdCBmcm9tLlxuICAgICAqIEBwYXJhbSAge09iamVjdH0gYmFzZSAgICAgICAgICAgICAgVEhSRUUuVmVjdG9yMyBpbnN0YW5jZSBkZXNjcmliaW5nIHRoZSBvcmlnaW4gb2YgdGhlIHRyYW5zZm9ybS5cbiAgICAgKiBAcGFyYW0gIHtOdW1iZXJ9IHJhZGl1cyAgICAgICAgICAgIFRoZSByYWRpdXMgb2YgdGhlIHNwaGVyZSB0byBwcm9qZWN0IG9udG8uXG4gICAgICogQHBhcmFtICB7TnVtYmVyfSByYWRpdXNTcHJlYWQgICAgICBUaGUgYW1vdW50IG9mIHJhbmRvbW5lc3MgdG8gYXBwbHkgdG8gdGhlIHByb2plY3Rpb24gcmVzdWx0XG4gICAgICogQHBhcmFtICB7T2JqZWN0fSByYWRpdXNTY2FsZSAgICAgICBUSFJFRS5WZWN0b3IzIGluc3RhbmNlIGRlc2NyaWJpbmcgdGhlIHNjYWxlIG9mIGVhY2ggYXhpcyBvZiB0aGUgc3BoZXJlLlxuICAgICAqIEBwYXJhbSAge051bWJlcn0gcmFkaXVzU3ByZWFkQ2xhbXAgV2hhdCBudW1lcmljIG11bHRpcGxlIHRoZSBwcm9qZWN0ZWQgdmFsdWUgc2hvdWxkIGJlIGNsYW1wZWQgdG8uXG4gICAgICovXG4gICAgcmFuZG9tVmVjdG9yM09uU3BoZXJlKFxuICAgICAgICBhdHRyaWJ1dGUsIGluZGV4LCBiYXNlLCByYWRpdXMsIHJhZGl1c1NwcmVhZCwgcmFkaXVzU2NhbGUsIHJhZGl1c1NwcmVhZENsYW1wLCBkaXN0cmlidXRpb25DbGFtcFxuICAgICkge1xuICAgICAgICBsZXQgZGVwdGggPSAyICogTWF0aC5yYW5kb20oKSAtIDEsXG4gICAgICAgICAgICB0ID0gNi4yODMyICogTWF0aC5yYW5kb20oKSxcbiAgICAgICAgICAgIHIgPSBNYXRoLnNxcnQoMSAtIGRlcHRoICogZGVwdGgpLFxuICAgICAgICAgICAgcmFuZCA9IHRoaXMucmFuZG9tRmxvYXQocmFkaXVzLCByYWRpdXNTcHJlYWQpLFxuICAgICAgICAgICAgeCA9IDAsXG4gICAgICAgICAgICB5ID0gMCxcbiAgICAgICAgICAgIHogPSAwO1xuXG4gICAgICAgIGlmIChyYWRpdXNTcHJlYWRDbGFtcCkge1xuICAgICAgICAgICAgcmFuZCA9IE1hdGgucm91bmQocmFuZCAvIHJhZGl1c1NwcmVhZENsYW1wKSAqIHJhZGl1c1NwcmVhZENsYW1wO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gU2V0IHBvc2l0aW9uIG9uIHNwaGVyZVxuICAgICAgICB4ID0gciAqIE1hdGguY29zKHQpICogcmFuZDtcbiAgICAgICAgeSA9IHIgKiBNYXRoLnNpbih0KSAqIHJhbmQ7XG4gICAgICAgIHogPSBkZXB0aCAqIHJhbmQ7XG5cbiAgICAgICAgLy8gQXBwbHkgcmFkaXVzIHNjYWxlIHRvIHRoaXMgcG9zaXRpb25cbiAgICAgICAgeCAqPSByYWRpdXNTY2FsZS54O1xuICAgICAgICB5ICo9IHJhZGl1c1NjYWxlLnk7XG4gICAgICAgIHogKj0gcmFkaXVzU2NhbGUuejtcblxuICAgICAgICAvLyBUcmFuc2xhdGUgdG8gdGhlIGJhc2UgcG9zaXRpb24uXG4gICAgICAgIHggKz0gYmFzZS54O1xuICAgICAgICB5ICs9IGJhc2UueTtcbiAgICAgICAgeiArPSBiYXNlLno7XG5cbiAgICAgICAgLy8gU2V0IHRoZSB2YWx1ZXMgaW4gdGhlIHR5cGVkIGFycmF5LlxuICAgICAgICBhdHRyaWJ1dGUudHlwZWRBcnJheS5zZXRWZWMzQ29tcG9uZW50cyhpbmRleCwgeCwgeSwgeik7XG4gICAgfSxcblxuICAgIHNlZWRlZFJhbmRvbShzZWVkKSB7XG4gICAgICAgIGxldCB4ID0gTWF0aC5zaW4oc2VlZCkgKiAxMDAwMDtcbiAgICAgICAgcmV0dXJuIHggLSAoeCB8IDApO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBc3NpZ25zIGEgcmFuZG9tIHZlY3RvciAzIHZhbHVlIHRvIGFuIFNQRS5TaGFkZXJBdHRyaWJ1dGUgaW5zdGFuY2UsIHByb2plY3RpbmcgdGhlXG4gICAgICogZ2l2ZW4gdmFsdWVzIG9udG8gYSAyZC1kaXNjLlxuICAgICAqXG4gICAgICogQHBhcmFtICB7T2JqZWN0fSBhdHRyaWJ1dGUgVGhlIGluc3RhbmNlIG9mIFNQRS5TaGFkZXJBdHRyaWJ1dGUgdG8gc2F2ZSB0aGUgcmVzdWx0IHRvLlxuICAgICAqIEBwYXJhbSAge051bWJlcn0gaW5kZXggICAgIFRoZSBvZmZzZXQgaW4gdGhlIGF0dHJpYnV0ZSdzIFR5cGVkQXJyYXkgdG8gc2F2ZSB0aGUgcmVzdWx0IGZyb20uXG4gICAgICogQHBhcmFtICB7T2JqZWN0fSBiYXNlICAgICAgICAgICAgICBUSFJFRS5WZWN0b3IzIGluc3RhbmNlIGRlc2NyaWJpbmcgdGhlIG9yaWdpbiBvZiB0aGUgdHJhbnNmb3JtLlxuICAgICAqIEBwYXJhbSAge051bWJlcn0gcmFkaXVzICAgICAgICAgICAgVGhlIHJhZGl1cyBvZiB0aGUgc3BoZXJlIHRvIHByb2plY3Qgb250by5cbiAgICAgKiBAcGFyYW0gIHtOdW1iZXJ9IHJhZGl1c1NwcmVhZCAgICAgIFRoZSBhbW91bnQgb2YgcmFuZG9tbmVzcyB0byBhcHBseSB0byB0aGUgcHJvamVjdGlvbiByZXN1bHRcbiAgICAgKiBAcGFyYW0gIHtPYmplY3R9IHJhZGl1c1NjYWxlICAgICAgIFRIUkVFLlZlY3RvcjMgaW5zdGFuY2UgZGVzY3JpYmluZyB0aGUgc2NhbGUgb2YgZWFjaCBheGlzIG9mIHRoZSBkaXNjLiBUaGUgei1jb21wb25lbnQgaXMgaWdub3JlZC5cbiAgICAgKiBAcGFyYW0gIHtOdW1iZXJ9IHJhZGl1c1NwcmVhZENsYW1wIFdoYXQgbnVtZXJpYyBtdWx0aXBsZSB0aGUgcHJvamVjdGVkIHZhbHVlIHNob3VsZCBiZSBjbGFtcGVkIHRvLlxuICAgICAqL1xuICAgIHJhbmRvbVZlY3RvcjNPbkRpc2MoYXR0cmlidXRlLCBpbmRleCwgYmFzZSwgcmFkaXVzLCByYWRpdXNTcHJlYWQsIHJhZGl1c1NjYWxlLCByYWRpdXNTcHJlYWRDbGFtcCkge1xuICAgICAgICBsZXQgdCA9IDYuMjgzMiAqIE1hdGgucmFuZG9tKCksXG4gICAgICAgICAgICByYW5kID0gTWF0aC5hYnModGhpcy5yYW5kb21GbG9hdChyYWRpdXMsIHJhZGl1c1NwcmVhZCkpLFxuICAgICAgICAgICAgeCA9IDAsXG4gICAgICAgICAgICB5ID0gMCxcbiAgICAgICAgICAgIHogPSAwO1xuXG4gICAgICAgIGlmIChyYWRpdXNTcHJlYWRDbGFtcCkge1xuICAgICAgICAgICAgcmFuZCA9IE1hdGgucm91bmQocmFuZCAvIHJhZGl1c1NwcmVhZENsYW1wKSAqIHJhZGl1c1NwcmVhZENsYW1wO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gU2V0IHBvc2l0aW9uIG9uIHNwaGVyZVxuICAgICAgICB4ID0gTWF0aC5jb3ModCkgKiByYW5kO1xuICAgICAgICB5ID0gTWF0aC5zaW4odCkgKiByYW5kO1xuXG4gICAgICAgIC8vIEFwcGx5IHJhZGl1cyBzY2FsZSB0byB0aGlzIHBvc2l0aW9uXG4gICAgICAgIHggKj0gcmFkaXVzU2NhbGUueDtcbiAgICAgICAgeSAqPSByYWRpdXNTY2FsZS55O1xuXG4gICAgICAgIC8vIFRyYW5zbGF0ZSB0byB0aGUgYmFzZSBwb3NpdGlvbi5cbiAgICAgICAgeCArPSBiYXNlLng7XG4gICAgICAgIHkgKz0gYmFzZS55O1xuICAgICAgICB6ICs9IGJhc2UuejtcblxuICAgICAgICAvLyBTZXQgdGhlIHZhbHVlcyBpbiB0aGUgdHlwZWQgYXJyYXkuXG4gICAgICAgIGF0dHJpYnV0ZS50eXBlZEFycmF5LnNldFZlYzNDb21wb25lbnRzKGluZGV4LCB4LCB5LCB6KTtcbiAgICB9LFxuXG4gICAgcmFuZG9tRGlyZWN0aW9uVmVjdG9yM09uU3BoZXJlOiAoZnVuY3Rpb24oKSB7XG4gICAgICAgIGxldCB2ID0gbmV3IFRIUkVFLlZlY3RvcjMoKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogR2l2ZW4gYW4gU1BFLlNoYWRlckF0dHJpYnV0ZSBpbnN0YW5jZSwgY3JlYXRlIGEgZGlyZWN0aW9uIHZlY3RvciBmcm9tIHRoZSBnaXZlblxuICAgICAgICAgKiBwb3NpdGlvbiwgdXNpbmcgYHNwZWVkYCBhcyB0aGUgbWFnbml0dWRlLiBWYWx1ZXMgYXJlIHNhdmVkIHRvIHRoZSBhdHRyaWJ1dGUuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwYXJhbSAge09iamVjdH0gYXR0cmlidXRlICAgICAgIFRoZSBpbnN0YW5jZSBvZiBTUEUuU2hhZGVyQXR0cmlidXRlIHRvIHNhdmUgdGhlIHJlc3VsdCB0by5cbiAgICAgICAgICogQHBhcmFtICB7TnVtYmVyfSBpbmRleCAgICAgICAgICAgVGhlIG9mZnNldCBpbiB0aGUgYXR0cmlidXRlJ3MgVHlwZWRBcnJheSB0byBzYXZlIHRoZSByZXN1bHQgZnJvbS5cbiAgICAgICAgICogQHBhcmFtICB7TnVtYmVyfSBwb3NYICAgICAgICAgICAgVGhlIHBhcnRpY2xlJ3MgeCBjb29yZGluYXRlLlxuICAgICAgICAgKiBAcGFyYW0gIHtOdW1iZXJ9IHBvc1kgICAgICAgICAgICBUaGUgcGFydGljbGUncyB5IGNvb3JkaW5hdGUuXG4gICAgICAgICAqIEBwYXJhbSAge051bWJlcn0gcG9zWiAgICAgICAgICAgIFRoZSBwYXJ0aWNsZSdzIHogY29vcmRpbmF0ZS5cbiAgICAgICAgICogQHBhcmFtICB7T2JqZWN0fSBlbWl0dGVyUG9zaXRpb24gVEhSRUUuVmVjdG9yMyBpbnN0YW5jZSBkZXNjcmliaW5nIHRoZSBlbWl0dGVyJ3MgYmFzZSBwb3NpdGlvbi5cbiAgICAgICAgICogQHBhcmFtICB7TnVtYmVyfSBzcGVlZCAgICAgICAgICAgVGhlIG1hZ25pdHVkZSB0byBhcHBseSB0byB0aGUgdmVjdG9yLlxuICAgICAgICAgKiBAcGFyYW0gIHtOdW1iZXJ9IHNwZWVkU3ByZWFkICAgICBUaGUgYW1vdW50IG9mIHJhbmRvbW5lc3MgdG8gYXBwbHkgdG8gdGhlIG1hZ25pdHVkZS5cbiAgICAgICAgICovXG4gICAgICAgIHJldHVybiBmdW5jdGlvbihhdHRyaWJ1dGUsIGluZGV4LCBwb3NYLCBwb3NZLCBwb3NaLCBlbWl0dGVyUG9zaXRpb24sIHNwZWVkLCBzcGVlZFNwcmVhZCkge1xuICAgICAgICAgICAgdi5jb3B5KGVtaXR0ZXJQb3NpdGlvbik7XG5cbiAgICAgICAgICAgIHYueCAtPSBwb3NYO1xuICAgICAgICAgICAgdi55IC09IHBvc1k7XG4gICAgICAgICAgICB2LnogLT0gcG9zWjtcblxuICAgICAgICAgICAgdi5ub3JtYWxpemUoKS5tdWx0aXBseVNjYWxhcigtdGhpcy5yYW5kb21GbG9hdChzcGVlZCwgc3BlZWRTcHJlYWQpKTtcblxuICAgICAgICAgICAgYXR0cmlidXRlLnR5cGVkQXJyYXkuc2V0VmVjM0NvbXBvbmVudHMoaW5kZXgsIHYueCwgdi55LCB2LnopO1xuICAgICAgICB9O1xuICAgIH0oKSksXG5cbiAgICByYW5kb21EaXJlY3Rpb25WZWN0b3IzT25EaXNjOiAoZnVuY3Rpb24oKSB7XG4gICAgICAgIGxldCB2ID0gbmV3IFRIUkVFLlZlY3RvcjMoKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogR2l2ZW4gYW4gU1BFLlNoYWRlckF0dHJpYnV0ZSBpbnN0YW5jZSwgY3JlYXRlIGEgZGlyZWN0aW9uIHZlY3RvciBmcm9tIHRoZSBnaXZlblxuICAgICAgICAgKiBwb3NpdGlvbiwgdXNpbmcgYHNwZWVkYCBhcyB0aGUgbWFnbml0dWRlLiBWYWx1ZXMgYXJlIHNhdmVkIHRvIHRoZSBhdHRyaWJ1dGUuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwYXJhbSAge09iamVjdH0gYXR0cmlidXRlICAgICAgIFRoZSBpbnN0YW5jZSBvZiBTUEUuU2hhZGVyQXR0cmlidXRlIHRvIHNhdmUgdGhlIHJlc3VsdCB0by5cbiAgICAgICAgICogQHBhcmFtICB7TnVtYmVyfSBpbmRleCAgICAgICAgICAgVGhlIG9mZnNldCBpbiB0aGUgYXR0cmlidXRlJ3MgVHlwZWRBcnJheSB0byBzYXZlIHRoZSByZXN1bHQgZnJvbS5cbiAgICAgICAgICogQHBhcmFtICB7TnVtYmVyfSBwb3NYICAgICAgICAgICAgVGhlIHBhcnRpY2xlJ3MgeCBjb29yZGluYXRlLlxuICAgICAgICAgKiBAcGFyYW0gIHtOdW1iZXJ9IHBvc1kgICAgICAgICAgICBUaGUgcGFydGljbGUncyB5IGNvb3JkaW5hdGUuXG4gICAgICAgICAqIEBwYXJhbSAge051bWJlcn0gcG9zWiAgICAgICAgICAgIFRoZSBwYXJ0aWNsZSdzIHogY29vcmRpbmF0ZS5cbiAgICAgICAgICogQHBhcmFtICB7T2JqZWN0fSBlbWl0dGVyUG9zaXRpb24gVEhSRUUuVmVjdG9yMyBpbnN0YW5jZSBkZXNjcmliaW5nIHRoZSBlbWl0dGVyJ3MgYmFzZSBwb3NpdGlvbi5cbiAgICAgICAgICogQHBhcmFtICB7TnVtYmVyfSBzcGVlZCAgICAgICAgICAgVGhlIG1hZ25pdHVkZSB0byBhcHBseSB0byB0aGUgdmVjdG9yLlxuICAgICAgICAgKiBAcGFyYW0gIHtOdW1iZXJ9IHNwZWVkU3ByZWFkICAgICBUaGUgYW1vdW50IG9mIHJhbmRvbW5lc3MgdG8gYXBwbHkgdG8gdGhlIG1hZ25pdHVkZS5cbiAgICAgICAgICovXG4gICAgICAgIHJldHVybiBmdW5jdGlvbihhdHRyaWJ1dGUsIGluZGV4LCBwb3NYLCBwb3NZLCBwb3NaLCBlbWl0dGVyUG9zaXRpb24sIHNwZWVkLCBzcGVlZFNwcmVhZCkge1xuICAgICAgICAgICAgdi5jb3B5KGVtaXR0ZXJQb3NpdGlvbik7XG5cbiAgICAgICAgICAgIHYueCAtPSBwb3NYO1xuICAgICAgICAgICAgdi55IC09IHBvc1k7XG4gICAgICAgICAgICB2LnogLT0gcG9zWjtcblxuICAgICAgICAgICAgdi5ub3JtYWxpemUoKS5tdWx0aXBseVNjYWxhcigtdGhpcy5yYW5kb21GbG9hdChzcGVlZCwgc3BlZWRTcHJlYWQpKTtcblxuICAgICAgICAgICAgYXR0cmlidXRlLnR5cGVkQXJyYXkuc2V0VmVjM0NvbXBvbmVudHMoaW5kZXgsIHYueCwgdi55LCAwKTtcbiAgICAgICAgfTtcbiAgICB9KCkpLFxuXG4gICAgZ2V0UGFja2VkUm90YXRpb25BeGlzOiAoZnVuY3Rpb24oKSB7XG4gICAgICAgIGxldCB2ID0gbmV3IFRIUkVFLlZlY3RvcjMoKSxcbiAgICAgICAgICAgIHZTcHJlYWQgPSBuZXcgVEhSRUUuVmVjdG9yMygpLFxuICAgICAgICAgICAgYyA9IG5ldyBUSFJFRS5Db2xvcigpLFxuICAgICAgICAgICAgYWRkT25lID0gbmV3IFRIUkVFLlZlY3RvcjMoMSwgMSwgMSk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEdpdmVuIGEgcm90YXRpb24gYXhpcywgYW5kIGEgcm90YXRpb24gYXhpcyBzcHJlYWQgdmVjdG9yLFxuICAgICAgICAgKiBjYWxjdWxhdGUgYSByYW5kb21pc2VkIHJvdGF0aW9uIGF4aXMsIGFuZCBwYWNrIGl0IGludG9cbiAgICAgICAgICogYSBoZXhhZGVjaW1hbCB2YWx1ZSByZXByZXNlbnRlZCBpbiBkZWNpbWFsIGZvcm0uXG4gICAgICAgICAqIEBwYXJhbSAge09iamVjdH0gYXhpcyAgICAgICBUSFJFRS5WZWN0b3IzIGluc3RhbmNlIGRlc2NyaWJpbmcgdGhlIHJvdGF0aW9uIGF4aXMuXG4gICAgICAgICAqIEBwYXJhbSAge09iamVjdH0gYXhpc1NwcmVhZCBUSFJFRS5WZWN0b3IzIGluc3RhbmNlIGRlc2NyaWJpbmcgdGhlIGFtb3VudCBvZiByYW5kb21uZXNzIHRvIGFwcGx5IHRvIHRoZSByb3RhdGlvbiBheGlzLlxuICAgICAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9ICAgICAgICAgICAgVGhlIHBhY2tlZCByb3RhdGlvbiBheGlzLCB3aXRoIHJhbmRvbW5lc3MuXG4gICAgICAgICAqL1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oYXhpcywgYXhpc1NwcmVhZCkge1xuICAgICAgICAgICAgdi5jb3B5KGF4aXMpLm5vcm1hbGl6ZSgpO1xuICAgICAgICAgICAgdlNwcmVhZC5jb3B5KGF4aXNTcHJlYWQpLm5vcm1hbGl6ZSgpO1xuXG4gICAgICAgICAgICB2LnggKz0gKC1heGlzU3ByZWFkLnggKiAwLjUpICsgKE1hdGgucmFuZG9tKCkgKiBheGlzU3ByZWFkLngpO1xuICAgICAgICAgICAgdi55ICs9ICgtYXhpc1NwcmVhZC55ICogMC41KSArIChNYXRoLnJhbmRvbSgpICogYXhpc1NwcmVhZC55KTtcbiAgICAgICAgICAgIHYueiArPSAoLWF4aXNTcHJlYWQueiAqIDAuNSkgKyAoTWF0aC5yYW5kb20oKSAqIGF4aXNTcHJlYWQueik7XG5cbiAgICAgICAgICAgIC8vIHYueCA9IE1hdGguYWJzKCB2LnggKTtcbiAgICAgICAgICAgIC8vIHYueSA9IE1hdGguYWJzKCB2LnkgKTtcbiAgICAgICAgICAgIC8vIHYueiA9IE1hdGguYWJzKCB2LnogKTtcblxuICAgICAgICAgICAgdi5ub3JtYWxpemUoKS5hZGQoYWRkT25lKS5tdWx0aXBseVNjYWxhcigwLjUpO1xuXG4gICAgICAgICAgICBjLnNldFJHQih2LngsIHYueSwgdi56KTtcblxuICAgICAgICAgICAgcmV0dXJuIGMuZ2V0SGV4KCk7XG4gICAgICAgIH07XG4gICAgfSgpKVxufSIsIlxuZXhwb3J0IGRlZmF1bHQge1xuICAgIC8qKlxuICAgICAqIEEgbWFwIG9mIHN1cHBvcnRlZCBkaXN0cmlidXRpb24gdHlwZXNcbiAgICAgKiBAZW51bSB7TnVtYmVyfVxuICAgICAqL1xuICAgICBkaXN0cmlidXRpb25zOiB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBWYWx1ZXMgd2lsbCBiZSBkaXN0cmlidXRlZCB3aXRoaW4gYSBib3guXG4gICAgICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICAgICAqL1xuICAgICAgICBCT1g6IDEsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFZhbHVlcyB3aWxsIGJlIGRpc3RyaWJ1dGVkIG9uIGEgc3BoZXJlLlxuICAgICAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAgICAgKi9cbiAgICAgICAgU1BIRVJFOiAyLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBWYWx1ZXMgd2lsbCBiZSBkaXN0cmlidXRlZCBvbiBhIDJkLWRpc2Mgc2hhcGUuXG4gICAgICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICAgICAqL1xuICAgICAgICBESVNDOiAzLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBWYWx1ZXMgd2lsbCBiZSBkaXN0cmlidXRlZCBhbG9uZyBhIGxpbmUuXG4gICAgICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICAgICAqL1xuICAgICAgICBMSU5FOiA0XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCB0aGlzIHZhbHVlIHRvIGhvd2V2ZXIgbWFueSAnc3RlcHMnIHlvdVxuICAgICAqIHdhbnQgdmFsdWUtb3Zlci1saWZldGltZSBwcm9wZXJ0aWVzIHRvIGhhdmUuXG4gICAgICpcbiAgICAgKiBJdCdzIGFkanVzdGFibGUgdG8gZml4IGFuIGludGVycG9sYXRpb24gcHJvYmxlbTpcbiAgICAgKlxuICAgICAqIEFzc3VtaW5nIHlvdSBzcGVjaWZ5IGFuIG9wYWNpdHkgdmFsdWUgYXMgWzAsIDEsIDBdXG4gICAgICogICAgICBhbmQgdGhlIGB2YWx1ZU92ZXJMaWZldGltZUxlbmd0aGAgaXMgNCwgdGhlbiB0aGVcbiAgICAgKiAgICAgIG9wYWNpdHkgdmFsdWUgYXJyYXkgd2lsbCBiZSByZWludGVycG9sYXRlZCB0b1xuICAgICAqICAgICAgYmUgWzAsIDAuNjYsIDAuNjYsIDBdLlxuICAgICAqICAgVGhpcyBpc24ndCBpZGVhbCwgYXMgcGFydGljbGVzIHdvdWxkIG5ldmVyIHJlYWNoXG4gICAgICogICBmdWxsIG9wYWNpdHkuXG4gICAgICpcbiAgICAgKiBOT1RFOlxuICAgICAqICAgICBUaGlzIHByb3BlcnR5IGFmZmVjdHMgdGhlIGxlbmd0aCBvZiBBTExcbiAgICAgKiAgICAgICB2YWx1ZS1vdmVyLWxpZmV0aW1lIHByb3BlcnRpZXMgZm9yIEFMTFxuICAgICAqICAgICAgIGVtaXR0ZXJzIGFuZCBBTEwgZ3JvdXBzLlxuICAgICAqXG4gICAgICogICAgIE9ubHkgdmFsdWVzID49IDMgJiYgPD0gNCBhcmUgYWxsb3dlZC5cbiAgICAgKlxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdmFsdWVPdmVyTGlmZXRpbWVMZW5ndGg6IDRcbn1cbiIsIi8qKlxuICogQSBoZWxwZXIgY2xhc3MgZm9yIFR5cGVkQXJyYXlzLlxuICpcbiAqIEFsbG93cyBmb3IgZWFzeSByZXNpemluZywgYXNzaWdubWVudCBvZiB2YXJpb3VzIGNvbXBvbmVudC1iYXNlZFxuICogdHlwZXMgKFZlY3RvcjJzLCBWZWN0b3IzcywgVmVjdG9yNHMsIE1hdDNzLCBNYXQ0cyksXG4gKiBhcyB3ZWxsIGFzIENvbG9ycyAod2hlcmUgY29tcG9uZW50cyBhcmUgYHJgLCBgZ2AsIGBiYCksXG4gKiBOdW1iZXJzLCBhbmQgc2V0dGluZyBmcm9tIG90aGVyIFR5cGVkQXJyYXlzLlxuICpcbiAqIEBhdXRob3IgSmFja1hpZTYwXG4gKiBAY29uc3RydWN0b3JcbiAqIEBwYXJhbSB7RnVuY3Rpb259IFR5cGVkQXJyYXlDb25zdHJ1Y3RvciBUaGUgY29uc3RydWN0b3IgdG8gdXNlIChGbG9hdDMyQXJyYXksIFVpbnQ4QXJyYXksIGV0Yy4pXG4gKiBAcGFyYW0ge051bWJlcn0gc2l6ZSAgICAgICAgICAgICAgICAgVGhlIHNpemUgb2YgdGhlIGFycmF5IHRvIGNyZWF0ZVxuICogQHBhcmFtIHtOdW1iZXJ9IGNvbXBvbmVudFNpemUgICAgICAgIFRoZSBudW1iZXIgb2YgY29tcG9uZW50cyBwZXItdmFsdWUgKGllLiAzIGZvciBhIHZlYzMsIDkgZm9yIGEgTWF0MywgZXRjLilcbiAqIEBwYXJhbSB7TnVtYmVyfSBpbmRleE9mZnNldCAgICAgICAgICBUaGUgaW5kZXggaW4gdGhlIGFycmF5IGZyb20gd2hpY2ggdG8gc3RhcnQgYXNzaWduaW5nIHZhbHVlcy4gRGVmYXVsdCBgMGAgaWYgbm9uZSBwcm92aWRlZFxuICovXG5cbmNsYXNzIFR5cGVkQXJyYXlIZWxwZXIge1xuICAgIGNvbnN0cnVjdG9yKFR5cGVkQXJyYXlDb25zdHJ1Y3Rvciwgc2l6ZSwgY29tcG9uZW50U2l6ZSwgaW5kZXhPZmZzZXQpIHtcbiAgICAgICAgdGhpcy5jb21wb25lbnRTaXplID0gY29tcG9uZW50U2l6ZSB8fCAxO1xuICAgICAgICB0aGlzLnNpemUgPSBzaXplIHx8IDE7XG4gICAgICAgIHRoaXMuVHlwZWRBcnJheUNvbnN0cnVjdG9yID0gVHlwZWRBcnJheUNvbnN0cnVjdG9yIHx8IEZsb2F0MzJBcnJheTtcbiAgICAgICAgdGhpcy5hcnJheSA9IG5ldyBUeXBlZEFycmF5Q29uc3RydWN0b3Ioc2l6ZSAqIHRoaXMuY29tcG9uZW50U2l6ZSk7XG4gICAgICAgIHRoaXMuaW5kZXhPZmZzZXQgPSBpbmRleE9mZnNldCB8fCAwO1xuICAgIH1cblxuICAgIHNldFNpemUoc2l6ZSwgbm9Db21wb25lbnRNdWx0aXBseSkge1xuICAgICAgICBjb25zdCBjdXJyZW50QXJyYXlTaXplID0gdGhpcy5hcnJheS5sZW5ndGg7XG5cbiAgICAgICAgaWYgKCFub0NvbXBvbmVudE11bHRpcGx5KSB7XG4gICAgICAgICAgICBzaXplID0gc2l6ZSAqIHRoaXMuY29tcG9uZW50U2l6ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzaXplIDwgY3VycmVudEFycmF5U2l6ZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2hyaW5rKHNpemUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHNpemUgPiBjdXJyZW50QXJyYXlTaXplKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5ncm93KHNpemUpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUuaW5mbygnVHlwZWRBcnJheSBpcyBhbHJlYWR5IG9mIHNpemU6Jywgc2l6ZSArICcuJywgJ1dpbGwgbm90IHJlc2l6ZS4nKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTaHJpbmtzIHRoZSBpbnRlcm5hbCBhcnJheS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSAge051bWJlcn0gc2l6ZSBUaGUgbmV3IHNpemUgb2YgdGhlIHR5cGVkIGFycmF5LiBNdXN0IGJlIHNtYWxsZXIgdGhhbiBgdGhpcy5hcnJheS5sZW5ndGhgLlxuICAgICAqIEByZXR1cm4ge1R5cGVkQXJyYXlIZWxwZXJ9ICAgICAgSW5zdGFuY2Ugb2YgdGhpcyBjbGFzcy5cbiAgICAgKi9cbiAgICBzaHJpbmsoc2l6ZSkge1xuICAgICAgICB0aGlzLmFycmF5ID0gdGhpcy5hcnJheS5zdWJhcnJheSgwLCBzaXplKTtcbiAgICAgICAgdGhpcy5zaXplID0gc2l6ZTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR3Jvd3MgdGhlIGludGVybmFsIGFycmF5LlxuICAgICAqIEBwYXJhbSAge051bWJlcn0gc2l6ZSBUaGUgbmV3IHNpemUgb2YgdGhlIHR5cGVkIGFycmF5LiBNdXN0IGJlIGxhcmdlciB0aGFuIGB0aGlzLmFycmF5Lmxlbmd0aGAuXG4gICAgICogQHJldHVybiB7VHlwZWRBcnJheUhlbHBlcn0gICAgICBJbnN0YW5jZSBvZiB0aGlzIGNsYXNzLlxuICAgICAqL1xuICAgIGdyb3coc2l6ZSkge1xuICAgICAgICBjb25zdCBuZXdBcnJheSA9IG5ldyB0aGlzLlR5cGVkQXJyYXlDb25zdHJ1Y3RvcihzaXplKTtcblxuICAgICAgICBuZXdBcnJheS5zZXQodGhpcy5hcnJheSk7XG4gICAgICAgIHRoaXMuYXJyYXkgPSBuZXdBcnJheTtcbiAgICAgICAgdGhpcy5zaXplID0gc2l6ZTtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQZXJmb3JtIGEgc3BsaWNlIG9wZXJhdGlvbiBvbiB0aGlzIGFycmF5J3MgYnVmZmVyLlxuICAgICAqIEBwYXJhbSAge051bWJlcn0gc3RhcnQgVGhlIHN0YXJ0IGluZGV4IG9mIHRoZSBzcGxpY2UuIFdpbGwgYmUgbXVsdGlwbGllZCBieSB0aGUgbnVtYmVyIG9mIGNvbXBvbmVudHMgZm9yIHRoaXMgYXR0cmlidXRlLlxuICAgICAqIEBwYXJhbSAge051bWJlcn0gZW5kIFRoZSBlbmQgaW5kZXggb2YgdGhlIHNwbGljZS4gV2lsbCBiZSBtdWx0aXBsaWVkIGJ5IHRoZSBudW1iZXIgb2YgY29tcG9uZW50cyBmb3IgdGhpcyBhdHRyaWJ1dGUuXG4gICAgICogQHJldHVybnMge09iamVjdH0gVGhlIFR5cGVkQXJyYXlIZWxwZXIgaW5zdGFuY2UuXG4gICAgICovXG4gICAgc3BsaWNlKHN0YXJ0LCBlbmQpIHtcbiAgICAgICAgY29uc3Qgc3RhcnRPZmZzZXQgPSBzdGFydCAqIHRoaXMuY29tcG9uZW50U2l6ZTtcbiAgICAgICAgY29uc3QgZW5kT2Zmc2V0ID0gZW5kICogdGhpcy5jb21wb25lbnRTaXplO1xuXG4gICAgICAgIGNvbnN0IGRhdGEgPSBbXTtcbiAgICAgICAgY29uc3Qgc2l6ZSA9IHRoaXMuYXJyYXkubGVuZ3RoO1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2l6ZTsgKytpKSB7XG4gICAgICAgICAgICBpZiAoaSA8IHN0YXJ0T2Zmc2V0IHx8IGkgPiBlbmRPZmZzZXQpIHtcbiAgICAgICAgICAgICAgICBkYXRhLnB1c2godGhpcy5hcnJheVtpXSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc2V0RnJvbUFycmF5KDAsIGRhdGEpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDb3BpZXMgZnJvbSB0aGUgZ2l2ZW4gVHlwZWRBcnJheSBpbnRvIHRoaXMgb25lLCB1c2luZyB0aGUgaW5kZXggYXJndW1lbnRcbiAgICAgKiBhcyB0aGUgc3RhcnQgcG9zaXRpb24uIEFsaWFzIGZvciBgVHlwZWRBcnJheS5zZXRgLiBXaWxsIGF1dG9tYXRpY2FsbHkgcmVzaXplXG4gICAgICogaWYgdGhlIGdpdmVuIHNvdXJjZSBhcnJheSBpcyBvZiBhIGxhcmdlciBzaXplIHRoYW4gdGhlIGludGVybmFsIGFycmF5LlxuICAgICAqXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IGluZGV4ICAgICAgVGhlIHN0YXJ0IHBvc2l0aW9uIGZyb20gd2hpY2ggdG8gY29weSBpbnRvIHRoaXMgYXJyYXkuXG4gICAgICogQHBhcmFtIHtUeXBlZEFycmF5fSBhcnJheSBUaGUgYXJyYXkgZnJvbSB3aGljaCB0byBjb3B5OyB0aGUgc291cmNlIGFycmF5LlxuICAgICAqIEByZXR1cm4ge1R5cGVkQXJyYXlIZWxwZXJ9IEluc3RhbmNlIG9mIHRoaXMgY2xhc3MuXG4gICAgICovXG4gICAgc2V0RnJvbUFycmF5KGluZGV4LCBhcnJheSkge1xuICAgICAgICBjb25zdCBzb3VyY2VBcnJheVNpemUgPSBhcnJheS5sZW5ndGg7XG4gICAgICAgIGNvbnN0IG5ld1NpemUgPSBpbmRleCArIHNvdXJjZUFycmF5U2l6ZTtcblxuICAgICAgICBpZiAobmV3U2l6ZSA+IHRoaXMuYXJyYXkubGVuZ3RoKSB7XG4gICAgICAgICAgICB0aGlzLmdyb3cobmV3U2l6ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAobmV3U2l6ZSA8IHRoaXMuYXJyYXkubGVuZ3RoKSB7XG4gICAgICAgICAgICB0aGlzLnNocmluayhuZXdTaXplKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuYXJyYXkuc2V0KGFycmF5LCB0aGlzLmluZGV4T2Zmc2V0ICsgaW5kZXgpO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCBhIFZlY3RvcjIgdmFsdWUgYXQgYGluZGV4YC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBpbmRleCBUaGUgaW5kZXggYXQgd2hpY2ggdG8gc2V0IHRoZSB2ZWMyIHZhbHVlcyBmcm9tLlxuICAgICAqIEBwYXJhbSB7VmVjdG9yMn0gdmVjMiAgQW55IG9iamVjdCB0aGF0IGhhcyBgeGAgYW5kIGB5YCBwcm9wZXJ0aWVzLlxuICAgICAqIEByZXR1cm4ge1R5cGVkQXJyYXlIZWxwZXJ9IEluc3RhbmNlIG9mIHRoaXMgY2xhc3MuXG4gICAgICovXG4gICAgc2V0VmVjMihpbmRleCwgdmVjMikge1xuICAgICAgICByZXR1cm4gdGhpcy5zZXRWZWMyQ29tcG9uZW50cyhpbmRleCwgdmVjMi54LCB2ZWMyLnkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCBhIFZlY3RvcjIgdmFsdWUgdXNpbmcgcmF3IGNvbXBvbmVudHMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gaW5kZXggVGhlIGluZGV4IGF0IHdoaWNoIHRvIHNldCB0aGUgdmVjMiB2YWx1ZXMgZnJvbS5cbiAgICAgKiBAcGFyYW0ge051bWJlcn0geCAgICAgVGhlIFZlYzIncyBgeGAgY29tcG9uZW50LlxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSB5ICAgICBUaGUgVmVjMidzIGB5YCBjb21wb25lbnQuXG4gICAgICogQHJldHVybiB7VHlwZWRBcnJheUhlbHBlcn0gSW5zdGFuY2Ugb2YgdGhpcyBjbGFzcy5cbiAgICAgKi9cbiAgICBzZXRWZWMyQ29tcG9uZW50cyAoaW5kZXgsIHgsIHkpIHtcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgICAgIGNvbnN0IGFycmF5ID0gdGhpcy5hcnJheSxcbiAgICAgICAgICAgIGkgPSB0aGlzLmluZGV4T2Zmc2V0ICsgKGluZGV4ICogdGhpcy5jb21wb25lbnRTaXplKTtcblxuICAgICAgICBhcnJheVsgaSBdID0geDtcbiAgICAgICAgYXJyYXlbIGkgKyAxIF0gPSB5O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogU2V0IGEgVmVjdG9yMyB2YWx1ZSBhdCBgaW5kZXhgLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IGluZGV4IFRoZSBpbmRleCBhdCB3aGljaCB0byBzZXQgdGhlIHZlYzMgdmFsdWVzIGZyb20uXG4gICAgICogQHBhcmFtIHtWZWN0b3IzfSB2ZWMyICBBbnkgb2JqZWN0IHRoYXQgaGFzIGB4YCwgYHlgLCBhbmQgYHpgIHByb3BlcnRpZXMuXG4gICAgICogQHJldHVybiB7VHlwZWRBcnJheUhlbHBlcn0gSW5zdGFuY2Ugb2YgdGhpcyBjbGFzcy5cbiAgICAgKi9cbiAgICBzZXRWZWMzKGluZGV4LCB2ZWMzKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNldFZlYzNDb21wb25lbnRzKGluZGV4LCB2ZWMzLngsIHZlYzMueSwgdmVjMy56KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgYSBWZWN0b3IzIHZhbHVlIHVzaW5nIHJhdyBjb21wb25lbnRzLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IGluZGV4IFRoZSBpbmRleCBhdCB3aGljaCB0byBzZXQgdGhlIHZlYzMgdmFsdWVzIGZyb20uXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHggICAgIFRoZSBWZWMzJ3MgYHhgIGNvbXBvbmVudC5cbiAgICAgKiBAcGFyYW0ge051bWJlcn0geSAgICAgVGhlIFZlYzMncyBgeWAgY29tcG9uZW50LlxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSB6ICAgICBUaGUgVmVjMydzIGB6YCBjb21wb25lbnQuXG4gICAgICogQHJldHVybiB7VHlwZWRBcnJheUhlbHBlcn0gSW5zdGFuY2Ugb2YgdGhpcyBjbGFzcy5cbiAgICAgKi9cbiAgICBzZXRWZWMzQ29tcG9uZW50cyhpbmRleCwgeCwgeSwgeikge1xuICAgICAgICBjb25zdCBhcnJheSA9IHRoaXMuYXJyYXk7XG4gICAgICAgIGNvbnN0IGkgPSB0aGlzLmluZGV4T2Zmc2V0ICsgKGluZGV4ICogdGhpcy5jb21wb25lbnRTaXplKTtcblxuICAgICAgICBhcnJheVtpXSA9IHg7XG4gICAgICAgIGFycmF5W2kgKyAxXSA9IHk7XG4gICAgICAgIGFycmF5W2kgKyAyXSA9IHo7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCBhIFZlY3RvcjQgdmFsdWUgYXQgYGluZGV4YC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBpbmRleCBUaGUgaW5kZXggYXQgd2hpY2ggdG8gc2V0IHRoZSB2ZWM0IHZhbHVlcyBmcm9tLlxuICAgICAqIEBwYXJhbSB7VmVjdG9yNH0gdmVjMiAgQW55IG9iamVjdCB0aGF0IGhhcyBgeGAsIGB5YCwgYHpgLCBhbmQgYHdgIHByb3BlcnRpZXMuXG4gICAgICogQHJldHVybiB7VHlwZWRBcnJheUhlbHBlcn0gSW5zdGFuY2Ugb2YgdGhpcyBjbGFzcy5cbiAgICAgKi9cbiAgICBzZXRWZWM0KGluZGV4LCB2ZWM0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNldFZlYzRDb21wb25lbnRzKGluZGV4LCB2ZWM0LngsIHZlYzQueSwgdmVjNC56LCB2ZWM0LncpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCBhIFZlY3RvcjQgdmFsdWUgdXNpbmcgcmF3IGNvbXBvbmVudHMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gaW5kZXggVGhlIGluZGV4IGF0IHdoaWNoIHRvIHNldCB0aGUgdmVjNCB2YWx1ZXMgZnJvbS5cbiAgICAgKiBAcGFyYW0ge051bWJlcn0geCAgICAgVGhlIFZlYzQncyBgeGAgY29tcG9uZW50LlxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSB5ICAgICBUaGUgVmVjNCdzIGB5YCBjb21wb25lbnQuXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHogICAgIFRoZSBWZWM0J3MgYHpgIGNvbXBvbmVudC5cbiAgICAgKiBAcGFyYW0ge051bWJlcn0gdyAgICAgVGhlIFZlYzQncyBgd2AgY29tcG9uZW50LlxuICAgICAqIEByZXR1cm4ge1R5cGVkQXJyYXlIZWxwZXJ9IEluc3RhbmNlIG9mIHRoaXMgY2xhc3MuXG4gICAgICovXG4gICAgc2V0VmVjNENvbXBvbmVudHMoaW5kZXgsIHgsIHksIHosIHcpIHtcbiAgICAgICAgY29uc3QgYXJyYXkgPSB0aGlzLmFycmF5O1xuICAgICAgICBjb25zdCBpID0gdGhpcy5pbmRleE9mZnNldCArIChpbmRleCAqIHRoaXMuY29tcG9uZW50U2l6ZSk7XG5cbiAgICAgICAgYXJyYXlbaV0gPSB4O1xuICAgICAgICBhcnJheVtpICsgMV0gPSB5O1xuICAgICAgICBhcnJheVtpICsgMl0gPSB6O1xuICAgICAgICBhcnJheVtpICsgM10gPSB3O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgYSBNYXRyaXgzIHZhbHVlIGF0IGBpbmRleGAuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gaW5kZXggVGhlIGluZGV4IGF0IHdoaWNoIHRvIHNldCB0aGUgbWF0cml4IHZhbHVlcyBmcm9tLlxuICAgICAqIEBwYXJhbSB7TWF0cml4M30gbWF0MyBUaGUgM3gzIG1hdHJpeCB0byBzZXQgZnJvbS4gTXVzdCBoYXZlIGEgVHlwZWRBcnJheSBwcm9wZXJ0eSBuYW1lZCBgZWxlbWVudHNgIHRvIGNvcHkgZnJvbS5cbiAgICAgKiBAcmV0dXJuIHtUeXBlZEFycmF5SGVscGVyfSBJbnN0YW5jZSBvZiB0aGlzIGNsYXNzLlxuICAgICAqL1xuICAgIHNldE1hdDMoaW5kZXgsIG1hdDMpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2V0RnJvbUFycmF5KHRoaXMuaW5kZXhPZmZzZXQgKyAoaW5kZXggKiB0aGlzLmNvbXBvbmVudFNpemUpLCBtYXQzLmVsZW1lbnRzKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgYSBNYXRyaXg0IHZhbHVlIGF0IGBpbmRleGAuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gaW5kZXggVGhlIGluZGV4IGF0IHdoaWNoIHRvIHNldCB0aGUgbWF0cml4IHZhbHVlcyBmcm9tLlxuICAgICAqIEBwYXJhbSB7TWF0cml4NH0gbWF0MyBUaGUgNHg0IG1hdHJpeCB0byBzZXQgZnJvbS4gTXVzdCBoYXZlIGEgVHlwZWRBcnJheSBwcm9wZXJ0eSBuYW1lZCBgZWxlbWVudHNgIHRvIGNvcHkgZnJvbS5cbiAgICAgKiBAcmV0dXJuIHtUeXBlZEFycmF5SGVscGVyfSBJbnN0YW5jZSBvZiB0aGlzIGNsYXNzLlxuICAgICAqL1xuICAgIHNldE1hdDQoaW5kZXgsIG1hdDQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2V0RnJvbUFycmF5KHRoaXMuaW5kZXhPZmZzZXQgKyAoaW5kZXggKiB0aGlzLmNvbXBvbmVudFNpemUpLCBtYXQ0LmVsZW1lbnRzKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgYSBDb2xvciB2YWx1ZSBhdCBgaW5kZXhgLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IGluZGV4IFRoZSBpbmRleCBhdCB3aGljaCB0byBzZXQgdGhlIHZlYzMgdmFsdWVzIGZyb20uXG4gICAgICogQHBhcmFtIHtDb2xvcn0gY29sb3IgIEFueSBvYmplY3QgdGhhdCBoYXMgYHJgLCBgZ2AsIGFuZCBgYmAgcHJvcGVydGllcy5cbiAgICAgKiBAcmV0dXJuIHtUeXBlZEFycmF5SGVscGVyfSBJbnN0YW5jZSBvZiB0aGlzIGNsYXNzLlxuICAgICAqL1xuICAgIHNldENvbG9yKGluZGV4LCBjb2xvcikge1xuICAgICAgICByZXR1cm4gdGhpcy5zZXRWZWMzQ29tcG9uZW50cyhpbmRleCwgY29sb3IuciwgY29sb3IuZywgY29sb3IuYik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0IGEgTnVtYmVyIHZhbHVlIGF0IGBpbmRleGAuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gaW5kZXggVGhlIGluZGV4IGF0IHdoaWNoIHRvIHNldCB0aGUgdmVjMyB2YWx1ZXMgZnJvbS5cbiAgICAgKiBAcGFyYW0ge051bWJlcn0gbnVtZXJpY1ZhbHVlICBUaGUgbnVtYmVyIHRvIGFzc2lnbiB0byB0aGlzIGluZGV4IGluIHRoZSBhcnJheS5cbiAgICAgKiBAcmV0dXJuIHtUeXBlZEFycmF5SGVscGVyfSBJbnN0YW5jZSBvZiB0aGlzIGNsYXNzLlxuICAgICAqL1xuICAgIHNldE51bWJlcihpbmRleCwgbnVtZXJpY1ZhbHVlKSB7XG4gICAgICAgIHRoaXMuYXJyYXlbdGhpcy5pbmRleE9mZnNldCArIChpbmRleCAqIHRoaXMuY29tcG9uZW50U2l6ZSldID0gbnVtZXJpY1ZhbHVlO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSB2YWx1ZSBvZiB0aGUgYXJyYXkgYXQgdGhlIGdpdmVuIGluZGV4LCB0YWtpbmcgaW50byBhY2NvdW50XG4gICAgICogdGhlIGBpbmRleE9mZnNldGAgcHJvcGVydHkgb2YgdGhpcyBjbGFzcy5cbiAgICAgKlxuICAgICAqIE5vdGUgdGhhdCB0aGlzIGZ1bmN0aW9uIGlnbm9yZXMgdGhlIGNvbXBvbmVudCBzaXplIGFuZCB3aWxsIGp1c3QgcmV0dXJuIGFcbiAgICAgKiBzaW5nbGUgdmFsdWUuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gIHtOdW1iZXJ9IGluZGV4IFRoZSBpbmRleCBpbiB0aGUgYXJyYXkgdG8gZmV0Y2guXG4gICAgICogQHJldHVybiB7TnVtYmVyfSAgICAgICBUaGUgdmFsdWUgYXQgdGhlIGdpdmVuIGluZGV4LlxuICAgICAqL1xuICAgIGdldFZhbHVlQXRJbmRleChpbmRleCkge1xuICAgICAgICByZXR1cm4gdGhpcy5hcnJheVt0aGlzLmluZGV4T2Zmc2V0ICsgaW5kZXhdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIGNvbXBvbmVudCB2YWx1ZSBvZiB0aGUgYXJyYXkgYXQgdGhlIGdpdmVuIGluZGV4LCB0YWtpbmcgaW50byBhY2NvdW50XG4gICAgICogdGhlIGBpbmRleE9mZnNldGAgcHJvcGVydHkgb2YgdGhpcyBjbGFzcy5cbiAgICAgKlxuICAgICAqIElmIHRoZSBjb21wb25lbnRTaXplIGlzIHNldCB0byAzLCB0aGVuIGl0IHdpbGwgcmV0dXJuIGEgbmV3IFR5cGVkQXJyYXlcbiAgICAgKiBvZiBsZW5ndGggMy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSAge051bWJlcn0gaW5kZXggVGhlIGluZGV4IGluIHRoZSBhcnJheSB0byBmZXRjaC5cbiAgICAgKiBAcmV0dXJuIHtUeXBlZEFycmF5fSAgICAgICBUaGUgY29tcG9uZW50IHZhbHVlIGF0IHRoZSBnaXZlbiBpbmRleC5cbiAgICAgKi9cbiAgICAgZ2V0Q29tcG9uZW50VmFsdWVBdEluZGV4KGluZGV4KSB7XG4gICAgICAgIHJldHVybiB0aGlzLmFycmF5LnN1YmFycmF5KHRoaXMuaW5kZXhPZmZzZXQgKyAoaW5kZXggKiB0aGlzLmNvbXBvbmVudFNpemUpKTtcbiAgICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBUeXBlZEFycmF5SGVscGVyOyIsImltcG9ydCAqIGFzIFRIUkVFIGZyb20gJ3RocmVlJztcbmltcG9ydCBUeXBlZEFycmF5SGVscGVyIGZyb20gJy4vVHlwZWRBcnJheUhlbHBlcic7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNoYWRlckF0dHJpYnV0ZSB7XG4gICAgY29uc3RydWN0b3IodHlwZSwgZHluYW1pY0J1ZmZlciwgYXJyYXlUeXBlKSB7XG4gICAgICAgIGNvbnN0IHR5cGVNYXAgPSBTaGFkZXJBdHRyaWJ1dGUudHlwZVNpemVNYXA7XG5cbiAgICAgICAgdGhpcy50eXBlID0gdHlwZW9mIHR5cGUgPT09ICdzdHJpbmcnICYmIHR5cGVNYXAuaGFzT3duUHJvcGVydHkodHlwZSkgPyB0eXBlIDogJ2YnO1xuICAgICAgICB0aGlzLmNvbXBvbmVudFNpemUgPSB0eXBlTWFwW3RoaXMudHlwZV07XG4gICAgICAgIHRoaXMuYXJyYXlUeXBlID0gYXJyYXlUeXBlIHx8IEZsb2F0MzJBcnJheTtcbiAgICAgICAgdGhpcy50eXBlZEFycmF5ID0gbnVsbDtcbiAgICAgICAgdGhpcy5idWZmZXJBdHRyaWJ1dGUgPSBudWxsO1xuICAgICAgICB0aGlzLmR5bmFtaWNCdWZmZXIgPSAhIWR5bmFtaWNCdWZmZXI7XG5cbiAgICAgICAgdGhpcy51cGRhdGVNaW4gPSAwO1xuICAgICAgICB0aGlzLnVwZGF0ZU1heCA9IDA7XG4gICAgfVxuXG4gICAgc3RhdGljIHR5cGVTaXplTWFwID0ge1xuICAgICAgICAvKipcbiAgICAgICAgKiBGbG9hdFxuICAgICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICAgICovXG4gICAgICAgIGY6IDEsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFZlYzJcbiAgICAgICAgICogQHR5cGUge051bWJlcn1cbiAgICAgICAgICovXG4gICAgICAgIHYyOiAyLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBWZWMzXG4gICAgICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICAgICAqL1xuICAgICAgICB2MzogMyxcblxuICAgICAgICAvKipcbiAgICAgICAgICogVmVjNFxuICAgICAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAgICAgKi9cbiAgICAgICAgdjQ6IDQsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIENvbG9yXG4gICAgICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICAgICAqL1xuICAgICAgICBjOiAzLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBNYXQzXG4gICAgICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICAgICAqL1xuICAgICAgICBtMzogOSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogTWF0NFxuICAgICAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAgICAgKi9cbiAgICAgICAgbTQ6IDE2XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2FsY3VsYXRlIHRoZSBtaW5pbXVtIGFuZCBtYXhpbXVtIHVwZGF0ZSByYW5nZSBmb3IgdGhpcyBidWZmZXIgYXR0cmlidXRlIHVzaW5nXG4gICAgICogY29tcG9uZW50IHNpemUgaW5kZXBlbmRhbnQgbWluIGFuZCBtYXggdmFsdWVzLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IG1pbiBUaGUgc3RhcnQgb2YgdGhlIHJhbmdlIHRvIG1hcmsgYXMgbmVlZGluZyBhbiB1cGRhdGUuXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IG1heCBUaGUgZW5kIG9mIHRoZSByYW5nZSB0byBtYXJrIGFzIG5lZWRpbmcgYW4gdXBkYXRlLlxuICAgICAqL1xuICAgIHNldFVwZGF0ZVJhbmdlKG1pbiwgbWF4KSB7XG4gICAgICAgIHRoaXMudXBkYXRlTWluID0gTWF0aC5taW4obWluICogdGhpcy5jb21wb25lbnRTaXplLCB0aGlzLnVwZGF0ZU1pbiAqIHRoaXMuY29tcG9uZW50U2l6ZSk7XG4gICAgICAgIHRoaXMudXBkYXRlTWF4ID0gTWF0aC5tYXgobWF4ICogdGhpcy5jb21wb25lbnRTaXplLCB0aGlzLnVwZGF0ZU1heCAqIHRoaXMuY29tcG9uZW50U2l6ZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2FsY3VsYXRlIHRoZSBudW1iZXIgb2YgaW5kaWNlcyB0aGF0IHRoaXMgYXR0cmlidXRlIHNob3VsZCBtYXJrIGFzIG5lZWRpbmdcbiAgICAgKiB1cGRhdGluZy4gQWxzbyBtYXJrcyB0aGUgYXR0cmlidXRlIGFzIG5lZWRpbmcgYW4gdXBkYXRlLlxuICAgICAqL1xuICAgIGZsYWdVcGRhdGUoKSB7XG4gICAgICAgIGNvbnN0IGF0dHIgPSB0aGlzLmJ1ZmZlckF0dHJpYnV0ZTtcbiAgICAgICAgY29uc3QgcmFuZ2UgPSBhdHRyLnVwZGF0ZVJhbmdlO1xuXG4gICAgICAgIHJhbmdlLm9mZnNldCA9IHRoaXMudXBkYXRlTWluO1xuICAgICAgICByYW5nZS5jb3VudCA9IE1hdGgubWluKCh0aGlzLnVwZGF0ZU1heCAtIHRoaXMudXBkYXRlTWluKSArIHRoaXMuY29tcG9uZW50U2l6ZSwgdGhpcy50eXBlZEFycmF5LmFycmF5Lmxlbmd0aCk7XG4gICAgICAgIGF0dHIubmVlZHNVcGRhdGUgPSB0cnVlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlc2V0IHRoZSBpbmRleCB1cGRhdGUgY291bnRzIGZvciB0aGlzIGF0dHJpYnV0ZVxuICAgICAqL1xuICAgIHJlc2V0VXBkYXRlUmFuZ2UoKSB7XG4gICAgICAgIHRoaXMudXBkYXRlTWluID0gMDtcbiAgICAgICAgdGhpcy51cGRhdGVNYXggPSAwO1xuICAgIH1cblxuICAgIHJlc2V0RHluYW1pYygpIHtcbiAgICAgICAgdGhpcy5idWZmZXJBdHRyaWJ1dGUudXNlYWdlID0gdGhpcy5keW5hbWljQnVmZmVyXG4gICAgICAgICAgICA/IFRIUkVFLkR5bmFtaWNEcmF3VXNhZ2VcbiAgICAgICAgICAgIDogVEhSRUUuU3RhdGljRHJhd1VzYWdlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFBlcmZvcm0gYSBzcGxpY2Ugb3BlcmF0aW9uIG9uIHRoaXMgYXR0cmlidXRlJ3MgYnVmZmVyLlxuICAgICAqIEBwYXJhbSAge051bWJlcn0gc3RhcnQgVGhlIHN0YXJ0IGluZGV4IG9mIHRoZSBzcGxpY2UuIFdpbGwgYmUgbXVsdGlwbGllZCBieSB0aGUgbnVtYmVyIG9mIGNvbXBvbmVudHMgZm9yIHRoaXMgYXR0cmlidXRlLlxuICAgICAqIEBwYXJhbSAge051bWJlcn0gZW5kIFRoZSBlbmQgaW5kZXggb2YgdGhlIHNwbGljZS4gV2lsbCBiZSBtdWx0aXBsaWVkIGJ5IHRoZSBudW1iZXIgb2YgY29tcG9uZW50cyBmb3IgdGhpcyBhdHRyaWJ1dGUuXG4gICAgICovXG4gICAgc3BsaWNlKHN0YXJ0LCBlbmQpIHtcbiAgICAgICAgdGhpcy50eXBlZEFycmF5LnNwbGljZShzdGFydCwgZW5kKTtcblxuICAgICAgICB0aGlzLmZvcmNlVXBkYXRlQWxsKCk7XG4gICAgfVxuXG4gICAgZm9yY2VVcGRhdGVBbGwoKSB7XG4gICAgICAgIHRoaXMuYnVmZmVyQXR0cmlidXRlLmFycmF5ID0gdGhpcy50eXBlZEFycmF5LmFycmF5O1xuICAgICAgICB0aGlzLmJ1ZmZlckF0dHJpYnV0ZS51cGRhdGVSYW5nZS5vZmZzZXQgPSAwO1xuICAgICAgICB0aGlzLmJ1ZmZlckF0dHJpYnV0ZS51cGRhdGVSYW5nZS5jb3VudCA9IC0xO1xuXG4gICAgICAgIHRoaXMuYnVmZmVyQXR0cmlidXRlLnVzYWdlID0gVEhSRUUuU3RhdGljRHJhd1VzYWdlO1xuICAgICAgICB0aGlzLmJ1ZmZlckF0dHJpYnV0ZS5uZWVkc1VwZGF0ZSA9IHRydWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTWFrZSBzdXJlIHRoaXMgYXR0cmlidXRlIGhhcyBhIHR5cGVkIGFycmF5IGFzc29jaWF0ZWQgd2l0aCBpdC5cbiAgICAgKlxuICAgICAqIElmIGl0IGRvZXMsIHRoZW4gaXQgd2lsbCBlbnN1cmUgdGhlIHR5cGVkIGFycmF5IGlzIG9mIHRoZSBjb3JyZWN0IHNpemUuXG4gICAgICpcbiAgICAgKiBJZiBub3QsIGEgbmV3IFNQRS5UeXBlZEFycmF5SGVscGVyIGluc3RhbmNlIHdpbGwgYmUgY3JlYXRlZC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSAge051bWJlcn0gc2l6ZSBUaGUgc2l6ZSBvZiB0aGUgdHlwZWQgYXJyYXkgdG8gY3JlYXRlIG9yIHVwZGF0ZSB0by5cbiAgICAgKi9cbiAgICBfZW5zdXJlVHlwZWRBcnJheShzaXplKSB7XG4gICAgICAgIGlmICh0aGlzLnR5cGVkQXJyYXkgIT09IG51bGwgJiYgdGhpcy50eXBlZEFycmF5LnNpemUgPT09IHNpemUgKiB0aGlzLmNvbXBvbmVudFNpemUpIHtcblxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHRoaXMudHlwZWRBcnJheSAhPT0gbnVsbCAmJiB0aGlzLnR5cGVkQXJyYXkuc2l6ZSAhPT0gc2l6ZSkge1xuICAgICAgICAgICAgdGhpcy50eXBlZEFycmF5LnNldFNpemUoc2l6ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodGhpcy50eXBlZEFycmF5ID09PSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLnR5cGVkQXJyYXkgPSBuZXcgVHlwZWRBcnJheUhlbHBlcih0aGlzLmFycmF5VHlwZSwgc2l6ZSwgdGhpcy5jb21wb25lbnRTaXplKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBUSFJFRS5CdWZmZXJBdHRyaWJ1dGUgaW5zdGFuY2UgaWYgb25lIGRvZXNuJ3QgZXhpc3QgYWxyZWFkeS5cbiAgICAgKlxuICAgICAqIEVuc3VyZXMgYSB0eXBlZCBhcnJheSBpcyBwcmVzZW50IGJ5IGNhbGxpbmcgX2Vuc3VyZVR5cGVkQXJyYXkoKSBmaXJzdC5cbiAgICAgKlxuICAgICAqIElmIGEgYnVmZmVyIGF0dHJpYnV0ZSBleGlzdHMgYWxyZWFkeSwgdGhlbiBpdCB3aWxsIGJlIG1hcmtlZCBhcyBuZWVkaW5nIGFuIHVwZGF0ZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSAge051bWJlcn0gc2l6ZSBUaGUgc2l6ZSBvZiB0aGUgdHlwZWQgYXJyYXkgdG8gY3JlYXRlIGlmIG9uZSBkb2Vzbid0IGV4aXN0LCBvciByZXNpemUgZXhpc3RpbmcgYXJyYXkgdG8uXG4gICAgICovXG4gICAgX2NyZWF0ZUJ1ZmZlckF0dHJpYnV0ZShzaXplKSB7XG4gICAgICAgIHRoaXMuX2Vuc3VyZVR5cGVkQXJyYXkoc2l6ZSk7XG5cbiAgICAgICAgaWYgKHRoaXMuYnVmZmVyQXR0cmlidXRlICE9PSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLmJ1ZmZlckF0dHJpYnV0ZS5hcnJheSA9IHRoaXMudHlwZWRBcnJheS5hcnJheTtcblxuICAgICAgICAgICAgdGhpcy5idWZmZXJBdHRyaWJ1dGUuY291bnQgPSB0aGlzLmJ1ZmZlckF0dHJpYnV0ZS5hcnJheS5sZW5ndGggLyB0aGlzLmJ1ZmZlckF0dHJpYnV0ZS5pdGVtU2l6ZTtcbiAgICAgICAgICAgIHRoaXMuYnVmZmVyQXR0cmlidXRlLm5lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuYnVmZmVyQXR0cmlidXRlID0gbmV3IFRIUkVFLkJ1ZmZlckF0dHJpYnV0ZSh0aGlzLnR5cGVkQXJyYXkuYXJyYXksIHRoaXMuY29tcG9uZW50U2l6ZSk7XG5cbiAgICAgICAgdGhpcy5idWZmZXJBdHRyaWJ1dGUudXNhZ2UgPSB0aGlzLmR5bmFtaWNCdWZmZXIgPyBUSFJFRS5EeW5hbWljRHJhd1VzYWdlIDogVEhSRUUuU3RhdGljRHJhd1VzYWdlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIGxlbmd0aCBvZiB0aGUgdHlwZWQgYXJyYXkgYXNzb2NpYXRlZCB3aXRoIHRoaXMgYXR0cmlidXRlLlxuICAgICAqIEByZXR1cm4ge051bWJlcn0gVGhlIGxlbmd0aCBvZiB0aGUgdHlwZWQgYXJyYXkuIFdpbGwgYmUgMCBpZiBubyB0eXBlZCBhcnJheSBoYXMgYmVlbiBjcmVhdGVkIHlldC5cbiAgICAgKi9cbiAgICBnZXRMZW5ndGgoKSB7XG4gICAgICAgIGlmICh0aGlzLnR5cGVkQXJyYXkgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMudHlwZWRBcnJheS5hcnJheS5sZW5ndGg7XG4gICAgfVxufSIsImV4cG9ydCBkZWZhdWx0IHtcbiAgICAvLyBSZWdpc3RlciBjb2xvci1wYWNraW5nIGRlZmluZSBzdGF0ZW1lbnRzLlxuICAgIGRlZmluZXM6IFtcbiAgICAgICAgJyNkZWZpbmUgUEFDS0VEX0NPTE9SX1NJWkUgMjU2LjAnLFxuICAgICAgICAnI2RlZmluZSBQQUNLRURfQ09MT1JfRElWSVNPUiAyNTUuMCdcbiAgICBdLmpvaW4oJ1xcbicpLFxuXG4gICAgLy8gQWxsIHVuaWZvcm1zIHVzZWQgYnkgdmVydGV4IC8gZnJhZ21lbnQgc2hhZGVyc1xuICAgIHVuaWZvcm1zOiBbXG4gICAgICAgICd1bmlmb3JtIGZsb2F0IGRlbHRhVGltZTsnLFxuICAgICAgICAndW5pZm9ybSBmbG9hdCBydW5UaW1lOycsXG4gICAgICAgICd1bmlmb3JtIHNhbXBsZXIyRCB0ZXg7JyxcbiAgICAgICAgJ3VuaWZvcm0gdmVjNCB0ZXh0dXJlQW5pbWF0aW9uOycsXG4gICAgICAgICd1bmlmb3JtIGZsb2F0IHNjYWxlOydcbiAgICBdLmpvaW4oJ1xcbicpLFxuXG4gICAgLy8gQWxsIGF0dHJpYnV0ZXMgdXNlZCBieSB0aGUgdmVydGV4IHNoYWRlci5cbiAgICAvL1xuICAgIC8vIE5vdGUgdGhhdCBzb21lIGF0dHJpYnV0ZXMgYXJlIHNxdWFzaGVkIGludG8gb3RoZXIgb25lczpcbiAgICAvL1xuICAgIC8vICogRHJhZyBpcyBhY2NlbGVyYXRpb24ud1xuICAgIGF0dHJpYnV0ZXM6IFtcbiAgICAgICAgJ2F0dHJpYnV0ZSB2ZWM0IGFjY2VsZXJhdGlvbjsnLFxuICAgICAgICAnYXR0cmlidXRlIHZlYzMgdmVsb2NpdHk7JyxcbiAgICAgICAgJ2F0dHJpYnV0ZSB2ZWM0IHJvdGF0aW9uOycsXG4gICAgICAgICdhdHRyaWJ1dGUgdmVjMyByb3RhdGlvbkNlbnRlcjsnLFxuICAgICAgICAnYXR0cmlidXRlIHZlYzQgcGFyYW1zOycsXG4gICAgICAgICdhdHRyaWJ1dGUgdmVjNCBzaXplOycsXG4gICAgICAgICdhdHRyaWJ1dGUgdmVjNCBhbmdsZTsnLFxuICAgICAgICAnYXR0cmlidXRlIHZlYzQgY29sb3I7JyxcbiAgICAgICAgJ2F0dHJpYnV0ZSB2ZWM0IG9wYWNpdHk7J1xuICAgIF0uam9pbignXFxuJyksXG5cbiAgICAvL1xuICAgIHZhcnlpbmdzOiBbXG4gICAgICAgICd2YXJ5aW5nIHZlYzQgdkNvbG9yOycsXG4gICAgICAgICcjaWZkZWYgU0hPVUxEX1JPVEFURV9URVhUVVJFJyxcbiAgICAgICAgJyAgICB2YXJ5aW5nIGZsb2F0IHZBbmdsZTsnLFxuICAgICAgICAnI2VuZGlmJyxcblxuICAgICAgICAnI2lmZGVmIFNIT1VMRF9DQUxDVUxBVEVfU1BSSVRFJyxcbiAgICAgICAgJyAgICB2YXJ5aW5nIHZlYzQgdlNwcml0ZVNoZWV0OycsXG4gICAgICAgICcjZW5kaWYnXG4gICAgXS5qb2luKCdcXG4nKSxcblxuICAgIC8vIEJyYW5jaC1hdm9pZGluZyBjb21wYXJpc29uIGZuc1xuICAgIC8vIC0gaHR0cDovL3RoZW9yYW5nZWR1Y2suY29tL3BhZ2UvYXZvaWRpbmctc2hhZGVyLWNvbmRpdGlvbmFsc1xuICAgIGJyYW5jaEF2b2lkYW5jZUZ1bmN0aW9uczogW1xuICAgICAgICAnZmxvYXQgd2hlbl9ndChmbG9hdCB4LCBmbG9hdCB5KSB7JyxcbiAgICAgICAgJyAgICByZXR1cm4gbWF4KHNpZ24oeCAtIHkpLCAwLjApOycsXG4gICAgICAgICd9JyxcblxuICAgICAgICAnZmxvYXQgd2hlbl9sdChmbG9hdCB4LCBmbG9hdCB5KSB7JyxcbiAgICAgICAgJyAgICByZXR1cm4gbWluKCBtYXgoMS4wIC0gc2lnbih4IC0geSksIDAuMCksIDEuMCApOycsXG4gICAgICAgICd9JyxcblxuICAgICAgICAnZmxvYXQgd2hlbl9lcSggZmxvYXQgeCwgZmxvYXQgeSApIHsnLFxuICAgICAgICAnICAgIHJldHVybiAxLjAgLSBhYnMoIHNpZ24oIHggLSB5ICkgKTsnLFxuICAgICAgICAnfScsXG5cbiAgICAgICAgJ2Zsb2F0IHdoZW5fZ2UoZmxvYXQgeCwgZmxvYXQgeSkgeycsXG4gICAgICAgICcgIHJldHVybiAxLjAgLSB3aGVuX2x0KHgsIHkpOycsXG4gICAgICAgICd9JyxcblxuICAgICAgICAnZmxvYXQgd2hlbl9sZShmbG9hdCB4LCBmbG9hdCB5KSB7JyxcbiAgICAgICAgJyAgcmV0dXJuIDEuMCAtIHdoZW5fZ3QoeCwgeSk7JyxcbiAgICAgICAgJ30nLFxuXG4gICAgICAgIC8vIEJyYW5jaC1hdm9pZGluZyBsb2dpY2FsIG9wZXJhdG9yc1xuICAgICAgICAvLyAodG8gYmUgdXNlZCB3aXRoIGFib3ZlIGNvbXBhcmlzb24gZm5zKVxuICAgICAgICAnZmxvYXQgYW5kKGZsb2F0IGEsIGZsb2F0IGIpIHsnLFxuICAgICAgICAnICAgIHJldHVybiBhICogYjsnLFxuICAgICAgICAnfScsXG5cbiAgICAgICAgJ2Zsb2F0IG9yKGZsb2F0IGEsIGZsb2F0IGIpIHsnLFxuICAgICAgICAnICAgIHJldHVybiBtaW4oYSArIGIsIDEuMCk7JyxcbiAgICAgICAgJ30nXG4gICAgXS5qb2luKCdcXG4nKSxcblxuICAgIC8vIEZyb206XG4gICAgLy8gLSBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8xMjU1MzE0OVxuICAgIC8vIC0gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMjI4OTUyMzcvaGV4YWRlY2ltYWwtdG8tcmdiLXZhbHVlcy1pbi13ZWJnbC1zaGFkZXJcbiAgICB1bnBhY2tDb2xvcjogW1xuICAgICAgICAndmVjMyB1bnBhY2tDb2xvciggaW4gZmxvYXQgaGV4ICkgeycsXG4gICAgICAgICcgICB2ZWMzIGMgPSB2ZWMzKCAwLjAgKTsnLFxuXG4gICAgICAgICcgICBmbG9hdCByID0gbW9kKCAoaGV4IC8gUEFDS0VEX0NPTE9SX1NJWkUgLyBQQUNLRURfQ09MT1JfU0laRSksIFBBQ0tFRF9DT0xPUl9TSVpFICk7JyxcbiAgICAgICAgJyAgIGZsb2F0IGcgPSBtb2QoIChoZXggLyBQQUNLRURfQ09MT1JfU0laRSksIFBBQ0tFRF9DT0xPUl9TSVpFICk7JyxcbiAgICAgICAgJyAgIGZsb2F0IGIgPSBtb2QoIGhleCwgUEFDS0VEX0NPTE9SX1NJWkUgKTsnLFxuXG4gICAgICAgICcgICBjLnIgPSByIC8gUEFDS0VEX0NPTE9SX0RJVklTT1I7JyxcbiAgICAgICAgJyAgIGMuZyA9IGcgLyBQQUNLRURfQ09MT1JfRElWSVNPUjsnLFxuICAgICAgICAnICAgYy5iID0gYiAvIFBBQ0tFRF9DT0xPUl9ESVZJU09SOycsXG5cbiAgICAgICAgJyAgIHJldHVybiBjOycsXG4gICAgICAgICd9J1xuICAgIF0uam9pbignXFxuJyksXG5cbiAgICB1bnBhY2tSb3RhdGlvbkF4aXM6IFtcbiAgICAgICAgJ3ZlYzMgdW5wYWNrUm90YXRpb25BeGlzKCBpbiBmbG9hdCBoZXggKSB7JyxcbiAgICAgICAgJyAgIHZlYzMgYyA9IHZlYzMoIDAuMCApOycsXG5cbiAgICAgICAgJyAgIGZsb2F0IHIgPSBtb2QoIChoZXggLyBQQUNLRURfQ09MT1JfU0laRSAvIFBBQ0tFRF9DT0xPUl9TSVpFKSwgUEFDS0VEX0NPTE9SX1NJWkUgKTsnLFxuICAgICAgICAnICAgZmxvYXQgZyA9IG1vZCggKGhleCAvIFBBQ0tFRF9DT0xPUl9TSVpFKSwgUEFDS0VEX0NPTE9SX1NJWkUgKTsnLFxuICAgICAgICAnICAgZmxvYXQgYiA9IG1vZCggaGV4LCBQQUNLRURfQ09MT1JfU0laRSApOycsXG5cbiAgICAgICAgJyAgIGMuciA9IHIgLyBQQUNLRURfQ09MT1JfRElWSVNPUjsnLFxuICAgICAgICAnICAgYy5nID0gZyAvIFBBQ0tFRF9DT0xPUl9ESVZJU09SOycsXG4gICAgICAgICcgICBjLmIgPSBiIC8gUEFDS0VEX0NPTE9SX0RJVklTT1I7JyxcblxuICAgICAgICAnICAgYyAqPSB2ZWMzKCAyLjAgKTsnLFxuICAgICAgICAnICAgYyAtPSB2ZWMzKCAxLjAgKTsnLFxuXG4gICAgICAgICcgICByZXR1cm4gYzsnLFxuICAgICAgICAnfSdcbiAgICBdLmpvaW4oJ1xcbicpLFxuXG4gICAgZmxvYXRPdmVyTGlmZXRpbWU6IFtcbiAgICAgICAgJ2Zsb2F0IGdldEZsb2F0T3ZlckxpZmV0aW1lKCBpbiBmbG9hdCBwb3NpdGlvbkluVGltZSwgaW4gdmVjNCBhdHRyICkgeycsXG4gICAgICAgICcgICAgaGlnaHAgZmxvYXQgdmFsdWUgPSAwLjA7JyxcbiAgICAgICAgJyAgICBmbG9hdCBkZWx0YUFnZSA9IHBvc2l0aW9uSW5UaW1lICogZmxvYXQoIFZBTFVFX09WRVJfTElGRVRJTUVfTEVOR1RIIC0gMSApOycsXG4gICAgICAgICcgICAgZmxvYXQgZkluZGV4ID0gMC4wOycsXG4gICAgICAgICcgICAgZmxvYXQgc2hvdWxkQXBwbHlWYWx1ZSA9IDAuMDsnLFxuXG4gICAgICAgIC8vIFRoaXMgbWlnaHQgbG9vayBhIGxpdHRsZSBvZGQsIGJ1dCBpdCdzIGZhc3RlciBpbiB0aGUgdGVzdGluZyBJJ3ZlIGRvbmUgdGhhbiB1c2luZyBicmFuY2hlcy5cbiAgICAgICAgLy8gVXNlcyBiYXNpYyBtYXRocyB0byBhdm9pZCBicmFuY2hpbmcuXG4gICAgICAgIC8vXG4gICAgICAgIC8vIFRha2UgYSBsb29rIGF0IHRoZSBicmFuY2gtYXZvaWRhbmNlIGZ1bmN0aW9ucyBkZWZpbmVkIGFib3ZlLFxuICAgICAgICAvLyBhbmQgYmUgc3VyZSB0byBjaGVjayBvdXQgVGhlIE9yYW5nZSBEdWNrIHNpdGUgd2hlcmUgSSBnb3QgdGhpc1xuICAgICAgICAvLyBmcm9tIChsaW5rIGFib3ZlKS5cblxuICAgICAgICAvLyBGaXggZm9yIHN0YXRpYyBlbWl0dGVycyAoYWdlIGlzIGFsd2F5cyB6ZXJvKS5cbiAgICAgICAgJyAgICB2YWx1ZSArPSBhdHRyWyAwIF0gKiB3aGVuX2VxKCBkZWx0YUFnZSwgMC4wICk7JyxcbiAgICAgICAgJycsXG4gICAgICAgICcgICAgZm9yKCBpbnQgaSA9IDA7IGkgPCBWQUxVRV9PVkVSX0xJRkVUSU1FX0xFTkdUSCAtIDE7ICsraSApIHsnLFxuICAgICAgICAnICAgICAgIGZJbmRleCA9IGZsb2F0KCBpICk7JyxcbiAgICAgICAgJyAgICAgICBzaG91bGRBcHBseVZhbHVlID0gYW5kKCB3aGVuX2d0KCBkZWx0YUFnZSwgZkluZGV4ICksIHdoZW5fbGUoIGRlbHRhQWdlLCBmSW5kZXggKyAxLjAgKSApOycsXG4gICAgICAgICcgICAgICAgdmFsdWUgKz0gc2hvdWxkQXBwbHlWYWx1ZSAqIG1peCggYXR0clsgaSBdLCBhdHRyWyBpICsgMSBdLCBkZWx0YUFnZSAtIGZJbmRleCApOycsXG4gICAgICAgICcgICAgfScsXG4gICAgICAgICcnLFxuICAgICAgICAnICAgIHJldHVybiB2YWx1ZTsnLFxuICAgICAgICAnfSdcbiAgICBdLmpvaW4oJ1xcbicpLFxuXG4gICAgY29sb3JPdmVyTGlmZXRpbWU6IFtcbiAgICAgICAgJ3ZlYzMgZ2V0Q29sb3JPdmVyTGlmZXRpbWUoIGluIGZsb2F0IHBvc2l0aW9uSW5UaW1lLCBpbiB2ZWMzIGNvbG9yMSwgaW4gdmVjMyBjb2xvcjIsIGluIHZlYzMgY29sb3IzLCBpbiB2ZWMzIGNvbG9yNCApIHsnLFxuICAgICAgICAnICAgIHZlYzMgdmFsdWUgPSB2ZWMzKCAwLjAgKTsnLFxuICAgICAgICAnICAgIHZhbHVlLnggPSBnZXRGbG9hdE92ZXJMaWZldGltZSggcG9zaXRpb25JblRpbWUsIHZlYzQoIGNvbG9yMS54LCBjb2xvcjIueCwgY29sb3IzLngsIGNvbG9yNC54ICkgKTsnLFxuICAgICAgICAnICAgIHZhbHVlLnkgPSBnZXRGbG9hdE92ZXJMaWZldGltZSggcG9zaXRpb25JblRpbWUsIHZlYzQoIGNvbG9yMS55LCBjb2xvcjIueSwgY29sb3IzLnksIGNvbG9yNC55ICkgKTsnLFxuICAgICAgICAnICAgIHZhbHVlLnogPSBnZXRGbG9hdE92ZXJMaWZldGltZSggcG9zaXRpb25JblRpbWUsIHZlYzQoIGNvbG9yMS56LCBjb2xvcjIueiwgY29sb3IzLnosIGNvbG9yNC56ICkgKTsnLFxuICAgICAgICAnICAgIHJldHVybiB2YWx1ZTsnLFxuICAgICAgICAnfSdcbiAgICBdLmpvaW4oJ1xcbicpLFxuXG4gICAgcGFyYW1GZXRjaGluZ0Z1bmN0aW9uczogW1xuICAgICAgICAnZmxvYXQgZ2V0QWxpdmUoKSB7JyxcbiAgICAgICAgJyAgIHJldHVybiBwYXJhbXMueDsnLFxuICAgICAgICAnfScsXG5cbiAgICAgICAgJ2Zsb2F0IGdldEFnZSgpIHsnLFxuICAgICAgICAnICAgcmV0dXJuIHBhcmFtcy55OycsXG4gICAgICAgICd9JyxcblxuICAgICAgICAnZmxvYXQgZ2V0TWF4QWdlKCkgeycsXG4gICAgICAgICcgICByZXR1cm4gcGFyYW1zLno7JyxcbiAgICAgICAgJ30nLFxuXG4gICAgICAgICdmbG9hdCBnZXRXaWdnbGUoKSB7JyxcbiAgICAgICAgJyAgIHJldHVybiBwYXJhbXMudzsnLFxuICAgICAgICAnfSdcbiAgICBdLmpvaW4oJ1xcbicpLFxuXG4gICAgZm9yY2VGZXRjaGluZ0Z1bmN0aW9uczogW1xuICAgICAgICAndmVjNCBnZXRQb3NpdGlvbiggaW4gZmxvYXQgYWdlICkgeycsXG4gICAgICAgICcgICByZXR1cm4gbW9kZWxWaWV3TWF0cml4ICogdmVjNCggcG9zaXRpb24sIDEuMCApOycsXG4gICAgICAgICd9JyxcblxuICAgICAgICAndmVjMyBnZXRWZWxvY2l0eSggaW4gZmxvYXQgYWdlICkgeycsXG4gICAgICAgICcgICByZXR1cm4gdmVsb2NpdHkgKiBhZ2U7JyxcbiAgICAgICAgJ30nLFxuXG4gICAgICAgICd2ZWMzIGdldEFjY2VsZXJhdGlvbiggaW4gZmxvYXQgYWdlICkgeycsXG4gICAgICAgICcgICByZXR1cm4gYWNjZWxlcmF0aW9uLnh5eiAqIGFnZTsnLFxuICAgICAgICAnfSdcbiAgICBdLmpvaW4oJ1xcbicpLFxuXG4gICAgcm90YXRpb25GdW5jdGlvbnM6IFtcbiAgICAgICAgLy8gSHVnZSB0aGFua3MgdG86XG4gICAgICAgIC8vIC0gaHR0cDovL3d3dy5uZWlsbWVuZG96YS5jb20vZ2xzbC1yb3RhdGlvbi1hYm91dC1hbi1hcmJpdHJhcnktYXhpcy9cbiAgICAgICAgJyNpZmRlZiBTSE9VTERfUk9UQVRFX1BBUlRJQ0xFUycsXG4gICAgICAgICcgICBtYXQ0IGdldFJvdGF0aW9uTWF0cml4KCBpbiB2ZWMzIGF4aXMsIGluIGZsb2F0IGFuZ2xlKSB7JyxcbiAgICAgICAgJyAgICAgICBheGlzID0gbm9ybWFsaXplKGF4aXMpOycsXG4gICAgICAgICcgICAgICAgZmxvYXQgcyA9IHNpbihhbmdsZSk7JyxcbiAgICAgICAgJyAgICAgICBmbG9hdCBjID0gY29zKGFuZ2xlKTsnLFxuICAgICAgICAnICAgICAgIGZsb2F0IG9jID0gMS4wIC0gYzsnLFxuICAgICAgICAnJyxcbiAgICAgICAgJyAgICAgICByZXR1cm4gbWF0NChvYyAqIGF4aXMueCAqIGF4aXMueCArIGMsICAgICAgICAgICBvYyAqIGF4aXMueCAqIGF4aXMueSAtIGF4aXMueiAqIHMsICBvYyAqIGF4aXMueiAqIGF4aXMueCArIGF4aXMueSAqIHMsICAwLjAsJyxcbiAgICAgICAgJyAgICAgICAgICAgICAgICAgICBvYyAqIGF4aXMueCAqIGF4aXMueSArIGF4aXMueiAqIHMsICBvYyAqIGF4aXMueSAqIGF4aXMueSArIGMsICAgICAgICAgICBvYyAqIGF4aXMueSAqIGF4aXMueiAtIGF4aXMueCAqIHMsICAwLjAsJyxcbiAgICAgICAgJyAgICAgICAgICAgICAgICAgICBvYyAqIGF4aXMueiAqIGF4aXMueCAtIGF4aXMueSAqIHMsICBvYyAqIGF4aXMueSAqIGF4aXMueiArIGF4aXMueCAqIHMsICBvYyAqIGF4aXMueiAqIGF4aXMueiArIGMsICAgICAgICAgICAwLjAsJyxcbiAgICAgICAgJyAgICAgICAgICAgICAgICAgICAwLjAsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAwLjAsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAwLjAsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAxLjApOycsXG4gICAgICAgICcgICB9JyxcbiAgICAgICAgJycsXG4gICAgICAgICcgICB2ZWMzIGdldFJvdGF0aW9uKCBpbiB2ZWMzIHBvcywgaW4gZmxvYXQgcG9zaXRpb25JblRpbWUgKSB7JyxcbiAgICAgICAgJyAgICAgIGlmKCByb3RhdGlvbi55ID09IDAuMCApIHsnLFxuICAgICAgICAnICAgICAgICAgICByZXR1cm4gcG9zOycsXG4gICAgICAgICcgICAgICB9JyxcbiAgICAgICAgJycsXG4gICAgICAgICcgICAgICB2ZWMzIGF4aXMgPSB1bnBhY2tSb3RhdGlvbkF4aXMoIHJvdGF0aW9uLnggKTsnLFxuICAgICAgICAnICAgICAgdmVjMyBjZW50ZXIgPSByb3RhdGlvbkNlbnRlcjsnLFxuICAgICAgICAnICAgICAgdmVjMyB0cmFuc2xhdGVkOycsXG4gICAgICAgICcgICAgICBtYXQ0IHJvdGF0aW9uTWF0cml4OycsXG5cbiAgICAgICAgJyAgICAgIGZsb2F0IGFuZ2xlID0gMC4wOycsXG4gICAgICAgICcgICAgICBhbmdsZSArPSB3aGVuX2VxKCByb3RhdGlvbi56LCAwLjAgKSAqIHJvdGF0aW9uLnk7JyxcbiAgICAgICAgJyAgICAgIGFuZ2xlICs9IHdoZW5fZ3QoIHJvdGF0aW9uLnosIDAuMCApICogbWl4KCAwLjAsIHJvdGF0aW9uLnksIHBvc2l0aW9uSW5UaW1lICk7JyxcbiAgICAgICAgJyAgICAgIHRyYW5zbGF0ZWQgPSByb3RhdGlvbkNlbnRlciAtIHBvczsnLFxuICAgICAgICAnICAgICAgcm90YXRpb25NYXRyaXggPSBnZXRSb3RhdGlvbk1hdHJpeCggYXhpcywgYW5nbGUgKTsnLFxuICAgICAgICAnICAgICAgcmV0dXJuIGNlbnRlciAtIHZlYzMoIHJvdGF0aW9uTWF0cml4ICogdmVjNCggdHJhbnNsYXRlZCwgMC4wICkgKTsnLFxuICAgICAgICAnICAgfScsXG4gICAgICAgICcjZW5kaWYnXG4gICAgXS5qb2luKCdcXG4nKSxcblxuICAgIC8vIEZyYWdtZW50IGNodW5rc1xuICAgIHJvdGF0ZVRleHR1cmU6IFtcbiAgICAgICAgJyAgICB2ZWMyIHZVdiA9IHZlYzIoIGdsX1BvaW50Q29vcmQueCwgMS4wIC0gZ2xfUG9pbnRDb29yZC55ICk7JyxcbiAgICAgICAgJycsXG4gICAgICAgICcgICAgI2lmZGVmIFNIT1VMRF9ST1RBVEVfVEVYVFVSRScsXG4gICAgICAgICcgICAgICAgZmxvYXQgeCA9IGdsX1BvaW50Q29vcmQueCAtIDAuNTsnLFxuICAgICAgICAnICAgICAgIGZsb2F0IHkgPSAxLjAgLSBnbF9Qb2ludENvb3JkLnkgLSAwLjU7JyxcbiAgICAgICAgJyAgICAgICBmbG9hdCBjID0gY29zKCAtdkFuZ2xlICk7JyxcbiAgICAgICAgJyAgICAgICBmbG9hdCBzID0gc2luKCAtdkFuZ2xlICk7JyxcblxuICAgICAgICAnICAgICAgIHZVdiA9IHZlYzIoIGMgKiB4ICsgcyAqIHkgKyAwLjUsIGMgKiB5IC0gcyAqIHggKyAwLjUgKTsnLFxuICAgICAgICAnICAgICNlbmRpZicsXG4gICAgICAgICcnLFxuXG4gICAgICAgIC8vIFNwcml0ZXNoZWV0cyBvdmVyd3JpdGUgYW5nbGUgY2FsY3VsYXRpb25zLlxuICAgICAgICAnICAgICNpZmRlZiBTSE9VTERfQ0FMQ1VMQVRFX1NQUklURScsXG4gICAgICAgICcgICAgICAgIGZsb2F0IGZyYW1lc1ggPSB2U3ByaXRlU2hlZXQueDsnLFxuICAgICAgICAnICAgICAgICBmbG9hdCBmcmFtZXNZID0gdlNwcml0ZVNoZWV0Lnk7JyxcbiAgICAgICAgJyAgICAgICAgZmxvYXQgY29sdW1uTm9ybSA9IHZTcHJpdGVTaGVldC56OycsXG4gICAgICAgICcgICAgICAgIGZsb2F0IHJvd05vcm0gPSB2U3ByaXRlU2hlZXQudzsnLFxuXG4gICAgICAgICcgICAgICAgIHZVdi54ID0gZ2xfUG9pbnRDb29yZC54ICogZnJhbWVzWCArIGNvbHVtbk5vcm07JyxcbiAgICAgICAgJyAgICAgICAgdlV2LnkgPSAxLjAgLSAoZ2xfUG9pbnRDb29yZC55ICogZnJhbWVzWSArIHJvd05vcm0pOycsXG4gICAgICAgICcgICAgI2VuZGlmJyxcblxuICAgICAgICAnJyxcbiAgICAgICAgJyAgICB2ZWM0IHJvdGF0ZWRUZXh0dXJlID0gdGV4dHVyZTJEKCB0ZXgsIHZVdiApOydcbiAgICBdLmpvaW4oJ1xcbicpXG59IiwiaW1wb3J0IHNoYWRlckNodW5rcyBmcm9tIFwiLi9zaGFkZXJDaHVua3NcIjtcbmltcG9ydCAqIGFzIFRIUkVFIGZyb20gJ3RocmVlJztcblxuZXhwb3J0IGRlZmF1bHQge1xuICAgIHZlcnRleDogW1xuICAgICAgICBzaGFkZXJDaHVua3MuZGVmaW5lcyxcbiAgICAgICAgc2hhZGVyQ2h1bmtzLnVuaWZvcm1zLFxuICAgICAgICBzaGFkZXJDaHVua3MuYXR0cmlidXRlcyxcbiAgICAgICAgc2hhZGVyQ2h1bmtzLnZhcnlpbmdzLFxuXG4gICAgICAgIFRIUkVFLlNoYWRlckNodW5rLmNvbW1vbixcbiAgICAgICAgVEhSRUUuU2hhZGVyQ2h1bmsubG9nZGVwdGhidWZfcGFyc192ZXJ0ZXgsXG4gICAgICAgIFRIUkVFLlNoYWRlckNodW5rLmZvZ19wYXJzX2ZyYWdtZW50LFxuXG4gICAgICAgIHNoYWRlckNodW5rcy5icmFuY2hBdm9pZGFuY2VGdW5jdGlvbnMsXG4gICAgICAgIHNoYWRlckNodW5rcy51bnBhY2tDb2xvcixcbiAgICAgICAgc2hhZGVyQ2h1bmtzLnVucGFja1JvdGF0aW9uQXhpcyxcbiAgICAgICAgc2hhZGVyQ2h1bmtzLmZsb2F0T3ZlckxpZmV0aW1lLFxuICAgICAgICBzaGFkZXJDaHVua3MuY29sb3JPdmVyTGlmZXRpbWUsXG4gICAgICAgIHNoYWRlckNodW5rcy5wYXJhbUZldGNoaW5nRnVuY3Rpb25zLFxuICAgICAgICBzaGFkZXJDaHVua3MuZm9yY2VGZXRjaGluZ0Z1bmN0aW9ucyxcbiAgICAgICAgc2hhZGVyQ2h1bmtzLnJvdGF0aW9uRnVuY3Rpb25zLFxuXG4gICAgICAgICd2b2lkIG1haW4oKSB7JyxcblxuXHRcdC8vXG5cdFx0Ly8gU2V0dXAuLi5cblx0XHQvL1xuXHRcdCcgICAgaGlnaHAgZmxvYXQgYWdlID0gZ2V0QWdlKCk7Jyxcblx0XHQnICAgIGhpZ2hwIGZsb2F0IGFsaXZlID0gZ2V0QWxpdmUoKTsnLFxuXHRcdCcgICAgaGlnaHAgZmxvYXQgbWF4QWdlID0gZ2V0TWF4QWdlKCk7Jyxcblx0XHQnICAgIGhpZ2hwIGZsb2F0IHBvc2l0aW9uSW5UaW1lID0gKGFnZSAvIG1heEFnZSk7Jyxcblx0XHQnICAgIGhpZ2hwIGZsb2F0IGlzQWxpdmUgPSB3aGVuX2d0KCBhbGl2ZSwgMC4wICk7JyxcblxuXHRcdCcgICAgI2lmZGVmIFNIT1VMRF9XSUdHTEVfUEFSVElDTEVTJyxcblx0XHQnICAgICAgICBmbG9hdCB3aWdnbGVBbW91bnQgPSBwb3NpdGlvbkluVGltZSAqIGdldFdpZ2dsZSgpOycsXG5cdFx0JyAgICAgICAgZmxvYXQgd2lnZ2xlU2luID0gaXNBbGl2ZSAqIHNpbiggd2lnZ2xlQW1vdW50ICk7Jyxcblx0XHQnICAgICAgICBmbG9hdCB3aWdnbGVDb3MgPSBpc0FsaXZlICogY29zKCB3aWdnbGVBbW91bnQgKTsnLFxuXHRcdCcgICAgI2VuZGlmJyxcblxuXHRcdC8vXG5cdFx0Ly8gRm9yY2VzXG5cdFx0Ly9cblxuXHRcdC8vIEdldCBmb3JjZXMgJiBwb3NpdGlvblxuXHRcdCcgICAgdmVjMyB2ZWwgPSBnZXRWZWxvY2l0eSggYWdlICk7Jyxcblx0XHQnICAgIHZlYzMgYWNjZWwgPSBnZXRBY2NlbGVyYXRpb24oIGFnZSApOycsXG5cdFx0JyAgICB2ZWMzIGZvcmNlID0gdmVjMyggMC4wICk7Jyxcblx0XHQnICAgIHZlYzMgcG9zID0gdmVjMyggcG9zaXRpb24gKTsnLFxuXG5cdFx0Ly8gQ2FsY3VsYXRlIHRoZSByZXF1aXJlZCBkcmFnIHRvIGFwcGx5IHRvIHRoZSBmb3JjZXMuXG5cdFx0JyAgICBmbG9hdCBkcmFnID0gMS4wIC0gKHBvc2l0aW9uSW5UaW1lICogMC41KSAqIGFjY2VsZXJhdGlvbi53OycsXG5cblx0XHQvLyBJbnRlZ3JhdGUgZm9yY2VzLi4uXG5cdFx0JyAgICBmb3JjZSArPSB2ZWw7Jyxcblx0XHQnICAgIGZvcmNlICo9IGRyYWc7Jyxcblx0XHQnICAgIGZvcmNlICs9IGFjY2VsICogYWdlOycsXG5cdFx0JyAgICBwb3MgKz0gZm9yY2U7JyxcblxuXHRcdC8vIFdpZ2dseSB3aWdnbHkgd2lnZ2xlIVxuXHRcdCcgICAgI2lmZGVmIFNIT1VMRF9XSUdHTEVfUEFSVElDTEVTJyxcblx0XHQnICAgICAgICBwb3MueCArPSB3aWdnbGVTaW47Jyxcblx0XHQnICAgICAgICBwb3MueSArPSB3aWdnbGVDb3M7Jyxcblx0XHQnICAgICAgICBwb3MueiArPSB3aWdnbGVTaW47Jyxcblx0XHQnICAgICNlbmRpZicsXG5cblx0XHQvLyBSb3RhdGUgdGhlIGVtaXR0ZXIgYXJvdW5kIGl0J3MgY2VudHJhbCBwb2ludFxuXHRcdCcgICAgI2lmZGVmIFNIT1VMRF9ST1RBVEVfUEFSVElDTEVTJyxcblx0XHQnICAgICAgICBwb3MgPSBnZXRSb3RhdGlvbiggcG9zLCBwb3NpdGlvbkluVGltZSApOycsXG5cdFx0JyAgICAjZW5kaWYnLFxuXG5cdFx0Ly8gQ29udmVydCBwb3MgdG8gYSB3b3JsZC1zcGFjZSB2YWx1ZVxuXHRcdCcgICAgdmVjNCBtdlBvc2l0aW9uID0gbW9kZWxWaWV3TWF0cml4ICogdmVjNCggcG9zLCAxLjAgKTsnLFxuXG5cdFx0Ly8gRGV0ZXJtaW5lIHBvaW50IHNpemUuXG5cdFx0JyAgICBoaWdocCBmbG9hdCBwb2ludFNpemUgPSBnZXRGbG9hdE92ZXJMaWZldGltZSggcG9zaXRpb25JblRpbWUsIHNpemUgKSAqIGlzQWxpdmU7JyxcblxuXHRcdC8vIERldGVybWluZSBwZXJzcGVjdGl2ZVxuXHRcdCcgICAgI2lmZGVmIEhBU19QRVJTUEVDVElWRScsXG5cdFx0JyAgICAgICAgZmxvYXQgcGVyc3BlY3RpdmUgPSBzY2FsZSAvIGxlbmd0aCggbXZQb3NpdGlvbi54eXogKTsnLFxuXHRcdCcgICAgI2Vsc2UnLFxuXHRcdCcgICAgICAgIGZsb2F0IHBlcnNwZWN0aXZlID0gMS4wOycsXG5cdFx0JyAgICAjZW5kaWYnLFxuXG5cdFx0Ly8gQXBwbHkgcGVycGVjdGl2ZSB0byBwb2ludFNpemUgdmFsdWVcblx0XHQnICAgIGZsb2F0IHBvaW50U2l6ZVBlcnNwZWN0aXZlID0gcG9pbnRTaXplICogcGVyc3BlY3RpdmU7JyxcblxuXHRcdC8vXG5cdFx0Ly8gQXBwZWFyYW5jZVxuXHRcdC8vXG5cblx0XHQvLyBEZXRlcm1pbmUgY29sb3IgYW5kIG9wYWNpdHkgZm9yIHRoaXMgcGFydGljbGVcblx0XHQnICAgICNpZmRlZiBDT0xPUklaRScsXG5cdFx0JyAgICAgICB2ZWMzIGMgPSBpc0FsaXZlICogZ2V0Q29sb3JPdmVyTGlmZXRpbWUoJyxcblx0XHQnICAgICAgICAgICBwb3NpdGlvbkluVGltZSwnLFxuXHRcdCcgICAgICAgICAgIHVucGFja0NvbG9yKCBjb2xvci54ICksJyxcblx0XHQnICAgICAgICAgICB1bnBhY2tDb2xvciggY29sb3IueSApLCcsXG5cdFx0JyAgICAgICAgICAgdW5wYWNrQ29sb3IoIGNvbG9yLnogKSwnLFxuXHRcdCcgICAgICAgICAgIHVucGFja0NvbG9yKCBjb2xvci53ICknLFxuXHRcdCcgICAgICAgKTsnLFxuXHRcdCcgICAgI2Vsc2UnLFxuXHRcdCcgICAgICAgdmVjMyBjID0gdmVjMygxLjApOycsXG5cdFx0JyAgICAjZW5kaWYnLFxuXG5cdFx0JyAgICBmbG9hdCBvID0gaXNBbGl2ZSAqIGdldEZsb2F0T3ZlckxpZmV0aW1lKCBwb3NpdGlvbkluVGltZSwgb3BhY2l0eSApOycsXG5cblx0XHQvLyBBc3NpZ24gY29sb3IgdG8gdkNvbG9yIHZhcnlpbmcuXG5cdFx0JyAgICB2Q29sb3IgPSB2ZWM0KCBjLCBvICk7JyxcblxuXHRcdC8vIERldGVybWluZSBhbmdsZVxuXHRcdCcgICAgI2lmZGVmIFNIT1VMRF9ST1RBVEVfVEVYVFVSRScsXG5cdFx0JyAgICAgICAgdkFuZ2xlID0gaXNBbGl2ZSAqIGdldEZsb2F0T3ZlckxpZmV0aW1lKCBwb3NpdGlvbkluVGltZSwgYW5nbGUgKTsnLFxuXHRcdCcgICAgI2VuZGlmJyxcblxuXHRcdC8vIElmIHRoaXMgcGFydGljbGUgaXMgdXNpbmcgYSBzcHJpdGUtc2hlZXQgYXMgYSB0ZXh0dXJlLCB3ZSdsbCBoYXZlIHRvIGZpZ3VyZSBvdXRcblx0XHQvLyB3aGF0IGZyYW1lIG9mIHRoZSB0ZXh0dXJlIHRoZSBwYXJ0aWNsZSBpcyB1c2luZyBhdCBpdCdzIGN1cnJlbnQgcG9zaXRpb24gaW4gdGltZS5cblx0XHQnICAgICNpZmRlZiBTSE9VTERfQ0FMQ1VMQVRFX1NQUklURScsXG5cdFx0JyAgICAgICAgZmxvYXQgZnJhbWVzWCA9IHRleHR1cmVBbmltYXRpb24ueDsnLFxuXHRcdCcgICAgICAgIGZsb2F0IGZyYW1lc1kgPSB0ZXh0dXJlQW5pbWF0aW9uLnk7Jyxcblx0XHQnICAgICAgICBmbG9hdCBsb29wQ291bnQgPSB0ZXh0dXJlQW5pbWF0aW9uLnc7Jyxcblx0XHQnICAgICAgICBmbG9hdCB0b3RhbEZyYW1lcyA9IHRleHR1cmVBbmltYXRpb24uejsnLFxuXHRcdCcgICAgICAgIGZsb2F0IGZyYW1lTnVtYmVyID0gbW9kKCAocG9zaXRpb25JblRpbWUgKiBsb29wQ291bnQpICogdG90YWxGcmFtZXMsIHRvdGFsRnJhbWVzICk7JyxcblxuXHRcdCcgICAgICAgIGZsb2F0IGNvbHVtbiA9IGZsb29yKG1vZCggZnJhbWVOdW1iZXIsIGZyYW1lc1ggKSk7Jyxcblx0XHQnICAgICAgICBmbG9hdCByb3cgPSBmbG9vciggKGZyYW1lTnVtYmVyIC0gY29sdW1uKSAvIGZyYW1lc1ggKTsnLFxuXG5cdFx0JyAgICAgICAgZmxvYXQgY29sdW1uTm9ybSA9IGNvbHVtbiAvIGZyYW1lc1g7Jyxcblx0XHQnICAgICAgICBmbG9hdCByb3dOb3JtID0gcm93IC8gZnJhbWVzWTsnLFxuXG5cdFx0JyAgICAgICAgdlNwcml0ZVNoZWV0LnggPSAxLjAgLyBmcmFtZXNYOycsXG5cdFx0JyAgICAgICAgdlNwcml0ZVNoZWV0LnkgPSAxLjAgLyBmcmFtZXNZOycsXG5cdFx0JyAgICAgICAgdlNwcml0ZVNoZWV0LnogPSBjb2x1bW5Ob3JtOycsXG5cdFx0JyAgICAgICAgdlNwcml0ZVNoZWV0LncgPSByb3dOb3JtOycsXG5cdFx0JyAgICAjZW5kaWYnLFxuXG5cdFx0Ly9cblx0XHQvLyBXcml0ZSB2YWx1ZXNcblx0XHQvL1xuXG5cdFx0Ly8gU2V0IFBvaW50U2l6ZSBhY2NvcmRpbmcgdG8gc2l6ZSBhdCBjdXJyZW50IHBvaW50IGluIHRpbWUuXG5cdFx0JyAgICBnbF9Qb2ludFNpemUgPSBwb2ludFNpemVQZXJzcGVjdGl2ZTsnLFxuXHRcdCcgICAgZ2xfUG9zaXRpb24gPSBwcm9qZWN0aW9uTWF0cml4ICogbXZQb3NpdGlvbjsnLFxuXG4gICAgICAgIFRIUkVFLlNoYWRlckNodW5rLmxvZ2RlcHRoYnVmX3ZlcnRleCxcbiAgICAgICAgJ30nXG4gICAgXS5qb2luKCdcXG4nKSxcbiAgICBmcmFnbWVudDogW1xuICAgICAgICBzaGFkZXJDaHVua3MudW5pZm9ybXMsXG5cbiAgICAgICAgVEhSRUUuU2hhZGVyQ2h1bmsuY29tbW9uLFxuICAgICAgICBUSFJFRS5TaGFkZXJDaHVuay5mb2dfcGFyc19mcmFnbWVudCxcbiAgICAgICAgVEhSRUUuU2hhZGVyQ2h1bmsubG9nZGVwdGhidWZfcGFyc19mcmFnbWVudCxcblxuICAgICAgICBzaGFkZXJDaHVua3MudmFyeWluZ3MsXG5cbiAgICAgICAgc2hhZGVyQ2h1bmtzLmJyYW5jaEF2b2lkYW5jZUZ1bmN0aW9ucyxcblxuICAgICAgICAndm9pZCBtYWluKCkgeycsXG5cdFx0JyAgICB2ZWMzIG91dGdvaW5nTGlnaHQgPSB2Q29sb3IueHl6OycsXG5cdFx0JyAgICAnLFxuXHRcdCcgICAgI2lmZGVmIEFMUEhBVEVTVCcsXG5cdFx0JyAgICAgICBpZiAoIHZDb2xvci53IDwgZmxvYXQoQUxQSEFURVNUKSApIGRpc2NhcmQ7Jyxcblx0XHQnICAgICNlbmRpZicsXG5cbiAgICAgICAgc2hhZGVyQ2h1bmtzLnJvdGF0ZVRleHR1cmUsXG5cbiAgICAgICAgVEhSRUUuU2hhZGVyQ2h1bmsubG9nZGVwdGhidWZfZnJhZ21lbnQsXG5cbiAgICAgICAgJyAgICBvdXRnb2luZ0xpZ2h0ID0gdkNvbG9yLnh5eiAqIHJvdGF0ZWRUZXh0dXJlLnh5ejsnLFxuXHRcdCcgICAgZ2xfRnJhZ0NvbG9yID0gdmVjNCggb3V0Z29pbmdMaWdodC54eXosIHJvdGF0ZWRUZXh0dXJlLncgKiB2Q29sb3IudyApOycsXG5cbiAgICAgICAgVEhSRUUuU2hhZGVyQ2h1bmsuZm9nX2ZyYWdtZW50LFxuXG4gICAgICAgICd9J1xuICAgIF0uam9pbignXFxuJylcbn0iLCJpbXBvcnQgKiBhcyBUSFJFRSBmcm9tICd0aHJlZSc7XG5pbXBvcnQgdXRpbHMgZnJvbSAnLi4vdXRpbHMvaW5kZXgnXG5pbXBvcnQgU1BFIGZyb20gJy4uL2dyb3VwL3NwZSdcblxuY2xhc3MgRW1pdHRlciB7XG4gICAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgICAgICBjb25zdCB0eXBlcyA9IHV0aWxzLnR5cGVzO1xuICAgICAgICBjb25zdCBsaWZldGltZUxlbmd0aCA9IFNQRS52YWx1ZU92ZXJMaWZldGltZUxlbmd0aDtcblxuICAgICAgICBvcHRpb25zID0gdXRpbHMuZW5zdXJlVHlwZWRBcmcob3B0aW9ucywgdHlwZXMuT0JKRUNULCB7fSk7XG4gICAgICAgIG9wdGlvbnMucG9zaXRpb24gPSB1dGlscy5lbnN1cmVUeXBlZEFyZyhvcHRpb25zLnBvc2l0aW9uLCB0eXBlcy5PQkpFQ1QsIHt9KTtcbiAgICAgICAgb3B0aW9ucy52ZWxvY2l0eSA9IHV0aWxzLmVuc3VyZVR5cGVkQXJnKG9wdGlvbnMudmVsb2NpdHksIHR5cGVzLk9CSkVDVCwge30pO1xuICAgICAgICBvcHRpb25zLmFjY2VsZXJhdGlvbiA9IHV0aWxzLmVuc3VyZVR5cGVkQXJnKG9wdGlvbnMuYWNjZWxlcmF0aW9uLCB0eXBlcy5PQkpFQ1QsIHt9KTtcbiAgICAgICAgb3B0aW9ucy5yYWRpdXMgPSB1dGlscy5lbnN1cmVUeXBlZEFyZyhvcHRpb25zLnJhZGl1cywgdHlwZXMuT0JKRUNULCB7fSk7XG4gICAgICAgIG9wdGlvbnMuZHJhZyA9IHV0aWxzLmVuc3VyZVR5cGVkQXJnKG9wdGlvbnMuZHJhZywgdHlwZXMuT0JKRUNULCB7fSk7XG4gICAgICAgIG9wdGlvbnMucm90YXRpb24gPSB1dGlscy5lbnN1cmVUeXBlZEFyZyhvcHRpb25zLnJvdGF0aW9uLCB0eXBlcy5PQkpFQ1QsIHt9KTtcbiAgICAgICAgb3B0aW9ucy5jb2xvciA9IHV0aWxzLmVuc3VyZVR5cGVkQXJnKG9wdGlvbnMuY29sb3IsIHR5cGVzLk9CSkVDVCwge30pO1xuICAgICAgICBvcHRpb25zLm9wYWNpdHkgPSB1dGlscy5lbnN1cmVUeXBlZEFyZyhvcHRpb25zLm9wYWNpdHksIHR5cGVzLk9CSkVDVCwge30pO1xuICAgICAgICBvcHRpb25zLnNpemUgPSB1dGlscy5lbnN1cmVUeXBlZEFyZyhvcHRpb25zLnNpemUsIHR5cGVzLk9CSkVDVCwge30pO1xuICAgICAgICBvcHRpb25zLmFuZ2xlID0gdXRpbHMuZW5zdXJlVHlwZWRBcmcob3B0aW9ucy5hbmdsZSwgdHlwZXMuT0JKRUNULCB7fSk7XG4gICAgICAgIG9wdGlvbnMud2lnZ2xlID0gdXRpbHMuZW5zdXJlVHlwZWRBcmcob3B0aW9ucy53aWdnbGUsIHR5cGVzLk9CSkVDVCwge30pO1xuICAgICAgICBvcHRpb25zLm1heEFnZSA9IHV0aWxzLmVuc3VyZVR5cGVkQXJnKG9wdGlvbnMubWF4QWdlLCB0eXBlcy5PQkpFQ1QsIHt9KTtcblxuICAgICAgICBpZiAob3B0aW9ucy5vblBhcnRpY2xlU3Bhd24pIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2Fybignb25QYXJ0aWNsZVNwYXduIGhhcyBiZWVuIHJlbW92ZWQuIFBsZWFzZSBzZXQgcHJvcGVydGllcyBkaXJlY3RseSB0byBhbHRlciB2YWx1ZXMgYXQgcnVudGltZS4nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMudXVpZCA9IFRIUkVFLk1hdGhVdGlscy5nZW5lcmF0ZVVVSUQoKTtcbiAgICAgICAgdGhpcy50eXBlID0gdXRpbHMuZW5zdXJlVHlwZWRBcmcob3B0aW9ucy50eXBlLCB0eXBlcy5OVU1CRVIsIFNQRS5kaXN0cmlidXRpb25zLkJPWCk7XG5cbiAgICAgICAgdGhpcy5wb3NpdGlvbiA9IHtcbiAgICAgICAgICAgIF92YWx1ZTogdXRpbHMuZW5zdXJlSW5zdGFuY2VPZihvcHRpb25zLnBvc2l0aW9uLnZhbHVlLCBUSFJFRS5WZWN0b3IzLCBuZXcgVEhSRUUuVmVjdG9yMygpKSxcbiAgICAgICAgICAgIF9zcHJlYWQ6IHV0aWxzLmVuc3VyZUluc3RhbmNlT2Yob3B0aW9ucy5wb3NpdGlvbi5zcHJlYWQsIFRIUkVFLlZlY3RvcjMsIG5ldyBUSFJFRS5WZWN0b3IzKCkpLFxuICAgICAgICAgICAgX3NwcmVhZENsYW1wOiB1dGlscy5lbnN1cmVJbnN0YW5jZU9mKG9wdGlvbnMucG9zaXRpb24uc3ByZWFkQ2xhbXAsIFRIUkVFLlZlY3RvcjMsIG5ldyBUSFJFRS5WZWN0b3IzKCkpLFxuICAgICAgICAgICAgX2Rpc3RyaWJ1dGlvbjogdXRpbHMuZW5zdXJlVHlwZWRBcmcob3B0aW9ucy5wb3NpdGlvbi5kaXN0cmlidXRpb24sIHR5cGVzLk5VTUJFUiwgdGhpcy50eXBlKSxcbiAgICAgICAgICAgIF9yYW5kb21pc2U6IHV0aWxzLmVuc3VyZVR5cGVkQXJnKG9wdGlvbnMucG9zaXRpb24ucmFuZG9taXNlLCB0eXBlcy5CT09MRUFOLCBmYWxzZSksXG4gICAgICAgICAgICBfcmFkaXVzOiB1dGlscy5lbnN1cmVUeXBlZEFyZyhvcHRpb25zLnBvc2l0aW9uLnJhZGl1cywgdHlwZXMuTlVNQkVSLCAxMCksXG4gICAgICAgICAgICBfcmFkaXVzU2NhbGU6IHV0aWxzLmVuc3VyZUluc3RhbmNlT2Yob3B0aW9ucy5wb3NpdGlvbi5yYWRpdXNTY2FsZSwgVEhSRUUuVmVjdG9yMywgbmV3IFRIUkVFLlZlY3RvcjMoMSwgMSwgMSkpLFxuICAgICAgICAgICAgX2Rpc3RyaWJ1dGlvbkNsYW1wOiB1dGlscy5lbnN1cmVUeXBlZEFyZyhvcHRpb25zLnBvc2l0aW9uLmRpc3RyaWJ1dGlvbkNsYW1wLCB0eXBlcy5OVU1CRVIsIDApXG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnZlbG9jaXR5ID0ge1xuICAgICAgICAgICAgX3ZhbHVlOiB1dGlscy5lbnN1cmVJbnN0YW5jZU9mKG9wdGlvbnMudmVsb2NpdHkudmFsdWUsIFRIUkVFLlZlY3RvcjMsIG5ldyBUSFJFRS5WZWN0b3IzKCkpLFxuICAgICAgICAgICAgX3NwcmVhZDogdXRpbHMuZW5zdXJlSW5zdGFuY2VPZihvcHRpb25zLnZlbG9jaXR5LnNwcmVhZCwgVEhSRUUuVmVjdG9yMywgbmV3IFRIUkVFLlZlY3RvcjMoKSksXG4gICAgICAgICAgICBfZGlzdHJpYnV0aW9uOiB1dGlscy5lbnN1cmVUeXBlZEFyZyhvcHRpb25zLnZlbG9jaXR5LmRpc3RyaWJ1dGlvbiwgdHlwZXMuTlVNQkVSLCB0aGlzLnR5cGUpLFxuICAgICAgICAgICAgX3JhbmRvbWlzZTogdXRpbHMuZW5zdXJlVHlwZWRBcmcob3B0aW9ucy5wb3NpdGlvbi5yYW5kb21pc2UsIHR5cGVzLkJPT0xFQU4sIGZhbHNlKVxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuYWNjZWxlcmF0aW9uID0ge1xuICAgICAgICAgICAgX3ZhbHVlOiB1dGlscy5lbnN1cmVJbnN0YW5jZU9mKG9wdGlvbnMuYWNjZWxlcmF0aW9uLnZhbHVlLCBUSFJFRS5WZWN0b3IzLCBuZXcgVEhSRUUuVmVjdG9yMygpKSxcbiAgICAgICAgICAgIF9zcHJlYWQ6IHV0aWxzLmVuc3VyZUluc3RhbmNlT2Yob3B0aW9ucy5hY2NlbGVyYXRpb24uc3ByZWFkLCBUSFJFRS5WZWN0b3IzLCBuZXcgVEhSRUUuVmVjdG9yMygpKSxcbiAgICAgICAgICAgIF9kaXN0cmlidXRpb246IHV0aWxzLmVuc3VyZVR5cGVkQXJnKG9wdGlvbnMuYWNjZWxlcmF0aW9uLmRpc3RyaWJ1dGlvbiwgdHlwZXMuTlVNQkVSLCB0aGlzLnR5cGUpLFxuICAgICAgICAgICAgX3JhbmRvbWlzZTogdXRpbHMuZW5zdXJlVHlwZWRBcmcob3B0aW9ucy5wb3NpdGlvbi5yYW5kb21pc2UsIHR5cGVzLkJPT0xFQU4sIGZhbHNlKVxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuZHJhZyA9IHtcbiAgICAgICAgICAgIF92YWx1ZTogdXRpbHMuZW5zdXJlVHlwZWRBcmcob3B0aW9ucy5kcmFnLnZhbHVlLCB0eXBlcy5OVU1CRVIsIDApLFxuICAgICAgICAgICAgX3NwcmVhZDogdXRpbHMuZW5zdXJlVHlwZWRBcmcob3B0aW9ucy5kcmFnLnNwcmVhZCwgdHlwZXMuTlVNQkVSLCAwKSxcbiAgICAgICAgICAgIF9yYW5kb21pc2U6IHV0aWxzLmVuc3VyZVR5cGVkQXJnKG9wdGlvbnMucG9zaXRpb24ucmFuZG9taXNlLCB0eXBlcy5CT09MRUFOLCBmYWxzZSlcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLndpZ2dsZSA9IHtcbiAgICAgICAgICAgIF92YWx1ZTogdXRpbHMuZW5zdXJlVHlwZWRBcmcob3B0aW9ucy53aWdnbGUudmFsdWUsIHR5cGVzLk5VTUJFUiwgMCksXG4gICAgICAgICAgICBfc3ByZWFkOiB1dGlscy5lbnN1cmVUeXBlZEFyZyhvcHRpb25zLndpZ2dsZS5zcHJlYWQsIHR5cGVzLk5VTUJFUiwgMClcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnJvdGF0aW9uID0ge1xuICAgICAgICAgICAgX2F4aXM6IHV0aWxzLmVuc3VyZUluc3RhbmNlT2Yob3B0aW9ucy5yb3RhdGlvbi5heGlzLCBUSFJFRS5WZWN0b3IzLCBuZXcgVEhSRUUuVmVjdG9yMygwLjAsIDEuMCwgMC4wKSksXG4gICAgICAgICAgICBfYXhpc1NwcmVhZDogdXRpbHMuZW5zdXJlSW5zdGFuY2VPZihvcHRpb25zLnJvdGF0aW9uLmF4aXNTcHJlYWQsIFRIUkVFLlZlY3RvcjMsIG5ldyBUSFJFRS5WZWN0b3IzKCkpLFxuICAgICAgICAgICAgX2FuZ2xlOiB1dGlscy5lbnN1cmVUeXBlZEFyZyhvcHRpb25zLnJvdGF0aW9uLmFuZ2xlLCB0eXBlcy5OVU1CRVIsIDApLFxuICAgICAgICAgICAgX2FuZ2xlU3ByZWFkOiB1dGlscy5lbnN1cmVUeXBlZEFyZyhvcHRpb25zLnJvdGF0aW9uLmFuZ2xlU3ByZWFkLCB0eXBlcy5OVU1CRVIsIDApLFxuICAgICAgICAgICAgX3N0YXRpYzogdXRpbHMuZW5zdXJlVHlwZWRBcmcob3B0aW9ucy5yb3RhdGlvbi5zdGF0aWMsIHR5cGVzLkJPT0xFQU4sIGZhbHNlKSxcbiAgICAgICAgICAgIF9jZW50ZXI6IHV0aWxzLmVuc3VyZUluc3RhbmNlT2Yob3B0aW9ucy5yb3RhdGlvbi5jZW50ZXIsIFRIUkVFLlZlY3RvcjMsIHRoaXMucG9zaXRpb24uX3ZhbHVlLmNsb25lKCkpLFxuICAgICAgICAgICAgX3JhbmRvbWlzZTogdXRpbHMuZW5zdXJlVHlwZWRBcmcob3B0aW9ucy5wb3NpdGlvbi5yYW5kb21pc2UsIHR5cGVzLkJPT0xFQU4sIGZhbHNlKVxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMubWF4QWdlID0ge1xuICAgICAgICAgICAgX3ZhbHVlOiB1dGlscy5lbnN1cmVUeXBlZEFyZyhvcHRpb25zLm1heEFnZS52YWx1ZSwgdHlwZXMuTlVNQkVSLCAyKSxcbiAgICAgICAgICAgIF9zcHJlYWQ6IHV0aWxzLmVuc3VyZVR5cGVkQXJnKG9wdGlvbnMubWF4QWdlLnNwcmVhZCwgdHlwZXMuTlVNQkVSLCAwKVxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIFRoZSBmb2xsb3dpbmcgcHJvcGVydGllcyBjYW4gc3VwcG9ydCBlaXRoZXIgc2luZ2xlIHZhbHVlcywgb3IgYW4gYXJyYXkgb2YgdmFsdWVzIHRoYXQgY2hhbmdlXG4gICAgICAgIC8vIHRoZSBwcm9wZXJ0eSBvdmVyIGEgcGFydGljbGUncyBsaWZldGltZSAodmFsdWUgb3ZlciBsaWZldGltZSkuXG4gICAgICAgIHRoaXMuY29sb3IgPSB7XG4gICAgICAgICAgICBfdmFsdWU6IHV0aWxzLmVuc3VyZUFycmF5SW5zdGFuY2VPZihvcHRpb25zLmNvbG9yLnZhbHVlLCBUSFJFRS5Db2xvciwgbmV3IFRIUkVFLkNvbG9yKCkpLFxuICAgICAgICAgICAgX3NwcmVhZDogdXRpbHMuZW5zdXJlQXJyYXlJbnN0YW5jZU9mKG9wdGlvbnMuY29sb3Iuc3ByZWFkLCBUSFJFRS5WZWN0b3IzLCBuZXcgVEhSRUUuVmVjdG9yMygpKSxcbiAgICAgICAgICAgIF9yYW5kb21pc2U6IHV0aWxzLmVuc3VyZVR5cGVkQXJnKG9wdGlvbnMucG9zaXRpb24ucmFuZG9taXNlLCB0eXBlcy5CT09MRUFOLCBmYWxzZSlcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLm9wYWNpdHkgPSB7XG4gICAgICAgICAgICBfdmFsdWU6IHV0aWxzLmVuc3VyZUFycmF5VHlwZWRBcmcob3B0aW9ucy5vcGFjaXR5LnZhbHVlLCB0eXBlcy5OVU1CRVIsIDEpLFxuICAgICAgICAgICAgX3NwcmVhZDogdXRpbHMuZW5zdXJlQXJyYXlUeXBlZEFyZyhvcHRpb25zLm9wYWNpdHkuc3ByZWFkLCB0eXBlcy5OVU1CRVIsIDApLFxuICAgICAgICAgICAgX3JhbmRvbWlzZTogdXRpbHMuZW5zdXJlVHlwZWRBcmcob3B0aW9ucy5wb3NpdGlvbi5yYW5kb21pc2UsIHR5cGVzLkJPT0xFQU4sIGZhbHNlKVxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuc2l6ZSA9IHtcbiAgICAgICAgICAgIF92YWx1ZTogdXRpbHMuZW5zdXJlQXJyYXlUeXBlZEFyZyhvcHRpb25zLnNpemUudmFsdWUsIHR5cGVzLk5VTUJFUiwgMSksXG4gICAgICAgICAgICBfc3ByZWFkOiB1dGlscy5lbnN1cmVBcnJheVR5cGVkQXJnKG9wdGlvbnMuc2l6ZS5zcHJlYWQsIHR5cGVzLk5VTUJFUiwgMCksXG4gICAgICAgICAgICBfcmFuZG9taXNlOiB1dGlscy5lbnN1cmVUeXBlZEFyZyhvcHRpb25zLnBvc2l0aW9uLnJhbmRvbWlzZSwgdHlwZXMuQk9PTEVBTiwgZmFsc2UpXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5hbmdsZSA9IHtcbiAgICAgICAgICAgIF92YWx1ZTogdXRpbHMuZW5zdXJlQXJyYXlUeXBlZEFyZyhvcHRpb25zLmFuZ2xlLnZhbHVlLCB0eXBlcy5OVU1CRVIsIDApLFxuICAgICAgICAgICAgX3NwcmVhZDogdXRpbHMuZW5zdXJlQXJyYXlUeXBlZEFyZyhvcHRpb25zLmFuZ2xlLnNwcmVhZCwgdHlwZXMuTlVNQkVSLCAwKSxcbiAgICAgICAgICAgIF9yYW5kb21pc2U6IHV0aWxzLmVuc3VyZVR5cGVkQXJnKG9wdGlvbnMucG9zaXRpb24ucmFuZG9taXNlLCB0eXBlcy5CT09MRUFOLCBmYWxzZSlcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBBc3NpZ24gcmVuYWluaW5nIG9wdGlvbiB2YWx1ZXMuXG4gICAgICAgIHRoaXMucGFydGljbGVDb3VudCA9IHV0aWxzLmVuc3VyZVR5cGVkQXJnKG9wdGlvbnMucGFydGljbGVDb3VudCwgdHlwZXMuTlVNQkVSLCAxMDApO1xuICAgICAgICB0aGlzLmR1cmF0aW9uID0gdXRpbHMuZW5zdXJlVHlwZWRBcmcob3B0aW9ucy5kdXJhdGlvbiwgdHlwZXMuTlVNQkVSLCBudWxsKTtcbiAgICAgICAgdGhpcy5pc1N0YXRpYyA9IHV0aWxzLmVuc3VyZVR5cGVkQXJnKG9wdGlvbnMuaXNTdGF0aWMsIHR5cGVzLkJPT0xFQU4sIGZhbHNlKTtcbiAgICAgICAgdGhpcy5hY3RpdmVNdWx0aXBsaWVyID0gdXRpbHMuZW5zdXJlVHlwZWRBcmcob3B0aW9ucy5hY3RpdmVNdWx0aXBsaWVyLCB0eXBlcy5OVU1CRVIsIDEpO1xuICAgICAgICB0aGlzLmRpcmVjdGlvbiA9IHV0aWxzLmVuc3VyZVR5cGVkQXJnKG9wdGlvbnMuZGlyZWN0aW9uLCB0eXBlcy5OVU1CRVIsIDEpO1xuXG4gICAgICAgIC8vIFdoZXRoZXIgdGhpcyBlbWl0dGVyIGlzIGFsaXZlIG9yIG5vdC5cbiAgICAgICAgdGhpcy5hbGl2ZSA9IHV0aWxzLmVuc3VyZVR5cGVkQXJnKG9wdGlvbnMuYWxpdmUsIHR5cGVzLkJPT0xFQU4sIHRydWUpO1xuXG4gICAgICAgIC8vIFRoZSBmb2xsb3dpbmcgcHJvcGVydGllcyBhcmUgc2V0IGludGVybmFsbHkgYW5kIGFyZSBub3RcbiAgICAgICAgLy8gdXNlci1jb250cm9sbGFibGUuXG4gICAgICAgIHRoaXMucGFydGljbGVzUGVyU2Vjb25kID0gMDtcblxuICAgICAgICAvLyBUaGUgY3VycmVudCBwYXJ0aWNsZSBpbmRleCBmb3Igd2hpY2ggcGFydGljbGVzIHNob3VsZFxuICAgICAgICAvLyBiZSBtYXJrZWQgYXMgYWN0aXZlIG9uIHRoZSBuZXh0IHVwZGF0ZSBjeWNsZS5cbiAgICAgICAgdGhpcy5hY3RpdmF0aW9uSW5kZXggPSAwO1xuXG4gICAgICAgIC8vIFRoZSBvZmZzZXQgaW4gdGhlIHR5cGVkIGFycmF5cyB0aGlzIGVtaXR0ZXInc1xuICAgICAgICAvLyBwYXJ0aWNsZSdzIHZhbHVlcyB3aWxsIHN0YXJ0IGF0XG4gICAgICAgIHRoaXMuYXR0cmlidXRlT2Zmc2V0ID0gMDtcblxuICAgICAgICAvLyBUaGUgZW5kIG9mIHRoZSByYW5nZSBpbiB0aGUgYXR0cmlidXRlIGJ1ZmZlcnNcbiAgICAgICAgdGhpcy5hdHRyaWJ1dGVFbmQgPSAwO1xuXG4gICAgICAgIC8vIEhvbGRzIHRoZSB0aW1lIHRoZSBlbWl0dGVyIGhhcyBiZWVuIGFsaXZlIGZvci5cbiAgICAgICAgdGhpcy5hZ2UgPSAwLjA7XG5cbiAgICAgICAgLy8gSG9sZHMgdGhlIG51bWJlciBvZiBjdXJyZW50bHktYWxpdmUgcGFydGljbGVzXG4gICAgICAgIHRoaXMuYWN0aXZlUGFydGljbGVDb3VudCA9IDAuMDtcblxuICAgICAgICAvLyBIb2xkcyBhIHJlZmVyZW5jZSB0byB0aGlzIGVtaXR0ZXIncyBncm91cCBvbmNlXG4gICAgICAgIC8vIGl0J3MgYWRkZWQgdG8gb25lLlxuICAgICAgICB0aGlzLmdyb3VwID0gbnVsbDtcblxuICAgICAgICAvLyBIb2xkcyBhIHJlZmVyZW5jZSB0byB0aGlzIGVtaXR0ZXIncyBncm91cCdzIGF0dHJpYnV0ZXMgb2JqZWN0XG4gICAgICAgIC8vIGZvciBlYXNpZXIgYWNjZXNzLlxuICAgICAgICB0aGlzLmF0dHJpYnV0ZXMgPSBudWxsO1xuXG4gICAgICAgIC8vIEhvbGRzIGEgcmVmZXJlbmNlIHRvIHRoZSBwYXJhbXMgYXR0cmlidXRlJ3MgdHlwZWQgYXJyYXlcbiAgICAgICAgLy8gZm9yIHF1aWNrZXIgYWNjZXNzLlxuICAgICAgICB0aGlzLnBhcmFtc0FycmF5ID0gbnVsbDtcblxuICAgICAgICAvLyBBIHNldCBvZiBmbGFncyB0byBkZXRlcm1pbmUgd2hldGhlciBwYXJ0aWN1bGFyIHByb3BlcnRpZXNcbiAgICAgICAgLy8gc2hvdWxkIGJlIHJlLXJhbmRvbWlzZWQgd2hlbiBhIHBhcnRpY2xlIGlzIHJlc2V0LlxuICAgICAgICAvL1xuICAgICAgICAvLyBJZiBhIGByYW5kb21pc2VgIHByb3BlcnR5IGlzIGdpdmVuLCB0aGlzIGlzIHByZWZlcnJlZC5cbiAgICAgICAgLy8gT3RoZXJ3aXNlLCBpdCBsb29rcyBhdCB3aGV0aGVyIGEgc3ByZWFkIHZhbHVlIGhhcyBiZWVuXG4gICAgICAgIC8vIGdpdmVuLlxuICAgICAgICAvL1xuICAgICAgICAvLyBJdCBhbGxvd3MgcmFuZG9taXphdGlvbiB0byBiZSB0dXJuZWQgb2ZmIGFzIGRlc2lyZWQuIElmXG4gICAgICAgIC8vIGFsbCByYW5kb21pemF0aW9uIGlzIHR1cm5lZCBvZmYsIHRoZW4gSSdkIGV4cGVjdCBhIHBlcmZvcm1hbmNlXG4gICAgICAgIC8vIGJvb3N0IGFzIG5vIGF0dHJpYnV0ZSBidWZmZXJzIChleGNsdWRpbmcgdGhlIGBwYXJhbXNgKVxuICAgICAgICAvLyB3b3VsZCBoYXZlIHRvIGJlIHJlLXBhc3NlZCB0byB0aGUgR1BVIGVhY2ggZnJhbWUgKHNpbmNlIG5vdGhpbmdcbiAgICAgICAgLy8gZXhjZXB0IHRoZSBgcGFyYW1zYCBhdHRyaWJ1dGUgd291bGQgaGF2ZSBjaGFuZ2VkKS5cbiAgICAgICAgdGhpcy5yZXNldEZsYWdzID0ge1xuICAgICAgICAgICAgLy8gcGFyYW1zOiB1dGlscy5lbnN1cmVUeXBlZEFyZyggb3B0aW9ucy5tYXhBZ2UucmFuZG9taXNlLCB0eXBlcy5CT09MRUFOLCAhIW9wdGlvbnMubWF4QWdlLnNwcmVhZCApIHx8XG4gICAgICAgICAgICAvLyAgICAgdXRpbHMuZW5zdXJlVHlwZWRBcmcoIG9wdGlvbnMud2lnZ2xlLnJhbmRvbWlzZSwgdHlwZXMuQk9PTEVBTiwgISFvcHRpb25zLndpZ2dsZS5zcHJlYWQgKSxcbiAgICAgICAgICAgIHBvc2l0aW9uOiB1dGlscy5lbnN1cmVUeXBlZEFyZyhvcHRpb25zLnBvc2l0aW9uLnJhbmRvbWlzZSwgdHlwZXMuQk9PTEVBTiwgZmFsc2UpIHx8XG4gICAgICAgICAgICAgICAgdXRpbHMuZW5zdXJlVHlwZWRBcmcob3B0aW9ucy5yYWRpdXMucmFuZG9taXNlLCB0eXBlcy5CT09MRUFOLCBmYWxzZSksXG4gICAgICAgICAgICB2ZWxvY2l0eTogdXRpbHMuZW5zdXJlVHlwZWRBcmcob3B0aW9ucy52ZWxvY2l0eS5yYW5kb21pc2UsIHR5cGVzLkJPT0xFQU4sIGZhbHNlKSxcbiAgICAgICAgICAgIGFjY2VsZXJhdGlvbjogdXRpbHMuZW5zdXJlVHlwZWRBcmcob3B0aW9ucy5hY2NlbGVyYXRpb24ucmFuZG9taXNlLCB0eXBlcy5CT09MRUFOLCBmYWxzZSkgfHxcbiAgICAgICAgICAgICAgICB1dGlscy5lbnN1cmVUeXBlZEFyZyhvcHRpb25zLmRyYWcucmFuZG9taXNlLCB0eXBlcy5CT09MRUFOLCBmYWxzZSksXG4gICAgICAgICAgICByb3RhdGlvbjogdXRpbHMuZW5zdXJlVHlwZWRBcmcob3B0aW9ucy5yb3RhdGlvbi5yYW5kb21pc2UsIHR5cGVzLkJPT0xFQU4sIGZhbHNlKSxcbiAgICAgICAgICAgIHJvdGF0aW9uQ2VudGVyOiB1dGlscy5lbnN1cmVUeXBlZEFyZyhvcHRpb25zLnJvdGF0aW9uLnJhbmRvbWlzZSwgdHlwZXMuQk9PTEVBTiwgZmFsc2UpLFxuICAgICAgICAgICAgc2l6ZTogdXRpbHMuZW5zdXJlVHlwZWRBcmcob3B0aW9ucy5zaXplLnJhbmRvbWlzZSwgdHlwZXMuQk9PTEVBTiwgZmFsc2UpLFxuICAgICAgICAgICAgY29sb3I6IHV0aWxzLmVuc3VyZVR5cGVkQXJnKG9wdGlvbnMuY29sb3IucmFuZG9taXNlLCB0eXBlcy5CT09MRUFOLCBmYWxzZSksXG4gICAgICAgICAgICBvcGFjaXR5OiB1dGlscy5lbnN1cmVUeXBlZEFyZyhvcHRpb25zLm9wYWNpdHkucmFuZG9taXNlLCB0eXBlcy5CT09MRUFOLCBmYWxzZSksXG4gICAgICAgICAgICBhbmdsZTogdXRpbHMuZW5zdXJlVHlwZWRBcmcob3B0aW9ucy5hbmdsZS5yYW5kb21pc2UsIHR5cGVzLkJPT0xFQU4sIGZhbHNlKVxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMudXBkYXRlRmxhZ3MgPSB7fTtcbiAgICAgICAgdGhpcy51cGRhdGVDb3VudHMgPSB7fTtcblxuICAgICAgICAvLyBBIG1hcCB0byBpbmRpY2F0ZSB3aGljaCBlbWl0dGVyIHBhcmFtZXRlcnMgc2hvdWxkIHVwZGF0ZVxuICAgICAgICAvLyB3aGljaCBhdHRyaWJ1dGUuXG4gICAgICAgIHRoaXMudXBkYXRlTWFwID0ge1xuICAgICAgICAgICAgbWF4QWdlOiAncGFyYW1zJyxcbiAgICAgICAgICAgIHBvc2l0aW9uOiAncG9zaXRpb24nLFxuICAgICAgICAgICAgdmVsb2NpdHk6ICd2ZWxvY2l0eScsXG4gICAgICAgICAgICBhY2NlbGVyYXRpb246ICdhY2NlbGVyYXRpb24nLFxuICAgICAgICAgICAgZHJhZzogJ2FjY2VsZXJhdGlvbicsXG4gICAgICAgICAgICB3aWdnbGU6ICdwYXJhbXMnLFxuICAgICAgICAgICAgcm90YXRpb246ICdyb3RhdGlvbicsXG4gICAgICAgICAgICBzaXplOiAnc2l6ZScsXG4gICAgICAgICAgICBjb2xvcjogJ2NvbG9yJyxcbiAgICAgICAgICAgIG9wYWNpdHk6ICdvcGFjaXR5JyxcbiAgICAgICAgICAgIGFuZ2xlOiAnYW5nbGUnXG4gICAgICAgIH07XG5cbiAgICAgICAgZm9yICh2YXIgaSBpbiB0aGlzLnVwZGF0ZU1hcCkge1xuICAgICAgICAgICAgaWYgKHRoaXMudXBkYXRlTWFwLmhhc093blByb3BlcnR5KGkpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVDb3VudHNbdGhpcy51cGRhdGVNYXBbaV1dID0gMC4wO1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlRmxhZ3NbdGhpcy51cGRhdGVNYXBbaV1dID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdGhpcy5fY3JlYXRlR2V0dGVyU2V0dGVycyh0aGlzW2ldLCBpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuYnVmZmVyVXBkYXRlUmFuZ2VzID0ge307XG4gICAgICAgIHRoaXMuYXR0cmlidXRlS2V5cyA9IG51bGw7XG4gICAgICAgIHRoaXMuYXR0cmlidXRlQ291bnQgPSAwO1xuXG4gICAgICAgIC8vIEVuc3VyZSB0aGF0IHRoZSB2YWx1ZS1vdmVyLWxpZmV0aW1lIHByb3BlcnR5IG9iamVjdHMgYWJvdmVcbiAgICAgICAgLy8gaGF2ZSB2YWx1ZSBhbmQgc3ByZWFkIHByb3BlcnRpZXMgdGhhdCBhcmUgb2YgdGhlIHNhbWUgbGVuZ3RoLlxuICAgICAgICAvL1xuICAgICAgICAvLyBBbHNvLCBmb3Igbm93LCBtYWtlIHN1cmUgdGhleSBoYXZlIGEgbGVuZ3RoIG9mIDMgKG1pbi9tYXggYXJndW1lbnRzIGhlcmUpLlxuICAgICAgICB1dGlscy5lbnN1cmVWYWx1ZU92ZXJMaWZldGltZUNvbXBsaWFuY2UodGhpcy5jb2xvciwgbGlmZXRpbWVMZW5ndGgsIGxpZmV0aW1lTGVuZ3RoKTtcbiAgICAgICAgdXRpbHMuZW5zdXJlVmFsdWVPdmVyTGlmZXRpbWVDb21wbGlhbmNlKHRoaXMub3BhY2l0eSwgbGlmZXRpbWVMZW5ndGgsIGxpZmV0aW1lTGVuZ3RoKTtcbiAgICAgICAgdXRpbHMuZW5zdXJlVmFsdWVPdmVyTGlmZXRpbWVDb21wbGlhbmNlKHRoaXMuc2l6ZSwgbGlmZXRpbWVMZW5ndGgsIGxpZmV0aW1lTGVuZ3RoKTtcbiAgICAgICAgdXRpbHMuZW5zdXJlVmFsdWVPdmVyTGlmZXRpbWVDb21wbGlhbmNlKHRoaXMuYW5nbGUsIGxpZmV0aW1lTGVuZ3RoLCBsaWZldGltZUxlbmd0aCk7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUdldHRlclNldHRlcnMocHJvcE9iaiwgcHJvcE5hbWUpIHtcbiAgICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgICAgIE9iamVjdC5rZXlzKHByb3BPYmopLmZvckVhY2goa2V5ID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5hbWUgPSBrZXkucmVwbGFjZSgnXycsICcnKTtcbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShwcm9wT2JqLCBuYW1lLCB7XG4gICAgICAgICAgICAgICAgZ2V0KCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpc1trZXldXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBzZXQodmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbWFwTmFtZSA9IHNlbGYudXBkYXRlTWFwW3Byb3BOYW1lXTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcHJldlZhbHVlID0gdGhpc1trZXldO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBsZW5ndGggPSBTUEUudmFsdWVPdmVyTGlmZXRpbWVMZW5ndGg7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGtleSA9PT0gJ19yb3RhdGlvbkNlbnRlcicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYudXBkYXRlRmxhZ3Mucm90YXRpb25DZW50ZXIgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy51cGRhdGVDb3VudHMucm90YXRpb25DZW50ZXIgPSAwLjA7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAocHJvcCA9PT0gJ19yYW5kb21pc2UnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnJlc2V0RmxhZ3NbbWFwTmFtZV0gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYudXBkYXRlRmxhZ3NbbWFwTmFtZV0gPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi51cGRhdGVDb3VudHNbbWFwTmFtZV0gPSAwLjA7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBzZWxmLmdyb3VwLl91cGRhdGVEZWZpbmVzKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgdGhpc1trZXldID0gdmFsdWU7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gSWYgdGhlIHByZXZpb3VzIHZhbHVlIHdhcyBhbiBhcnJheSwgdGhlbiBtYWtlXG4gICAgICAgICAgICAgICAgICAgIC8vIHN1cmUgdGhlIHByb3ZpZGVkIHZhbHVlIGlzIGludGVycG9sYXRlZCBjb3JyZWN0bHkuXG4gICAgICAgICAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KHByZXZWYWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHV0aWxzLmVuc3VyZVZhbHVlT3ZlckxpZmV0aW1lQ29tcGxpYW5jZShzZWxmW3Byb3BOYW1lXSwgbGVuZ3RoLCBsZW5ndGgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICBfc2V0QnVmZmVyVXBkYXRlUmFuZ2VzKGtleXMpIHtcbiAgICAgICAgdGhpcy5hdHRyaWJ1dGVLZXlzID0ga2V5cztcbiAgICAgICAgdGhpcy5hdHRyaWJ1dGVDb3VudCA9IGtleXMubGVuZ3RoO1xuXG4gICAgICAgIGZvciAobGV0IGkgPSB0aGlzLmF0dHJpYnV0ZUNvdW50IC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgICAgIHRoaXMuYnVmZmVyVXBkYXRlUmFuZ2VzW2tleXNbaV1dID0ge1xuICAgICAgICAgICAgICAgIG1pbjogTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZLFxuICAgICAgICAgICAgICAgIG1heDogTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgX2NhbGN1bGF0ZVBQU1ZhbHVlKGdyb3VwTWF4QWdlKSB7XG4gICAgICAgIGNvbnN0IHBhcnRpY2xlQ291bnQgPSB0aGlzLnBhcnRpY2xlQ291bnQ7XG5cbiAgICAgICAgLy8gQ2FsY3VsYXRlIHRoZSBgcGFydGljbGVzUGVyU2Vjb25kYCB2YWx1ZSBmb3IgdGhpcyBlbWl0dGVyLiBJdCdzIHVzZWRcbiAgICAgICAgLy8gd2hlbiBkZXRlcm1pbmluZyB3aGljaCBwYXJ0aWNsZXMgc2hvdWxkIGRpZSBhbmQgd2hpY2ggc2hvdWxkIGxpdmUgdG9cbiAgICAgICAgLy8gc2VlIGFub3RoZXIgZGF5LiBPciBiZSBib3JuLCBmb3IgdGhhdCBtYXR0ZXIuIFRoZSBcIkdvZFwiIHByb3BlcnR5LlxuICAgICAgICBpZiAodGhpcy5kdXJhdGlvbikge1xuICAgICAgICAgICAgdGhpcy5wYXJ0aWNsZXNQZXJTZWNvbmQgPSBwYXJ0aWNsZUNvdW50IC8gKGdyb3VwTWF4QWdlIDwgdGhpcy5kdXJhdGlvbiA/IGdyb3VwTWF4QWdlIDogdGhpcy5kdXJhdGlvbik7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnBhcnRpY2xlc1BlclNlY29uZCA9IHBhcnRpY2xlQ291bnQgLyBncm91cE1heEFnZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9zZXRBdHRyaWJ1dGVPZmZzZXQoc3RhcnRJbmRleCkge1xuICAgICAgICB0aGlzLmF0dHJpYnV0ZU9mZnNldCA9IHN0YXJ0SW5kZXg7XG4gICAgICAgIHRoaXMuYWN0aXZhdGlvbkluZGV4ID0gc3RhcnRJbmRleDtcbiAgICAgICAgdGhpcy5hY3RpdmF0aW9uRW5kID0gc3RhcnRJbmRleCArIHRoaXMucGFydGljbGVDb3VudDtcbiAgICB9XG5cbiAgICBfYXNzaWduVmFsdWUocHJvcCwgaW5kZXgpIHtcbiAgICAgICAgc3dpdGNoIChwcm9wKSB7XG4gICAgICAgICAgICBjYXNlICdwb3NpdGlvbic6XG4gICAgICAgICAgICAgICAgdGhpcy5fYXNzaWduUG9zaXRpb25WYWx1ZShpbmRleCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgJ3ZlbG9jaXR5JzpcbiAgICAgICAgICAgIGNhc2UgJ2FjY2VsZXJhdGlvbic6XG4gICAgICAgICAgICAgICAgdGhpcy5fYXNzaWduRm9yY2VWYWx1ZShpbmRleCwgcHJvcCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgJ3NpemUnOlxuICAgICAgICAgICAgY2FzZSAnb3BhY2l0eSc6XG4gICAgICAgICAgICAgICAgdGhpcy5fYXNzaWduQWJzTGlmZXRpbWVWYWx1ZShpbmRleCwgcHJvcCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgJ2FuZ2xlJzpcbiAgICAgICAgICAgICAgICB0aGlzLl9hc3NpZ25BbmdsZVZhbHVlKGluZGV4KTtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSAncGFyYW1zJzpcbiAgICAgICAgICAgICAgICB0aGlzLl9hc3NpZ25QYXJhbXNWYWx1ZShpbmRleCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgJ3JvdGF0aW9uJzpcbiAgICAgICAgICAgICAgICB0aGlzLl9hc3NpZ25Sb3RhdGlvblZhbHVlKGluZGV4KTtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSAnY29sb3InOlxuICAgICAgICAgICAgICAgIHRoaXMuX2Fzc2lnbkNvbG9yVmFsdWUoaW5kZXgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgX2Fzc2lnblBvc2l0aW9uVmFsdWUoaW5kZXgpIHtcbiAgICAgICAgY29uc3QgZGlzdHJpYnV0aW9ucyA9IFNQRS5kaXN0cmlidXRpb25zO1xuICAgICAgICBjb25zdCBwcm9wID0gdGhpcy5wb3NpdGlvbjtcbiAgICAgICAgY29uc3QgYXR0ciA9IHRoaXMuYXR0cmlidXRlcy5wb3NpdGlvbjtcbiAgICAgICAgY29uc3QgdmFsdWUgPSBwcm9wLl92YWx1ZTtcbiAgICAgICAgY29uc3Qgc3ByZWFkID0gcHJvcC5fc3ByZWFkO1xuICAgICAgICBjb25zdCBkaXN0cmlidXRpb24gPSBwcm9wLmRpc3RyaWJ1dGlvbjtcblxuICAgICAgICBzd2l0Y2ggKGRpc3RyaWJ1dGlvbikge1xuICAgICAgICAgICAgY2FzZSBkaXN0cmlidXRpb25zLkJPWDpcbiAgICAgICAgICAgICAgICB1dGlscy5yYW5kb21WZWN0b3IzKGF0dHIsIGluZGV4LCB2YWx1ZSwgc3ByZWFkLCBwcm9wLl9zcHJlYWRDbGFtcCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgZGlzdHJpYnV0aW9ucy5TUEhFUkU6XG4gICAgICAgICAgICAgICAgdXRpbHMucmFuZG9tVmVjdG9yM09uU3BoZXJlKGF0dHIsIGluZGV4LCB2YWx1ZSwgcHJvcC5fcmFkaXVzLCBwcm9wLl9zcHJlYWQueCwgcHJvcC5fcmFkaXVzU2NhbGUsIHByb3AuX3NwcmVhZENsYW1wLngsIHByb3AuX2Rpc3RyaWJ1dGlvbkNsYW1wIHx8IHRoaXMucGFydGljbGVDb3VudCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgZGlzdHJpYnV0aW9ucy5ESVNDOlxuICAgICAgICAgICAgICAgIHV0aWxzLnJhbmRvbVZlY3RvcjNPbkRpc2MoYXR0ciwgaW5kZXgsIHZhbHVlLCBwcm9wLl9yYWRpdXMsIHByb3AuX3NwcmVhZC54LCBwcm9wLl9yYWRpdXNTY2FsZSwgcHJvcC5fc3ByZWFkQ2xhbXAueCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgZGlzdHJpYnV0aW9ucy5MSU5FOlxuICAgICAgICAgICAgICAgIHV0aWxzLnJhbmRvbVZlY3RvcjNPbkxpbmUoYXR0ciwgaW5kZXgsIHZhbHVlLCBzcHJlYWQpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgX2Fzc2lnbkZvcmNlVmFsdWUoaW5kZXgsIGF0dHJOYW1lKSB7XG4gICAgICAgIGNvbnN0IGRpc3RyaWJ1dGlvbnMgPSBTUEUuZGlzdHJpYnV0aW9ucztcbiAgICAgICAgY29uc3QgcHJvcCA9IHRoaXNbYXR0ck5hbWVdO1xuICAgICAgICBjb25zdCB2YWx1ZSA9IHByb3AuX3ZhbHVlO1xuICAgICAgICBjb25zdCBzcHJlYWQgPSBwcm9wLl9zcHJlYWQ7XG4gICAgICAgIGNvbnN0IGRpc3RyaWJ1dGlvbiA9IHByb3AuX2Rpc3RyaWJ1dGlvbjtcblxuICAgICAgICBsZXQgcG9zLCBwb3NpdGlvblgsIHBvc2l0aW9uWSwgcG9zaXRpb25aLCBpO1xuXG4gICAgICAgIHN3aXRjaCAoZGlzdHJpYnV0aW9uKSB7XG4gICAgICAgICAgICBjYXNlIGRpc3RyaWJ1dGlvbnMuQk9YOlxuICAgICAgICAgICAgICAgIHV0aWxzLnJhbmRvbVZlY3RvcjModGhpcy5hdHRyaWJ1dGVzW2F0dHJOYW1lXSwgaW5kZXgsIHZhbHVlLCBzcHJlYWQpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIGRpc3RyaWJ1dGlvbnMuU1BIRVJFOlxuICAgICAgICAgICAgICAgIHBvcyA9IHRoaXMuYXR0cmlidXRlcy5wb3NpdGlvbi50eXBlZEFycmF5LmFycmF5O1xuICAgICAgICAgICAgICAgIGkgPSBpbmRleCAqIDM7XG5cbiAgICAgICAgICAgICAgICAvLyBFbnN1cmUgcG9zaXRpb24gdmFsdWVzIGFyZW4ndCB6ZXJvLCBvdGhlcndpc2Ugbm8gZm9yY2Ugd2lsbCBiZVxuICAgICAgICAgICAgICAgIC8vIGFwcGxpZWQuXG4gICAgICAgICAgICAgICAgLy8gcG9zaXRpb25YID0gdXRpbHMuemVyb1RvRXBzaWxvbiggcG9zWyBpIF0sIHRydWUgKTtcbiAgICAgICAgICAgICAgICAvLyBwb3NpdGlvblkgPSB1dGlscy56ZXJvVG9FcHNpbG9uKCBwb3NbIGkgKyAxIF0sIHRydWUgKTtcbiAgICAgICAgICAgICAgICAvLyBwb3NpdGlvblogPSB1dGlscy56ZXJvVG9FcHNpbG9uKCBwb3NbIGkgKyAyIF0sIHRydWUgKTtcbiAgICAgICAgICAgICAgICBwb3NpdGlvblggPSBwb3NbaV07XG4gICAgICAgICAgICAgICAgcG9zaXRpb25ZID0gcG9zW2kgKyAxXTtcbiAgICAgICAgICAgICAgICBwb3NpdGlvblogPSBwb3NbaSArIDJdO1xuXG4gICAgICAgICAgICAgICAgdXRpbHMucmFuZG9tRGlyZWN0aW9uVmVjdG9yM09uU3BoZXJlKFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmF0dHJpYnV0ZXNbYXR0ck5hbWVdLCBpbmRleCxcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb25YLCBwb3NpdGlvblksIHBvc2l0aW9uWixcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wb3NpdGlvbi5fdmFsdWUsXG4gICAgICAgICAgICAgICAgICAgIHByb3AuX3ZhbHVlLngsXG4gICAgICAgICAgICAgICAgICAgIHByb3AuX3NwcmVhZC54XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSBkaXN0cmlidXRpb25zLkRJU0M6XG4gICAgICAgICAgICAgICAgcG9zID0gdGhpcy5hdHRyaWJ1dGVzLnBvc2l0aW9uLnR5cGVkQXJyYXkuYXJyYXk7XG4gICAgICAgICAgICAgICAgaSA9IGluZGV4ICogMztcblxuICAgICAgICAgICAgICAgIC8vIEVuc3VyZSBwb3NpdGlvbiB2YWx1ZXMgYXJlbid0IHplcm8sIG90aGVyd2lzZSBubyBmb3JjZSB3aWxsIGJlXG4gICAgICAgICAgICAgICAgLy8gYXBwbGllZC5cbiAgICAgICAgICAgICAgICAvLyBwb3NpdGlvblggPSB1dGlscy56ZXJvVG9FcHNpbG9uKCBwb3NbIGkgXSwgdHJ1ZSApO1xuICAgICAgICAgICAgICAgIC8vIHBvc2l0aW9uWSA9IHV0aWxzLnplcm9Ub0Vwc2lsb24oIHBvc1sgaSArIDEgXSwgdHJ1ZSApO1xuICAgICAgICAgICAgICAgIC8vIHBvc2l0aW9uWiA9IHV0aWxzLnplcm9Ub0Vwc2lsb24oIHBvc1sgaSArIDIgXSwgdHJ1ZSApO1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uWCA9IHBvc1tpXTtcbiAgICAgICAgICAgICAgICBwb3NpdGlvblkgPSBwb3NbaSArIDFdO1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uWiA9IHBvc1tpICsgMl07XG5cbiAgICAgICAgICAgICAgICB1dGlscy5yYW5kb21EaXJlY3Rpb25WZWN0b3IzT25EaXNjKFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmF0dHJpYnV0ZXNbYXR0ck5hbWVdLCBpbmRleCxcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb25YLCBwb3NpdGlvblksIHBvc2l0aW9uWixcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wb3NpdGlvbi5fdmFsdWUsXG4gICAgICAgICAgICAgICAgICAgIHByb3AuX3ZhbHVlLngsXG4gICAgICAgICAgICAgICAgICAgIHByb3AuX3NwcmVhZC54XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSBkaXN0cmlidXRpb25zLkxJTkU6XG4gICAgICAgICAgICAgICAgdXRpbHMucmFuZG9tVmVjdG9yM09uTGluZSh0aGlzLmF0dHJpYnV0ZXNbYXR0ck5hbWVdLCBpbmRleCwgdmFsdWUsIHNwcmVhZCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGF0dHJOYW1lID09PSAnYWNjZWxlcmF0aW9uJykge1xuICAgICAgICAgICAgdmFyIGRyYWcgPSB1dGlscy5jbGFtcCh1dGlscy5yYW5kb21GbG9hdCh0aGlzLmRyYWcuX3ZhbHVlLCB0aGlzLmRyYWcuX3NwcmVhZCksIDAsIDEpO1xuICAgICAgICAgICAgdGhpcy5hdHRyaWJ1dGVzLmFjY2VsZXJhdGlvbi50eXBlZEFycmF5LmFycmF5W2luZGV4ICogNCArIDNdID0gZHJhZztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9hc3NpZ25BYnNMaWZldGltZVZhbHVlKGluZGV4LCBwcm9wTmFtZSkge1xuICAgICAgICBjb25zdCBhcnJheSA9IHRoaXMuYXR0cmlidXRlc1twcm9wTmFtZV0udHlwZWRBcnJheTtcbiAgICAgICAgY29uc3QgcHJvcCA9IHRoaXNbcHJvcE5hbWVdO1xuICAgICAgICBsZXQgdmFsdWU7XG5cbiAgICAgICAgaWYgKHV0aWxzLmFycmF5VmFsdWVzQXJlRXF1YWwocHJvcC5fdmFsdWUpICYmIHV0aWxzLmFycmF5VmFsdWVzQXJlRXF1YWwocHJvcC5fc3ByZWFkKSkge1xuICAgICAgICAgICAgdmFsdWUgPSBNYXRoLmFicyh1dGlscy5yYW5kb21GbG9hdChwcm9wLl92YWx1ZVswXSwgcHJvcC5fc3ByZWFkWzBdKSk7XG4gICAgICAgICAgICBhcnJheS5zZXRWZWM0Q29tcG9uZW50cyhpbmRleCwgdmFsdWUsIHZhbHVlLCB2YWx1ZSwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgYXJyYXkuc2V0VmVjNENvbXBvbmVudHMoaW5kZXgsXG4gICAgICAgICAgICAgICAgTWF0aC5hYnModXRpbHMucmFuZG9tRmxvYXQocHJvcC5fdmFsdWVbMF0sIHByb3AuX3NwcmVhZFswXSkpLFxuICAgICAgICAgICAgICAgIE1hdGguYWJzKHV0aWxzLnJhbmRvbUZsb2F0KHByb3AuX3ZhbHVlWzFdLCBwcm9wLl9zcHJlYWRbMV0pKSxcbiAgICAgICAgICAgICAgICBNYXRoLmFicyh1dGlscy5yYW5kb21GbG9hdChwcm9wLl92YWx1ZVsyXSwgcHJvcC5fc3ByZWFkWzJdKSksXG4gICAgICAgICAgICAgICAgTWF0aC5hYnModXRpbHMucmFuZG9tRmxvYXQocHJvcC5fdmFsdWVbM10sIHByb3AuX3NwcmVhZFszXSkpXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgX2Fzc2lnbkFuZ2xlVmFsdWUoaW5kZXgpIHtcbiAgICAgICAgY29uc3QgYXJyYXkgPSB0aGlzLmF0dHJpYnV0ZXMuYW5nbGUudHlwZWRBcnJheTtcbiAgICAgICAgY29uc3QgcHJvcCA9IHRoaXMuYW5nbGU7XG4gICAgICAgIGxldCB2YWx1ZTtcblxuICAgICAgICBpZiAodXRpbHMuYXJyYXlWYWx1ZXNBcmVFcXVhbChwcm9wLl92YWx1ZSkgJiYgdXRpbHMuYXJyYXlWYWx1ZXNBcmVFcXVhbChwcm9wLl9zcHJlYWQpKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IHV0aWxzLnJhbmRvbUZsb2F0KHByb3AuX3ZhbHVlWzBdLCBwcm9wLl9zcHJlYWRbMF0pO1xuICAgICAgICAgICAgYXJyYXkuc2V0VmVjNENvbXBvbmVudHMoaW5kZXgsIHZhbHVlLCB2YWx1ZSwgdmFsdWUsIHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGFycmF5LnNldFZlYzRDb21wb25lbnRzKGluZGV4LFxuICAgICAgICAgICAgICAgIHV0aWxzLnJhbmRvbUZsb2F0KHByb3AuX3ZhbHVlWzBdLCBwcm9wLl9zcHJlYWRbMF0pLFxuICAgICAgICAgICAgICAgIHV0aWxzLnJhbmRvbUZsb2F0KHByb3AuX3ZhbHVlWzFdLCBwcm9wLl9zcHJlYWRbMV0pLFxuICAgICAgICAgICAgICAgIHV0aWxzLnJhbmRvbUZsb2F0KHByb3AuX3ZhbHVlWzJdLCBwcm9wLl9zcHJlYWRbMl0pLFxuICAgICAgICAgICAgICAgIHV0aWxzLnJhbmRvbUZsb2F0KHByb3AuX3ZhbHVlWzNdLCBwcm9wLl9zcHJlYWRbM10pXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgX2Fzc2lnblBhcmFtc1ZhbHVlKGluZGV4KSB7XG4gICAgICAgIHRoaXMuYXR0cmlidXRlcy5wYXJhbXMudHlwZWRBcnJheS5zZXRWZWM0Q29tcG9uZW50cyhpbmRleCxcbiAgICAgICAgICAgIHRoaXMuaXNTdGF0aWMgPyAxIDogMCxcbiAgICAgICAgICAgIDAuMCxcbiAgICAgICAgICAgIE1hdGguYWJzKHV0aWxzLnJhbmRvbUZsb2F0KHRoaXMubWF4QWdlLl92YWx1ZSwgdGhpcy5tYXhBZ2UuX3NwcmVhZCkpLFxuICAgICAgICAgICAgdXRpbHMucmFuZG9tRmxvYXQodGhpcy53aWdnbGUuX3ZhbHVlLCB0aGlzLndpZ2dsZS5fc3ByZWFkKVxuICAgICAgICApO1xuICAgIH1cblxuICAgIF9hc3NpZ25Sb3RhdGlvblZhbHVlKGluZGV4KSB7XG4gICAgICAgIHRoaXMuYXR0cmlidXRlcy5yb3RhdGlvbi50eXBlZEFycmF5LnNldFZlYzNDb21wb25lbnRzKGluZGV4LFxuICAgICAgICAgICAgdXRpbHMuZ2V0UGFja2VkUm90YXRpb25BeGlzKHRoaXMucm90YXRpb24uX2F4aXMsIHRoaXMucm90YXRpb24uX2F4aXNTcHJlYWQpLFxuICAgICAgICAgICAgdXRpbHMucmFuZG9tRmxvYXQodGhpcy5yb3RhdGlvbi5fYW5nbGUsIHRoaXMucm90YXRpb24uX2FuZ2xlU3ByZWFkKSxcbiAgICAgICAgICAgIHRoaXMucm90YXRpb24uX3N0YXRpYyA/IDAgOiAxXG4gICAgICAgICk7XG5cbiAgICAgICAgdGhpcy5hdHRyaWJ1dGVzLnJvdGF0aW9uQ2VudGVyLnR5cGVkQXJyYXkuc2V0VmVjMyhpbmRleCwgdGhpcy5yb3RhdGlvbi5fY2VudGVyKTtcbiAgICB9XG5cbiAgICBfYXNzaWduQ29sb3JWYWx1ZShpbmRleCkge1xuICAgICAgICB1dGlscy5yYW5kb21Db2xvckFzSGV4KHRoaXMuYXR0cmlidXRlcy5jb2xvciwgaW5kZXgsIHRoaXMuY29sb3IuX3ZhbHVlLCB0aGlzLmNvbG9yLl9zcHJlYWQpO1xuICAgIH1cblxuICAgIF9yZXNldFBhcnRpY2xlKGluZGV4KSB7XG4gICAgICAgIGNvbnN0IHJlc2V0RmxhZ3MgPSB0aGlzLnJlc2V0RmxhZ3M7XG4gICAgICAgIGNvbnN0IHVwZGF0ZUZsYWdzID0gdGhpcy51cGRhdGVGbGFncztcbiAgICAgICAgY29uc3QgdXBkYXRlQ291bnRzID0gdGhpcy51cGRhdGVDb3VudHM7XG4gICAgICAgIGNvbnN0IGtleXMgPSB0aGlzLmF0dHJpYnV0ZUtleXM7XG4gICAgICAgIGxldCBrZXksIHVwZGF0ZUZsYWc7XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IHRoaXMuYXR0cmlidXRlQ291bnQgLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICAgICAga2V5ID0ga2V5c1tpXTtcbiAgICAgICAgICAgIHVwZGF0ZUZsYWcgPSB1cGRhdGVGbGFnc1trZXldO1xuXG4gICAgICAgICAgICBpZiAocmVzZXRGbGFnc1trZXldID09PSB0cnVlIHx8IHVwZGF0ZUZsYWcgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9hc3NpZ25WYWx1ZShrZXksIGluZGV4KTtcbiAgICAgICAgICAgICAgICB0aGlzLl91cGRhdGVBdHRyaWJ1dGVVcGRhdGVSYW5nZShrZXksIGluZGV4KTtcblxuICAgICAgICAgICAgICAgIGlmICh1cGRhdGVGbGFnID09PSB0cnVlICYmIHVwZGF0ZUNvdW50c1trZXldID09PSB0aGlzLnBhcnRpY2xlQ291bnQpIHtcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlRmxhZ3Nba2V5XSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB1cGRhdGVDb3VudHNba2V5XSA9IDAuMDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAodXBkYXRlRmxhZyA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICArK3VwZGF0ZUNvdW50c1trZXldO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIF91cGRhdGVBdHRyaWJ1dGVVcGRhdGVSYW5nZShhdHRyLCBpKSB7XG4gICAgICAgIGNvbnN0IHJhbmdlcyA9IHRoaXMuYnVmZmVyVXBkYXRlUmFuZ2VzW2F0dHJdO1xuXG4gICAgICAgIHJhbmdlcy5taW4gPSBNYXRoLm1pbihpLCByYW5nZXMubWluKTtcbiAgICAgICAgcmFuZ2VzLm1heCA9IE1hdGgubWF4KGksIHJhbmdlcy5tYXgpO1xuICAgIH1cblxuICAgIF9yZXNldEJ1ZmZlclJhbmdlcygpIHtcbiAgICAgICAgY29uc3QgcmFuZ2VzID0gdGhpcy5idWZmZXJVcGRhdGVSYW5nZXM7XG4gICAgICAgIGNvbnN0IGtleXMgPSB0aGlzLmJ1ZmZlclVwZGF0ZUtleXM7XG4gICAgICAgIGxldCBpID0gdGhpcy5idWZmZXJVcGRhdGVDb3VudCAtIDE7XG4gICAgICAgIGxldCBrZXk7XG5cbiAgICAgICAgZm9yIChpOyBpID49IDA7IC0taSkge1xuICAgICAgICAgICAga2V5ID0ga2V5c1tpXTtcbiAgICAgICAgICAgIHJhbmdlc1trZXldLm1pbiA9IE51bWJlci5QT1NJVElWRV9JTkZJTklUWTtcbiAgICAgICAgICAgIHJhbmdlc1trZXldLm1heCA9IE51bWJlci5ORUdBVElWRV9JTkZJTklUWTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9vblJlbW92ZSgpIHtcbiAgICAgICAgdGhpcy5wYXJ0aWNsZXNQZXJTZWNvbmQgPSAwO1xuICAgICAgICB0aGlzLmF0dHJpYnV0ZU9mZnNldCA9IDA7XG4gICAgICAgIHRoaXMuYWN0aXZhdGlvbkluZGV4ID0gMDtcbiAgICAgICAgdGhpcy5hY3RpdmVQYXJ0aWNsZUNvdW50ID0gMDtcbiAgICAgICAgdGhpcy5ncm91cCA9IG51bGw7XG4gICAgICAgIHRoaXMuYXR0cmlidXRlcyA9IG51bGw7XG4gICAgICAgIHRoaXMucGFyYW1zQXJyYXkgPSBudWxsO1xuICAgICAgICB0aGlzLmFnZSA9IDAuMDtcbiAgICB9XG5cbiAgICBfZGVjcmVtZW50UGFydGljbGVDb3VudCgpIHtcbiAgICAgICAgLS10aGlzLmFjdGl2ZVBhcnRpY2xlQ291bnQ7XG4gICAgfVxuXG4gICAgX2luY3JlbWVudFBhcnRpY2xlQ291bnQoKSB7XG4gICAgICAgICsrdGhpcy5hY3RpdmVQYXJ0aWNsZUNvdW50O1xuICAgIH1cblxuICAgIF9jaGVja1BhcnRpY2xlQWdlcyhzdGFydCwgZW5kLCBwYXJhbXMsIGR0KSB7XG4gICAgICAgIGZvciAobGV0IGkgPSBlbmQgLSAxLCBpbmRleCwgbWF4QWdlLCBhZ2UsIGFsaXZlOyBpID49IHN0YXJ0OyAtLWkpIHtcbiAgICAgICAgICAgIGluZGV4ID0gaSAqIDQ7XG5cbiAgICAgICAgICAgIGFsaXZlID0gcGFyYW1zW2luZGV4XTtcblxuICAgICAgICAgICAgaWYgKGFsaXZlID09PSAwLjApIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gSW5jcmVtZW50IGFnZVxuICAgICAgICAgICAgYWdlID0gcGFyYW1zW2luZGV4ICsgMV07XG4gICAgICAgICAgICBtYXhBZ2UgPSBwYXJhbXNbaW5kZXggKyAyXTtcblxuICAgICAgICAgICAgaWYgKHRoaXMuZGlyZWN0aW9uID09PSAxKSB7XG4gICAgICAgICAgICAgICAgYWdlICs9IGR0O1xuXG4gICAgICAgICAgICAgICAgaWYgKGFnZSA+PSBtYXhBZ2UpIHtcbiAgICAgICAgICAgICAgICAgICAgYWdlID0gMC4wO1xuICAgICAgICAgICAgICAgICAgICBhbGl2ZSA9IDAuMDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZGVjcmVtZW50UGFydGljbGVDb3VudCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGFnZSAtPSBkdDtcblxuICAgICAgICAgICAgICAgIGlmIChhZ2UgPD0gMC4wKSB7XG4gICAgICAgICAgICAgICAgICAgIGFnZSA9IG1heEFnZTtcbiAgICAgICAgICAgICAgICAgICAgYWxpdmUgPSAwLjA7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2RlY3JlbWVudFBhcnRpY2xlQ291bnQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHBhcmFtc1tpbmRleF0gPSBhbGl2ZTtcbiAgICAgICAgICAgIHBhcmFtc1tpbmRleCArIDFdID0gYWdlO1xuXG4gICAgICAgICAgICB0aGlzLl91cGRhdGVBdHRyaWJ1dGVVcGRhdGVSYW5nZSgncGFyYW1zJywgaSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfYWN0aXZhdGVQYXJ0aWNsZXMoYWN0aXZhdGlvblN0YXJ0LCBhY3RpdmF0aW9uRW5kLCBwYXJhbXMsIGR0UGVyUGFydGljbGUpIHtcbiAgICAgICAgY29uc3QgZGlyZWN0aW9uID0gdGhpcy5kaXJlY3Rpb247XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IGFjdGl2YXRpb25TdGFydCwgaW5kZXgsIGR0VmFsdWU7IGkgPCBhY3RpdmF0aW9uRW5kOyArK2kpIHtcbiAgICAgICAgICAgIGluZGV4ID0gaSAqIDQ7XG5cbiAgICAgICAgICAgIGlmIChwYXJhbXNbaW5kZXhdICE9PSAwLjAgJiYgdGhpcy5wYXJ0aWNsZUNvdW50ICE9PSAxKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIEluY3JlbWVudCB0aGUgYWN0aXZlIHBhcnRpY2xlIGNvdW50LlxuICAgICAgICAgICAgdGhpcy5faW5jcmVtZW50UGFydGljbGVDb3VudCgpO1xuXG4gICAgICAgICAgICAvLyBNYXJrIHRoZSBwYXJ0aWNsZSBhcyBhbGl2ZS5cbiAgICAgICAgICAgIHBhcmFtc1tpbmRleF0gPSAxLjA7XG5cbiAgICAgICAgICAgIC8vIFJlc2V0IHRoZSBwYXJ0aWNsZVxuICAgICAgICAgICAgdGhpcy5fcmVzZXRQYXJ0aWNsZShpKTtcblxuICAgICAgICAgICAgLy8gTW92ZSBlYWNoIHBhcnRpY2xlIGJlaW5nIGFjdGl2YXRlZCB0b1xuICAgICAgICAgICAgLy8gaXQncyBhY3R1YWwgcG9zaXRpb24gaW4gdGltZS5cbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAvLyBUaGlzIHN0b3BzIHBhcnRpY2xlcyBiZWluZyAnY2x1bXBlZCcgdG9nZXRoZXJcbiAgICAgICAgICAgIC8vIHdoZW4gZnJhbWUgcmF0ZXMgYXJlIG9uIHRoZSBsb3dlciBzaWRlIG9mIDYwZnBzXG4gICAgICAgICAgICAvLyBvciBub3QgY29uc3RhbnQgKGEgdmVyeSByZWFsIHBvc3NpYmlsaXR5ISlcbiAgICAgICAgICAgIGR0VmFsdWUgPSBkdFBlclBhcnRpY2xlICogKGkgLSBhY3RpdmF0aW9uU3RhcnQpXG4gICAgICAgICAgICBwYXJhbXNbaW5kZXggKyAxXSA9IGRpcmVjdGlvbiA9PT0gLTEgPyBwYXJhbXNbaW5kZXggKyAyXSAtIGR0VmFsdWUgOiBkdFZhbHVlO1xuXG4gICAgICAgICAgICB0aGlzLl91cGRhdGVBdHRyaWJ1dGVVcGRhdGVSYW5nZSgncGFyYW1zJywgaSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0aWNrKGR0KSB7XG4gICAgICAgIGlmICh0aGlzLmlzU3RhdGljKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5wYXJhbXNBcnJheSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgdGhpcy5wYXJhbXNBcnJheSA9IHRoaXMuYXR0cmlidXRlcy5wYXJhbXMudHlwZWRBcnJheS5hcnJheTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHN0YXJ0ID0gdGhpcy5hdHRyaWJ1dGVPZmZzZXQ7XG4gICAgICAgIGNvbnN0IGVuZCA9IHN0YXJ0ICsgdGhpcy5wYXJ0aWNsZUNvdW50O1xuICAgICAgICBjb25zdCBwYXJhbXMgPSB0aGlzLnBhcmFtc0FycmF5O1xuICAgICAgICBjb25zdCBwcHNEdCA9IHRoaXMucGFydGljbGVzUGVyU2Vjb25kICogdGhpcy5hY3RpdmVNdWx0aXBsaWVyICogZHQ7XG4gICAgICAgIGNvbnN0IGFjdGl2YXRpb25JbmRleCA9IHRoaXMuYWN0aXZhdGlvbkluZGV4O1xuXG4gICAgICAgIC8vIFJlc2V0IHRoZSBidWZmZXIgdXBkYXRlIGluZGljZXMuXG4gICAgICAgIHRoaXMuX3Jlc2V0QnVmZmVyUmFuZ2VzKCk7XG5cbiAgICAgICAgLy8gSW5jcmVtZW50IGFnZSBmb3IgdGhvc2UgcGFydGljbGVzIHRoYXQgYXJlIGFsaXZlLFxuICAgICAgICAvLyBhbmQga2lsbCBvZmYgYW55IHBhcnRpY2xlcyB3aG9zZSBhZ2UgaXMgb3ZlciB0aGUgbGltaXQuXG4gICAgICAgIHRoaXMuX2NoZWNrUGFydGljbGVBZ2VzKHN0YXJ0LCBlbmQsIHBhcmFtcywgZHQpO1xuXG4gICAgICAgIC8vIElmIHRoZSBlbWl0dGVyIGlzIGRlYWQsIHJlc2V0IHRoZSBhZ2Ugb2YgdGhlIGVtaXR0ZXIgdG8gemVybyxcbiAgICAgICAgLy8gcmVhZHkgdG8gZ28gYWdhaW4gaWYgcmVxdWlyZWRcbiAgICAgICAgaWYgKHRoaXMuYWxpdmUgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICB0aGlzLmFnZSA9IDAuMDtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIElmIHRoZSBlbWl0dGVyIGhhcyBhIHNwZWNpZmllZCBsaWZldGltZSBhbmQgd2UndmUgZXhjZWVkZWQgaXQsXG4gICAgICAgIC8vIG1hcmsgdGhlIGVtaXR0ZXIgYXMgZGVhZC5cbiAgICAgICAgaWYgKHRoaXMuZHVyYXRpb24gIT09IG51bGwgJiYgdGhpcy5hZ2UgPiB0aGlzLmR1cmF0aW9uKSB7XG4gICAgICAgICAgICB0aGlzLmFsaXZlID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLmFnZSA9IDAuMDtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGFjdGl2YXRpb25TdGFydCA9IHRoaXMucGFydGljbGVDb3VudCA9PT0gMSA/IGFjdGl2YXRpb25JbmRleCA6IChhY3RpdmF0aW9uSW5kZXggfCAwKTtcbiAgICAgICAgY29uc3QgYWN0aXZhdGlvbkVuZCA9IE1hdGgubWluKGFjdGl2YXRpb25TdGFydCArIHBwc0R0LCB0aGlzLmFjdGl2YXRpb25FbmQpO1xuICAgICAgICBjb25zdCBhY3RpdmF0aW9uQ291bnQgPSBhY3RpdmF0aW9uRW5kIC0gdGhpcy5hY3RpdmF0aW9uSW5kZXggfCAwO1xuICAgICAgICBjb25zdCBkdFBlclBhcnRpY2xlID0gYWN0aXZhdGlvbkNvdW50ID4gMCA/IGR0IC8gYWN0aXZhdGlvbkNvdW50IDogMDtcblxuICAgICAgICB0aGlzLl9hY3RpdmF0ZVBhcnRpY2xlcyhhY3RpdmF0aW9uU3RhcnQsIGFjdGl2YXRpb25FbmQsIHBhcmFtcywgZHRQZXJQYXJ0aWNsZSk7XG5cbiAgICAgICAgLy8gTW92ZSB0aGUgYWN0aXZhdGlvbiB3aW5kb3cgZm9yd2FyZCwgc29sZGllci5cbiAgICAgICAgdGhpcy5hY3RpdmF0aW9uSW5kZXggKz0gcHBzRHQ7XG5cbiAgICAgICAgaWYgKHRoaXMuYWN0aXZhdGlvbkluZGV4ID4gZW5kKSB7XG4gICAgICAgICAgICB0aGlzLmFjdGl2YXRpb25JbmRleCA9IHN0YXJ0O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSW5jcmVtZW50IHRoZSBhZ2Ugb2YgdGhlIGVtaXR0ZXIuXG4gICAgICAgIHRoaXMuYWdlICs9IGR0O1xuICAgIH1cblxuICAgIHJlc2V0KGZvcmNlKSB7XG4gICAgICAgIHRoaXMuYWdlID0gMC4wO1xuICAgICAgICB0aGlzLmFsaXZlID0gZmFsc2U7XG5cbiAgICAgICAgaWYgKGZvcmNlID09PSB0cnVlKSB7XG4gICAgICAgICAgICBjb25zdCBzdGFydCA9IHRoaXMuYXR0cmlidXRlT2Zmc2V0O1xuICAgICAgICAgICAgY29uc3QgZW5kID0gc3RhcnQgKyB0aGlzLnBhcnRpY2xlQ291bnQ7XG4gICAgICAgICAgICBjb25zdCBhcnJheSA9IHRoaXMucGFyYW1zQXJyYXk7XG4gICAgICAgICAgICBjb25zdCBhdHRyID0gdGhpcy5hdHRyaWJ1dGVzLnBhcmFtcy5idWZmZXJBdHRyaWJ1dGU7XG5cbiAgICAgICAgICAgIGZvciAobGV0IGkgPSBlbmQgLSAxLCBpbmRleDsgaSA+PSBzdGFydDsgLS1pKSB7XG4gICAgICAgICAgICAgICAgaW5kZXggPSBpICogNDtcblxuICAgICAgICAgICAgICAgIGFycmF5W2luZGV4XSA9IDAuMDtcbiAgICAgICAgICAgICAgICBhcnJheVtpbmRleCArIDFdID0gMC4wO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBhdHRyLnVwZGF0ZVJhbmdlLm9mZnNldCA9IDA7XG4gICAgICAgICAgICBhdHRyLnVwZGF0ZVJhbmdlLmNvdW50ID0gLTE7XG4gICAgICAgICAgICBhdHRyLm5lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEVuYWJsZXMgdGhlIGVtaXR0ZXIuIElmIG5vdCBhbHJlYWR5IGVuYWJsZWQsIHRoZSBlbWl0dGVyXG4gICAgICogd2lsbCBzdGFydCBlbWl0dGluZyBwYXJ0aWNsZXMuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtFbWl0dGVyfSBUaGlzIGVtaXR0ZXIgaW5zdGFuY2UuXG4gICAgICovXG4gICAgZW5hYmxlKCkge1xuICAgICAgICB0aGlzLmFsaXZlID0gdHJ1ZTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRGlzYWJsZXMgdGggZW1pdHRlciwgYnV0IGRvZXMgbm90IGluc3RhbnRseSByZW1vdmUgaXQnc1xuICAgICAqIHBhcnRpY2xlcyBmcm9tdCB0aGUgc2NlbmUuIFdoZW4gY2FsbGVkLCB0aGUgZW1pdHRlciB3aWxsIGJlXG4gICAgICogJ3N3aXRjaGVkIG9mZicgYW5kIGp1c3Qgc3RvcCBlbWl0dGluZy4gQW55IHBhcnRpY2xlJ3MgYWxpdmUgd2lsbFxuICAgICAqIGJlIGFsbG93ZWQgdG8gZmluaXNoIHRoZWlyIGxpZmVjeWNsZS5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge0VtaXR0ZXJ9IFRoaXMgZW1pdHRlciBpbnN0YW5jZS5cbiAgICAgKi9cbiAgICBkaXNhYmxlKCkge1xuICAgICAgICB0aGlzLmFsaXZlID0gZmFsc2U7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmUgdGhpcyBlbWl0dGVyIGZyb20gaXQncyBwYXJlbnQgZ3JvdXAgKGlmIGl0IGhhcyBiZWVuIGFkZGVkIHRvIG9uZSkuXG4gICAgICogRGVsZ2F0ZXMgdG8gU1BFLmdyb3VwLnByb3RvdHlwZS5yZW1vdmVFbWl0dGVyKCkuXG4gICAgICpcbiAgICAgKiBXaGVuIGNhbGxlZCwgYWxsIHBhcnRpY2xlJ3MgYmVsb25naW5nIHRvIHRoaXMgZW1pdHRlciB3aWxsIGJlIGluc3RhbnRseVxuICAgICAqIHJlbW92ZWQgZnJvbSB0aGUgc2NlbmUuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtFbWl0dGVyfSBUaGlzIGVtaXR0ZXIgaW5zdGFuY2UuXG4gICAgICovXG4gICAgcmVtb3ZlKCkge1xuICAgICAgICAndXNlIHN0cmljdCc7XG4gICAgICAgIGlmICh0aGlzLmdyb3VwICE9PSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLmdyb3VwLnJlbW92ZUVtaXR0ZXIodGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdFbWl0dGVyIGRvZXMgbm90IGJlbG9uZyB0byBhIGdyb3VwLCBjYW5ub3QgcmVtb3ZlLicpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgRW1pdHRlcjsiLCJpbXBvcnQgdXRpbHMgZnJvbSAnLi4vdXRpbHMvaW5kZXgnO1xuaW1wb3J0ICogYXMgVEhSRUUgZnJvbSAndGhyZWUnXG5pbXBvcnQgU1BFIGZyb20gJy4vc3BlJztcbmltcG9ydCBTaGFkZXJBdHRyaWJ1dGUgZnJvbSAnLi4vaGVscGVycy9TaGFkZXJBdHRyaWJ1dGUnXG5pbXBvcnQgc2hhZGVycyBmcm9tICcuLi9zaGFkZXJzL3NoYWRlcnMnO1xuaW1wb3J0IEVtaXR0ZXIgZnJvbSAnLi4vZW1pdHRlci9pbmRleCc7XG5jbGFzcyBHcm91cCB7XG4gICAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgICAgICBjb25zdCB0eXBlcyA9IHV0aWxzLnR5cGVzO1xuXG4gICAgICAgIG9wdGlvbnMgPSB1dGlscy5lbnN1cmVUeXBlZEFyZyhvcHRpb25zLCB0eXBlcy5PQkpFQ1QsIHt9KTtcbiAgICAgICAgb3B0aW9ucy50ZXh0dXJlID0gdXRpbHMuZW5zdXJlVHlwZWRBcmcob3B0aW9ucy50ZXh0dXJlLCB0eXBlcy5PQkpFQ1QsIHt9KTtcblxuICAgICAgICB0aGlzLnV1aWQgPSBUSFJFRS5NYXRoVXRpbHMuZ2VuZXJhdGVVVUlEKCk7XG5cbiAgICAgICAgLy8gSWYgbm8gYGRlbHRhVGltZWAgdmFsdWUgaXMgcGFzc2VkIHRvIHRoZSBgU1BFLkdyb3VwLnRpY2tgIGZ1bmN0aW9uLFxuICAgICAgICAvLyB0aGUgdmFsdWUgb2YgdGhpcyBwcm9wZXJ0eSB3aWxsIGJlIHVzZWQgdG8gYWR2YW5jZSB0aGUgc2ltdWxhdGlvbi5cbiAgICAgICAgdGhpcy5maXhlZFRpbWVTdGVwID0gdXRpbHMuZW5zdXJlVHlwZWRBcmcob3B0aW9ucy5maXhlZFRpbWVTdGVwLCB0eXBlcy5OVU1CRVIsIDAuMDE2KTtcblxuICAgICAgICAvLyBTZXQgcHJvcGVydGllcyB1c2VkIGluIHRoZSB1bmlmb3JtcyBtYXAsIHN0YXJ0aW5nIHdpdGggdGhlXG4gICAgICAgIC8vIHRleHR1cmUgc3R1ZmYuXG4gICAgICAgIHRoaXMudGV4dHVyZSA9IG9wdGlvbnMudGV4dHVyZS52YWx1ZSB8fCBudWxsO1xuICAgICAgICB0aGlzLnRleHR1cmVGcmFtZXMgPSBvcHRpb25zLnRleHR1cmUuZnJhbWVzIHx8IG5ldyBUSFJFRS5WZWN0b3IyKDEsIDEpO1xuICAgICAgICB0aGlzLnRleHR1cmVGcmFtZUNvdW50ID0gdXRpbHMuZW5zdXJlVHlwZWRBcmcob3B0aW9ucy50ZXh0dXJlLmZyYW1lQ291bnQsIHR5cGVzLk5VTUJFUiwgdGhpcy50ZXh0dXJlRnJhbWVzLnggKiB0aGlzLnRleHR1cmVGcmFtZXMueSk7XG4gICAgICAgIHRoaXMudGV4dHVyZUxvb3AgPSB1dGlscy5lbnN1cmVUeXBlZEFyZyhvcHRpb25zLnRleHR1cmUubG9vcCwgdHlwZXMuTlVNQkVSLCAxKTtcbiAgICAgICAgdGhpcy50ZXh0dXJlRnJhbWVzLm1heChuZXcgVEhSRUUuVmVjdG9yMigxLCAxKSk7XG5cbiAgICAgICAgdGhpcy5oYXNQZXJzcGVjdGl2ZSA9IHV0aWxzLmVuc3VyZVR5cGVkQXJnKG9wdGlvbnMuaGFzUGVyc3BlY3RpdmUsIHR5cGVzLkJPT0xFQU4sIHRydWUpO1xuICAgICAgICB0aGlzLmNvbG9yaXplID0gdXRpbHMuZW5zdXJlVHlwZWRBcmcob3B0aW9ucy5jb2xvcml6ZSwgdHlwZXMuQk9PTEVBTiwgdHJ1ZSk7XG5cbiAgICAgICAgdGhpcy5tYXhQYXJ0aWNsZUNvdW50ID0gdXRpbHMuZW5zdXJlVHlwZWRBcmcob3B0aW9ucy5tYXhQYXJ0aWNsZUNvdW50LCB0eXBlcy5OVU1CRVIsIG51bGwpO1xuXG4gICAgICAgIC8vIFNldCBwcm9wZXJ0aWVzIHVzZWQgdG8gZGVmaW5lIHRoZSBTaGFkZXJNYXRlcmlhbCdzIGFwcGVhcmFuY2UuXG4gICAgICAgIHRoaXMuYmxlbmRpbmcgPSB1dGlscy5lbnN1cmVUeXBlZEFyZyhvcHRpb25zLmJsZW5kaW5nLCB0eXBlcy5OVU1CRVIsIFRIUkVFLkFkZGl0aXZlQmxlbmRpbmcpO1xuICAgICAgICB0aGlzLnRyYW5zcGFyZW50ID0gdXRpbHMuZW5zdXJlVHlwZWRBcmcob3B0aW9ucy50cmFuc3BhcmVudCwgdHlwZXMuQk9PTEVBTiwgdHJ1ZSk7XG4gICAgICAgIHRoaXMuYWxwaGFUZXN0ID0gcGFyc2VGbG9hdCh1dGlscy5lbnN1cmVUeXBlZEFyZyhvcHRpb25zLmFscGhhVGVzdCwgdHlwZXMuTlVNQkVSLCAwLjApKTtcbiAgICAgICAgdGhpcy5kZXB0aFdyaXRlID0gdXRpbHMuZW5zdXJlVHlwZWRBcmcob3B0aW9ucy5kZXB0aFdyaXRlLCB0eXBlcy5CT09MRUFOLCBmYWxzZSk7XG4gICAgICAgIHRoaXMuZGVwdGhUZXN0ID0gdXRpbHMuZW5zdXJlVHlwZWRBcmcob3B0aW9ucy5kZXB0aFRlc3QsIHR5cGVzLkJPT0xFQU4sIHRydWUpO1xuICAgICAgICB0aGlzLmZvZyA9IHV0aWxzLmVuc3VyZVR5cGVkQXJnKG9wdGlvbnMuZm9nLCB0eXBlcy5CT09MRUFOLCB0cnVlKTtcbiAgICAgICAgdGhpcy5zY2FsZSA9IHV0aWxzLmVuc3VyZVR5cGVkQXJnKG9wdGlvbnMuc2NhbGUsIHR5cGVzLk5VTUJFUiwgMzAwKTtcblxuICAgICAgICAvLyBXaGVyZSBlbWl0dGVyJ3MgZ28gdG8gY3VybCB1cCBpbiBhIHdhcm0gYmxhbmtldCBhbmQgbGl2ZVxuICAgICAgICAvLyBvdXQgdGhlaXIgZGF5cy5cbiAgICAgICAgdGhpcy5lbWl0dGVycyA9IFtdO1xuICAgICAgICB0aGlzLmVtaXR0ZXJJRHMgPSBbXTtcblxuICAgICAgICAvLyBDcmVhdGUgcHJvcGVydGllcyBmb3IgdXNlIGJ5IHRoZSBlbWl0dGVyIHBvb2xpbmcgZnVuY3Rpb25zLlxuICAgICAgICB0aGlzLl9wb29sID0gW107XG4gICAgICAgIHRoaXMuX3Bvb2xDcmVhdGlvblNldHRpbmdzID0gbnVsbDtcbiAgICAgICAgdGhpcy5fY3JlYXRlTmV3V2hlblBvb2xFbXB0eSA9IDA7XG5cbiAgICAgICAgLy8gV2hldGhlciBhbGwgYXR0cmlidXRlcyBzaG91bGQgYmUgZm9yY2VkIHRvIHVwZGF0ZWRcbiAgICAgICAgLy8gdGhlaXIgZW50aXJlIGJ1ZmZlciBjb250ZW50cyBvbiB0aGUgbmV4dCB0aWNrLlxuICAgICAgICAvL1xuICAgICAgICAvLyBVc2VkIHdoZW4gYW4gZW1pdHRlciBpcyByZW1vdmVkLlxuICAgICAgICB0aGlzLl9hdHRyaWJ1dGVzTmVlZFJlZnJlc2ggPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fYXR0cmlidXRlc05lZWREeW5hbWljUmVzZXQgPSBmYWxzZTtcblxuICAgICAgICB0aGlzLnBhcnRpY2xlQ291bnQgPSAwO1xuXG4gICAgICAgIC8vIE1hcCBvZiB1bmlmb3JtcyB0byBiZSBhcHBsaWVkIHRvIHRoZSBTaGFkZXJNYXRlcmlhbCBpbnN0YW5jZS5cbiAgICAgICAgdGhpcy51bmlmb3JtcyA9IHtcbiAgICAgICAgICAgIHRleDoge1xuICAgICAgICAgICAgICAgIHR5cGU6ICd0JyxcbiAgICAgICAgICAgICAgICB2YWx1ZTogdGhpcy50ZXh0dXJlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdGV4dHVyZUFuaW1hdGlvbjoge1xuICAgICAgICAgICAgICAgIHR5cGU6ICd2NCcsXG4gICAgICAgICAgICAgICAgdmFsdWU6IG5ldyBUSFJFRS5WZWN0b3I0KFxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRleHR1cmVGcmFtZXMueCxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50ZXh0dXJlRnJhbWVzLnksXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGV4dHVyZUZyYW1lQ291bnQsXG4gICAgICAgICAgICAgICAgICAgIE1hdGgubWF4KE1hdGguYWJzKHRoaXMudGV4dHVyZUxvb3ApLCAxLjApXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZvZ0NvbG9yOiB7XG4gICAgICAgICAgICAgICAgdHlwZTogJ2MnLFxuICAgICAgICAgICAgICAgIHZhbHVlOiB0aGlzLmZvZyA/IG5ldyBUSFJFRS5Db2xvcigpIDogbnVsbFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZvZ05lYXI6IHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnZicsXG4gICAgICAgICAgICAgICAgdmFsdWU6IDEwXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZm9nRmFyOiB7XG4gICAgICAgICAgICAgICAgdHlwZTogJ2YnLFxuICAgICAgICAgICAgICAgIHZhbHVlOiAyMDBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmb2dEZW5zaXR5OiB7XG4gICAgICAgICAgICAgICAgdHlwZTogJ2YnLFxuICAgICAgICAgICAgICAgIHZhbHVlOiAwLjVcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBkZWx0YVRpbWU6IHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnZicsXG4gICAgICAgICAgICAgICAgdmFsdWU6IDBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBydW5UaW1lOiB7XG4gICAgICAgICAgICAgICAgdHlwZTogJ2YnLFxuICAgICAgICAgICAgICAgIHZhbHVlOiAwXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2NhbGU6IHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnZicsXG4gICAgICAgICAgICAgICAgdmFsdWU6IHRoaXMuc2NhbGVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICAvLyBBZGQgc29tZSBkZWZpbmVzIGludG8gdGhlIG1peC4uLlxuICAgICAgICB0aGlzLmRlZmluZXMgPSB7XG4gICAgICAgICAgICBIQVNfUEVSU1BFQ1RJVkU6IHRoaXMuaGFzUGVyc3BlY3RpdmUsXG4gICAgICAgICAgICBDT0xPUklaRTogdGhpcy5jb2xvcml6ZSxcbiAgICAgICAgICAgIFZBTFVFX09WRVJfTElGRVRJTUVfTEVOR1RIOiBTUEUudmFsdWVPdmVyTGlmZXRpbWVMZW5ndGgsXG5cbiAgICAgICAgICAgIFNIT1VMRF9ST1RBVEVfVEVYVFVSRTogZmFsc2UsXG4gICAgICAgICAgICBTSE9VTERfUk9UQVRFX1BBUlRJQ0xFUzogZmFsc2UsXG4gICAgICAgICAgICBTSE9VTERfV0lHR0xFX1BBUlRJQ0xFUzogZmFsc2UsXG5cbiAgICAgICAgICAgIFNIT1VMRF9DQUxDVUxBVEVfU1BSSVRFOiB0aGlzLnRleHR1cmVGcmFtZXMueCA+IDEgfHwgdGhpcy50ZXh0dXJlRnJhbWVzLnkgPiAxXG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gTWFwIG9mIGFsbCBhdHRyaWJ1dGVzIHRvIGJlIGFwcGxpZWQgdG8gdGhlIHBhcnRpY2xlcy5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gU2VlIFNQRS5TaGFkZXJBdHRyaWJ1dGUgZm9yIGEgYml0IG1vcmUgaW5mbyBvbiB0aGlzIGJpdC5cbiAgICAgICAgdGhpcy5hdHRyaWJ1dGVzID0ge1xuICAgICAgICAgICAgcG9zaXRpb246IG5ldyBTaGFkZXJBdHRyaWJ1dGUoJ3YzJywgdHJ1ZSksXG4gICAgICAgICAgICBhY2NlbGVyYXRpb246IG5ldyBTaGFkZXJBdHRyaWJ1dGUoJ3Y0JywgdHJ1ZSksIC8vIHcgY29tcG9uZW50IGlzIGRyYWdcbiAgICAgICAgICAgIHZlbG9jaXR5OiBuZXcgU2hhZGVyQXR0cmlidXRlKCd2MycsIHRydWUpLFxuICAgICAgICAgICAgcm90YXRpb246IG5ldyBTaGFkZXJBdHRyaWJ1dGUoJ3Y0JywgdHJ1ZSksXG4gICAgICAgICAgICByb3RhdGlvbkNlbnRlcjogbmV3IFNoYWRlckF0dHJpYnV0ZSgndjMnLCB0cnVlKSxcbiAgICAgICAgICAgIHBhcmFtczogbmV3IFNoYWRlckF0dHJpYnV0ZSgndjQnLCB0cnVlKSwgLy8gSG9sZHMgKGFsaXZlLCBhZ2UsIGRlbGF5LCB3aWdnbGUpXG4gICAgICAgICAgICBzaXplOiBuZXcgU2hhZGVyQXR0cmlidXRlKCd2NCcsIHRydWUpLFxuICAgICAgICAgICAgYW5nbGU6IG5ldyBTaGFkZXJBdHRyaWJ1dGUoJ3Y0JywgdHJ1ZSksXG4gICAgICAgICAgICBjb2xvcjogbmV3IFNoYWRlckF0dHJpYnV0ZSgndjQnLCB0cnVlKSxcbiAgICAgICAgICAgIG9wYWNpdHk6IG5ldyBTaGFkZXJBdHRyaWJ1dGUoJ3Y0JywgdHJ1ZSlcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmF0dHJpYnV0ZUtleXMgPSBPYmplY3Qua2V5cyh0aGlzLmF0dHJpYnV0ZXMpO1xuICAgICAgICB0aGlzLmF0dHJpYnV0ZUNvdW50ID0gdGhpcy5hdHRyaWJ1dGVLZXlzLmxlbmd0aDtcblxuICAgICAgICAvLyBDcmVhdGUgdGhlIFNoYWRlck1hdGVyaWFsIGluc3RhbmNlIHRoYXQnbGwgaGVscCByZW5kZXIgdGhlXG4gICAgICAgIC8vIHBhcnRpY2xlcy5cbiAgICAgICAgdGhpcy5tYXRlcmlhbCA9IG5ldyBUSFJFRS5TaGFkZXJNYXRlcmlhbCh7XG4gICAgICAgICAgICB1bmlmb3JtczogdGhpcy51bmlmb3JtcyxcbiAgICAgICAgICAgIHZlcnRleFNoYWRlcjogc2hhZGVycy52ZXJ0ZXgsXG4gICAgICAgICAgICBmcmFnbWVudFNoYWRlcjogc2hhZGVycy5mcmFnbWVudCxcbiAgICAgICAgICAgIGJsZW5kaW5nOiB0aGlzLmJsZW5kaW5nLFxuICAgICAgICAgICAgdHJhbnNwYXJlbnQ6IHRoaXMudHJhbnNwYXJlbnQsXG4gICAgICAgICAgICBhbHBoYVRlc3Q6IHRoaXMuYWxwaGFUZXN0LFxuICAgICAgICAgICAgZGVwdGhXcml0ZTogdGhpcy5kZXB0aFdyaXRlLFxuICAgICAgICAgICAgZGVwdGhUZXN0OiB0aGlzLmRlcHRoVGVzdCxcbiAgICAgICAgICAgIGRlZmluZXM6IHRoaXMuZGVmaW5lcyxcbiAgICAgICAgICAgIGZvZzogdGhpcy5mb2dcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gQ3JlYXRlIHRoZSBCdWZmZXJHZW9tZXRyeSBhbmQgUG9pbnRzIGluc3RhbmNlcywgZW5zdXJpbmdcbiAgICAgICAgLy8gdGhlIGdlb21ldHJ5IGFuZCBtYXRlcmlhbCBhcmUgZ2l2ZW4gdG8gdGhlIGxhdHRlci5cbiAgICAgICAgdGhpcy5nZW9tZXRyeSA9IG5ldyBUSFJFRS5CdWZmZXJHZW9tZXRyeSgpO1xuICAgICAgICB0aGlzLm1lc2ggPSBuZXcgVEhSRUUuUG9pbnRzKHRoaXMuZ2VvbWV0cnksIHRoaXMubWF0ZXJpYWwpO1xuXG4gICAgICAgIGlmICh0aGlzLm1heFBhcnRpY2xlQ291bnQgPT09IG51bGwpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignU1BFLkdyb3VwOiBObyBtYXhQYXJ0aWNsZUNvdW50IHNwZWNpZmllZC4gQWRkaW5nIGVtaXR0ZXJzIGFmdGVyIHJlbmRlcmluZyB3aWxsIHByb2JhYmx5IGNhdXNlIGVycm9ycy4nKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIF91cGRhdGVEZWZpbmVzKCkge1xuICAgICAgICBjb25zdCBlbWl0dGVycyA9IHRoaXMuZW1pdHRlcnM7XG4gICAgICAgIGxldCBlbWl0dGVyO1xuICAgICAgICBsZXQgZGVmaW5lcyA9IHRoaXMuZGVmaW5lcztcblxuICAgICAgICBmb3IgKGxldCBpID0gZW1pdHRlcnMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgICAgIGVtaXR0ZXIgPSBlbWl0dGVyc1tpXTtcblxuICAgICAgICAgICAgLy8gT25seSBkbyBhbmdsZSBjYWxjdWxhdGlvbiBpZiB0aGVyZSdzIG5vIHNwcml0ZXNoZWV0IGRlZmluZWQuXG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgLy8gU2F2ZXMgY2FsY3VsYXRpb25zIGJlaW5nIGRvbmUgYW5kIHRoZW4gb3ZlcndyaXR0ZW4gaW4gdGhlIHNoYWRlcnMuXG4gICAgICAgICAgICBpZiAoIWRlZmluZXMuU0hPVUxEX0NBTENVTEFURV9TUFJJVEUpIHtcbiAgICAgICAgICAgICAgICBkZWZpbmVzLlNIT1VMRF9ST1RBVEVfVEVYVFVSRSA9IGRlZmluZXMuU0hPVUxEX1JPVEFURV9URVhUVVJFIHx8ICEhTWF0aC5tYXgoXG4gICAgICAgICAgICAgICAgICAgIE1hdGgubWF4LmFwcGx5KG51bGwsIGVtaXR0ZXIuYW5nbGUudmFsdWUpLFxuICAgICAgICAgICAgICAgICAgICBNYXRoLm1heC5hcHBseShudWxsLCBlbWl0dGVyLmFuZ2xlLnNwcmVhZClcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBkZWZpbmVzLlNIT1VMRF9ST1RBVEVfUEFSVElDTEVTID0gZGVmaW5lcy5TSE9VTERfUk9UQVRFX1BBUlRJQ0xFUyB8fCAhIU1hdGgubWF4KFxuICAgICAgICAgICAgICAgIGVtaXR0ZXIucm90YXRpb24uYW5nbGUsXG4gICAgICAgICAgICAgICAgZW1pdHRlci5yb3RhdGlvbi5hbmdsZVNwcmVhZFxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgZGVmaW5lcy5TSE9VTERfV0lHR0xFX1BBUlRJQ0xFUyA9IGRlZmluZXMuU0hPVUxEX1dJR0dMRV9QQVJUSUNMRVMgfHwgISFNYXRoLm1heChcbiAgICAgICAgICAgICAgICBlbWl0dGVyLndpZ2dsZS52YWx1ZSxcbiAgICAgICAgICAgICAgICBlbWl0dGVyLndpZ2dsZS5zcHJlYWRcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLm1hdGVyaWFsLm5lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBfYXBwbHlBdHRyaWJ1dGVzVG9HZW9tZXRyeSgpIHtcbiAgICAgICAgY29uc3QgYXR0cmlidXRlcyA9IHRoaXMuYXR0cmlidXRlcztcbiAgICAgICAgY29uc3QgZ2VvbWV0cnkgPSB0aGlzLmdlb21ldHJ5O1xuICAgICAgICBjb25zdCBnZW9tZXRyeUF0dHJpYnV0ZXMgPSBnZW9tZXRyeS5hdHRyaWJ1dGVzO1xuICAgICAgICBsZXQgYXR0cmlidXRlLCBnZW9tZXRyeUF0dHJpYnV0ZTtcblxuICAgICAgICBPYmplY3Qua2V5cyhhdHRyaWJ1dGVzKS5mb3JFYWNoKGF0dHIgPT4ge1xuICAgICAgICAgICAgYXR0cmlidXRlID0gYXR0cmlidXRlc1thdHRyXTtcbiAgICAgICAgICAgIGdlb21ldHJ5QXR0cmlidXRlID0gZ2VvbWV0cnlBdHRyaWJ1dGVzW2F0dHJdO1xuXG4gICAgICAgICAgICAvLyBVcGRhdGUgdGhlIGFycmF5IGlmIHRoaXMgYXR0cmlidXRlIGV4aXN0cyBvbiB0aGUgZ2VvbWV0cnkuXG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgLy8gVGhpcyBuZWVkcyB0byBiZSBkb25lIGJlY2F1c2UgdGhlIGF0dHJpYnV0ZSdzIHR5cGVkIGFycmF5IG1pZ2h0IGhhdmVcbiAgICAgICAgICAgIC8vIGJlZW4gcmVzaXplZCBhbmQgcmVpbnN0YW50aWF0ZWQsIGFuZCBtaWdodCBub3cgYmUgbG9va2luZyBhdCBhXG4gICAgICAgICAgICAvLyBkaWZmZXJlbnQgQXJyYXlCdWZmZXIsIHNvIHJlZmVyZW5jZSBuZWVkcyB1cGRhdGluZy5cbiAgICAgICAgICAgIGlmIChnZW9tZXRyeUF0dHJpYnV0ZSkge1xuICAgICAgICAgICAgICAgIGdlb21ldHJ5QXR0cmlidXRlLmFycmF5ID0gYXR0cmlidXRlLnR5cGVkQXJyYXkuYXJyYXk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIC8vIEFkZCB0aGUgYXR0cmlidXRlIHRvIHRoZSBnZW9tZXRyeSBpZiBpdCBkb2Vzbid0IGFscmVhZHkgZXhpc3QuXG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBnZW9tZXRyeS5zZXRBdHRyaWJ1dGUoYXR0ciwgYXR0cmlidXRlLmJ1ZmZlckF0dHJpYnV0ZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIE1hcmsgdGhlIGF0dHJpYnV0ZSBhcyBuZWVkaW5nIGFuIHVwZGF0ZSB0aGUgbmV4dCB0aW1lIGEgZnJhbWUgaXMgcmVuZGVyZWQuXG4gICAgICAgICAgICBhdHRyaWJ1dGUuYnVmZmVyQXR0cmlidXRlLm5lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgICAgICAgfSlcblxuICAgICAgICAvLyBNYXJrIHRoZSBkcmF3IHJhbmdlIG9uIHRoZSBnZW9tZXRyeS4gVGhpcyB3aWxsIGVuc3VyZVxuICAgICAgICAvLyBvbmx5IHRoZSB2YWx1ZXMgaW4gdGhlIGF0dHJpYnV0ZSBidWZmZXJzIHRoYXQgYXJlXG4gICAgICAgIC8vIGFzc29jaWF0ZWQgd2l0aCBhIHBhcnRpY2xlIHdpbGwgYmUgdXNlZCBpbiBUSFJFRSdzXG4gICAgICAgIC8vIHJlbmRlciBjeWNsZS5cbiAgICAgICAgdGhpcy5nZW9tZXRyeS5zZXREcmF3UmFuZ2UoMCwgdGhpcy5wYXJ0aWNsZUNvdW50KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBZGRzIGFuIFNQRS5FbWl0dGVyIGluc3RhbmNlIHRvIHRoaXMgZ3JvdXAsIGNyZWF0aW5nIHBhcnRpY2xlIHZhbHVlcyBhbmRcbiAgICAgKiBhc3NpZ25pbmcgdGhlbSB0byB0aGlzIGdyb3VwJ3Mgc2hhZGVyIGF0dHJpYnV0ZXMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge0VtaXR0ZXJ9IGVtaXR0ZXIgVGhlIGVtaXR0ZXIgdG8gYWRkIHRvIHRoaXMgZ3JvdXAuXG4gICAgICovXG4gICAgYWRkRW1pdHRlcihlbWl0dGVyKSB7XG4gICAgICAgIC8vIEVuc3VyZSBhbiBhY3R1YWwgZW1pdHRlciBpbnN0YW5jZSBpcyBwYXNzZWQgaGVyZS5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gRGVjaWRlZCBub3QgdG8gdGhyb3cgaGVyZSwganVzdCBpbiBjYXNlIGEgc2NlbmUnc1xuICAgICAgICAvLyByZW5kZXJpbmcgd291bGQgYmUgcGF1c2VkLiBMb2dnaW5nIGFuIGVycm9yIGluc3RlYWRcbiAgICAgICAgLy8gb2Ygc3RvcHBpbmcgZXhlY3V0aW9uIGlmIGV4Y2VwdGlvbnMgYXJlbid0IGNhdWdodC5cbiAgICAgICAgaWYgKGVtaXR0ZXIgaW5zdGFuY2VvZiBFbWl0dGVyID09PSBmYWxzZSkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignYGVtaXR0ZXJgIGFyZ3VtZW50IG11c3QgYmUgaW5zdGFuY2Ugb2YgU1BFLkVtaXR0ZXIuIFdhcyBwcm92aWRlZCB3aXRoOicsIGVtaXR0ZXIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSWYgdGhlIGVtaXR0ZXIgYWxyZWFkeSBleGlzdHMgYXMgYSBtZW1iZXIgb2YgdGhpcyBncm91cCwgdGhlblxuICAgICAgICAvLyBzdG9wIGhlcmUsIHdlIGRvbid0IHdhbnQgdG8gYWRkIGl0IGFnYWluLlxuICAgICAgICBlbHNlIGlmICh0aGlzLmVtaXR0ZXJJRHMuaW5kZXhPZihlbWl0dGVyLnV1aWQpID4gLTEpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0VtaXR0ZXIgYWxyZWFkeSBleGlzdHMgaW4gdGhpcyBncm91cC4gV2lsbCBub3QgYWRkIGFnYWluLicpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQW5kIGZpbmFsbHksIGlmIHRoZSBlbWl0dGVyIGlzIGEgbWVtYmVyIG9mIGFub3RoZXIgZ3JvdXAsXG4gICAgICAgIC8vIGRvbid0IGFkZCBpdCB0byB0aGlzIGdyb3VwLlxuICAgICAgICBlbHNlIGlmIChlbWl0dGVyLmdyb3VwICE9PSBudWxsKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdFbWl0dGVyIGFscmVhZHkgYmVsb25ncyB0byBhbm90aGVyIGdyb3VwLiBXaWxsIG5vdCBhZGQgdG8gcmVxdWVzdGVkIGdyb3VwLicpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgYXR0cmlidXRlcyA9IHRoaXMuYXR0cmlidXRlcztcbiAgICAgICAgY29uc3Qgc3RhcnQgPSB0aGlzLnBhcnRpY2xlQ291bnQ7XG4gICAgICAgIGNvbnN0IGVuZCA9IHN0YXJ0ICsgZW1pdHRlci5wYXJ0aWNsZUNvdW50O1xuXG4gICAgICAgIC8vIFVwZGF0ZSB0aGlzIGdyb3VwJ3MgcGFydGljbGUgY291bnQuXG4gICAgICAgIHRoaXMucGFydGljbGVDb3VudCA9IGVuZDtcblxuICAgICAgICAvLyBFbWl0IGEgd2FybmluZyBpZiB0aGUgZW1pdHRlciBiZWluZyBhZGRlZCB3aWxsIGV4Y2VlZCB0aGUgYnVmZmVyIHNpemVzIHNwZWNpZmllZC5cbiAgICAgICAgaWYgKHRoaXMubWF4UGFydGljbGVDb3VudCAhPT0gbnVsbCAmJiB0aGlzLnBhcnRpY2xlQ291bnQgPiB0aGlzLm1heFBhcnRpY2xlQ291bnQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignU1BFLkdyb3VwOiBtYXhQYXJ0aWNsZUNvdW50IGV4Y2VlZGVkLiBSZXF1ZXN0aW5nJywgdGhpcy5wYXJ0aWNsZUNvdW50LCAncGFydGljbGVzLCBjYW4gc3VwcG9ydCBvbmx5JywgdGhpcy5tYXhQYXJ0aWNsZUNvdW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFNldCB0aGUgYHBhcnRpY2xlc1BlclNlY29uZGAgdmFsdWUgKFBQUykgb24gdGhlIGVtaXR0ZXIuXG4gICAgICAgIC8vIEl0J3MgdXNlZCB0byBkZXRlcm1pbmUgaG93IG1hbnkgcGFydGljbGVzIHRvIHJlbGVhc2VcbiAgICAgICAgLy8gb24gYSBwZXItZnJhbWUgYmFzaXMuXG4gICAgICAgIGVtaXR0ZXIuX2NhbGN1bGF0ZVBQU1ZhbHVlKGVtaXR0ZXIubWF4QWdlLl92YWx1ZSArIGVtaXR0ZXIubWF4QWdlLl9zcHJlYWQpO1xuICAgICAgICBlbWl0dGVyLl9zZXRCdWZmZXJVcGRhdGVSYW5nZXModGhpcy5hdHRyaWJ1dGVLZXlzKTtcblxuICAgICAgICAvLyBTdG9yZSB0aGUgb2Zmc2V0IHZhbHVlIGluIHRoZSBUeXBlZEFycmF5IGF0dHJpYnV0ZXMgZm9yIHRoaXMgZW1pdHRlci5cbiAgICAgICAgZW1pdHRlci5fc2V0QXR0cmlidXRlT2Zmc2V0KHN0YXJ0KTtcblxuICAgICAgICAvLyBTYXZlIGEgcmVmZXJlbmNlIHRvIHRoaXMgZ3JvdXAgb24gdGhlIGVtaXR0ZXIgc28gaXQga25vd3NcbiAgICAgICAgLy8gd2hlcmUgaXQgYmVsb25ncy5cbiAgICAgICAgZW1pdHRlci5ncm91cCA9IHRoaXM7XG5cbiAgICAgICAgLy8gU3RvcmUgcmVmZXJlbmNlIHRvIHRoZSBhdHRyaWJ1dGVzIG9uIHRoZSBlbWl0dGVyIGZvclxuICAgICAgICAvLyBlYXNpZXIgYWNjZXNzIGR1cmluZyB0aGUgZW1pdHRlcidzIHRpY2sgZnVuY3Rpb24uXG4gICAgICAgIGVtaXR0ZXIuYXR0cmlidXRlcyA9IHRoaXMuYXR0cmlidXRlcztcblxuICAgICAgICAvLyBFbnN1cmUgdGhlIGF0dHJpYnV0ZXMgYW5kIHRoZWlyIEJ1ZmZlckF0dHJpYnV0ZXMgZXhpc3QsIGFuZCB0aGVpclxuICAgICAgICAvLyBUeXBlZEFycmF5cyBhcmUgb2YgdGhlIGNvcnJlY3Qgc2l6ZS5cbiAgICAgICAgZm9yICh2YXIgYXR0ciBpbiBhdHRyaWJ1dGVzKSB7XG4gICAgICAgICAgICBpZiAoYXR0cmlidXRlcy5oYXNPd25Qcm9wZXJ0eShhdHRyKSkge1xuICAgICAgICAgICAgICAgIC8vIFdoZW4gY3JlYXRpbmcgYSBidWZmZXIsIHBhc3MgdGhyb3VnaCB0aGUgbWF4UGFydGljbGUgY291bnRcbiAgICAgICAgICAgICAgICAvLyBpZiBvbmUgaXMgc3BlY2lmaWVkLlxuICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXNbYXR0cl0uX2NyZWF0ZUJ1ZmZlckF0dHJpYnV0ZShcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tYXhQYXJ0aWNsZUNvdW50ICE9PSBudWxsXG4gICAgICAgICAgICAgICAgICAgICAgICA/IHRoaXMubWF4UGFydGljbGVDb3VudFxuICAgICAgICAgICAgICAgICAgICAgICAgOiB0aGlzLnBhcnRpY2xlQ291bnRcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gTG9vcCB0aHJvdWdoIGVhY2ggcGFydGljbGUgdGhpcyBlbWl0dGVyIHdhbnRzIHRvIGhhdmUsIGFuZCBjcmVhdGUgdGhlIGF0dHJpYnV0ZXMgdmFsdWVzLFxuICAgICAgICAvLyBzdG9yaW5nIHRoZW0gaW4gdGhlIFR5cGVkQXJyYXlzIHRoYXQgZWFjaCBhdHRyaWJ1dGUgaG9sZHMuXG4gICAgICAgIGZvciAobGV0IGkgPSBzdGFydDsgaSA8IGVuZDsgKytpKSB7XG4gICAgICAgICAgICBlbWl0dGVyLl9hc3NpZ25Qb3NpdGlvblZhbHVlKGkpO1xuICAgICAgICAgICAgZW1pdHRlci5fYXNzaWduRm9yY2VWYWx1ZShpLCAndmVsb2NpdHknKTtcbiAgICAgICAgICAgIGVtaXR0ZXIuX2Fzc2lnbkZvcmNlVmFsdWUoaSwgJ2FjY2VsZXJhdGlvbicpO1xuICAgICAgICAgICAgZW1pdHRlci5fYXNzaWduQWJzTGlmZXRpbWVWYWx1ZShpLCAnb3BhY2l0eScpO1xuICAgICAgICAgICAgZW1pdHRlci5fYXNzaWduQWJzTGlmZXRpbWVWYWx1ZShpLCAnc2l6ZScpO1xuICAgICAgICAgICAgZW1pdHRlci5fYXNzaWduQW5nbGVWYWx1ZShpKTtcbiAgICAgICAgICAgIGVtaXR0ZXIuX2Fzc2lnblJvdGF0aW9uVmFsdWUoaSk7XG4gICAgICAgICAgICBlbWl0dGVyLl9hc3NpZ25QYXJhbXNWYWx1ZShpKTtcbiAgICAgICAgICAgIGVtaXR0ZXIuX2Fzc2lnbkNvbG9yVmFsdWUoaSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBVcGRhdGUgdGhlIGdlb21ldHJ5IGFuZCBtYWtlIHN1cmUgdGhlIGF0dHJpYnV0ZXMgYXJlIHJlZmVyZW5jaW5nXG4gICAgICAgIC8vIHRoZSB0eXBlZCBhcnJheXMgcHJvcGVybHkuXG4gICAgICAgIHRoaXMuX2FwcGx5QXR0cmlidXRlc1RvR2VvbWV0cnkoKTtcblxuICAgICAgICAvLyBTdG9yZSB0aGlzIGVtaXR0ZXIgaW4gdGhpcyBncm91cCdzIGVtaXR0ZXIncyBzdG9yZS5cbiAgICAgICAgdGhpcy5lbWl0dGVycy5wdXNoKGVtaXR0ZXIpO1xuICAgICAgICB0aGlzLmVtaXR0ZXJJRHMucHVzaChlbWl0dGVyLnV1aWQpO1xuXG4gICAgICAgIC8vIFVwZGF0ZSBjZXJ0YWluIGZsYWdzIHRvIGVuYWJsZSBzaGFkZXIgY2FsY3VsYXRpb25zIG9ubHkgaWYgdGhleSdyZSBuZWNlc3NhcnkuXG4gICAgICAgIHRoaXMuX3VwZGF0ZURlZmluZXMoZW1pdHRlcik7XG5cbiAgICAgICAgLy8gVXBkYXRlIHRoZSBtYXRlcmlhbCBzaW5jZSBkZWZpbmVzIG1pZ2h0IGhhdmUgY2hhbmdlZFxuICAgICAgICB0aGlzLm1hdGVyaWFsLm5lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5nZW9tZXRyeS5uZWVkc1VwZGF0ZSA9IHRydWU7XG4gICAgICAgIHRoaXMuX2F0dHJpYnV0ZXNOZWVkUmVmcmVzaCA9IHRydWU7XG5cbiAgICAgICAgLy8gUmV0dXJuIHRoZSBncm91cCB0byBlbmFibGUgY2hhaW5pbmcuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgYW4gU1BFLkVtaXR0ZXIgaW5zdGFuY2UgZnJvbSB0aGlzIGdyb3VwLiBXaGVuIGNhbGxlZCxcbiAgICAgKiBhbGwgcGFydGljbGUncyBiZWxvbmdpbmcgdG8gdGhlIGdpdmVuIGVtaXR0ZXIgd2lsbCBiZSBpbnN0YW50bHlcbiAgICAgKiByZW1vdmVkIGZyb20gdGhlIHNjZW5lLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtFbWl0dGVyfSBlbWl0dGVyIFRoZSBlbWl0dGVyIHRvIGFkZCB0byB0aGlzIGdyb3VwLlxuICAgICAqL1xuICAgIHJlbW92ZUVtaXR0ZXIoZW1pdHRlcikge1xuICAgICAgICBjb25zdCBlbWl0dGVySW5kZXggPSB0aGlzLmVtaXR0ZXJJRHMuaW5kZXhPZihlbWl0dGVyLCB0aGlzLnV1aWQpO1xuXG4gICAgICAgIC8vIEVuc3VyZSBhbiBhY3R1YWwgZW1pdHRlciBpbnN0YW5jZSBpcyBwYXNzZWQgaGVyZS5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gRGVjaWRlZCBub3QgdG8gdGhyb3cgaGVyZSwganVzdCBpbiBjYXNlIGEgc2NlbmUnc1xuICAgICAgICAvLyByZW5kZXJpbmcgd291bGQgYmUgcGF1c2VkLiBMb2dnaW5nIGFuIGVycm9yIGluc3RlYWRcbiAgICAgICAgLy8gb2Ygc3RvcHBpbmcgZXhlY3V0aW9uIGlmIGV4Y2VwdGlvbnMgYXJlbid0IGNhdWdodC5cbiAgICAgICAgaWYgKGVtaXR0ZXIgaW5zdGFuY2VvZiBFbWl0dGVyID09PSBmYWxzZSkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignYGVtaXR0ZXJgIGFyZ3VtZW50IG11c3QgYmUgaW5zdGFuY2Ugb2YgU1BFLkVtaXR0ZXIuIFdhcyBwcm92aWRlZCB3aXRoOicsIGVtaXR0ZXIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGVtaXR0ZXJJbmRleCA9PT0gLTEpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0VtaXR0ZXIgZG9lcyBub3QgZXhpc3QgaW4gdGhpcyBncm91cC4gV2lsbCBub3QgcmVtb3ZlLicpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gS2lsbCBhbGwgcGFydGljbGVzIGJ5IG1hcmtpbmcgdGhlbSBhcyBkZWFkXG4gICAgICAgIC8vIGFuZCB0aGVpciBhZ2UgYXMgMC5cbiAgICAgICAgY29uc3Qgc3RhcnQgPSBlbWl0dGVyLmF0dHJpYnV0ZU9mZnNldDtcbiAgICAgICAgY29uc3QgZW5kID0gc3RhcnQgKyBlbWl0dGVyLnBhcnRpY2xlQ291bnQ7XG4gICAgICAgIGNvbnN0IHBhcmFtcyA9IHRoaXMuYXR0cmlidXRlcy5wYXJhbXMudHlwZWRBcnJheTtcblxuICAgICAgICAvLyBTZXQgYWxpdmUgYW5kIGFnZSB0byB6ZXJvLlxuICAgICAgICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7ICsraSkge1xuICAgICAgICAgICAgcGFyYW1zLmFycmF5W2kgKiA0XSA9IDAuMDtcbiAgICAgICAgICAgIHBhcmFtcy5hcnJheVtpICogNCArIDFdID0gMC4wO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUmVtb3ZlIHRoZSBlbWl0dGVyIGZyb20gdGhpcyBncm91cCdzIFwic3RvcmVcIi5cbiAgICAgICAgdGhpcy5lbWl0dGVycy5zcGxpY2UoZW1pdHRlckluZGV4LCAxKTtcbiAgICAgICAgdGhpcy5lbWl0dGVySURzLnNwbGljZShlbWl0dGVySW5kZXgsIDEpO1xuXG4gICAgICAgIC8vIFJlbW92ZSB0aGlzIGVtaXR0ZXIncyBhdHRyaWJ1dGUgdmFsdWVzIGZyb20gYWxsIHNoYWRlciBhdHRyaWJ1dGVzLlxuICAgICAgICAvLyBUaGUgYC5zcGxpY2UoKWAgY2FsbCBoZXJlIGFsc28gbWFya3MgZWFjaCBhdHRyaWJ1dGUncyBidWZmZXJcbiAgICAgICAgLy8gYXMgbmVlZGluZyB0byB1cGRhdGUgaXQncyBlbnRpcmUgY29udGVudHMuXG4gICAgICAgIGZvciAodmFyIGF0dHIgaW4gdGhpcy5hdHRyaWJ1dGVzKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5hdHRyaWJ1dGVzLmhhc093blByb3BlcnR5KGF0dHIpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hdHRyaWJ1dGVzW2F0dHJdLnNwbGljZShzdGFydCwgZW5kKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEVuc3VyZSB0aGlzIGdyb3VwJ3MgcGFydGljbGUgY291bnQgaXMgY29ycmVjdC5cbiAgICAgICAgdGhpcy5wYXJ0aWNsZUNvdW50IC09IGVtaXR0ZXIucGFydGljbGVDb3VudDtcblxuICAgICAgICAvLyBDYWxsIHRoZSBlbWl0dGVyJ3MgcmVtb3ZlIG1ldGhvZC5cbiAgICAgICAgZW1pdHRlci5fb25SZW1vdmUoKTtcblxuICAgICAgICAvLyBTZXQgYSBmbGFnIHRvIGluZGljYXRlIHRoYXQgdGhlIGF0dHJpYnV0ZSBidWZmZXJzIHNob3VsZFxuICAgICAgICAvLyBiZSB1cGRhdGVkIGluIHRoZWlyIGVudGlyZXR5IG9uIHRoZSBuZXh0IGZyYW1lLlxuICAgICAgICB0aGlzLl9hdHRyaWJ1dGVzTmVlZFJlZnJlc2ggPSB0cnVlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZldGNoIGEgc2luZ2xlIGVtaXR0ZXIgaW5zdGFuY2UgZnJvbSB0aGUgcG9vbC5cbiAgICAgKiBJZiB0aGVyZSBhcmUgbm8gb2JqZWN0cyBpbiB0aGUgcG9vbCwgYSBuZXcgZW1pdHRlciB3aWxsIGJlXG4gICAgICogY3JlYXRlZCBpZiBzcGVjaWZpZWQuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtFbWl0dGVyfG51bGx9XG4gICAgICovXG4gICAgZ2V0RnJvbVBvb2woKSB7XG4gICAgICAgIGNvbnN0IHBvb2wgPSB0aGlzLl9wb29sO1xuICAgICAgICBjb25zdCBjcmVhdGVOZXcgPSB0aGlzLl9jcmVhdGVOZXdXaGVuUG9vbEVtcHR5O1xuXG4gICAgICAgIGlmIChwb29sLmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuIHBvb2wucG9wKCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoY3JlYXRlTmV3KSB7XG4gICAgICAgICAgICB2YXIgZW1pdHRlciA9IG5ldyBFbWl0dGVyKHRoaXMuX3Bvb2xDcmVhdGlvblNldHRpbmdzKTtcblxuICAgICAgICAgICAgdGhpcy5hZGRFbWl0dGVyKGVtaXR0ZXIpO1xuXG4gICAgICAgICAgICByZXR1cm4gZW1pdHRlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlbGVhc2UgYW4gZW1pdHRlciBpbnRvIHRoZSBwb29sLlxuICAgICAqXG4gICAgICogQHBhcmFtICB7U2hhZGVyUGFydGljbGVFbWl0dGVyfSBlbWl0dGVyXG4gICAgICogQHJldHVybiB7R3JvdXB9IFRoaXMgZ3JvdXAgaW5zdGFuY2UuXG4gICAgICovXG4gICAgcmVsZWFzZUludG9Qb29sKGVtaXR0ZXIpIHtcbiAgICAgICAgaWYgKGVtaXR0ZXIgaW5zdGFuY2VvZiBFbWl0dGVyID09PSBmYWxzZSkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignQXJndW1lbnQgaXMgbm90IGluc3RhbmNlb2YgU1BFLkVtaXR0ZXI6JywgZW1pdHRlcik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBlbWl0dGVyLnJlc2V0KCk7XG4gICAgICAgIHRoaXMuX3Bvb2wudW5zaGlmdChlbWl0dGVyKTtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBnZXRQb29sKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fcG9vbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBZGQgYSBwb29sIG9mIGVtaXR0ZXJzIHRvIHRoaXMgcGFydGljbGUgZ3JvdXBcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBudW1FbWl0dGVycyAgICAgIFRoZSBudW1iZXIgb2YgZW1pdHRlcnMgdG8gYWRkIHRvIHRoZSBwb29sLlxuICAgICAqIEBwYXJhbSB7RW1pdHRlck9wdGlvbnN8QXJyYXl9IGVtaXR0ZXJPcHRpb25zICBBbiBvYmplY3QsIG9yIGFycmF5IG9mIG9iamVjdHMsIGRlc2NyaWJpbmcgdGhlIG9wdGlvbnMgdG8gcGFzcyB0byBlYWNoIGVtaXR0ZXIuXG4gICAgICogQHBhcmFtIHtCb29sZWFufSBjcmVhdGVOZXcgICAgICAgU2hvdWxkIGEgbmV3IGVtaXR0ZXIgYmUgY3JlYXRlZCBpZiB0aGUgcG9vbCBydW5zIG91dD9cbiAgICAgKiBAcmV0dXJuIHtHcm91cH0gVGhpcyBncm91cCBpbnN0YW5jZS5cbiAgICAgKi9cbiAgICBhZGRQb29sKG51bUVtaXR0ZXJzLCBlbWl0dGVyT3B0aW9ucywgY3JlYXRlTmV3KSB7XG4gICAgICAgIGxldCBlbWl0dGVyO1xuICAgICAgICAvLyBTYXZlIHJlbGV2YW50IHNldHRpbmdzIGFuZCBmbGFncy5cbiAgICAgICAgdGhpcy5fcG9vbENyZWF0aW9uU2V0dGluZ3MgPSBlbWl0dGVyT3B0aW9ucztcbiAgICAgICAgdGhpcy5fY3JlYXRlTmV3V2hlblBvb2xFbXB0eSA9ICEhY3JlYXRlTmV3O1xuXG4gICAgICAgIC8vIENyZWF0ZSB0aGUgZW1pdHRlcnMsIGFkZCB0aGVtIHRvIHRoaXMgZ3JvdXAgYW5kIHRoZSBwb29sLlxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG51bUVtaXR0ZXJzOyArK2kpIHtcbiAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KGVtaXR0ZXJPcHRpb25zKSkge1xuICAgICAgICAgICAgICAgIGVtaXR0ZXIgPSBuZXcgU1BFLkVtaXR0ZXIoZW1pdHRlck9wdGlvbnNbaV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgZW1pdHRlciA9IG5ldyBTUEUuRW1pdHRlcihlbWl0dGVyT3B0aW9ucyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmFkZEVtaXR0ZXIoZW1pdHRlcik7XG4gICAgICAgICAgICB0aGlzLnJlbGVhc2VJbnRvUG9vbChlbWl0dGVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIF90cmlnZ2VyU2luZ2xlRW1pdHRlcihwb3MpIHtcbiAgICAgICAgY29uc3QgZW1pdHRlciA9IHRoaXMuZ2V0RnJvbVBvb2woKSxcbiAgICAgICAgICAgIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgIGlmIChlbWl0dGVyID09PSBudWxsKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnU1BFLkdyb3VwIHBvb2wgcmFuIG91dC4nKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRPRE86XG4gICAgICAgIC8vIC0gTWFrZSBzdXJlIGJ1ZmZlcnMgYXJlIHVwZGF0ZSB3aXRoIHRodXMgbmV3IHBvc2l0aW9uLlxuICAgICAgICBpZiAocG9zIGluc3RhbmNlb2YgVEhSRUUuVmVjdG9yMykge1xuICAgICAgICAgICAgZW1pdHRlci5wb3NpdGlvbi52YWx1ZS5jb3B5KHBvcyk7XG5cbiAgICAgICAgICAgIC8vIFRyaWdnZXIgdGhlIHNldHRlciBmb3IgdGhpcyBwcm9wZXJ0eSB0byBmb3JjZSBhblxuICAgICAgICAgICAgLy8gdXBkYXRlIHRvIHRoZSBlbWl0dGVyJ3MgcG9zaXRpb24gYXR0cmlidXRlLlxuICAgICAgICAgICAgZW1pdHRlci5wb3NpdGlvbi52YWx1ZSA9IGVtaXR0ZXIucG9zaXRpb24udmFsdWU7XG4gICAgICAgIH1cblxuICAgICAgICBlbWl0dGVyLmVuYWJsZSgpO1xuXG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZW1pdHRlci5kaXNhYmxlKCk7XG4gICAgICAgICAgICBzZWxmLnJlbGVhc2VJbnRvUG9vbChlbWl0dGVyKTtcbiAgICAgICAgfSwgKE1hdGgubWF4KGVtaXR0ZXIuZHVyYXRpb24sIChlbWl0dGVyLm1heEFnZS52YWx1ZSArIGVtaXR0ZXIubWF4QWdlLnNwcmVhZCkpKSAqIDEwMDApO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCBhIGdpdmVuIG51bWJlciBvZiBlbWl0dGVycyBhcyBhbGl2ZSwgd2l0aCBhbiBvcHRpb25hbCBwb3NpdGlvblxuICAgICAqIHZlY3RvcjMgdG8gbW92ZSB0aGVtIHRvLlxuICAgICAqXG4gICAgICogQHBhcmFtICB7TnVtYmVyfSBudW1FbWl0dGVycyBUaGUgbnVtYmVyIG9mIGVtaXR0ZXJzIHRvIGFjdGl2YXRlXG4gICAgICogQHBhcmFtICB7T2JqZWN0fSBbcG9zaXRpb249dW5kZWZpbmVkXSBBIFRIUkVFLlZlY3RvcjMgaW5zdGFuY2UgZGVzY3JpYmluZyB0aGUgcG9zaXRpb24gdG8gYWN0aXZhdGUgdGhlIGVtaXR0ZXIocykgYXQuXG4gICAgICogQHJldHVybiB7R3JvdXB9IFRoaXMgZ3JvdXAgaW5zdGFuY2UuXG4gICAgICovXG4gICAgdHJpZ2dlclBvb2xFbWl0dGVyKG51bUVtaXR0ZXJzLCBwb3NpdGlvbikge1xuICAgICAgICBpZiAodHlwZW9mIG51bUVtaXR0ZXJzID09PSAnbnVtYmVyJyAmJiBudW1FbWl0dGVycyA+IDEpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbnVtRW1pdHRlcnM7ICsraSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3RyaWdnZXJTaW5nbGVFbWl0dGVyKHBvc2l0aW9uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX3RyaWdnZXJTaW5nbGVFbWl0dGVyKHBvc2l0aW9uKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIF91cGRhdGVVbmlmb3JtcyhkdCkge1xuICAgICAgICB0aGlzLnVuaWZvcm1zLnJ1blRpbWUudmFsdWUgKz0gZHQ7XG4gICAgICAgIHRoaXMudW5pZm9ybXMuZGVsdGFUaW1lLnZhbHVlID0gZHQ7XG4gICAgfVxuXG4gICAgX3Jlc2V0QnVmZmVyUmFuZ2VzKCkge1xuICAgICAgICBjb25zdCBrZXlzID0gdGhpcy5hdHRyaWJ1dGVLZXlzO1xuICAgICAgICBjb25zdCBhdHRycyA9IHRoaXMuYXR0cmlidXRlcztcbiAgICAgICAgbGV0IGkgPSB0aGlzLmF0dHJpYnV0ZUNvdW50IC0gMTtcblxuICAgICAgICBmb3IgKGk7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgICAgICBhdHRyc1trZXlzW2ldXS5yZXNldFVwZGF0ZVJhbmdlKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfdXBkYXRlQnVmZmVycyhlbWl0dGVyKSB7XG4gICAgICAgIGNvbnN0IGtleXMgPSB0aGlzLmF0dHJpYnV0ZUtleXM7XG4gICAgICAgIGNvbnN0IGF0dHJzID0gdGhpcy5hdHRyaWJ1dGVzO1xuICAgICAgICBjb25zdCBlbWl0dGVyUmFuZ2VzID0gZW1pdHRlci5idWZmZXJVcGRhdGVSYW5nZXM7XG4gICAgICAgIGxldCBpID0gdGhpcy5hdHRyaWJ1dGVDb3VudCAtIDE7XG4gICAgICAgIGxldCBrZXksIGVtaXR0ZXJBdHRyLCBhdHRyO1xuXG4gICAgICAgIGZvciAoaTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgICAgIGtleSA9IGtleXNbaV07XG4gICAgICAgICAgICBlbWl0dGVyQXR0ciA9IGVtaXR0ZXJSYW5nZXNba2V5XTtcbiAgICAgICAgICAgIGF0dHIgPSBhdHRyc1trZXldO1xuICAgICAgICAgICAgYXR0ci5zZXRVcGRhdGVSYW5nZShlbWl0dGVyQXR0ci5taW4sIGVtaXR0ZXJBdHRyLm1heCk7XG4gICAgICAgICAgICBhdHRyLmZsYWdVcGRhdGUoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNpbXVsYXRlIGFsbCB0aGUgZW1pdHRlcidzIGJlbG9uZ2luZyB0byB0aGlzIGdyb3VwLCB1cGRhdGluZ1xuICAgICAqIGF0dHJpYnV0ZSB2YWx1ZXMgYWxvbmcgdGhlIHdheS5cbiAgICAgKiBAcGFyYW0gIHtOdW1iZXJ9IFtkdD1Hcm91cCdzIGBmaXhlZFRpbWVTdGVwYCB2YWx1ZV0gVGhlIG51bWJlciBvZiBzZWNvbmRzIHRvIHNpbXVsYXRlIHRoZSBncm91cCdzIGVtaXR0ZXJzIGZvciAoZGVsdGFUaW1lKVxuICAgICAqL1xuICAgIHRpY2soZHQpIHtcbiAgICAgICAgY29uc3QgZW1pdHRlcnMgPSB0aGlzLmVtaXR0ZXJzO1xuICAgICAgICBjb25zdCBudW1FbWl0dGVycyA9IGVtaXR0ZXJzLmxlbmd0aDtcbiAgICAgICAgY29uc3QgZGVsdGFUaW1lID0gZHQgfHwgdGhpcy5maXhlZFRpbWVTdGVwO1xuICAgICAgICBjb25zdCBrZXlzID0gdGhpcy5hdHRyaWJ1dGVLZXlzO1xuICAgICAgICBjb25zdCBhdHRycyA9IHRoaXMuYXR0cmlidXRlcztcbiAgICAgICAgbGV0IGk7XG5cbiAgICAgICAgLy8gVXBkYXRlIHVuaWZvcm0gdmFsdWVzLlxuICAgICAgICB0aGlzLl91cGRhdGVVbmlmb3JtcyhkZWx0YVRpbWUpO1xuXG4gICAgICAgIC8vIFJlc2V0IGJ1ZmZlciB1cGRhdGUgcmFuZ2VzIG9uIHRoZSBzaGFkZXIgYXR0cmlidXRlcy5cbiAgICAgICAgdGhpcy5fcmVzZXRCdWZmZXJSYW5nZXMoKTtcblxuICAgICAgICAvLyBJZiBub3RoaW5nIG5lZWRzIHVwZGF0aW5nLCB0aGVuIHN0b3AgaGVyZS5cbiAgICAgICAgaWYgKFxuICAgICAgICAgICAgbnVtRW1pdHRlcnMgPT09IDAgJiZcbiAgICAgICAgICAgIHRoaXMuX2F0dHJpYnV0ZXNOZWVkUmVmcmVzaCA9PT0gZmFsc2UgJiZcbiAgICAgICAgICAgIHRoaXMuX2F0dHJpYnV0ZXNOZWVkRHluYW1pY1Jlc2V0ID09PSBmYWxzZVxuICAgICAgICApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIExvb3AgdGhyb3VnaCBlYWNoIGVtaXR0ZXIgaW4gdGhpcyBncm91cCBhbmRcbiAgICAgICAgLy8gc2ltdWxhdGUgaXQsIHRoZW4gdXBkYXRlIHRoZSBzaGFkZXIgYXR0cmlidXRlXG4gICAgICAgIC8vIGJ1ZmZlcnMuXG4gICAgICAgIGZvciAobGV0IGkgPSAwLCBlbWl0dGVyOyBpIDwgbnVtRW1pdHRlcnM7ICsraSkge1xuICAgICAgICAgICAgZW1pdHRlciA9IGVtaXR0ZXJzW2ldO1xuICAgICAgICAgICAgZW1pdHRlci50aWNrKGRlbHRhVGltZSk7XG4gICAgICAgICAgICB0aGlzLl91cGRhdGVCdWZmZXJzKGVtaXR0ZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSWYgdGhlIHNoYWRlciBhdHRyaWJ1dGVzIGhhdmUgYmVlbiByZWZyZXNoZWQsXG4gICAgICAgIC8vIHRoZW4gdGhlIGR5bmFtaWMgcHJvcGVydGllcyBvZiBlYWNoIGJ1ZmZlclxuICAgICAgICAvLyBhdHRyaWJ1dGUgd2lsbCBuZWVkIHRvIGJlIHJlc2V0IGJhY2sgdG9cbiAgICAgICAgLy8gd2hhdCB0aGV5IHNob3VsZCBiZS5cbiAgICAgICAgaWYgKHRoaXMuX2F0dHJpYnV0ZXNOZWVkRHluYW1pY1Jlc2V0ID09PSB0cnVlKSB7XG4gICAgICAgICAgICBpID0gdGhpcy5hdHRyaWJ1dGVDb3VudCAtIDE7XG5cbiAgICAgICAgICAgIGZvciAoaTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgICAgICAgICBhdHRyc1trZXlzW2ldXS5yZXNldER5bmFtaWMoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5fYXR0cmlidXRlc05lZWREeW5hbWljUmVzZXQgPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIElmIHRoaXMgZ3JvdXAncyBzaGFkZXIgYXR0cmlidXRlcyBuZWVkIGEgZnVsbCByZWZyZXNoXG4gICAgICAgIC8vIHRoZW4gbWFyayBlYWNoIGF0dHJpYnV0ZSdzIGJ1ZmZlciBhdHRyaWJ1dGUgYXNcbiAgICAgICAgLy8gbmVlZGluZyBzby5cbiAgICAgICAgaWYgKHRoaXMuX2F0dHJpYnV0ZXNOZWVkUmVmcmVzaCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgaSA9IHRoaXMuYXR0cmlidXRlQ291bnQgLSAxO1xuXG4gICAgICAgICAgICBmb3IgKGk7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgICAgICAgICAgYXR0cnNba2V5c1tpXV0uZm9yY2VVcGRhdGVBbGwoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5fYXR0cmlidXRlc05lZWRSZWZyZXNoID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLl9hdHRyaWJ1dGVzTmVlZER5bmFtaWNSZXNldCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBkaXNwb3NlKCkge1xuICAgICAgICB0aGlzLmdlb21ldHJ5LmRpc3Bvc2UoKTtcbiAgICAgICAgdGhpcy5tYXRlcmlhbC5kaXNwb3NlKCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgR3JvdXA7IiwiaW1wb3J0IEdyb3VwIGZyb20gXCIuL2dyb3VwL2luZGV4XCI7XG5pbXBvcnQgRW1pdHRlciBmcm9tIFwiLi9lbWl0dGVyL2luZGV4XCI7XG5pbXBvcnQgdXRpbHMgZnJvbSBcIi4vdXRpbHMvaW5kZXhcIjtcbmltcG9ydCBTUEUgZnJvbSBcIi4vZ3JvdXAvc3BlXCJcblxuR3JvdXAuRW1pdHRlciA9IEVtaXR0ZXI7XG5Hcm91cC51dGlscyA9IHV0aWxzO1xuR3JvdXAuU1BFID0gU1BFO1xuXG5leHBvcnQgZGVmYXVsdCBHcm91cDsiXSwibmFtZXMiOlsidHlwZXMiLCJCb29sZWFuIiwiU1RSSU5HIiwiTlVNQkVSIiwiT0JKRUNUIiwiZW5zdXJlVHlwZWRBcmciLCJhcmciLCJ0eXBlIiwiZGVmYXVsdFZhbHVlIiwiZW5zdXJlQXJyYXlUeXBlZEFyZyIsIkFycmF5IiwiaXNBcnJheSIsImkiLCJsZW5ndGgiLCJlbnN1cmVJbnN0YW5jZU9mIiwiaW5zdGFuY2UiLCJ1bmRlZmluZWQiLCJlbnN1cmVBcnJheUluc3RhbmNlT2YiLCJlbnN1cmVWYWx1ZU92ZXJMaWZldGltZUNvbXBsaWFuY2UiLCJwcm9wZXJ0eSIsIm1pbkxlbmd0aCIsIm1heExlbmd0aCIsIl92YWx1ZSIsIl9zcHJlYWQiLCJ2YWx1ZUxlbmd0aCIsImNsYW1wIiwic3ByZWFkTGVuZ3RoIiwiZGVzaXJlZExlbmd0aCIsIk1hdGgiLCJtYXgiLCJpbnRlcnBvbGF0ZUFycmF5Iiwic3JjQXJyYXkiLCJuZXdMZW5ndGgiLCJzb3VyY2VMZW5ndGgiLCJuZXdBcnJheSIsImNsb25lIiwiZmFjdG9yIiwiZiIsImJlZm9yZSIsImZsb29yIiwiYWZ0ZXIiLCJjZWlsIiwiZGVsdGEiLCJsZXJwVHlwZUFnbm9zdGljIiwicHVzaCIsInZhbHVlIiwibWluIiwiemVyb1RvRXBzaWxvbiIsInJhbmRvbWlzZSIsImVwc2lsb24iLCJyZXN1bHQiLCJyYW5kb20iLCJzdGFydCIsImVuZCIsIm91dCIsIlRIUkVFIiwiVmVjdG9yMiIsIngiLCJsZXJwIiwieSIsIlZlY3RvcjMiLCJ6IiwiVmVjdG9yNCIsInciLCJDb2xvciIsInIiLCJnIiwiYiIsImNvbnNvbGUiLCJ3YXJuIiwicm91bmRUb05lYXJlc3RNdWx0aXBsZSIsIm4iLCJtdWx0aXBsZSIsInJlbWFpbmRlciIsImFicyIsImFycmF5VmFsdWVzQXJlRXF1YWwiLCJhcnJheSIsInJhbmRvbUZsb2F0IiwiYmFzZSIsInNwcmVhZCIsInJhbmRvbVZlY3RvcjMiLCJhdHRyaWJ1dGUiLCJpbmRleCIsInNwcmVhZENsYW1wIiwidHlwZWRBcnJheSIsInNldFZlYzNDb21wb25lbnRzIiwicmFuZG9tQ29sb3IiLCJyYW5kb21Db2xvckFzSGV4Iiwid29ya2luZ0NvbG9yIiwibnVtSXRlbXMiLCJjb2xvcnMiLCJzcHJlYWRWZWN0b3IiLCJjb3B5IiwiZ2V0SGV4Iiwic2V0VmVjNENvbXBvbmVudHMiLCJyYW5kb21WZWN0b3IzT25MaW5lIiwicG9zIiwicmFuZG9tVmVjdG9yM09uU3BoZXJlIiwicmFkaXVzIiwicmFkaXVzU3ByZWFkIiwicmFkaXVzU2NhbGUiLCJyYWRpdXNTcHJlYWRDbGFtcCIsImRpc3RyaWJ1dGlvbkNsYW1wIiwiZGVwdGgiLCJ0Iiwic3FydCIsInJhbmQiLCJyb3VuZCIsImNvcyIsInNpbiIsInNlZWRlZFJhbmRvbSIsInNlZWQiLCJyYW5kb21WZWN0b3IzT25EaXNjIiwicmFuZG9tRGlyZWN0aW9uVmVjdG9yM09uU3BoZXJlIiwidiIsInBvc1giLCJwb3NZIiwicG9zWiIsImVtaXR0ZXJQb3NpdGlvbiIsInNwZWVkIiwic3BlZWRTcHJlYWQiLCJub3JtYWxpemUiLCJtdWx0aXBseVNjYWxhciIsInJhbmRvbURpcmVjdGlvblZlY3RvcjNPbkRpc2MiLCJnZXRQYWNrZWRSb3RhdGlvbkF4aXMiLCJ2U3ByZWFkIiwiYyIsImFkZE9uZSIsImF4aXMiLCJheGlzU3ByZWFkIiwiYWRkIiwic2V0UkdCIiwiZGlzdHJpYnV0aW9ucyIsIkJPWCIsIlNQSEVSRSIsIkRJU0MiLCJMSU5FIiwidmFsdWVPdmVyTGlmZXRpbWVMZW5ndGgiLCJUeXBlZEFycmF5SGVscGVyIiwiVHlwZWRBcnJheUNvbnN0cnVjdG9yIiwic2l6ZSIsImNvbXBvbmVudFNpemUiLCJpbmRleE9mZnNldCIsIkZsb2F0MzJBcnJheSIsIm5vQ29tcG9uZW50TXVsdGlwbHkiLCJjdXJyZW50QXJyYXlTaXplIiwic2hyaW5rIiwiZ3JvdyIsImluZm8iLCJzdWJhcnJheSIsInNldCIsInN0YXJ0T2Zmc2V0IiwiZW5kT2Zmc2V0IiwiZGF0YSIsInNldEZyb21BcnJheSIsInNvdXJjZUFycmF5U2l6ZSIsIm5ld1NpemUiLCJ2ZWMyIiwic2V0VmVjMkNvbXBvbmVudHMiLCJ2ZWMzIiwidmVjNCIsIm1hdDMiLCJlbGVtZW50cyIsIm1hdDQiLCJjb2xvciIsIm51bWVyaWNWYWx1ZSIsIlNoYWRlckF0dHJpYnV0ZSIsImR5bmFtaWNCdWZmZXIiLCJhcnJheVR5cGUiLCJ0eXBlTWFwIiwidHlwZVNpemVNYXAiLCJoYXNPd25Qcm9wZXJ0eSIsImJ1ZmZlckF0dHJpYnV0ZSIsInVwZGF0ZU1pbiIsInVwZGF0ZU1heCIsImF0dHIiLCJyYW5nZSIsInVwZGF0ZVJhbmdlIiwib2Zmc2V0IiwiY291bnQiLCJuZWVkc1VwZGF0ZSIsInVzZWFnZSIsIkR5bmFtaWNEcmF3VXNhZ2UiLCJTdGF0aWNEcmF3VXNhZ2UiLCJzcGxpY2UiLCJmb3JjZVVwZGF0ZUFsbCIsInVzYWdlIiwic2V0U2l6ZSIsIl9lbnN1cmVUeXBlZEFycmF5IiwiaXRlbVNpemUiLCJCdWZmZXJBdHRyaWJ1dGUiLCJ2MiIsInYzIiwidjQiLCJtMyIsIm00IiwiZGVmaW5lcyIsImpvaW4iLCJ1bmlmb3JtcyIsImF0dHJpYnV0ZXMiLCJ2YXJ5aW5ncyIsImJyYW5jaEF2b2lkYW5jZUZ1bmN0aW9ucyIsInVucGFja0NvbG9yIiwidW5wYWNrUm90YXRpb25BeGlzIiwiZmxvYXRPdmVyTGlmZXRpbWUiLCJjb2xvck92ZXJMaWZldGltZSIsInBhcmFtRmV0Y2hpbmdGdW5jdGlvbnMiLCJmb3JjZUZldGNoaW5nRnVuY3Rpb25zIiwicm90YXRpb25GdW5jdGlvbnMiLCJyb3RhdGVUZXh0dXJlIiwidmVydGV4Iiwic2hhZGVyQ2h1bmtzIiwiU2hhZGVyQ2h1bmsiLCJjb21tb24iLCJsb2dkZXB0aGJ1Zl9wYXJzX3ZlcnRleCIsImZvZ19wYXJzX2ZyYWdtZW50IiwibG9nZGVwdGhidWZfdmVydGV4IiwiZnJhZ21lbnQiLCJsb2dkZXB0aGJ1Zl9wYXJzX2ZyYWdtZW50IiwibG9nZGVwdGhidWZfZnJhZ21lbnQiLCJmb2dfZnJhZ21lbnQiLCJFbWl0dGVyIiwib3B0aW9ucyIsInV0aWxzIiwibGlmZXRpbWVMZW5ndGgiLCJTUEUiLCJwb3NpdGlvbiIsInZlbG9jaXR5IiwiYWNjZWxlcmF0aW9uIiwiZHJhZyIsInJvdGF0aW9uIiwib3BhY2l0eSIsImFuZ2xlIiwid2lnZ2xlIiwibWF4QWdlIiwib25QYXJ0aWNsZVNwYXduIiwidXVpZCIsIk1hdGhVdGlscyIsImdlbmVyYXRlVVVJRCIsIl9zcHJlYWRDbGFtcCIsIl9kaXN0cmlidXRpb24iLCJkaXN0cmlidXRpb24iLCJfcmFuZG9taXNlIiwiQk9PTEVBTiIsIl9yYWRpdXMiLCJfcmFkaXVzU2NhbGUiLCJfZGlzdHJpYnV0aW9uQ2xhbXAiLCJfYXhpcyIsIl9heGlzU3ByZWFkIiwiX2FuZ2xlIiwiX2FuZ2xlU3ByZWFkIiwiYW5nbGVTcHJlYWQiLCJfc3RhdGljIiwiX2NlbnRlciIsImNlbnRlciIsInBhcnRpY2xlQ291bnQiLCJkdXJhdGlvbiIsImlzU3RhdGljIiwiYWN0aXZlTXVsdGlwbGllciIsImRpcmVjdGlvbiIsImFsaXZlIiwicGFydGljbGVzUGVyU2Vjb25kIiwiYWN0aXZhdGlvbkluZGV4IiwiYXR0cmlidXRlT2Zmc2V0IiwiYXR0cmlidXRlRW5kIiwiYWdlIiwiYWN0aXZlUGFydGljbGVDb3VudCIsImdyb3VwIiwicGFyYW1zQXJyYXkiLCJyZXNldEZsYWdzIiwicm90YXRpb25DZW50ZXIiLCJ1cGRhdGVGbGFncyIsInVwZGF0ZUNvdW50cyIsInVwZGF0ZU1hcCIsIl9jcmVhdGVHZXR0ZXJTZXR0ZXJzIiwiYnVmZmVyVXBkYXRlUmFuZ2VzIiwiYXR0cmlidXRlS2V5cyIsImF0dHJpYnV0ZUNvdW50IiwicHJvcE9iaiIsInByb3BOYW1lIiwic2VsZiIsIk9iamVjdCIsImtleXMiLCJmb3JFYWNoIiwia2V5IiwibmFtZSIsInJlcGxhY2UiLCJkZWZpbmVQcm9wZXJ0eSIsImdldCIsIm1hcE5hbWUiLCJwcmV2VmFsdWUiLCJwcm9wIiwiX3VwZGF0ZURlZmluZXMiLCJOdW1iZXIiLCJQT1NJVElWRV9JTkZJTklUWSIsIk5FR0FUSVZFX0lORklOSVRZIiwiZ3JvdXBNYXhBZ2UiLCJzdGFydEluZGV4IiwiYWN0aXZhdGlvbkVuZCIsIl9hc3NpZ25Qb3NpdGlvblZhbHVlIiwiX2Fzc2lnbkZvcmNlVmFsdWUiLCJfYXNzaWduQWJzTGlmZXRpbWVWYWx1ZSIsIl9hc3NpZ25BbmdsZVZhbHVlIiwiX2Fzc2lnblBhcmFtc1ZhbHVlIiwiX2Fzc2lnblJvdGF0aW9uVmFsdWUiLCJfYXNzaWduQ29sb3JWYWx1ZSIsImF0dHJOYW1lIiwicG9zaXRpb25YIiwicG9zaXRpb25ZIiwicG9zaXRpb25aIiwicGFyYW1zIiwic2V0VmVjMyIsInVwZGF0ZUZsYWciLCJfYXNzaWduVmFsdWUiLCJfdXBkYXRlQXR0cmlidXRlVXBkYXRlUmFuZ2UiLCJyYW5nZXMiLCJidWZmZXJVcGRhdGVLZXlzIiwiYnVmZmVyVXBkYXRlQ291bnQiLCJkdCIsIl9kZWNyZW1lbnRQYXJ0aWNsZUNvdW50IiwiYWN0aXZhdGlvblN0YXJ0IiwiZHRQZXJQYXJ0aWNsZSIsImR0VmFsdWUiLCJfaW5jcmVtZW50UGFydGljbGVDb3VudCIsIl9yZXNldFBhcnRpY2xlIiwicHBzRHQiLCJfcmVzZXRCdWZmZXJSYW5nZXMiLCJfY2hlY2tQYXJ0aWNsZUFnZXMiLCJhY3RpdmF0aW9uQ291bnQiLCJfYWN0aXZhdGVQYXJ0aWNsZXMiLCJmb3JjZSIsInJlbW92ZUVtaXR0ZXIiLCJlcnJvciIsIkdyb3VwIiwidGV4dHVyZSIsImZpeGVkVGltZVN0ZXAiLCJ0ZXh0dXJlRnJhbWVzIiwiZnJhbWVzIiwidGV4dHVyZUZyYW1lQ291bnQiLCJmcmFtZUNvdW50IiwidGV4dHVyZUxvb3AiLCJsb29wIiwiaGFzUGVyc3BlY3RpdmUiLCJjb2xvcml6ZSIsIm1heFBhcnRpY2xlQ291bnQiLCJibGVuZGluZyIsIkFkZGl0aXZlQmxlbmRpbmciLCJ0cmFuc3BhcmVudCIsImFscGhhVGVzdCIsInBhcnNlRmxvYXQiLCJkZXB0aFdyaXRlIiwiZGVwdGhUZXN0IiwiZm9nIiwic2NhbGUiLCJlbWl0dGVycyIsImVtaXR0ZXJJRHMiLCJfcG9vbCIsIl9wb29sQ3JlYXRpb25TZXR0aW5ncyIsIl9jcmVhdGVOZXdXaGVuUG9vbEVtcHR5IiwiX2F0dHJpYnV0ZXNOZWVkUmVmcmVzaCIsIl9hdHRyaWJ1dGVzTmVlZER5bmFtaWNSZXNldCIsInRleCIsInRleHR1cmVBbmltYXRpb24iLCJmb2dDb2xvciIsImZvZ05lYXIiLCJmb2dGYXIiLCJmb2dEZW5zaXR5IiwiZGVsdGFUaW1lIiwicnVuVGltZSIsIkhBU19QRVJTUEVDVElWRSIsIkNPTE9SSVpFIiwiVkFMVUVfT1ZFUl9MSUZFVElNRV9MRU5HVEgiLCJTSE9VTERfUk9UQVRFX1RFWFRVUkUiLCJTSE9VTERfUk9UQVRFX1BBUlRJQ0xFUyIsIlNIT1VMRF9XSUdHTEVfUEFSVElDTEVTIiwiU0hPVUxEX0NBTENVTEFURV9TUFJJVEUiLCJtYXRlcmlhbCIsIlNoYWRlck1hdGVyaWFsIiwidmVydGV4U2hhZGVyIiwic2hhZGVycyIsImZyYWdtZW50U2hhZGVyIiwiZ2VvbWV0cnkiLCJCdWZmZXJHZW9tZXRyeSIsIm1lc2giLCJQb2ludHMiLCJlbWl0dGVyIiwiYXBwbHkiLCJnZW9tZXRyeUF0dHJpYnV0ZXMiLCJnZW9tZXRyeUF0dHJpYnV0ZSIsInNldEF0dHJpYnV0ZSIsInNldERyYXdSYW5nZSIsImluZGV4T2YiLCJfY2FsY3VsYXRlUFBTVmFsdWUiLCJfc2V0QnVmZmVyVXBkYXRlUmFuZ2VzIiwiX3NldEF0dHJpYnV0ZU9mZnNldCIsIl9jcmVhdGVCdWZmZXJBdHRyaWJ1dGUiLCJfYXBwbHlBdHRyaWJ1dGVzVG9HZW9tZXRyeSIsImVtaXR0ZXJJbmRleCIsIl9vblJlbW92ZSIsInBvb2wiLCJjcmVhdGVOZXciLCJwb3AiLCJhZGRFbWl0dGVyIiwicmVzZXQiLCJ1bnNoaWZ0IiwibnVtRW1pdHRlcnMiLCJlbWl0dGVyT3B0aW9ucyIsInJlbGVhc2VJbnRvUG9vbCIsImdldEZyb21Qb29sIiwibG9nIiwiZW5hYmxlIiwic2V0VGltZW91dCIsImRpc2FibGUiLCJfdHJpZ2dlclNpbmdsZUVtaXR0ZXIiLCJhdHRycyIsInJlc2V0VXBkYXRlUmFuZ2UiLCJlbWl0dGVyUmFuZ2VzIiwiZW1pdHRlckF0dHIiLCJzZXRVcGRhdGVSYW5nZSIsImZsYWdVcGRhdGUiLCJfdXBkYXRlVW5pZm9ybXMiLCJ0aWNrIiwiX3VwZGF0ZUJ1ZmZlcnMiLCJyZXNldER5bmFtaWMiLCJkaXNwb3NlIl0sIm1hcHBpbmdzIjoiOzs7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
