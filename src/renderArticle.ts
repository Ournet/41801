
import * as marked from 'marked';
const renderer = new marked.Renderer();

renderer.image = function (href: string, title: string, text: string) {
    title = encodeURIComponent(title || text);
    text = encodeURIComponent(text);
    return `<a class="article_pic_a" href="#${title}"><img class="article_pic" alt="${text}" src="${href}" /></a>`
}

export default function render(text: string) {
    return marked(text, { renderer: renderer });
}
