import * as dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import Product from './models/Product.js';

const products = [
  {
    title: "Ivory Silk Camisole",
    brand: "Saint Laurent",
    price: 10,
    image: "src/images/Ivory_silk_camisole.png",
    rating: 4,
    badges: ["SALE! 13%"],
    description: "A masterclass in silhouette and shadow, this ensemble centers on a razor-sharp, double-breasted blazer in midnight wool-crepe.",
    isNewArrival: false,
    category: "clothing"
  },
  {
    title: "Rose Suede Gilet",
    brand: "Prada",
    price: 12,
    image: "src/images/Rose_quartz_suede_gilet.png",
    rating: 5,
    badges: [],
    description: "A masterclass in tonal layering, this gilet is rendered in an ultra-soft, blush-toned vegan suede that mimics the delicate hue of rose quartz.",
    isNewArrival: false,
    category: "clothing"
  },
  {
    title: "Slim Fit Denim",
    brand: "Balmain",
    price: 10,
    image: "src/images/Slim_fit_denim.png",
    rating: 3,
    badges: ["SOLD OUT"],
    description: "Crafted from high-recovery stretch denim, these slim-fit jeans feature a custom artisanal stone-wash for an authentic, lived-in character.",
    soldOut: true,
    isNewArrival: false,
    category: "clothing"
  },
  {
    title: "Onyx Column Gown",
    brand: "Chloé",
    price: 15,
    image: "src/images/Onyx_column_gown.png",
    rating: 4,
    badges: [],
    description: "Exuding effortless evening glamour, this floor-length column gown is meticulously crafted from premium liquid-jersey.",
    isNewArrival: false,
    category: "clothing"
  },
  {
    title: "Midnight Sculpted Blazer",
    brand: "Muglar",
    price: 16,
    image: "src/images/Midnight_sculpted_blazer.png",
    rating: 5,
    badges: ["NEW"],
    description: "A definitive silhouette for the modern icon, this blazer is a study in precision tailoring.",
    isNewArrival: true,
    category: "clothing"
  },
  {
    title: "Ruby Silk Utility Blouse",
    brand: "Saint Laurent",
    price: 15,
    image: "src/images/Ruby_silk_utility_blouse.png",
    rating: 4,
    badges: ["NEW", "SALE! 13%"],
    description: "A vibrant intersection of function and femininity, this utility blouse is reimagined in a rich ruby-red crepe de chine.",
    isNewArrival: true,
    category: "clothing"
  },
  {
    title: "Midi Dress",
    brand: "Prada",
    price: 25,
    image: "src/images/Midi_dress.png",
    rating: 3,
    badges: ["NEW", "SALE! 13%"],
    description: "A striking study in contrast, this midi dress pairs a lush, botanical-print bodice with a structured, high-waisted skirt.",
    isNewArrival: true,
    category: "clothing"
  },
  {
    title: "Longline Tunic Coat",
    brand: "For All Mankind",
    price: 13,
    image: "src/images/Longline_tunic_coat.png",
    rating: 5,
    badges: ["NEW"],
    description: "A playful dialogue between texture and geometry, this ensemble features a vibrant scarlet sweater.",
    isNewArrival: true,
    category: "clothing"
  },
  {
    title: "Sculptural Jumpsuit",
    brand: "Muglar",
    price: 30,
    image: "src/images/Sculptural_jumpsuit.png",
    rating: 4,
    badges: [],
    description: "A masterclass in architectural dressing, this sleeveless jumpsuit is defined by its clean, tunic-style bodice.",
    isNewArrival: false,
    category: "clothing"
  },
  {
    title: "Flare Leg Jeans",
    brand: "For All Mankind",
    price: 20,
    image: "src/images/Flare_leg_jeans.png",
    rating: 4,
    badges: ["NEW", "SALE! 13%"],
    description: "A masterclass in 1970s-inspired tailoring, these high-rise flares are engineered from premium, deep-indigo raw denim.",
    isNewArrival: true,
    category: "clothing"
  },
  {
    title: "Embellished Scarlet",
    brand: "Chloé",
    price: 15,
    image: "src/images/Embellished_scarlet_pullover.png",
    rating: 3,
    badges: [],
    description: "The cropped, athletic-inspired silhouette of the knit is balanced by the sharp, architectural pleats of a midnight vegan leather mini skirt.",
    isNewArrival: false,
    category: "clothing"
  },
  {
    title: "Crimson Sleeve Dress",
    brand: "Chloé",
    price: 11,
    image: "src/images/Crimson_bishop-Sleeve_dress.png",
    rating: 5,
    badges: [],
    description: "A poetic study in texture and silhouette, this ensemble pairs a fluid, crimson-hued midi dress with a hand-loomed alabaster infinity scarf.",
    isNewArrival: false,
    category: "clothing"
  }
];

async function goodsProducts() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    // Clear existing products
    await Product.deleteMany({});
    console.log('🗑️ Cleared existing products');

    // Insert new products
    await Product.insertMany(products);
    console.log(`✅ ${products.length} products saved successfully!`);

    mongoose.connection.close();
    console.log('✅ Done!');
  } catch (error) {
    console.error('❌ saving error error:', error.message);
    mongoose.connection.close();
  }
}

goodsProducts();