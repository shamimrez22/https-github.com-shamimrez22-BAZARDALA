import { db } from './firebase';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';

const demoProducts = [
  {
    name: "iPhone 15 Pro Max",
    price: 145000,
    category: "Electronic Devices",
    description: "The ultimate iPhone with titanium design, A17 Pro chip, and advanced camera system.",
    images: ["https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&q=80&w=800"],
    stock: 15,
    ratings: 4.9
  },
  {
    name: "Samsung Galaxy S24 Ultra",
    price: 135000,
    category: "Electronic Devices",
    description: "Galaxy AI is here. Experience the new era of smartphones with S24 Ultra.",
    images: ["https://images.unsplash.com/photo-1707230560033-66270387609d?auto=format&fit=crop&q=80&w=800"],
    stock: 10,
    ratings: 4.8
  },
  {
    name: "MacBook Pro M3 Max",
    price: 350000,
    category: "TV & Home Appliances",
    description: "The most advanced chips ever built for a personal computer.",
    images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800"],
    stock: 5,
    ratings: 5.0
  },
  {
    name: "Sony WH-1000XM5",
    price: 35000,
    category: "Electronic Accessories",
    description: "Industry-leading noise cancellation and premium sound quality.",
    images: ["https://images.unsplash.com/photo-1618366712277-70779c70583f?auto=format&fit=crop&q=80&w=800"],
    stock: 25,
    ratings: 4.7
  },
  {
    name: "Rolex Submariner Date",
    price: 1250000,
    category: "Watches & Accessories",
    description: "The benchmark among divers' watches, a classic of the deep.",
    images: ["https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&q=80&w=800"],
    stock: 2,
    ratings: 5.0
  },
  {
    name: "Nike Air Jordan 1 Retro",
    price: 18500,
    category: "Men's Fashion",
    description: "The sneaker that started it all. Iconic design and premium comfort.",
    images: ["https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&q=80&w=800"],
    stock: 20,
    ratings: 4.9
  },
  {
    name: "Dior Sauvage Elixir",
    price: 16500,
    category: "Health & Beauty",
    description: "An extraordinarily concentrated fragrance steeped in the iconic freshness of Sauvage.",
    images: ["https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=800"],
    stock: 30,
    ratings: 4.8
  },
  {
    name: "Canon EOS R5",
    price: 385000,
    category: "Electronic Devices",
    description: "Professional mirrorless evolved. 45MP full-frame sensor and 8K video.",
    images: ["https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=800"],
    stock: 4,
    ratings: 4.9
  }
];

export const seedProducts = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'products'));
    if (querySnapshot.empty) {
      console.log('Seeding demo products...');
      for (const product of demoProducts) {
        await addDoc(collection(db, 'products'), {
          ...product,
          createdAt: serverTimestamp()
        });
      }
      console.log('Demo products seeded successfully!');
    } else {
      console.log('Products collection already has data. Skipping seed.');
    }
  } catch (error) {
    console.error('Error seeding products:', error);
  }
};
