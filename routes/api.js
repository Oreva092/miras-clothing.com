import * as dotenv from 'dotenv';
dotenv.config();

import fetch from 'node-fetch';

import express from 'express';
import nodemailer from 'nodemailer';
import Subscriber from '../models/Subscriber.js';
import Contact from '../models/Contact.js';
import User from '../models/User.js';
import Cart from '../models/Cart.js';
import Wishlist from '../models/Wishlist.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

const router = express.Router();

// Email transporter setup using Brevo
const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASS
  }
});

// ✅ SUBSCRIBE ROUTE
router.post('/subscribe', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  try {
    const existing = await Subscriber.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'This email is already subscribed!' });
    }

    const newSubscriber = new Subscriber({ email });
    await newSubscriber.save();

    // Respond immediately — don't wait for the email to send
    res.json({ success: true, message: "You've successfully subscribed!" });

    // Send confirmation email in the background
    transporter.sendMail({
      from: `"Mira's Clothing" <${process.env.BREVO_SMTP_USER}>`,
      to: email,
      subject: "You're subscribed to Mira's Clothing! 🎉",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
          <h2 style="color: #e36d3b;">Welcome to Mira's Clothing!</h2>
          <p>Thank you for subscribing to our newsletter.</p>
          <p>You'll be the first to know about new arrivals, promotions and more!</p>
          <br/>
          <p style="color: #636363;">— The Mira's Clothing Team</p>
        </div>
      `
    }).then(() => {
      console.log('✅ Confirmation email sent to:', email);
    }).catch((emailError) => {
      console.error('Email sending failed:', emailError.message);
    });

  } catch (error) {
    console.error('Subscribe error:', error.message);
    return res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
  }
});

// ✅ CONTACT FORM ROUTE
router.post('/contact', async (req, res) => {
  const { name, phone, message } = req.body;

  if (!name || !phone || !message) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  try {
    const newContact = new Contact({ name, phone, message });
    await newContact.save();

    // Respond immediately — don't wait for the email to send
    res.json({ success: true, message: 'Your message has been sent successfully!' });

    // Send notification email in the background
    transporter.sendMail({
      from: `"Mira's Clothing Contact Form" <${process.env.BREVO_SMTP_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `New Contact Message from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
          <h2 style="color: #e36d3b;">New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Message:</strong> ${message}</p>
        </div>
      `
    }).then(() => {
      console.log('✅ Contact email sent!');
    }).catch((emailError) => {
      console.error('Contact email failed:', emailError.message);
    });

  } catch (error) {
    console.error('Contact error:', error.message);
    return res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
  }
});

// ✅ REGISTER ROUTE
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered!' });
    }

    const newUser = new User({ name, email, password });
    await newUser.save();

    const user = { id: newUser._id, name: newUser.name, email: newUser.email, avatar: newUser.avatar, isAdmin: newUser.isAdmin };

    return res.json({ success: true, message: 'Account created successfully!', user });

  } catch (error) {
    console.error('Register error:', error.message);
    return res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
  }
});

// ✅ LOGIN ROUTE
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }

    const userData = { id: user._id, name: user.name, email: user.email, avatar: user.avatar, isAdmin: user.isAdmin };

    return res.json({ success: true, message: 'Welcome back!', user: userData });

  } catch (error) {
    console.error('Login error:', error.message);
    return res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
  }
});


// ✅ ADD TO CART
router.post('/cart/add', async (req, res) => {
  const { productId, title, price, image, sessionId } = req.body;
  const userId = req.body.userId || null;

  try {
    let cart = userId
      ? await Cart.findOne({ userId })
      : await Cart.findOne({ sessionId });

    if (!cart) {
      cart = new Cart({ userId, sessionId, items: [] });
    }

    const existingItem = cart.items.find(item => item.productId == productId);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.items.push({ productId, title, price, image, quantity: 1 });
    }

    cart.updatedAt = Date.now();
    await cart.save();

    return res.json({ success: true, message: `${title} added to cart!`, cart });

  } catch (error) {
    console.error('Cart error:', error.message);
    return res.status(500).json({ success: false, message: 'Something went wrong.' });
  }
});

// ✅ GET CART
router.get('/cart', async (req, res) => {
  const { userId, sessionId } = req.query;

  try {
    let cart;
    if (userId && userId !== 'undefined' && userId !== 'null') {
      cart = await Cart.findOne({ userId });
    } else if (sessionId) {
      cart = await Cart.findOne({ sessionId });
    }

    return res.json({ success: true, cart: cart || { items: [] } });

  } catch (error) {
    console.error('Get cart error:', error.message);
    return res.status(500).json({ success: false, message: 'Something went wrong.' });
  }
});

// ✅ REMOVE FROM CART
router.post('/cart/remove', async (req, res) => {
  const { productId, sessionId } = req.body;
  const userId = req.body.userId || null;

  try {
    let cart;
    if (userId && userId !== 'undefined') {
      cart = await Cart.findOne({ userId });
    } else {
      cart = await Cart.findOne({ sessionId });
    }

    if (cart) {
      cart.items = cart.items.filter(item => item.productId != productId);
      await cart.save();
    }

    return res.json({ success: true, message: 'Item removed from cart' });

  } catch (error) {
    console.error('Remove cart error:', error.message);
    return res.status(500).json({ success: false, message: 'Something went wrong.' });
  }
});

// ✅ UPDATE QUANTITY
router.post('/cart/update', async (req, res) => {
  const { productId, change, sessionId } = req.body;
  const userId = req.body.userId || null;

  try {
    let cart;
    if (userId && userId !== 'undefined') {
      cart = await Cart.findOne({ userId });
    } else {
      cart = await Cart.findOne({ sessionId });
    }

    if (cart) {
      const item = cart.items.find(item => item.productId == productId);
      if (item) {
        item.quantity += parseInt(change);
        if (item.quantity <= 0) {
          cart.items = cart.items.filter(item => item.productId != productId);
        }
      }
      await cart.save();
    }

    return res.json({ success: true });

  } catch (error) {
    console.error('Update quantity error:', error.message);
    return res.status(500).json({ success: false, message: 'Something went wrong.' });
  }
});

// ✅ CLEAR CART
router.post('/cart/clear', async (req, res) => {
  const { sessionId } = req.body;
  const userId = req.body.userId || null;

  try {
    if (userId) {
      await Cart.findOneAndUpdate({ userId }, { items: [] });
    } else if (sessionId) {
      await Cart.findOneAndUpdate({ sessionId }, { items: [] });
    }
    return res.json({ success: true });
  } catch (error) {
    console.error('Clear cart error:', error.message);
    return res.status(500).json({ success: false });
  }
});

// ✅ ADD TO WISHLIST
router.post('/wishlist/add', async (req, res) => {
  const { productId, title, price, image, sessionId } = req.body;
  const userId = req.body.userId || null;

  try {
    let wishlist = userId
      ? await Wishlist.findOne({ userId })
      : await Wishlist.findOne({ sessionId });

    if (!wishlist) {
      wishlist = new Wishlist({ userId, sessionId, items: [] });
    }

    const exists = wishlist.items.find(item => item.productId == productId);
    if (exists) {
      return res.json({ success: false, message: 'Already in wishlist!' });
    }

    wishlist.items.push({ productId, title, price, image });
    await wishlist.save();

    return res.json({ success: true, message: `${title} added to wishlist!`, wishlist });

  } catch (error) {
    console.error('Wishlist error:', error.message);
    return res.status(500).json({ success: false, message: 'Something went wrong.' });
  }
});

// ✅ GET WISHLIST
router.get('/wishlist', async (req, res) => {
  const { userId, sessionId } = req.query;

  try {
    let wishlist;
    if (userId && userId !== 'undefined' && userId !== 'null') {
      wishlist = await Wishlist.findOne({ userId });
    } else if (sessionId) {
      wishlist = await Wishlist.findOne({ sessionId });
    }

    return res.json({ success: true, wishlist: wishlist || { items: [] } });

  } catch (error) {
    console.error('Get wishlist error:', error.message);
    return res.status(500).json({ success: false, message: 'Something went wrong.' });
  }
});

// ✅ REMOVE FROM WISHLIST
router.post('/wishlist/remove', async (req, res) => {
  const { productId, sessionId } = req.body;
  const userId = req.body.userId || null;

  try {
    let wishlist;
    if (userId && userId !== 'undefined') {
      wishlist = await Wishlist.findOne({ userId });
    } else {
      wishlist = await Wishlist.findOne({ sessionId });
    }

    if (wishlist) {
      wishlist.items = wishlist.items.filter(item => item.productId != productId);
      await wishlist.save();
    }

    return res.json({ success: true, message: 'Item removed from wishlist' });

  } catch (error) {
    console.error('Remove wishlist error:', error.message);
    return res.status(500).json({ success: false, message: 'Something went wrong.' });
  }
});




// ✅ INITIALIZE PAYMENT
router.post('/payment/initialize', async (req, res) => {
  const { email, amount, cartItems } = req.body;

  try {
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        amount: amount * 100, // Paystack uses kobo
        currency: 'NGN',
        callback_url: `${process.env.FRONTEND_URL}/order-success.html`,
        metadata: {
          cartItems: JSON.stringify(cartItems)
        }
      })
    });

    const data = await response.json();

    if (data.status) {
      return res.json({ success: true, data: data.data });
    } else {
      return res.status(400).json({ success: false, message: data.message });
    }

  } catch (error) {
    console.error('Payment init error:', error.message);
    return res.status(500).json({ success: false, message: 'Payment initialization failed' });
  }
});

// ✅ VERIFY PAYMENT
router.get('/payment/verify/:reference', async (req, res) => {
  const { reference } = req.params;

  try {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
      }
    });

    const data = await response.json();

    if (data.status && data.data.status === 'success') {
      const { email, metadata, amount, customer } = data.data;
      const customerEmail = email || customer?.email || req.query.email || 'unknown@email.com';
      const cartItems = JSON.parse(metadata.cartItems);
      const userId = req.query.userId || null;

      // Save order to database
      const order = new Order({
        userId,
        email: customerEmail,
        items: cartItems,
        totalAmount: amount / 100,
        paystackReference: reference,
        status: 'paid'
      });
      await order.save();

      // Clear the cart
      if (userId) {
        await Cart.findOneAndUpdate({ userId }, { items: [] });
      } else if (req.query.sessionId) {
        await Cart.findOneAndUpdate({ sessionId: req.query.sessionId }, { items: [] });
      }

      return res.json({ success: true, order });
    } else {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

  } catch (error) {
    console.error('Payment verify error:', error.message);
    return res.status(500).json({ success: false, message: 'Payment verification failed' });
  }
});


// ✅ CLEAR CART
router.post('/cart/clear', async (req, res) => {
  const { sessionId } = req.body;
  const userId = req.body.userId || null;

  try {
    if (userId) {
      await Cart.findOneAndUpdate({ userId }, { items: [] });
    } else if (sessionId) {
      await Cart.findOneAndUpdate({ sessionId }, { items: [] });
    }
    return res.json({ success: true });
  } catch (error) {
    console.error('Clear cart error:', error.message);
    return res.status(500).json({ success: false });
  }
});


// ✅ GET USER ORDERS
router.get('/orders', async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ success: false, message: 'User ID required' });
  }

  try {
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    return res.json({ success: true, orders });
  } catch (error) {
    console.error('Get orders error:', error.message);
    return res.status(500).json({ success: false, message: 'Something went wrong.' });
  }
});



// ✅ CLEAR ALL ORDERS
router.post('/orders/clear', async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ success: false });

  try {
    await Order.deleteMany({ userId });
    return res.json({ success: true });
  } catch (error) {
    console.error('Clear orders error:', error.message);
    return res.status(500).json({ success: false });
  }
});


// ✅ GET ALL PRODUCTS
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find({}).sort({ createdAt: 1 });
    return res.json({ success: true, products });
  } catch (error) {
    console.error('Get products error:', error.message);
    return res.status(500).json({ success: false, message: 'Something went wrong.' });
  }
});

// ✅ GET SINGLE PRODUCT
router.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    return res.json({ success: true, product });
  } catch (error) {
    console.error('Get product error:', error.message);
    return res.status(500).json({ success: false, message: 'Something went wrong.' });
  }
});

// ✅ ADD PRODUCT (admin only)
router.post('/products', async (req, res) => {
  const { title, brand, price, image, rating, badges, description, soldOut, isNew, category } = req.body;

  if (!title || !brand || !price || !image) {
    return res.status(400).json({ success: false, message: 'Title, brand, price and image are required' });
  }

  try {
    const product = new Product({ title, brand, price, image, rating, badges, description, soldOut, isNew, category });
    await product.save();
    return res.json({ success: true, message: 'Product added successfully!', product });
  } catch (error) {
    console.error('Add product error:', error.message);
    return res.status(500).json({ success: false, message: 'Something went wrong.' });
  }
});

// ✅ UPDATE PRODUCT (admin only)
router.put('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    return res.json({ success: true, message: 'Product updated!', product });
  } catch (error) {
    console.error('Update product error:', error.message);
    return res.status(500).json({ success: false, message: 'Something went wrong.' });
  }
});

// ✅ DELETE PRODUCT (admin only)
router.delete('/products/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'Product deleted!' });
  } catch (error) {
    console.error('Delete product error:', error.message);
    return res.status(500).json({ success: false, message: 'Something went wrong.' });
  }
});

// ✅ SEARCH PRODUCTS
router.get('/products/search/:query', async (req, res) => {
  try {
    const products = await Product.find({
      $or: [
        { title: { $regex: req.params.query, $options: 'i' } },
        { brand: { $regex: req.params.query, $options: 'i' } },
        { category: { $regex: req.params.query, $options: 'i' } }
      ]
    });
    return res.json({ success: true, products });
  } catch (error) {
    console.error('Search error:', error.message);
    return res.status(500).json({ success: false, message: 'Something went wrong.' });
  }
});


// ✅ ADMIN ROUTES
router.get('/admin/orders', async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    return res.json({ success: true, orders });
  } catch (error) {
    return res.status(500).json({ success: false });
  }
});

router.get('/admin/subscribers', async (req, res) => {
  try {
    const subscribers = await Subscriber.find({}).sort({ subscribedAt: -1 });
    return res.json({ success: true, subscribers });
  } catch (error) {
    return res.status(500).json({ success: false });
  }
});

router.get('/admin/users', async (req, res) => {
  try {
    const users = await User.find({}, 'name email isAdmin createdAt').sort({ createdAt: -1 });
    return res.json({ success: true, users });
  } catch (error) {
    return res.status(500).json({ success: false });
  }
});



export default router;