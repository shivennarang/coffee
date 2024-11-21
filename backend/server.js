const express = require('express');
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Product = require('./models/Product');
const Wishlist = require('./models/Wishlist');
const Cart = require('./models/Cart'); // Import the Cart model
const Payment = require('./models/Payment'); // Ensure this is correctly imported

const app = express();
const upload = multer({ dest: 'public/uploads/' });
const jwtSecret = 'your_jwt_secret'; // Ensure this is consistent

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

mongoose.connect('mongodb://localhost:27017/coff', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.post('/signup', upload.single('logo'), async (req, res) => {
  const { name, email, password, coffeeShopName, description, address, authorize } = req.body;
  const logo = req.file ? req.file.filename : null;

  const newUser = new User({
    name,
    email,
    password,
    role: coffeeShopName ? 'admin' : 'user',
    coffeeShopName,
    logo,
    description,
    address,
    authorize: authorize === 'true',
  });

  try {
    await newUser.save();
    res.send('Signup successful');
  } catch (error) {
    res.status(500).send('Error saving user: ' + error.message);
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email, password });
    if (!user) {
      console.log('Invalid credentials:', { email, password });
      return res.status(401).send('Invalid credentials');
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, jwtSecret, { expiresIn: '1h' });
    res.json({ token, role: user.role, userId: user._id });
  } catch (error) {
    console.log('Error logging in:', error.message);
    res.status(500).send('Error logging in: ' + error.message);
  }
});

app.post('/products', upload.single('photo'), async (req, res) => {
  const { coffeeName, rate } = req.body;
  const photo = req.file ? req.file.filename : null;
  const token = req.headers.authorization.split(' ')[1];
  const decoded = jwt.verify(token, jwtSecret);
  const adminId = decoded.userId;

  console.log('Adding product:', { coffeeName, rate, adminId, photo });

  const newProduct = new Product({
    coffeeName,
    rate,
    photo,
    admin: adminId,
  });

  try {
    await newProduct.save();
    res.send('Product added successfully');
  } catch (error) {
    console.log('Error adding product:', error.message);
    res.status(500).send('Error adding product: ' + error.message);
  }
});

app.get('/products', async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  const decoded = jwt.verify(token, jwtSecret);
  const role = decoded.role;
  console.log('Fetching products for role:', role);
  try {
    let products;
    if (role === 'admin') {
      const adminId = decoded.userId;
      products = await Product.find({ admin: adminId });
    } else {
      products = await Product.find();
    }
    console.log('Products found:', products);
    res.json(products);
  } catch (error) {
    console.log('Error fetching products:', error.message);
    res.status(500).send('Error fetching products: ' + error.message);
  }
});

app.post('/wishlist', async (req, res) => {
  const { productId } = req.body;
  const token = req.headers.authorization.split(' ')[1];
  const decoded = jwt.verify(token, jwtSecret);
  const userId = decoded.userId;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).send('Product not found');
    }

    const newWishlistItem = new Wishlist({
      user: userId,
      product: productId,
    });

    await newWishlistItem.save();
    res.send('Product added to wishlist');
  } catch (error) {
    console.log('Error adding to wishlist:', error.message);
    res.status(500).send('Error adding to wishlist: ' + error.message);
  }
});

app.get('/wishlist', async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  const decoded = jwt.verify(token, jwtSecret);
  const userId = decoded.userId;

  try {
    const wishlistItems = await Wishlist.find({ user: userId }).populate('product');
    res.json(wishlistItems.map(item => item.product));
  } catch (error) {
    console.log('Error fetching wishlist:', error.message);
    res.status(500).send('Error fetching wishlist: ' + error.message);
  }
});

app.get('/wishlist/count', async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  const decoded = jwt.verify(token, jwtSecret);
  const userId = decoded.userId;

  try {
    const count = await Wishlist.countDocuments({ user: userId });
    res.json({ count });
  } catch (error) {
    console.log('Error fetching wishlist count:', error.message);
    res.status(500).send('Error fetching wishlist count: ' + error.message);
  }
});

app.delete('/wishlist/:productId', async (req, res) => {
  const { productId } = req.params;
  const token = req.headers.authorization.split(' ')[1];
  const decoded = jwt.verify(token, jwtSecret);
  const userId = decoded.userId;

  try {
    await Wishlist.findOneAndDelete({ user: userId, product: productId });
    res.send('Product removed from wishlist');
  } catch (error) {
    console.log('Error removing from wishlist:', error.message);
    res.status(500).send('Error removing from wishlist: ' + error.message);
  }
});

app.post('/cart', async (req, res) => {
  const { productId } = req.body;
  const token = req.headers.authorization.split(' ')[1];
  const decoded = jwt.verify(token, jwtSecret);
  const userId = decoded.userId;

  try {
    const newCartItem = new Cart({
      user: userId,
      product: productId,
    });

    await newCartItem.save();
    res.send('Product added to cart');
  } catch (error) {
    console.log('Error adding to cart:', error.message);
    res.status(500).send('Error adding to cart: ' + error.message);
  }
});

app.get('/cart', async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  const decoded = jwt.verify(token, jwtSecret);
  const userId = decoded.userId;

  try {
    const cartItems = await Cart.find({ user: userId }).populate('product');
    res.json(cartItems.map(item => item.product));
  } catch (error) {
    console.log('Error fetching cart items:', error.message);
    res.status(500).send('Error fetching cart items: ' + error.message);
  }
});

app.get('/cart/count', async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  const decoded = jwt.verify(token, jwtSecret);
  const userId = decoded.userId;

  try {
    const count = await Cart.countDocuments({ user: userId });
    res.json({ count });
  } catch (error) {
    console.log('Error fetching cart count:', error.message);
    res.status(500).send('Error fetching cart count: ' + error.message);
  }
});

app.delete('/cart/:productId', async (req, res) => {
  const { productId } = req.params;
  const token = req.headers.authorization.split(' ')[1];
  const decoded = jwt.verify(token, jwtSecret);
  const userId = decoded.userId;

  try {
    await Cart.findOneAndDelete({ user: userId, product: productId });
    res.send('Product removed from cart');
  } catch (error) {
    console.log('Error removing from cart:', error.message);
    res.status(500).send('Error removing from cart: ' + error.message);
  }
});

app.post('/payment', async (req, res) => {
  const { cartItems } = req.body;
  const token = req.headers.authorization.split(' ')[1];
  const decoded = jwt.verify(token, jwtSecret);
  const userId = decoded.userId;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send('User not found');
    }

    const orders = cartItems.map(item => ({
      userId,
      userName: user.name,
      productName: item.coffeeName,
      price: item.rate,
    }));

    await Payment.insertMany(orders); // Use insertMany to insert multiple documents
    await Cart.deleteMany({ user: userId }); // Clear the cart after payment

    res.send('Payment successful and order placed');
  } catch (error) {
    console.log('Error processing payment:', error.message);
    res.status(500).send('Error processing payment: ' + error.message);
  }
});

app.get('/orders', async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  const decoded = jwt.verify(token, jwtSecret);
  const userId = decoded.userId;

  try {
    const orders = await Payment.find({ userId });
    res.json(orders);
  } catch (error) {
    console.log('Error fetching orders:', error.message);
    res.status(500).send('Error fetching orders: ' + error.message);
  }
});

app.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).send('Error fetching users: ' + error.message);
  }
});

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});