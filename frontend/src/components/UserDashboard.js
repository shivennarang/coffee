import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function UserDashboard() {
  const [products, setProducts] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch all products, wishlist, and cart count
    const fetchData = async () => {
      try {
        const productsResponse = await axios.get('http://localhost:5000/products', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setProducts(productsResponse.data);

        const wishlistResponse = await axios.get('http://localhost:5000/wishlist', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const wishlistData = wishlistResponse.data;
        setWishlist(wishlistData.map(item => item._id));
        setWishlistProducts(wishlistData);

        const cartResponse = await axios.get('http://localhost:5000/cart', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const cartData = cartResponse.data;
        setCart(cartData.map(item => item._id));
        setCartCount(cartData.length);
      } catch (error) {
        console.error('Error fetching data:', error);
        alert('Error fetching data. Please try again later.');
      }
    };
    fetchData();
  }, []);

  const handleLike = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      if (wishlist.includes(productId)) {
        await axios.delete(`http://localhost:5000/wishlist/${productId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        setWishlist(wishlist.filter(id => id !== productId));
        setWishlistProducts(wishlistProducts.filter(product => product._id !== productId));
      } else {
        await axios.post('http://localhost:5000/wishlist', { productId }, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const wishlistResponse = await axios.get('http://localhost:5000/wishlist', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const wishlistData = wishlistResponse.data;
        setWishlist(wishlistData.map(item => item._id));
        setWishlistProducts(wishlistData);
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      alert('Error updating wishlist. Please try again later.');
    }
  };

  const handleAddToCart = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      if (cart.includes(productId)) {
        await axios.delete(`http://localhost:5000/cart/${productId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        setCart(cart.filter(id => id !== productId));
        setCartCount(cartCount - 1);
      } else {
        await axios.post('http://localhost:5000/cart', { productId }, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        setCart([...cart, productId]);
        setCartCount(cartCount + 1);
      }
    } catch (error) {
      console.error('Error updating cart:', error);
      alert('Error updating cart. Please try again later.');
    }
  };

  const goToCart = () => {
    navigate('/cart');
  };

  const goToHistory = () => {
    navigate('/history');
  };

  return (
    <div>
      <h1>Welcome to E-Coffee Shop</h1>
      <button onClick={goToCart}>Go to Cart ({cartCount})</button>
      <button onClick={goToHistory}>Order History</button>
      <h2>Products</h2>
      <div className="product-list">
        {products.map((product) => (
          <div className="product-card" key={product._id}>
            <img src={`http://localhost:5000/uploads/${product.photo}`} alt={product.coffeeName} />
            <h3>{product.coffeeName}</h3>
            <p>${product.rate}</p>
            <button onClick={() => handleAddToCart(product._id)}>
              {cart.includes(product._id) ? 'Remove from Cart' : 'Add to Cart'}
            </button>
            <button onClick={() => handleLike(product._id)}>
              {wishlist.includes(product._id) ? 'Unlike' : 'Like'}
            </button>
          </div>
        ))}
      </div>
      <h2>Wishlist Count: {wishlist.length}</h2>
      <h2>Wishlist</h2>
      <div className="wishlist-list">
        {wishlistProducts.map((product) => (
          <div className="product-card" key={product._id}>
            <img src={`http://localhost:5000/uploads/${product.photo}`} alt={product.coffeeName} />
            <h3>{product.coffeeName}</h3>
            <p>${product.rate}</p>
            <button onClick={() => handleAddToCart(product._id)}>
              {cart.includes(product._id) ? 'Remove from Cart' : 'Add to Cart'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UserDashboard;
