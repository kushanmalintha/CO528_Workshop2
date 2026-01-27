import { useEffect, useMemo, useState } from "react";
import "./Dashboard.css";

const API_BASE = "http://localhost:3000/api";

function Dashboard({ token, onLogout }) {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    quantity: "",
  });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isLoading, setIsLoading] = useState(true);

  const authHeaders = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
    }),
    [token]
  );

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/products`, {
        headers: authHeaders,
      });
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          onLogout?.();
        }
        throw new Error(data?.message || "Unable to load products.");
      }

      setProducts(data);
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const totalInventory = useMemo(
    () =>
      products.reduce(
        (total, product) => total + Number(product.quantity || 0),
        0
      ),
    [products]
  );

  const totalValue = useMemo(
    () =>
      products.reduce(
        (total, product) =>
          total +
          Number(product.quantity || 0) * Number(product.price || 0),
        0
      ),
    [products]
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: "", message: "" });

    try {
      const response = await fetch(`${API_BASE}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          price: Number(formData.price),
          quantity: Number(formData.quantity),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          onLogout?.();
        }
        throw new Error(data?.message || "Unable to add product.");
      }

      setStatus({ type: "success", message: "Product added successfully." });
      setFormData({ name: "", price: "", quantity: "" });
      setProducts((prev) => [data, ...prev]);
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <div>
          <p className="dashboard__eyebrow">Inventory Hub</p>
          <h1>Welcome back</h1>
          <p className="dashboard__subtext">
            Track product availability, adjust inventory, and add new stock in
            seconds.
          </p>
        </div>
        <button className="dashboard__logout" type="button" onClick={onLogout}>
          Log out
        </button>
      </header>

      <section className="dashboard__summary">
        <div className="summary-card">
          <p className="summary-card__label">Products</p>
          <h3>{products.length}</h3>
          <span>Items tracked today</span>
        </div>
        <div className="summary-card">
          <p className="summary-card__label">Total units</p>
          <h3>{totalInventory}</h3>
          <span>Units currently in stock</span>
        </div>
        <div className="summary-card">
          <p className="summary-card__label">Inventory value</p>
          <h3>
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "LKR",
            }).format(totalValue)}
          </h3>
          <span>Estimated retail worth</span>
        </div>
      </section>

      <section className="dashboard__content">
        <div className="dashboard__panel">
          <h2>Add a new product</h2>
          <p className="dashboard__panel-text">
            Keep the list fresh by recording new inventory as it arrives.
          </p>
          <form className="product-form" onSubmit={handleSubmit}>
            <label>
              Product name
              <input
                name="name"
                type="text"
                placeholder="Wireless Headphones"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Price (LKR)
              <input
                name="price"
                type="number"
                min="0"
                step="0.01"
                placeholder="149.99"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Quantity
              <input
                name="quantity"
                type="number"
                min="0"
                step="1"
                placeholder="25"
                value={formData.quantity}
                onChange={handleChange}
                required
              />
            </label>
            <button type="submit">Add product</button>
          </form>
          {status.message && (
            <p className={`form-status form-status--${status.type}`}>
              {status.message}
            </p>
          )}
        </div>

        <div className="dashboard__panel dashboard__panel--list">
          <div className="dashboard__panel-header">
            <div>
              <h2>Current inventory</h2>
              <p className="dashboard__panel-text">
                Live snapshot of items in stock.
              </p>
            </div>
            <button type="button" onClick={fetchProducts}>
              Refresh list
            </button>
          </div>

          {isLoading ? (
            <div className="empty-state">Loading inventory…</div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              No products yet. Add your first item to get started.
            </div>
          ) : (
            <div className="product-grid">
              {products.map((product) => (
                <article className="product-card" key={product.id}>
                  <div>
                    <h3>{product.name}</h3>
                    <p className="product-card__meta">
                      LKR {Number(product.price).toFixed(2)} ·{" "}
                      {product.quantity} units
                    </p>
                  </div>
                  <span className="product-card__badge">
                    {product.quantity > 0 ? "In stock" : "Out of stock"}
                  </span>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
