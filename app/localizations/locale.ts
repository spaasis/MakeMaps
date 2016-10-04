import * as LocalizedStrings from 'react-localization';
import { Strings } from './strings';
import { fi } from './fi';

let en = new Strings();

let locale = new LocalizedStrings({
    fi,
    en,
});

export { locale }
