
const assets: { [name: string]: string } = require('../public/static/rev-manifest.json');

export default {
    getName(name: string) {
        return assets[name];
    }
}
