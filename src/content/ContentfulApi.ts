
const debug = require('debug')('41801-content');
import { createClient, ContentfulClientApi, Entry, EntryCollection } from 'contentful'

export interface ApiOptions {
    space: string
    accessToken: string
}

export interface EntityFields {
    [index: string]: any
}

export interface ContentfulEntity {
    sys?: any
    id: string
    createdAt: string
    updatedAt: string
    fields: EntityFields
}

export interface ApiQuery {
    limit: number
    content_type?: string
    select?: string
    [index: string]: string | number
}

export interface ContentfulEntityCollection<T extends ContentfulEntity> {
    total: number;
    skip: number;
    limit: number;
    items: Array<T>;
}

export class ContentfulApi {
    private client: ContentfulClientApi
    constructor(protected options: ApiOptions) {
        if (!options) {
            throw new Error(`options are required!`);
        }
        if (!options.space) {
            throw new Error(`options.space is required!`);
        }
        if (!options.accessToken) {
            throw new Error(`options.accessToken is required!`);
        }
        this.client = createClient({ ...this.options, ...{} });
    }

    // protected getEntry(id: string, query?: ApiQuery): Promise<ContentfulEntity> {
    //     return this.client.getEntry(id, query)
    //         .then(entry => {
    //             debug(`for getEntry ${id}, ${query} got: `, JSON.stringify(entry));
    //             return entryToEntity(entry)
    //         })
    //         .catch(catchError);
    // }

    protected getEntries(query: ApiQuery): Promise<ContentfulEntityCollection<ContentfulEntity>> {
        return this.client.getEntries(query)
            .then(data => {
                debug(`for getEntries ${query} got: `, JSON.stringify(data));
                return toEntityCollection(data)
            });
    }
}

// function catchError(error: any): null {
//     if (error) {
//         if (error.status === 404 || error.response && error.response.status === 404) {
//             return null;
//         }
//     }
//     throw error;
// }

function toEntityCollection(data: EntryCollection<ContentfulEntity>) {
    if (!data) {
        return null;
    }
    const collection: ContentfulEntityCollection<ContentfulEntity> = {
        total: data.total,
        skip: data.skip,
        limit: data.limit,
        items: data.items.map(item => entryToEntity(item, data.includes))
    };

    return collection;
}

function entryToEntity(entry: Entry<any>, includes?: any): ContentfulEntity {
    if (!entry || !entry.sys) {
        return null;
    }

    const entity: ContentfulEntity = {
        id: entry.sys.id,
        createdAt: entry.sys.createdAt,
        updatedAt: entry.sys.updatedAt,
        fields: entry.fields
    };

    if (entity.fields) {
        entity.fields = JSON.parse(JSON.stringify(entry.fields));
        const refData: { [id: string]: any } = {};

        Object.keys(entity.fields).forEach(key => {
            if (entity.fields[key].sys) {
                entity.fields[key] = entryToEntity(entity.fields[key]);
                refData[entity.fields[key].id] = entity.fields[key];
            }
        });

        if (includes) {
            // const refData: { [id: string]: any } = {};
            // Object.keys(entry.fields).forEach(key => {
            //     if (entry.fields[key].id && !entry.fields[key].fields) {
            //         refData[entry.fields[key].id] = entry.fields[key];
            //     }
            // });
            Object.keys(includes).forEach(type => {
                includes[type].forEach((item: any) => {
                    if (refData[item.sys.id]) {
                        refData[item.sys.id].fields = item.fields;
                    }
                })
            });
        }
    }

    return entity;
}
