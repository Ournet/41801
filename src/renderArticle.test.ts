
import renderArticle from './renderArticle';
import test from 'ava';

test('parse instagram', t => {

    const html = renderArticle(`
### Header

@[instagram](ID19010)


`);
    t.is(html.indexOf('class="instagram-media"') > 0, true, 'found instagram-media');
});
