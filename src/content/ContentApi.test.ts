
require('dotenv').config();

import { ContentApi } from './ContentApi';
import test from 'ava';

const api = new ContentApi();

test('category', async t => {
    const category = await api.category({ id: '1IjH8VopI42qWcYQeukQOG_' });

    t.is(null, category);
});

test('rootCategories', async t => {
    let categories = await api.rootCategories();

    t.is(true, categories.length > 0, 'many root categories');

    //for cache test
    categories = await api.rootCategories();
    t.is(true, categories.length > 0, 'many root categories');
});

test('mainCategories', async t => {
    let categories = await api.mainCategories(10);

    t.is(true, categories.length === 0, 'many main categories');
});

test('article', async t => {
    const entity = await api.article({ id: '3g80f7DeaQyAuSU8Q2EYAM_' });
    t.is(null, entity);
});
