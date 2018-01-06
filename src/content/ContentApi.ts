
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

export interface FilterArticleParams {
    id?: string
    slug?: string
}

export interface FilterCategoryParams {
    id?: string
    slug?: string
}

export interface IContentApi {
    category(filter: FilterCategoryParams): Promise<CategoryEntity>
    rootCategories(): Promise<CategoryCollection>
    allCategories(): Promise<CategoryCollection>
    articles(filter: FilterArticlesParams): Promise<ArticleCollection>
    article(filter: FilterArticleParams): Promise<ArticleEntity>
}

export class ContentApi extends CacheContentfulApi implements IContentApi {
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

    article(filter: FilterArticleParams): Promise<ArticleEntity> {
        if (!filter || !filter.id && !filter.slug) {
            return Promise.reject(new Error(`parameter filter is invalid`));
        }
        const query: ApiQuery = {
            include: 1,
            limit: 1,
        };
        if (filter.slug) {
            query['fields.slug'] = filter.slug;
        } else {
            query['sys.id'] = filter.id;
        }
        return this.getArticles(query)
            .then(articles => articles.items.length && articles.items[0] || null);
    }

    articles(filter: FilterArticlesParams): Promise<ArticleCollection> {
        if (!filter) {
            return Promise.reject(new Error(`parameter filter is invalid`));
        }
        const query: ApiQuery = { limit: filter.limit };
        query.select = 'sys.id,sys.createdAt,sys.updatedAt,fields.title,fields.slug,fields.summary,fields.image,fields.category';

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

    category(filter: FilterCategoryParams): Promise<CategoryEntity> {
        if (!filter || !filter.id && !filter.slug) {
            return Promise.reject(new Error(`parameter filter is invalid`));
        }
        const query: ApiQuery = {
            include: 1,
            limit: 1,
        };
        if (filter.slug) {
            query['fields.slug'] = filter.slug;
        } else {
            query['sys.id'] = filter.id;
        }
        return this.getCategories(query)
            .then(collection => collection.items.length && collection.items[0] || null);
    }

    rootCategories(): Promise<CategoryCollection> {
        return this.getCategories({ order: 'fields.slug', 'fields.parent': null });
    }

    allCategories(): Promise<CategoryCollection> {
        return this.getCategories({ order: 'fields.slug' });
    }

    protected getArticles(query: any): Promise<ArticleCollection> {
        query.content_type = ContentTypes.ARTICLE;
        return this.getCacheEntries(ContentTypes.ARTICLE, query)
            .then(toArticles);
    }

    protected getCategories(query: any): Promise<CategoryCollection> {
        query.content_type = ContentTypes.CATEGORY;
        return this.getCacheEntries(ContentTypes.CATEGORY, query)
            .then(toCategories);
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


function toCategories(collection: ContentfulEntityCollection<ContentfulEntity>): CategoryCollection {
    const data: CategoryCollection = { total: 0, items: [] };
    if (!collection) {
        return data;
    }

    if (!collection.items) {
        data.total = collection.total || data.total;
        return data;
    }

    data.items = collection.items.map(toCategory);

    return data;
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
