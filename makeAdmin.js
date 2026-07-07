import * as dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import User from './models/User.js';

async function makeAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected');
    
    const result = await User.findOneAndUpdate(
      { email: 'danieledegbe81@gmail.com' },
      { isAdmin: true },
      { returnDocument: 'after' }
    );
    
    if (result) {
      console.log('✅ Admin set for:', result.email);
    } else {
      console.log('❌ User not found');
    }
    
    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

makeAdmin();