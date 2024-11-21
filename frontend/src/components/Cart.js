import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const response = await axios.get('http://localhost:5000/cart', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setCartItems(response.data);
      } catch (error) {
        console.error('Error fetching cart items:', error);
        alert('Error fetching cart items. Please try again later.');
      }
    };
    fetchCartItems();
  }, []);

  const handlePayment = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/payment', { cartItems }, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setPaymentSuccess(true);
      setCartItems([]);
      setTimeout(() => {
        navigate('/user-dashboard'); // Redirect to user dashboard after payment
      }, 2000);
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Error processing payment. Please try again later.');
    }
  };

  return (
    <div>
      <h1>Cart</h1>
      <div className="cart-list">
        {cartItems.map((item) => (
          <div className="cart-item" key={item._id}>
            <img src={`http://localhost:5000/uploads/${item.photo}`} alt={item.coffeeName} />
            <h3>{item.coffeeName}</h3>
            <p>${item.rate}</p>
          </div>
        ))}
      </div>
      {cartItems.length > 0 && (
        <button onClick={handlePayment}>Proceed to Payment</button>
      )}
      {paymentSuccess && <p>Payment successful! Redirecting to dashboard...</p>}
    </div>
  );
}

export default Cart;
