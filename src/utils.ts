
import config from './config';
import * as marked from 'marked';
const moment = require('moment-timezone');

export { moment }

export function canonical(url: string) {
    return `${config.schema}//${config.host}${url}`;
}

export function parseArticle(md: string) {
    const html = marked(md, { sanitize: true });

    return html;
}
