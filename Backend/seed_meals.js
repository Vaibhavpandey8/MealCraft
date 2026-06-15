require('dotenv').config();
const mongoose = require('mongoose');
const Meal = require('./meal.model');

const mealsData = [
  {
    name: 'Paneer Butter Masala',
    category: 'vegetarian',
    calories: 450,
    nutriscore: 82,
    rating: 4.9,
    price: 220,
    image: '/img/meals/paneer_butter_masala.png',
    description: 'Tender paneer cubes cooked in a rich, creamy tomato gravy with traditional spices, butter, and cream.'
  },
  {
    name: 'Dal Makhani',
    category: 'vegetarian',
    calories: 380,
    nutriscore: 78,
    rating: 4.8,
    price: 180,
    image: '/img/meals/dal_makhani.png',
    description: 'Creamy black lentils slow-cooked overnight with authentic spices, rich butter, and fresh cream.'
  },
  {
    name: 'Veg Dum Biryani',
    category: 'vegan',
    calories: 420,
    nutriscore: 85,
    rating: 4.9,
    price: 250,
    image: '/img/meals/veg_biryani.png',
    description: 'Aromatic basmati rice layered with fresh vegetables, saffron, and exotic Indian herbs, slow-cooked in dum style.'
  },
  {
    name: 'Chole Bhature',
    category: 'vegetarian',
    calories: 580,
    nutriscore: 70,
    rating: 4.7,
    price: 150,
    image: '/img/meals/chole_bhature.png',
    description: 'Spicy chickpeas curry cooked in Punjabi style, served with two fluffy, golden-fried bhaturas.'
  },
  {
    name: 'Butter Chicken',
    category: 'paleo',
    calories: 550,
    nutriscore: 80,
    rating: 4.9,
    price: 290,
    image: '/img/meals/butter_chicken.png',
    description: 'Juicy grilled tandoori chicken pieces simmered in a rich, velvety tomato gravy with fresh cream and butter.'
  },
  {
    name: 'Aloo Paratha Platter',
    category: 'vegetarian',
    calories: 350,
    nutriscore: 75,
    rating: 4.6,
    price: 120,
    image: '/img/meals/aloo_paratha.png',
    description: 'Two whole wheat flatbreads stuffed with spiced mashed potatoes, topped with white butter, served with curd and pickle.'
  },
  {
    name: 'Paneer Tikka Salad',
    category: 'vegetarian',
    calories: 290,
    nutriscore: 90,
    rating: 4.8,
    price: 200,
    image: '/img/meals/paneer_tikka_salad.png',
    description: 'Healthy grilled paneer cubes tossed with fresh bell peppers, onions, tomatoes, and spicy mint vinaigrette.'
  },
  {
    name: 'Yellow Dal Tadka',
    category: 'vegan',
    calories: 250,
    nutriscore: 88,
    rating: 4.7,
    price: 140,
    image: '/img/meals/yellow_dal_tadka.png',
    description: 'Comforting yellow lentils tempered with ghee, cumin seeds, garlic, red chilies, and fresh coriander leaves.'
  },
  {
    name: 'Shahi Paneer Kofta',
    category: 'vegetarian',
    calories: 480,
    nutriscore: 81,
    rating: 4.8,
    price: 240,
    image: '/img/meals/shahi_paneer_kofta.png',
    description: 'Delicious fried paneer ball dumplings stuffed with dry fruits, simmered in a rich, creamy cashew-onion golden gravy.'
  },
  {
    name: 'Kadhai Paneer',
    category: 'vegetarian',
    calories: 460,
    nutriscore: 84,
    rating: 4.7,
    price: 230,
    image: '/img/meals/kadhai_paneer.png',
    description: 'Paneer cubes stir-fried with colorful bell peppers, onions, tomatoes, and freshly ground whole aromatic spices.'
  },
  {
    name: 'Masala Dosa Platter',
    category: 'vegan',
    calories: 320,
    nutriscore: 89,
    rating: 4.8,
    price: 130,
    image: '/img/meals/masala_dosa.png',
    description: 'Crispy rice crepe stuffed with spiced potatoes, served with fresh coconut chutney, tomato chutney, and hot sambar.'
  },
  {
    name: 'Chicken Tikka Masala',
    category: 'paleo',
    calories: 520,
    nutriscore: 79,
    rating: 4.9,
    price: 280,
    image: '/img/meals/chicken_tikka_masala.png',
    description: 'Tender grilled chicken chunks cooked in a rich, creamy, spiced orange-red tomato-onion sauce.'
  },
  {
    name: 'Mutton Rogan Josh',
    category: 'paleo',
    calories: 620,
    nutriscore: 76,
    rating: 4.9,
    price: 340,
    image: '/img/meals/mutton_rogan_josh.png',
    description: 'Classic Kashmiri lamb dish slow-cooked in a rich, aromatic red gravy flavored with Kashmiri dry red chilies.'
  },
  {
    name: 'Pav Bhaji Special',
    category: 'vegetarian',
    calories: 490,
    nutriscore: 72,
    rating: 4.8,
    price: 140,
    image: '/img/meals/pav_bhaji.png',
    description: 'A thick, spicy mashed vegetable curry topped with melting butter, served with two soft toasted pav buns.'
  },
  {
    name: 'Rajma Chawal Platter',
    category: 'vegan',
    calories: 390,
    nutriscore: 87,
    rating: 4.7,
    price: 160,
    image: '/img/meals/rajma_chawal.png',
    description: 'Spiced red kidney bean curry slow-cooked with fresh tomatoes and herbs, served over fluffy basmati rice.'
  },
  {
    name: 'Malai Kofta Special',
    category: 'vegetarian',
    calories: 510,
    nutriscore: 77,
    rating: 4.8,
    price: 250,
    image: '/img/meals/malai_kofta.png',
    description: 'Creamy potato and paneer balls cooked in a rich, sweet and mild cashew-tomato cream sauce.'
  },
  {
    name: 'Tandoori Chicken Platter',
    category: 'paleo',
    calories: 430,
    nutriscore: 85,
    rating: 4.9,
    price: 270,
    image: '/img/meals/tandoori_chicken.png',
    description: 'Juicy roasted chicken leg quarters marinated in yogurt and hot tandoori spices, cooked in a tandoor.'
  },
  {
    name: 'Samosa Chana Chaat',
    category: 'vegetarian',
    calories: 310,
    nutriscore: 74,
    rating: 4.7,
    price: 110,
    image: '/img/meals/samosa_chaat.png',
    description: 'Crushed samosas topped with spicy chickpeas, sweet yogurt, tangy tamarind chutney, and fresh sev.'
  },
  {
    name: 'Palak Paneer',
    category: 'vegetarian',
    calories: 410,
    nutriscore: 88,
    rating: 4.8,
    price: 220,
    image: '/img/meals/palak_paneer.png',
    description: 'Cubes of fresh paneer cooked in a smooth, vibrant spinach gravy tempered with garlic and cumin.'
  },
  {
    name: 'Chicken Dum Biryani',
    category: 'paleo',
    calories: 540,
    nutriscore: 80,
    rating: 4.9,
    price: 270,
    image: '/img/meals/chicken_biryani.png',
    description: 'Aromatic basmati rice layered with juicy marinated chicken chunks, saffron, and mint, cooked in dum style.'
  },
  {
    name: 'Bhindi Masala Fry',
    category: 'vegan',
    calories: 210,
    nutriscore: 85,
    rating: 4.6,
    price: 130,
    image: '/img/meals/bhindi_masala.png',
    description: 'Fresh okra sautéed with onions, tomatoes, green chilies, and handpicked spice powders.'
  },
  {
    name: 'Gobi Manchurian (Desi Style)',
    category: 'vegetarian',
    calories: 340,
    nutriscore: 71,
    rating: 4.7,
    price: 160,
    image: '/img/meals/gobi_manchurian.png',
    description: 'Crispy fried cauliflower florets tossed in a spicy, sweet, and tangy Indo-Chinese sauce.'
  },
  {
    name: 'Amritsari Paneer Bhurji',
    category: 'vegetarian',
    calories: 390,
    nutriscore: 78,
    rating: 4.8,
    price: 190,
    image: '/img/meals/paneer_bhurji.png',
    description: 'Scrambled paneer sautéed with onions, tomatoes, spices, and fresh herbs, served hot.'
  },
  {
    name: 'Egg Curry Feast',
    category: 'paleo',
    calories: 420,
    nutriscore: 82,
    rating: 4.7,
    price: 180,
    image: '/img/meals/egg_curry.png',
    description: 'Boiled eggs cooked in a delicious tomato and onion-based golden gravy with warm Indian spices.'
  },
  {
    name: 'Classic Matar Paneer',
    category: 'vegetarian',
    calories: 430,
    nutriscore: 80,
    rating: 4.8,
    price: 210,
    image: '/img/meals/matar_paneer.png',
    description: 'Fresh peas and paneer cubes cooked in a delicious spiced tomato and onion gravy.'
  },
  {
    name: 'Baingan Bharta',
    category: 'vegan',
    calories: 230,
    nutriscore: 86,
    rating: 4.7,
    price: 140,
    image: '/img/meals/baingan_bharta.png',
    description: 'Smoky roasted eggplant mashed and sautéed with chopped onions, tomatoes, green peas, and fresh cilantro.'
  },
  {
    name: 'Kadhai Chicken',
    category: 'paleo',
    calories: 510,
    nutriscore: 81,
    rating: 4.9,
    price: 290,
    image: '/img/meals/kadhai_chicken.png',
    description: 'Tender chicken pieces cooked with ground whole spices, bell peppers, and onions in a traditional wok.'
  },
  {
    name: 'Aloo Gobhi Masala',
    category: 'vegan',
    calories: 270,
    nutriscore: 83,
    rating: 4.6,
    price: 120,
    image: '/img/meals/aloo_gobhi.png',
    description: 'Comforting home-style potato and cauliflower dish cooked with dry Indian spices.'
  },
  {
    name: 'Jain Paneer Pulao',
    category: 'jain',
    calories: 340,
    nutriscore: 88,
    rating: 4.8,
    price: 160,
    image: '/img/meals/jain_paneer_pulao.png',
    description: 'Fragrant basmati rice layered with fresh paneer cubes and green peas, prepared without onion and garlic.'
  },
  {
    name: 'Jain Dal Khichdi',
    category: 'jain',
    calories: 280,
    nutriscore: 92,
    rating: 4.7,
    price: 130,
    image: '/img/meals/jain_dal_khichdi.png',
    description: 'Steaming bowl of comforting yellow lentil and rice porridge, topped with pure ghee, prepared without onion and garlic.'
  },
  {
    name: 'Sabudana Khichdi',
    category: 'fasting',
    calories: 360,
    nutriscore: 85,
    rating: 4.8,
    price: 120,
    image: '/img/meals/sabudana_khichdi.png',
    description: 'Translucent tapioca pearls sautéed with roasted peanuts, curry leaves, green chilies, and potato cubes.'
  },
  {
    name: 'Kuttu Puri Platter',
    category: 'fasting',
    calories: 420,
    nutriscore: 79,
    rating: 4.7,
    price: 140,
    image: '/img/meals/kuttu_puri_platter.png',
    description: 'Crispy dark buckwheat flour puris served with a side of dry potato curry prepared with rock salt (sendha namak).'
  }
];

const seedMeals = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding Indian meals...');

    // Clear existing meals
    await Meal.deleteMany({});
    console.log('Cleared existing meals.');

    // Seed meals
    await Meal.insertMany(mealsData);
    console.log('Seeded Indian meals successfully!');

    mongoose.connection.close();
    console.log('Database connection closed.');
  } catch (error) {
    console.error('Error seeding meals:', error);
    process.exit(1);
  }
};

seedMeals();
