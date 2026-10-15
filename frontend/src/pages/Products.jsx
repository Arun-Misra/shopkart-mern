import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import "./Products.css";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const [searchInputState, setSearchInputState] = useState({
    urlSearch: search,
    value: search,
  });
  const searchInput =
    searchInputState.urlSearch === search ? searchInputState.value : search;
  const [wishlistIds, setWishlistIds] = useState([]);

  const updateQueryParams = (updates) => {
    setSearchParams((currentParams) => {
      const nextParams = new URLSearchParams(currentParams);

      Object.entries(updates).forEach(([key, value]) => {
        const normalizedValue = value.trim();
        if (normalizedValue) {
          nextParams.set(key, normalizedValue);
        } else {
          nextParams.delete(key);
        }
      });

      return nextParams;
    });
  };

  const handleSearch = () => {
    updateQueryParams({ search: searchInput });
  };

  useEffect(() => {
    let cancelled = false;

    const fetchWishlist = async () => {
      try {
        const response = await api.get("/wishlist");

        if (!cancelled) {
          setWishlistIds(
            response.data.wishlist.map((product) => product._id)
          );
        }
      } catch {
        if (!cancelled) {
          setWishlistIds([]);
        }
      }
    };

    fetchWishlist();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleWishlistChange = (productId, saved) => {
    setWishlistIds((current) =>
      saved
        ? [...current, productId]
        : current.filter((id) => id !== productId)
    );
  };

  useEffect(() => {
    let cancelled = false;

    const fetchProducts = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("/products", {
          params: {
            search,
            category,
          },
        });

        if (!cancelled) {
          setProducts(response.data.products);
        }
      } catch {
        if (!cancelled) {
          setError("Something went wrong while loading products.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      cancelled = true;
    };
  }, [search, category]);

  return (
    <div className="products-page">
      <Navbar
        tagline="Curated products for everyday life."
        wishlistCount={wishlistIds.length}
      />

      <div className="products-container">
        <div className="product-filters">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search products..."
              value={searchInput}
              onChange={(e) =>
                setSearchInputState({
                  urlSearch: search,
                  value: e.target.value,
                })
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
            />

            <button onClick={handleSearch}>Search</button>
          </div>

          <select
            value={category}
            onChange={(e) => updateQueryParams({ category: e.target.value })}
          >
            <option value="">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Clothing">Clothing</option>
            <option value="Books">Books</option>
          </select>
        </div>

        {loading ? (
          <p className="product-loading">Loading products...</p>
        ) : error ? (
          <p className="product-empty">{error}</p>
        ) : products.length === 0 ? (
          <p className="product-empty">No products found.</p>
        ) : (
          <div className="products-list">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                isWishlisted={wishlistIds.includes(product._id)}
                onChange={handleWishlistChange}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Products;
