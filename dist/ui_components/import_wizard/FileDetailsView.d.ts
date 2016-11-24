import * as React from 'react';
import { ImportWizardState } from '../../stores/States';
import { Strings } from '../../localizations/Strings';
export declare class FileDetailsView extends React.Component<{
    strings: Strings;
    state: ImportWizardState;
    saveValues: () => void;
    goBack: () => void;
}, {}> {
    private activeLayer;
    componentWillMount(): void;
    proceed: () => void;
    render(): JSX.Element;
}
