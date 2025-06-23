/**
 * @desc The default delta provided to the System instance
 * @type {number}
 */
export const DEFAULT_SYSTEM_DELTA = 0.0167;

export default {
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
}