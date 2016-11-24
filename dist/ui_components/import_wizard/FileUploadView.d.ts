import * as React from 'react';
import { ImportWizardState } from '../../stores/States';
import { Strings } from '../../localizations/Strings';
export declare class FileUploadView extends React.Component<{
    strings: Strings;
    state: ImportWizardState;
    saveValues: () => void;
    cancel: () => void;
}, {}> {
    onDrop: (files: any) => void;
    proceed: () => void;
    render(): JSX.Element;
}
