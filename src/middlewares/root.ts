
const _package = require('../../package.json');
import { format } from 'util';
import { moment } from '../utils';
import { Request, Response, NextFunction } from 'express';
import config from '../config';

const util = {
    moment: moment,
    format: format,
};

export default function (_req: Request, res: Response, next: NextFunction) {

    res.locals.noGoogleAds = false;

    res.locals.site = {
        version: _package.version,
        name: config.name,
        head: {},
    };

    res.locals.util = util;

    res.locals._events = [];

    res.locals.viewdata = [] as Promise<any>[];

    next();
};
