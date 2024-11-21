import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    coffeeName: '',
    rate: '',
    photo: null,
  });

  const adminId = localStorage.getItem('adminId');

  useEffect(() => {
    // Fetch products and users
    const fetchData = async () => {
      try {
        const productsResponse = await axios.get('http://localhost:5000/products', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const usersResponse = await axios.get('http://localhost:5000/users', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setProducts(productsResponse.data);
        setUsers(usersResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        alert('Error fetching data. Please try again later.');
      }
    };
    fetchData();
  }, [adminId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      photo: e.target.files[0],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    for (const key in formData) {
      data.append(key, formData[key]);
    }
    data.append('adminId', adminId);

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/products', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
      });
      alert('Product added successfully');
      // Refresh products list
      const productsResponse = await axios.get('http://localhost:5000/products', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setProducts(productsResponse.data);
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Error adding product. Please try again later.');
    }
  };

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Coffee Name:</label>
          <input type="text" name="coffeeName" value={formData.coffeeName} onChange={handleChange} required />
        </div>
        <div>
          <label>Rate:</label>
          <input type="number" name="rate" value={formData.rate} onChange={handleChange} required />
        </div>
        <div>
          <label>Photo:</label>
          <input type="file" name="photo" onChange={handleFileChange} required />
        </div>
        <button type="submit">Add Product</button>
      </form>
      <h2>Products</h2>
      <div className="product-list">
        {products.map((product) => (
          <div className="product-card" key={product._id}>
            <img src={`http://localhost:5000/uploads/${product.photo}`} alt={product.coffeeName} />
            <h3>{product.coffeeName}</h3>
            <p>${product.rate}</p>
          </div>
        ))}
      </div>
      <h2>Users</h2>
      <ul>
        {users.map((user) => (
          <li key={user._id}>{user.name} - {user.email}</li>
        ))}
      </ul>
    </div>
  );
}

export default AdminDashboard;
