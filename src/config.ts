
export interface IConfig {
    name: string
    host: string
    domain: string
    language: string
    schema: string
}

const config: IConfig = {
    name: '41801',
    host: 'localhost:41801',
    domain: 'localhost:41801',
    language: 'ro',
    schema: 'https:'
}

export default config;
