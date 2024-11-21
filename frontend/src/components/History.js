import React, { useState, useEffect } from 'react';
import axios from 'axios';

function History() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get('http://localhost:5000/orders', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setOrders(response.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
        alert('Error fetching orders. Please try again later.');
      }
    };
    fetchOrders();
  }, []);

  return (
    <div>
      <h1>Order History</h1>
      <div className="order-list">
        {orders.map((order) => (
          <div className="product-card" key={order._id}>
            <h3>{order.productName}</h3>
            <p>Ordered by: {order.userName}</p>
            <p>Price: ${order.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default History;
