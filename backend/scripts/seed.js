require('dotenv').config();
const mongoose  = require('mongoose');
const connectDB = require('../config/db');
const Product   = require('../models/Product');

const products = [
  {
    name: "Clean Whey Protein", subtitle: "Premium Protein Formula",
    category: "proteins", price: 6499, originalPrice: 7999,
    weight: "2000g (2kg / 4.4 lbs)", servingSize: "1 Scoop (Approx. 33g)",
    servingsCount: 60, protein: "24g",
    features: ["Builds Lean Muscle", "Faster Recovery", "Premium Quality", "USA Imported Whey Protein"],
    details: "High quality whey protein to support lean muscle growth, faster recovery & enhance overall performance.",
    nutritionFacts: { "Protein": "24g", "BCAAs": "5.5g", "Glutamic Acid": "4.2g", "Servings": "60" },
    badge: "Best Seller", themeColor: "linear-gradient(135deg, #2e2e2e, #1a1a1a)", stock: 150
  },
  {
    name: "Pro Gain Advanced Muscle Growth", subtitle: "Mass Gainer Formula",
    category: "gainers", price: 3899, originalPrice: 4799,
    weight: "3000g (3kg / 6.6 lbs)", servingSize: "2 Scoops (100g)",
    servingsCount: 30, protein: "35g",
    features: ["Supports Muscle Growth", "Supports Healthy Weight Gain", "Enhances Strength", "USA imported ingredients"],
    details: "High calorie & high protein formula to support muscle growth, strength & weight gain.",
    nutritionFacts: { "Protein": "35g", "BCAAs": "7.4g", "Creatine": "1.2g", "Dietary Fiber": "2.5g" },
    badge: "Bulk Up", themeColor: "linear-gradient(135deg, #d35400, #2c3e50)", stock: 120
  },
  {
    name: "Hunter Pre-Workout", subtitle: "Explosive Energy & Focus",
    category: "preworkouts", price: 1949, originalPrice: 2499,
    weight: "180g", servingSize: "1 Scoop (6g)", servingsCount: 30, protein: "0g",
    features: ["Explosive Energy", "Enhanced Focus", "Improved Performance", "USA imported ingredients"],
    details: "Powerful pre-workout formula to boost energy, focus, strength & workout performance.",
    nutritionFacts: { "Beta-Alanine": "1600mg", "Caffeine": "200mg", "L-Arginine": "1000mg", "Servings": "30" },
    badge: "High Energy", themeColor: "linear-gradient(135deg, #c0392b, #1a0505)", stock: 80
  },
  {
    name: "Wingman Pre-Workout", subtitle: "Power, Pump & Endurance",
    category: "preworkouts", price: 2399, originalPrice: 2999,
    weight: "180g", servingSize: "1 Scoop (10g)", servingsCount: 18, protein: "0g",
    features: ["Power & Strength", "Muscle Pumps", "Endurance Support", "0% Itching"],
    details: "Advanced pre-workout formula to enhance strength, endurance and muscle pumps.",
    nutritionFacts: { "Citrulline Malate": "3000mg", "Beta-Alanine": "2000mg", "Caffeine Anhydrous": "250mg", "Servings": "18" },
    badge: "Extreme Pump", themeColor: "linear-gradient(135deg, #111, #333)", stock: 60
  },
  {
    name: "Micronized Creatine Monohydrate", subtitle: "Strength & Power",
    category: "wellness", price: 1599, originalPrice: 1999,
    weight: "240g", servingSize: "1 Scoop (3g)", servingsCount: 80, protein: "0g",
    features: ["Increases Strength", "Improves Power", "Muscle Growth Support", "100% Pure Micronized Creatine"],
    details: "100% pure micronized creatine for strength, power and muscle growth.",
    nutritionFacts: { "Creatine Monohydrate": "3g", "Purity": "100%", "Servings": "80" },
    badge: "100% Pure", themeColor: "linear-gradient(135deg, #2980b9, #2c3e50)", stock: 200
  },
  {
    name: "L-Carnitine 4000mg", subtitle: "Fat Metabolism & Energy",
    category: "wellness", price: 2999, originalPrice: 3499,
    weight: "450ml", servingSize: "15ml (1 Tablespoon)", servingsCount: 30, protein: "0g",
    features: ["Supports Fat Metabolism", "Enhances Performance", "Boosts Energy", "Mix Fruit Flavour"],
    details: "L-Carnitine Tartrate helps convert fat into energy and enhances athletic performance.",
    nutritionFacts: { "L-Carnitine": "4000mg", "Vitamin B6": "1.5mg", "Servings": "30" },
    badge: "Fat Burn", themeColor: "linear-gradient(135deg, #27ae60, #145a32)", stock: 75
  },
  {
    name: "Complete A to Z Multi-One", subtitle: "Multivitamin & Mineral",
    category: "wellness", price: 999, originalPrice: 1299,
    weight: "60 Tablets", servingSize: "2 Tablets (2000mg)", servingsCount: 30, protein: "0g",
    features: ["Supports Immunity", "Supports Strong Bones", "Enhances Energy", "59 Essential Nutrients"],
    details: "Complete daily nutrition with 59 essential nutrients to support strong immunity.",
    nutritionFacts: { "Vitamins & Minerals": "32 Ingredients", "Amino Acid Blend": "15 Ingredients", "Antioxidant & Herb Blend": "12 Ingredients" },
    badge: "Daily Health", themeColor: "linear-gradient(135deg, #8e44ad, #2c3e50)", stock: 300
  },
  {
    name: "Testo One Natural Herbs", subtitle: "Men's Performance Support",
    category: "performance", price: 2249, originalPrice: 2799,
    weight: "60 Tablets", servingSize: "1 Tablet", servingsCount: 60, protein: "0g",
    features: ["Boosts Stamina", "Supports Strength", "Enhances Vitality", "Advanced Herbal Formula"],
    details: "Advanced herbal formula to support stamina, strength, vitality & overall male wellness.",
    nutritionFacts: { "Tribulus Terrestris": "500mg", "Ashwagandha Extract": "300mg", "Safed Musli": "200mg", "Ginseng": "100mg" },
    badge: "Male Vitality", themeColor: "linear-gradient(135deg, #d35400, #111)", stock: 90
  },
  {
    name: "3x Strength Gold Omega-3", subtitle: "Heart, Brain & Joint Support",
    category: "wellness", price: 1299, originalPrice: 1699,
    weight: "60 Softgels", servingSize: "1 Softgel", servingsCount: 60, protein: "0g",
    features: ["Supports Heart Health", "Boosts Brain Function", "Supports Joint Health", "High Potency Formula"],
    details: "High potency Omega-3 for heart health, brain function, joint support and overall wellness.",
    nutritionFacts: { "Fish Oil": "1250mg", "EPA": "540mg", "DHA": "360mg", "Total Omega-3": "900mg" },
    badge: "Triple Strength", themeColor: "linear-gradient(135deg, #f1c40f, #f39c12)", stock: 110
  }
];

const seed = async () => {
  try {
    await connectDB();
    await Product.deleteMany({});
    console.log('🗑️  Cleared existing products...');

    await Product.insertMany(products);
    console.log(`✅ Seeded ${products.length} products successfully!`);

    await mongoose.connection.close();
    console.log('🔌 Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

seed();
