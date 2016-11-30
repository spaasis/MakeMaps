// / <reference path="./../typings/globals/leaflet/index.d.ts" />

declare namespace L {

    export interface heatLayerOptions {
        /**
         *   The minimum opacity the heat will start at
         */
        minOpacity?: number,
        /**
         *   Zoom level where the points reach maximum intensity (as intensity scales with zoom), equals maxZoom of the map by default
         */
        maxZoom?: number,
        /**
         *   Maximum point intensity, 1.0 by default
         */
        max?: number,
        /**
         * Radius of each "point" of the heatmap, 25 by default
         */
        radius?: number,
        /**
         * Amount of blur, 15 by default
         */
        blur?: number,
        /**
         * Color gradient config, e.g. {0.4: 'blue', 0.65: 'lime', 1: 'red'}
         */
        gradient?: any,

        relative?: boolean,
    }

    export interface HeatLayer {
        /**
         *  Sets new heatmap options and redraws it
         */
        setOptions: (options: heatLayerOptions) => void,
        /**
         * Adds a new point to the heatmap and redraws it
         */
        addLatLng: (latlng: L.LatLng | number[]) => void,
        /**
         * Resets heatmap data and redraws it
         */
        setLatLngs: (latlng: L.LatLng[] | number[][]) => void,
        /**
         * Redraws the heatmap
         */
        redraw: () => void,

    }

    export function heatLayer(latlngs: L.LatLng[] | number[][], options: heatLayerOptions): HeatLayer;



}
