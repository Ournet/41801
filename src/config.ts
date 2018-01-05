
export interface IConfig {
    name: string
    host: string
    domain: string
    schema: string
    language: string
    locale: string
}

const config: IConfig = {
    name: '41801',
    host: 'localhost:41801',
    domain: 'localhost:41801',
    schema: 'https:',
    language: 'ro',
    locale: 'ro_RO',
}

export default config;
