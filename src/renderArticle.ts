
import * as Url from 'url'
import * as marked from 'marked';
import config from './config';
// const atonic = require('atonic');
const renderer = new marked.Renderer();
// const defaultLink = renderer.link;
// const defaultImage = renderer.image;

export default function render(text: string) {
    text = text.replace(/(<([^>]+)>)/ig, '');
    text = replaceInstagram(text, config.locale);
    return marked(text, {
        renderer: renderer,
        // accpt HTML
        sanitize: false
    });
}

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
    return `<p><a class="article_pic_a js-article-image" name="${imageId}" href="#${imageId}" data-id="${imageId}"><img class="article_pic" alt="${text}" src="${href}" /></a></p>`
}

function replaceInstagram(text: string, locale: string) {
    const reg = /@\[instagram\]\((?:https\:\/\/www\.instagram\.com\/p\/([a-zA-Z0-9-]{6,24}).*|([a-zA-Z0-9-]{6,24}))\)/;
    let result;
    while (result = reg.exec(text)) {
        const id = result[1];
        const html = `<blockquote class="instagram-media" data-instgrm-permalink="https://www.instagram.com/p/${id}/" data-instgrm-version="8" style=" background:#FFF; border:0; border-radius:3px; box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15); margin: 1px; max-width:658px; padding:0; width:99.375%; width:-webkit-calc(100% - 2px); width:calc(100% - 2px);">
        <div style="padding:8px;">
            <div style=" background:#F8F8F8; line-height:0; margin-top:40px; padding:28.10185185185185% 0; text-align:center; width:100%;">
                <div style=" background:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACwAAAAsCAMAAAApWqozAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAMUExURczMzPf399fX1+bm5mzY9AMAAADiSURBVDjLvZXbEsMgCES5/P8/t9FuRVCRmU73JWlzosgSIIZURCjo/ad+EQJJB4Hv8BFt+IDpQoCx1wjOSBFhh2XssxEIYn3ulI/6MNReE07UIWJEv8UEOWDS88LY97kqyTliJKKtuYBbruAyVh5wOHiXmpi5we58Ek028czwyuQdLKPG1Bkb4NnM+VeAnfHqn1k4+GPT6uGQcvu2h2OVuIf/gWUFyy8OWEpdyZSa3aVCqpVoVvzZZ2VTnn2wU8qzVjDDetO90GSy9mVLqtgYSy231MxrY6I2gGqjrTY0L8fxCxfCBbhWrsYYAAAAAElFTkSuQmCC); display:block; height:44px; margin:0 auto -44px; position:relative; top:-22px; width:44px;"></div>
            </div>
        </div>
    </blockquote>
    <script async defer src="//platform.instagram.com/${locale}/embeds.js"></script>`;

        text = text.replace(result[0], html);
    }

    return text;
}