
import * as Url from 'url'
import * as marked from 'marked';
// const atonic = require('atonic');
const renderer = new marked.Renderer();

renderer.image = function (href: string, title: string, text: string) {
    let imageId = '';
    const result = /images\.contentful\.com\/[a-zA-Z0-9]+\/[a-zA-Z0-9]+\/([a-zA-Z0-9]+)\//.exec(href);
    if (result) {
        const urlParts = Url.parse(href, false);
        href = `${urlParts.pathname}?w=650&q=90`;
        imageId = 'image-' + result[1];
    }
    title = encodeURIComponent(title || text);
    text = encodeURIComponent(text);
    return `<a class="article_pic_a js-article-image" name="${imageId}" href="#${imageId}" data-id="${imageId}"><img class="article_pic" alt="${text}" src="${href}" /></a>`
}

export default function render(text: string) {
    return marked(text, { renderer: renderer });
}
