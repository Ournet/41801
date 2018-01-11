import { Router, Request, Response, NextFunction } from 'express';
import { Data } from '../data';
import { maxage } from '../maxage';
import { ArticleEntity } from '../content/ContentApi';
import { canonical } from '../utils';
import links from '../links';

const route: Router = Router();

export default route;

//index

route.get('/_api/ournet_articles.json', function (_req: Request, res: Response, next: NextFunction) {

    maxage(res, 60 * 3);

    Data.articlesList({ limit: 5, order: '-createdAt' })
        .then(articles => res.send({ articles: articles.map(ournetArticle) }))
        .catch(next);
});

function ournetArticle(article: ArticleEntity) {
    return {
        link: canonical(links.article(article.slug)),
        image: article.image.url,
        title: article.title
    }
}
