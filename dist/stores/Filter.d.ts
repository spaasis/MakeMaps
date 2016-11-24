import { AppState } from './States';
export declare class Filter {
    id: number;
    title: string;
    layerId: number;
    filterHeaderId: number;
    filterValues: {
        [value: string]: number[];
    };
    currentMax: number;
    currentMin: number;
    totalMax: number;
    totalMin: number;
    steps: [number, number][];
    categories: string[];
    remove: boolean;
    filteredIndices: number[];
    selectedStep: number;
    allowCategoryMultiSelect: boolean;
    selectedCategories: string[];
    locked: boolean;
    lockedDistance: number;
    show: boolean;
    x: number;
    y: number;
    showSlider: boolean;
    forceSelection: boolean;
    useDistinctValues: boolean;
    previousLower: number;
    previousUpper: number;
    appState: AppState;
    constructor(appState: AppState, prev?: Filter);
    init(): void;
    filterLayer(): void;
}
