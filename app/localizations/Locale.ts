import * as Loc from 'react-localization';
import { Strings } from './Strings';
import { fi } from './fi';

let en = new Strings();

//TODO:fix typings!
let Locale: any = new Loc({
    fi,
    en,
});

export { Locale }
