const pool = require("./db");

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

    res.status(201).json(result.rows[0]);
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
