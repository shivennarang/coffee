import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Signup() {
  const [role, setRole] = useState('user');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    coffeeShopName: '',
    logo: null,
    description: '',
    address: '',
    authorize: false,
  });
  const navigate = useNavigate();

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
      logo: e.target.files[0],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    for (const key in formData) {
      data.append(key, formData[key]);
    }

    try {
      const response = await axios.post('http://localhost:5000/signup', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert(response.data);
      navigate('/login'); // Redirect to login page
    } catch (error) {
      alert('Error signing up: ' + error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>
          <input
            type="radio"
            value="user"
            checked={role === 'user'}
            onChange={() => setRole('user')}
          />
          User
        </label>
        <label>
          <input
            type="radio"
            value="admin"
            checked={role === 'admin'}
            onChange={() => setRole('admin')}
          />
          Admin
        </label>
      </div>

      {role === 'user' && (
        <>
          <div>
            <label>Name:</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required />
          </div>
          <div>
            <label>Email:</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>
          <div>
            <label>Password:</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required />
          </div>
          <div>
            <label>
              <input type="checkbox" name="authorize" checked={formData.authorize} onChange={handleChange} />
              I authorize all this stuff
            </label>
          </div>
        </>
      )}

      {role === 'admin' && (
        <>
          <div>
            <label>Name of Coffee Shop:</label>
            <input type="text" name="coffeeShopName" value={formData.coffeeShopName} onChange={handleChange} required />
          </div>
          <div>
            <label>Upload Logo:</label>
            <input type="file" name="logo" onChange={handleFileChange} required />
          </div>
          <div>
            <label>Name:</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required />
          </div>
          <div>
            <label>Email:</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>
          <div>
            <label>Password:</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required />
          </div>
          <div>
            <label>Description:</label>
            <textarea name="description" value={formData.description} onChange={handleChange} required />
          </div>
          <div>
            <label>Address:</label>
            <input type="text" name="address" value={formData.address} onChange={handleChange} required />
          </div>
        </>
      )}

      <button type="submit">Signup</button>
    </form>
  );
}

export default Signup;
