
const _package = require('../../package.json');
import { format } from 'util';
import { moment, parseArticle } from '../utils';
import { Request, Response, NextFunction } from 'express';
import config from '../config';
import { DataContainer, Data } from '../data';

const util = {
    moment: moment,
    format: format,
    parseArticle: parseArticle,
};

export default function (_req: Request, res: Response, next: NextFunction) {

    res.locals.culture = {
        language: config.language,
        locale: config.locale,
    }

    res.locals.noGoogleAds = false;

    res.locals.site = {
        version: _package.version,
        name: config.name,
        head: {},
    };

    res.locals.util = util;

    res.locals._events = [];

    const dc = res.locals.dataContainer = new DataContainer();
    dc.push('mainCategories', Data.mainCategories(8));

    next();
};
