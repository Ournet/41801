
const debug = require('debug')('41801-content');
import { ContentfulApi, ApiOptions, ContentfulEntity, ApiQuery, ContentfulEntityCollection } from './ContentfulApi';
import * as LRU from 'lru-cache';
const objectHash = require('object-hash');

export interface LruCacheOptions {
    max: number
    maxAge: number
}

export interface CacheApiOptions {
    [type: string]: {
        item?: LruCacheOptions
        collection?: LruCacheOptions
    }
}

interface CacheData {
    [type: string]: {
        item?: LRU.Cache<string, any>
        collection?: LRU.Cache<string, any>
    }
}

export class CacheContentfulApi extends ContentfulApi {
    private cache: CacheData
    constructor(options: ApiOptions, cacheOptions: CacheApiOptions) {
        super(options);

        this.cache = Object.keys(cacheOptions).reduce<CacheData>((data, type) => {
            data[type] = {};
            if (cacheOptions[type].item) {
                data[type].item = LRU(cacheOptions[type].item);
            }
            if (cacheOptions[type].collection) {
                data[type].collection = LRU(cacheOptions[type].collection);
            }

            return data;
        }, {});
    }

    // protected async getCacheEntry(type: string, id: string, query?: ApiQuery): Promise<ContentfulEntity> {
    //     const cache = this.cache[type] && this.cache[type].item;
    //     const key = id;

    //     if (cache) {
    //         const value = cache.get(key);
    //         if (value !== undefined) {
    //             debug(`got from cache: ${type}=${id}`);
    //             return Promise.resolve(value);
    //         }
    //     }

    //     return this.getEntry(id, query)
    //         .then(entity => {
    //             if (cache) {
    //                 debug(`put to cache: ${type}=${id}`);
    //                 cache.set(key, entity);
    //             }
    //             return entity;
    //         });
    // }

    protected async getCacheEntries<T extends ContentfulEntity>(type: string, query: ApiQuery): Promise<ContentfulEntityCollection<ContentfulEntity>> {
        const cache = this.cache[type] && (query.limit > 1 ? this.cache[type].collection : this.cache[type].item);
        const key = type + '_' + objectHash(query);

        if (cache) {
            const value = cache.get(key) as ContentfulEntityCollection<T>;
            if (value !== undefined) {
                debug(`got from cache: ${key}=${query}`);
                return Promise.resolve(value);
            }
        }

        return this.getEntries(query)
            .then(collection => {
                if (cache) {
                    debug(`put to cache: ${key}=${query}`);
                    cache.set(key, collection);
                }
                return collection;
            });
    }
}
