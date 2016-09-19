

/** The interface for React-Select-components */
interface ISelectData {
    /** The data of an select-item*/
    value: any,
    /** The text to show in the select box*/
    label: string
}

interface IIcon {
    /** If creating Icon symbols, the font-awesome class name to display*/
    fa?: string,
    /** The Extra-Markers- shape. Used if symbolType == Icon*/
    shape?: 'circle' | 'square' | 'star' | 'penta',
}

/** The React properties of the filters shown on the map */
interface IOnScreenFilterProps {
    /** Filter identification */
    id: number,
    /** The name of the filter. Is visible in the UI */
    title: string,
    /** The lowest value being filtered.  */
    minValue: number,
    /** The maximum of the value being filtered */
    maxValue: number,
    steps: [number, number][],
}
/** The React statuses of the filters shown on the map */
interface IOnScreenFilterStates {
    /** The current lower limit of the filtered value. Values below this point will be hidden */
    lowerLimit?: number,
    /** The current upper limit of the filtered value. Values above this point will be hidden */
    upperLimit?: number,
    step?: number,
    /** Keep the distance between the min and max the same when the slider is being moved.
     * Useful for keeping a locked range to filter
     */
    lockDistance?: boolean,
}

interface ISaveData {
    //layers: ILayerData[],
    //legend: ILegend,
    //filters: Filter[],
}

interface IWelcomeScreenProps {
    loadMap: (saveData: ISaveData) => void,
    openLayerImport: () => void,
}
interface IWelcomeScreenStates {
    /** User selected filename to upload*/
    fileName?: string,
    /** The JSON of the saved data */
    savedJSON?: ISaveData,
}
interface IDemoPreviewProps {
    imageURL: string,
    description: string,
    loadDemo: () => void,
}
interface IDemoPreviewStates {
    overlayOpen?: boolean
}
