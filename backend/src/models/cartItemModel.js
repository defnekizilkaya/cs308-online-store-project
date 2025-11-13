const pool = require('../config/db');

const getItemWithProduct = async (itemId) => {
  const res = await pool.query(
    `SELECT ci.id,
            ci.cart_id,
            ci.product_id,
            ci.quantity,
            p.name,
            p.price
     FROM cart_items ci
     JOIN products p ON ci.product_id = p.id
     WHERE ci.id = $1`,
    [itemId]
  );
  return res.rows[0];
};

const CartItemModel = {
  async addOrUpdateItem(cartId, productId, quantity) {
    const res = await pool.query(
      `INSERT INTO cart_items (cart_id, product_id, quantity)
       VALUES ($1, $2, $3)
       ON CONFLICT (cart_id, product_id)
       DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity
       RETURNING id`,
      [cartId, productId, quantity]
    );

    return getItemWithProduct(res.rows[0].id);
  },

  async updateItemQuantity(itemId, quantity) {
    await pool.query(
      `UPDATE cart_items SET quantity = $1 WHERE id = $2`,
      [quantity, itemId]
    );

    return getItemWithProduct(itemId);
  },

  async removeItem(itemId) {
    await pool.query(`DELETE FROM cart_items WHERE id = $1`, [itemId]);
  },

  async getItemWithCart(itemId) {
    const res = await pool.query(
      `SELECT ci.id,
              ci.cart_id,
              ci.product_id,
              ci.quantity,
              c.user_id,
              p.name,
              p.price
       FROM cart_items ci
       JOIN carts c ON ci.cart_id = c.id
       JOIN products p ON ci.product_id = p.id
       WHERE ci.id = $1`,
      [itemId]
    );
    return res.rows[0];
  },
};

module.exports = CartItemModel;
