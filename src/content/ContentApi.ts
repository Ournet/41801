
import { CacheContentfulApi } from './CacheContentfulApi';
import { ContentfulEntity, ContentfulEntityCollection, ApiQuery } from './ContentfulApi';
const ms = require('ms');

export enum ContentTypes {
    CATEGORY = 'category',
    FILE = 'file',
    ARTICLE = 'article',
}

export interface Entity {
    id: string
    // title: string
    createdAt?: string
    updatedAt?: string
    [index: string]: any
}

export interface CategoryEntity extends Entity {
    name?: string
    slug?: string
    parent?: CategoryEntity
}

export interface ArticleEntity extends Entity {
    title?: string
    slug?: string
    text?: string
    summary?: string
    image?: ImageEntity
    category?: CategoryEntity
}

export interface ImageEntity extends Entity {
    title?: string
    url?: string
    width?: number
    height?: number
    size?: number
    contentType?: string
}

export interface EntityCollection<T extends Entity> {
    items: T[]
    total: number
}

export interface ArticleCollection extends EntityCollection<ArticleEntity> { }
export interface CategoryCollection extends EntityCollection<CategoryEntity> { }

export interface FilterArticlesParams {
    limit: number
    order: 'createdAt' | 'countViews' | '-createdAt' | '-countViews'
    categoryId?: string
    categorySlug?: string
}

export interface ContentApi {
    category(id: string): Promise<CategoryEntity>
    rootCategories(): Promise<CategoryEntity[]>
    allCategories(): Promise<CategoryEntity[]>
    articles(filter: FilterArticlesParams): Promise<ArticleCollection>
}

export class ImplContentApi extends CacheContentfulApi implements ContentApi {
    constructor() {
        super({
            space: process.env.CONTENTFUL_SPACE,
            accessToken: process.env.CONTENTFUL_ACCESS_TOKEN
        },
            {
                category: {
                    item: { max: 50, maxAge: ms('1h') },
                    collection: { max: 50, maxAge: ms('30m') },
                }
            })
    }



    article(id: string): Promise<ArticleEntity> {
        return this.getArticles({
            'sys.id': id,
            include: 1,
            limit: 1,
        }).then(articles => articles.items.length && articles.items[0] || null);
    }

    articles(filter: FilterArticlesParams): Promise<ArticleCollection> {
        const query: ApiQuery = { limit: filter.limit };

        switch (filter.order) {
            case 'createdAt':
                query.order = 'sys.createdAt';
                break;
            case 'countViews':
                query.order = 'fields.countViews';
                break;
            case '-countViews':
                query.order = '-fields.countViews';
                break;
            default:
                query.order = '-sys.createdAt';
                break;
        }

        if (filter.categoryId) {
            query['fields.category.sys.id'] = filter.categoryId;
        }
        if (filter.categorySlug) {
            query['fields.category.fields.slug'] = filter.categorySlug;
        }

        return this.getArticles(query);
    }

    protected getArticles(query: any): Promise<ArticleCollection> {
        return this.getCacheEntries(ContentTypes.ARTICLE, query)
            .then(toArticles);
    }

    category(id: string): Promise<CategoryEntity> {
        return this.getCacheEntry(ContentTypes.CATEGORY, id).then(toCategory);
    }

    rootCategories(): Promise<CategoryEntity[]> {
        return this.getCacheEntries(ContentTypes.CATEGORY, {
            // select: 'sys.id,sys.createdAt,sys.updatedAt,fields.'
            content_type: ContentTypes.CATEGORY,
            parent: null,
            order: 'fields.slug',
        }).then(toCategories);
    }

    allCategories(): Promise<CategoryEntity[]> {
        return this.getCacheEntries(ContentTypes.CATEGORY, {
            // select: 'sys.id,sys.createdAt,sys.updatedAt,fields.'
            content_type: ContentTypes.CATEGORY,
            // parent: null,
            order: 'fields.slug',
        }).then(toCategories);
    }
}

function toArticles(collection: ContentfulEntityCollection<ContentfulEntity>): ArticleCollection {
    const data: ArticleCollection = { total: 0, items: [] };
    if (!collection) {
        return data;
    }

    if (!collection.items) {
        data.total = collection.total || data.total;
        return data;
    }

    data.items = collection.items.map(toArticle);

    return data;
}

function toArticle(entity: ContentfulEntity): ArticleEntity {
    if (!entity) {
        return null;
    }
    const data: ArticleEntity = {
        id: entity.id,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
        title: entity.fields.title,
        slug: entity.fields.slug,
        summary: entity.fields.summary,
    }

    if (entity.fields.text) {
        data.text = entity.fields.text;
    }

    if (entity.fields.category) {
        data.category = toCategory(entity.fields.category);
    }

    if (entity.fields.image) {
        data.image = toImage(entity.fields.image);
    }

    return data;
}


function toCategories(collection: ContentfulEntityCollection<ContentfulEntity>): CategoryEntity[] {
    if (!collection || !collection.items.length) {
        return [];
    }

    return collection.items.map(toCategory);
}

function toCategory(entity: ContentfulEntity): CategoryEntity {
    if (!entity) {
        return null;
    }
    const data: CategoryEntity = {
        id: entity.id,
        // createdAt: entity.createdAt,
        // updatedAt: entity.updatedAt,
    }
    if (entity.fields) {
        data.name = entity.fields.name;
        data.slug = entity.fields.slug;

        if (entity.fields.parent) {
            data.parent = toCategory(entity.fields.parent);
        }
    }

    return data;
}

function toImage(entity: ContentfulEntity): ImageEntity {
    if (!entity) {
        return null;
    }
    const data: ImageEntity = {
        id: entity.id
    }

    if (entity.fields) {
        if (entity.fields.file) {
            if (entity.fields.file.url) {
                data.url = entity.fields.file.url;
            }
            if (entity.fields.file.contentType) {
                data.contentType = entity.fields.file.contentType;
            }
            if (entity.fields.file.details) {
                data.size = entity.fields.file.details.size;
                if (entity.fields.file.details.image) {
                    data.width = entity.fields.file.details.image.width;
                    data.height = entity.fields.file.details.image.height;
                }
            }
        }
    }

    return data;
}
