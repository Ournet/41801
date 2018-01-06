
import { Router, Request, Response, NextFunction } from 'express';
import { Data, DataContainer } from '../data';
// import { format } from 'util';
// import config from '../config';
import links from '../links';
import { canonical } from '../utils';
import { maxageIndex } from '../maxage';

const route: Router = Router();

export default route;

//index

route.get('/', function (_req: Request, res: Response, next: NextFunction) {

    maxageIndex(res);
    const __ = res.locals.__;

    res.locals.title = res.locals.site.head.title = __('home_title');
    res.locals.subTitle = res.locals.site.head.description = __('home_description');
    res.locals.site.head.keywords = __('home_keywords');

    res.locals.site.head.canonical = canonical(links.home());

    const dc: DataContainer = res.locals.dataContainer;

    dc.push('articleCollection', Data.articles({ limit: 10, order: '-createdAt' }));

    dc.getData()
        .then(data => {
            res.render('articles', data);
        })
        .catch(next);
});
