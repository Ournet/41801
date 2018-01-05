
import { Router, Request, Response, NextFunction } from 'express';
// import { format } from 'util';
// import config from '../config';
import links from '../links';
import { canonical } from '../utils';
import { maxageIndex } from '../maxage';

const route: Router = Router();

export default route;

//index

route.get('/', function (_req: Request, res: Response, _next: NextFunction) {

    maxageIndex(res);
    const __ = res.locals.__;

    res.locals.title = res.locals.site.head.title = __('home_title');
    res.locals.subTitle = res.locals.site.head.description = __('home_description');
    res.locals.site.head.keywords = __('home_keywords');

    res.locals.site.head.canonical = canonical(links.home());

    res.render('index');
});
