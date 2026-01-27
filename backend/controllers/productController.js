const pool = require("../db");
const { publishDomainEvent } = require("../eventBus/eventPublisher");

exports.createProduct = async (req, res) => {
  const { name, price, quantity } = req.body;
  if (!name || price == null || quantity == null) {
    return res.status(400).json({ message: "All fields are required" });
  }
  try {
    const result = await pool.query(
      "INSERT INTO products (name, price, quantity) VALUES ($1, $2, $3) RETURNING *",
      [name, price, quantity]
    );
    const product = result.rows[0];

    const domainEvent = {
      eventName: "ProductCreated",
      entityId: product.id,
      timestamp: new Date().toISOString(),
      metadata: {
        name: product.name,
        price: product.price,
        quantity: product.quantity,
        requestedBy: req.user
          ? { id: req.user.id, username: req.user.username }
          : null,
        source: "products.create"
      }
    };

    publishDomainEvent(domainEvent);

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM products ORDER BY id DESC");
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM products WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, price, quantity } = req.body;
  try {
    const result = await pool.query(
      "UPDATE products SET name = $1, price = $2, quantity = $3 WHERE id = $4 RETURNING *",
      [name, price, quantity, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM products WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
