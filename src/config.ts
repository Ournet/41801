
export interface IConfig {
    name: string
    host: string
    domain: string
    schema: string
    language: string
    locale: string
}

const config: IConfig = require('../package.json').descopero;

export default config;
