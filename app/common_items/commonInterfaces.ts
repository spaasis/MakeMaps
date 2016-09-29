

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
