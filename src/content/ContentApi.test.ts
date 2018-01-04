
require('dotenv').load();

import { ImplContentApi } from './ContentApi';
import test from 'ava';

const api = new ImplContentApi();

test('category', async t => {
    const category = await api.category('1IjH8VopI42qWcYQeukQOG_');

    t.is(null, category);
});

test('rootCategories', async t => {
    let categories = await api.rootCategories();

    t.is(true, categories.length > 0, 'many root categories');

    //for cache test
    categories = await api.rootCategories();
    t.is(true, categories.length > 0, 'many root categories');
});

test('article', async t => {
    const entity = await api.article('3g80f7DeaQyAuSU8Q2EYAM_');
    t.is(null, entity);
});