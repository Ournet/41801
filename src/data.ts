import { ContentApi } from "./content/ContentApi";


export const Data = new ContentApi();

export class DataContainer {
    private container: { [key: string]: Promise<any> } = {}

    getData() {
        const keys = Object.keys(this.container);
        const values = keys.map(key => this.container[key]);

        return Promise.all(values)
            .then(result => keys.reduce<{ [key: string]: any }>((data, key, index) => {
                data[key] = result[index];
                return data;
            }, {}));
    }

    push(key: string, promise: Promise<any>) {
        if (this.container[key]) {
            throw new Error(`key ${key} already exists`);
        }
        this.container[key] = promise;

        return this;
    }
}