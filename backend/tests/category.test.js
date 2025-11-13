const request = require('supertest');
const app = require('../server');
const knex = require('../src/db/knex');

describe('Category API Tests', () => {
  const testCategories = [
    { name: 'Smartphones', description: 'Smart devices and phones' },
    { name: 'Accessories', description: 'Gadgets and accessories' },
  ];

  const createdCategoryIds = [];

  beforeAll(async () => {
    for (const category of testCategories) {
      const [inserted] = await knex('categories').insert(category).returning('*');
      createdCategoryIds.push(inserted.id);
    }
  });

  afterAll(async () => {
    if (createdCategoryIds.length) {
      await knex('categories').whereIn('id', createdCategoryIds).del();
    }
    await knex.destroy();
  });

  test('GET /api/categories - should return list of categories', async () => {
    const res = await request(app).get('/api/categories');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.count).toBe(res.body.data.length);

    const names = res.body.data.map((category) => category.name);
    for (const category of testCategories) {
      expect(names).toContain(category.name);
    }
  });
});