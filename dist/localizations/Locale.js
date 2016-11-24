"use strict";
var Loc = require('react-localization');
var Strings_1 = require('./Strings');
var fi_1 = require('./fi');
var en = new Strings_1.Strings();
var Locale = new Loc({
    fi: fi_1.fi,
    en: en,
});
exports.Locale = Locale;
