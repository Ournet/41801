
var i18n = require('i18n');
import { join } from 'path';
import config from './config';

i18n.configure({
    locales: [config.language],
    directory: join(__dirname, '../locales')
});

export default i18n.init as any