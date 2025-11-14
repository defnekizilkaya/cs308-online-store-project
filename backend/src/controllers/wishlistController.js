// src/controllers/wishlistController.js
const WishlistModel = require("../models/wishlistModel");
const CartModel = require('../models/cartModel');
const CartItemModel = require('../models/cartItemModel');
const Product = require('../models/product.model');

exports.getWishlist = async (req, res) => {
  const userId = req.user?.id || req.user?.sub;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const items = await WishlistModel.getWishlistItems(userId);
    return res.json({ items });
  } catch (err) {
    console.error("WISHLIST GET ERR:", err);
    return res.status(500).json({ message: "Failed to fetch wishlist" });
  }
};

exports.addToWishlist = async (req, res) => {
  const userId = req.user?.id || req.user?.sub;
  const { productId } = req.body || {};

  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  if (!productId) return res.status(400).json({ message: "productId required" });

  try {
    const wishlist = await WishlistModel.ensureWishlist(userId);

    // Duplicate prevention is handled by DB UNIQUE constraint.
    const item = await WishlistModel.addItem(wishlist.id, productId);

    return res.status(201).json(item);
  } catch (err) {
    if (err.code === "23505") {
      return res
        .status(409)
        .json({ message: "Product already in wishlist" });
    }
    console.error("ADD WISHLIST ERR:", err);
    return res.status(500).json({ message: "Failed to add wishlist item" });
  }
};

exports.removeFromWishlist = async (req, res) => {
  const userId = req.user?.id || req.user?.sub;
  const itemId = Number(req.params.id);

  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  if (!itemId) return res.status(400).json({ message: "Invalid item id" });

  try {
    const item = await WishlistModel.findItemById(itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    if (Number(item.user_id) !== Number(userId)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await WishlistModel.removeItem(itemId);

    return res.json({ message: "Wishlist item removed" });
  } catch (err) {
    console.error("REMOVE WISHLIST ERR:", err);
    return res.status(500).json({ message: "Failed to remove item" });
  }
};

exports.moveToCart = async (req, res) => {
  const userId = req.user?.id || req.user?.sub;
  const itemId = Number(req.params.id);

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (!Number.isInteger(itemId)) {
    return res.status(400).json({ message: 'Invalid wishlist item id' });
  }

  try {
    // 1) Wishlist item + owner kontrolü
    const item = await WishlistModel.findItemById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Wishlist item not found' });
    }

    if (Number(item.user_id) !== Number(userId)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // 2) Ürün bilgisi + stok kontrolü
    const product = await Product.findById(item.product_id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (!product.quantity_in_stock || Number(product.quantity_in_stock) <= 0) {
      return res.status(409).json({ message: 'Product is out of stock' });
    }

    // 3) Kullanıcının sepetini al/oluştur
    const cart = await CartModel.ensureCart(userId);

    // 4) Sepete ekle (varsa quantity+1 yapar, yoksa yeni item yaratır)
    const cartItem = await CartItemModel.addOrUpdateItem(
      cart.id,
      item.product_id,
      1
    );

    // 5) Wishlist'ten sil
    await WishlistModel.removeItem(itemId);

    const responseItem = {
      id: cartItem.id,
      productId: cartItem.product_id,
      name: cartItem.name,
      quantity: Number(cartItem.quantity),
      unitPrice: Number(cartItem.price),
      totalPrice: Number(cartItem.price) * Number(cartItem.quantity),
    };

    return res.json(responseItem);
} catch (err) {
  if (err.code === '23505') {
    return res.status(409).json({ message: 'Product already in wishlist' });
  }
  if (err.code === '23503') {
    return res.status(400).json({ message: 'Invalid productId' });
  }
  console.error('ADD WISHLIST ERR:', err);
  return res.status(500).json({ message: 'Failed to add wishlist item' });
}
};
