const knex = require('../db/knex');

class Product {
  /**
   * Find all products with optional filtering, searching and sorting
   * @param {Object} options - Query options
   * @param {number} options.page - Page number
   * @param {number} options.limit - Items per page
   * @param {string} options.search - Search term for name/description
   * @param {string} options.sort - Sort option (price_asc, price_desc, name_asc, name_desc)
   * @param {number} options.category_id - Filter by category ID
   */
  static async findAll(options = {}) {
    const { 
      page = 1, 
      limit = 100, 
      search = '', 
      sort = '', 
      category_id = null 
    } = options;

    const offset = (page - 1) * limit;
    let query = knex('products').select('*');

    // Search functionality
    if (search) {
      query = query.where(function() {
        this.where('name', 'ilike', `%${search}%`)
            .orWhere('description', 'ilike', `%${search}%`);
      });
    }

    // Category filter
    if (category_id) {
      query = query.where('category_id', category_id);
    }

    // Sorting
    switch (sort) {
      case 'price_asc':
        query = query.orderBy('price', 'asc');
        break;
      case 'price_desc':
        query = query.orderBy('price', 'desc');
        break;
      case 'name_asc':
        query = query.orderBy('name', 'asc');
        break;
      case 'name_desc':
        query = query.orderBy('name', 'desc');
        break;
      case 'newest':
        query = query.orderBy('created_at', 'desc');
        break;
      default:
        query = query.orderBy('id', 'asc');
    }

    // Pagination
    query = query.limit(limit).offset(offset);

    return query;
  }

  static async findById(id) {
    return knex('products')
      .where({ id })
      .first();
  }

  static async create(productData) {
    const [product] = await knex('products')
      .insert(productData)
      .returning('*');
    return product;
  }

  static async update(id, productData) {
    const [product] = await knex('products')
      .where({ id })
      .update(productData)
      .returning('*');
    return product;
  }

  static async delete(id) {
    return knex('products')
      .where({ id })
      .del();
  }
}

module.exports = Product;