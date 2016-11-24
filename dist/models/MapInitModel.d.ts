import 'leaflet';
export declare class MapInitModel {
    InitCustomProjections(): void;
    InitBaseMaps(): {
        id: string;
        layer: L.TileLayer;
    }[];
}
