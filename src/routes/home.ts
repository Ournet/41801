
import { Router, Request, Response, NextFunction } from 'express';
import { Data, DataContainer } from '../data';
// import { format } from 'util';
// import config from '../config';
import links from '../links';
import { canonical } from '../utils';
import { maxageIndex, maxageArticle, maxageCategory } from '../maxage';
import { format } from 'util';

const route: Router = Router();

export default route;

//index

route.get('/', function (_req: Request, res: Response, next: NextFunction) {

    maxageIndex(res);
    const __ = res.locals.__;

    res.locals.site.head.title = __('home_title');
    res.locals.site.head.description = __('home_description');
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

route.get('/article/:slug', function (req: Request, res: Response, next: NextFunction) {

    const slug = req.params.slug;
    // const __ = res.locals.__;

    const dc: DataContainer = res.locals.dataContainer;

    Data.article({ slug: slug })
        .then(article => {
            if (!article) {
                const error: any = new Error(`Not found article ${slug}`)
                error.statusCode = 404;
                return next(error);
            }
            res.locals.article = article;
            res.locals.site.head.title = article.title;
            res.locals.site.head.description = article.summary;
            res.locals.site.head.canonical = canonical(links.article(article.slug));
            res.locals.site.head.image = article.image.url;

            res.locals.selectedCategory = article.category;

            maxageArticle(res, article);

            dc.push('latestArticles', Data.articlesList({ limit: 6, order: '-createdAt' }));
            dc.push('articles', Data.articlesList({ limit: 10, order: '-createdAt', categoryId: article.category.id }));

            return dc.getData()
                .then(data => {
                    res.render('article', data);
                });
        })
        .catch(next);
});

route.get('/:slug', function (req: Request, res: Response, next: NextFunction) {

    const slug = req.params.slug;
    maxageCategory(res);
    const __ = res.locals.__;

    const dc: DataContainer = res.locals.dataContainer;

    Data.category({ slug: slug })
        .then(category => {
            if (!category) {
                const error: any = new Error(`Not found category ${slug}`)
                error.statusCode = 404;
                return next(error);
            }
            res.locals.selectedCategory = category;
            res.locals.category = category;
            res.locals.site.head.title = format(__('category_title_format'), category.name);
            res.locals.site.head.description = format(__('category_description_format'), category.name);
            res.locals.site.head.canonical = canonical(links.category(category.slug));

            res.locals.title = category.name;

            dc.push('articleCollection', Data.articles({ limit: 10, order: '-createdAt', categoryId: category.id }));
            return dc.getData()
                .then(data => {
                    res.render('articles', data);
                });
        })
        .catch(next);
});