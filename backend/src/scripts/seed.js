import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Category } from '../models/Category.js';
import { Book } from '../models/Book.js';
import { Review } from '../models/Review.js';
import { Order } from '../models/Order.js';
import { Payment } from '../models/Payment.js';
import { Wishlist } from '../models/Wishlist.js';

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/online_book_store';
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB');

    // Clean existing collections
    await User.deleteMany({});
    await Category.deleteMany({});
    await Book.deleteMany({});
    await Review.deleteMany({});
    await Order.deleteMany({});
    await Payment.deleteMany({});
    await Wishlist.deleteMany({});
    console.log('[Seed] Cleared existing data');

    // 1. Create Users (Admin & Customer)
    const adminUser = await User.create({
      name: 'System Admin',
      email: 'admin@bookstore.com',
      password: 'Admin@123456',
      role: 'ADMIN',
      phone: '252615112233',
      address: {
        city: 'Mogadishu',
        district: 'Hodan',
        street: 'Maka Al Mukarama St',
        zipCode: '10001',
        country: 'Somalia'
      }
    });

    const customerUser = await User.create({
      name: 'Mohamed Ali',
      email: 'customer@bookstore.com',
      password: 'Customer@123456',
      role: 'CUSTOMER',
      phone: '252615554433',
      address: {
        city: 'Mogadishu',
        district: 'Waberi',
        street: 'Airport Road, Block 4',
        zipCode: '10002',
        country: 'Somalia'
      }
    });

    console.log('[Seed] Created default users:');
    console.log('   Admin: admin@bookstore.com / Admin@123456');
    console.log('   Customer: customer@bookstore.com / Customer@123456');

    // 2. Create Categories
    const categoriesData = [
      { name: 'Technology', slug: 'technology', description: 'Artificial intelligence, Cloud computing, Cybersecurity, and Modern Tech', icon: 'Cpu', featured: true },
      { name: 'Programming', slug: 'programming', description: 'Software engineering, Web development, Python, JavaScript, and Algorithms', icon: 'Code', featured: true },
      { name: 'Business', slug: 'business', description: 'Entrepreneurship, Leadership, Finance, and Management strategies', icon: 'Briefcase', featured: true },
      { name: 'Self Development', slug: 'self-development', description: 'Personal growth, Habits, Productivity, and Mindset', icon: 'Sparkles', featured: true },
      { name: 'Science', slug: 'science', description: 'Physics, Biology, Astronomy, and Scientific discoveries', icon: 'Atom', featured: true },
      { name: 'Fiction', slug: 'fiction', description: 'Novels, Mystery, Science Fiction, and Epic Storytelling', icon: 'BookOpen', featured: true },
      { name: 'History', slug: 'history', description: 'World civilizations, Historical biographies, and Landmark events', icon: 'Hourglass', featured: false },
      { name: 'Religion', slug: 'religion', description: 'Islamic studies, Philosophy, Spirituality, and Ethics', icon: 'Moon', featured: false },
      { name: 'Romance', slug: 'romance', description: 'Heartwarming stories, Classic romance, and Emotional journeys', icon: 'Heart', featured: false }
    ];

    const categories = await Category.insertMany(categoriesData);
    console.log(`[Seed] Created ${categories.length} categories`);

    // 3. Create Books
    const booksData = [
      {
        title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
        author: 'Robert C. Martin',
        category: 'Programming',
        isbn: '978-0132350884',
        publisher: 'Prentice Hall',
        publicationDate: new Date('2008-08-01'),
        pages: 464,
        language: 'English',
        price: 44.99,
        discountPrice: 38.5,
        stock: 25,
        coverImage: 'https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?q=80&w=800&auto=format&fit=crop',
        rating: 4.8,
        totalReviews: 142,
        totalSold: 88,
        featured: true,
        isBestSeller: true,
        description: 'Even bad code can function. But if code isn\'t clean, it can bring a development organization to its knees. Every year, countless hours and significant resources are lost because of poorly written code. This book will teach you how to write code that is clean, elegant, and maintainable.'
      },
      {
        title: 'Designing Data-Intensive Applications',
        author: 'Martin Kleppmann',
        category: 'Technology',
        isbn: '978-1449373320',
        publisher: "O'Reilly Media",
        publicationDate: new Date('2017-03-16'),
        pages: 616,
        language: 'English',
        price: 49.99,
        discountPrice: 42.0,
        stock: 18,
        coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop',
        rating: 4.9,
        totalReviews: 210,
        totalSold: 130,
        featured: true,
        isBestSeller: true,
        description: 'Data is at the center of many challenges in system design today. Difficult issues need to be figured out, such as scalability, consistency, reliability, efficiency, and maintainability. This book provides a deep dive into databases, distributed systems, and modern architectures.'
      },
      {
        title: 'Atomic Habits: An Easy & Proven Way to Build Good Habits',
        author: 'James Clear',
        category: 'Self Development',
        isbn: '978-0735211292',
        publisher: 'Avery',
        publicationDate: new Date('2018-10-16'),
        pages: 320,
        language: 'English',
        price: 27.0,
        discountPrice: 21.99,
        stock: 45,
        coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=800&auto=format&fit=crop',
        rating: 4.9,
        totalReviews: 540,
        totalSold: 320,
        featured: true,
        isBestSeller: true,
        description: 'No matter your goals, Atomic Habits offers a proven framework for improving—every day. James Clear, one of the world\'s leading experts on habit formation, reveals practical strategies that will teach you exactly how to form good habits, break bad ones, and master tiny behaviors that lead to remarkable results.'
      },
      {
        title: 'Zero to One: Notes on Startups, or How to Build the Future',
        author: 'Peter Thiel',
        category: 'Business',
        isbn: '978-0804139298',
        publisher: 'Crown Business',
        publicationDate: new Date('2014-09-16'),
        pages: 224,
        language: 'English',
        price: 28.0,
        discountPrice: 22.5,
        stock: 30,
        coverImage: 'https://images.unsplash.com/photo-1507842229451-79b1be88688e?q=80&w=800&auto=format&fit=crop',
        rating: 4.7,
        totalReviews: 95,
        totalSold: 64,
        featured: true,
        isBestSeller: false,
        description: 'The great secret of our time is that there are still uncharted frontiers to explore and new inventions to create. In Zero to One, legendary entrepreneur and investor Peter Thiel shows how we can find singular ways to create those new things.'
      },
      {
        title: 'The Pragmatic Programmer: Your Journey to Mastery',
        author: 'David Thomas & Andrew Hunt',
        category: 'Programming',
        isbn: '978-0135957059',
        publisher: 'Addison-Wesley Professional',
        publicationDate: new Date('2019-09-13'),
        pages: 352,
        language: 'English',
        price: 49.95,
        discountPrice: 41.99,
        stock: 14,
        coverImage: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=800&auto=format&fit=crop',
        rating: 4.8,
        totalReviews: 89,
        totalSold: 52,
        featured: false,
        isBestSeller: true,
        description: 'Illustrates the best approaches and major pitfalls of many different aspects of software development. Whether you are a new coder or an experienced programmer, you will learn pragmatic guidelines to write flexible, adaptable code.'
      },
      {
        title: 'Astrophysics for People in a Hurry',
        author: 'Neil deGrasse Tyson',
        category: 'Science',
        isbn: '978-0393609394',
        publisher: 'W. W. Norton & Company',
        publicationDate: new Date('2017-05-02'),
        pages: 224,
        language: 'English',
        price: 18.95,
        discountPrice: 15.5,
        stock: 22,
        coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop',
        rating: 4.6,
        totalReviews: 120,
        totalSold: 75,
        featured: true,
        isBestSeller: false,
        description: 'What is the nature of space and time? How do we fit within the universe? How does the universe fit within us? There’s no better guide through these mind-expanding questions than acclaimed astrophysicist Neil deGrasse Tyson.'
      },
      {
        title: 'The Psychology of Money: Timeless Lessons on Wealth, Greed, and Happiness',
        author: 'Morgan Housel',
        category: 'Business',
        isbn: '978-0857197689',
        publisher: 'Harriman House',
        publicationDate: new Date('2020-09-08'),
        pages: 256,
        language: 'English',
        price: 24.99,
        discountPrice: 19.99,
        stock: 35,
        coverImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=800&auto=format&fit=crop',
        rating: 4.9,
        totalReviews: 310,
        totalSold: 210,
        featured: true,
        isBestSeller: true,
        description: 'Doing well with money isn’t necessarily about what you know. It’s about how you behave. And behavior is hard to teach, even to really smart people. Money—investing, personal finance, and business decisions—is typically taught as a math-based field.'
      },
      {
        title: 'Deep Work: Rules for Focused Success in a Distracted World',
        author: 'Cal Newport',
        category: 'Self Development',
        isbn: '978-1455586691',
        publisher: 'Grand Central Publishing',
        publicationDate: new Date('2016-01-05'),
        pages: 304,
        language: 'English',
        price: 28.0,
        discountPrice: 23.0,
        stock: 20,
        coverImage: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=800&auto=format&fit=crop',
        rating: 4.7,
        totalReviews: 180,
        totalSold: 110,
        featured: false,
        isBestSeller: true,
        description: 'Deep work is the ability to focus without distraction on a cognitively demanding task. It\'s a skill that allows you to quickly master complicated information and produce better results in less time.'
      },
      {
        title: 'Sapiens: A Brief History of Humankind',
        author: 'Yuval Noah Harari',
        category: 'History',
        isbn: '978-0062316097',
        publisher: 'Harper',
        publicationDate: new Date('2015-02-10'),
        pages: 464,
        language: 'English',
        price: 35.0,
        discountPrice: 29.5,
        stock: 40,
        coverImage: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?q=80&w=800&auto=format&fit=crop',
        rating: 4.8,
        totalReviews: 420,
        totalSold: 290,
        featured: true,
        isBestSeller: true,
        description: 'From a renowned historian comes a groundbreaking narrative of humanity’s creation and evolution—a #1 international bestseller—that explores the ways in which biology and history have defined us and enhanced our understanding of what it means to be “human.”'
      },
      {
        title: 'Dune (Dune Chronicles, Book 1)',
        author: 'Frank Herbert',
        category: 'Fiction',
        isbn: '978-0441013593',
        publisher: 'Ace Books',
        publicationDate: new Date('1965-08-01'),
        pages: 688,
        language: 'English',
        price: 19.99,
        discountPrice: 16.99,
        stock: 32,
        coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop',
        rating: 4.7,
        totalReviews: 360,
        totalSold: 230,
        featured: true,
        isBestSeller: true,
        description: 'Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, heir to a noble family tasked with ruling an inhospitable world where the only thing of value is the “spice” melange, a drug capable of extending life and enhancing consciousness.'
      },
      {
        title: 'Artificial Intelligence: A Modern Approach (4th Edition)',
        author: 'Stuart Russell & Peter Norvig',
        category: 'Technology',
        isbn: '978-0134610993',
        publisher: 'Pearson',
        publicationDate: new Date('2020-04-28'),
        pages: 1152,
        language: 'English',
        price: 89.99,
        discountPrice: 79.99,
        stock: 12,
        coverImage: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=800&auto=format&fit=crop',
        rating: 4.9,
        totalReviews: 76,
        totalSold: 41,
        featured: true,
        isBestSeller: false,
        description: 'The most comprehensive, up-to-date introduction to the theory and practice of artificial intelligence. Covers modern probabilistic reasoning, deep learning, multiagent systems, machine ethics, and state-of-the-art applications.'
      },
      {
        title: 'In the Footsteps of the Prophet: Lessons from the Life of Muhammad',
        author: 'Tariq Ramadan',
        category: 'Religion',
        isbn: '978-0195374766',
        publisher: 'Oxford University Press',
        publicationDate: new Date('2007-02-05'),
        pages: 256,
        language: 'English',
        price: 21.95,
        discountPrice: 18.5,
        stock: 28,
        coverImage: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?q=80&w=800&auto=format&fit=crop',
        rating: 4.9,
        totalReviews: 88,
        totalSold: 65,
        featured: false,
        isBestSeller: false,
        description: 'A fresh, profound biography of the Prophet Muhammad, presenting spiritual insights, ethical compass, and historical context for modern readers seeking wisdom and moral clarity.'
      },
      {
        title: 'Pride and Prejudice',
        author: 'Jane Austen',
        category: 'Romance',
        isbn: '978-0141439518',
        publisher: 'Penguin Classics',
        publicationDate: new Date('2002-12-31'),
        pages: 480,
        language: 'English',
        price: 12.99,
        discountPrice: 9.99,
        stock: 35,
        coverImage: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=800&auto=format&fit=crop',
        rating: 4.7,
        totalReviews: 195,
        totalSold: 140,
        featured: false,
        isBestSeller: false,
        description: 'A masterpiece of wit, romance, and societal commentary. The sparkling battle of wits between Elizabeth Bennet and the arrogant Mr. Darcy remains one of the greatest love stories ever written.'
      },
      {
        title: 'Guns, Germs, and Steel: The Fates of Human Societies',
        author: 'Jared Diamond',
        category: 'History',
        isbn: '978-0393354324',
        publisher: 'W. W. Norton & Company',
        publicationDate: new Date('2017-03-07'),
        pages: 528,
        language: 'English',
        price: 19.95,
        discountPrice: 16.5,
        stock: 19,
        coverImage: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?q=80&w=800&auto=format&fit=crop',
        rating: 4.6,
        totalReviews: 140,
        totalSold: 82,
        featured: false,
        isBestSeller: false,
        description: 'Pulitzer Prize winner Jared Diamond convincingly argues that geographical and environmental factors shaped the modern world rather than racial or genetic differences.'
      },
      {
        title: 'You Don’t Know JS Yet: Get Started',
        author: 'Kyle Simpson',
        category: 'Programming',
        isbn: '978-1838838324',
        publisher: 'Independently published',
        publicationDate: new Date('2020-01-28'),
        pages: 142,
        language: 'English',
        price: 22.0,
        discountPrice: 17.99,
        stock: 40,
        coverImage: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?q=80&w=800&auto=format&fit=crop',
        rating: 4.8,
        totalReviews: 112,
        totalSold: 94,
        featured: true,
        isBestSeller: false,
        description: 'No matter how much you know about JavaScript, chances are you don\'t understand it completely. This compact yet deep handbook explains the core mechanics of JS, closures, scopes, and objects.'
      },
      {
        title: 'Thinking, Fast and Slow',
        author: 'Daniel Kahneman',
        category: 'Self Development',
        isbn: '978-0374533557',
        publisher: 'Farrar, Straus and Giroux',
        publicationDate: new Date('2013-04-02'),
        pages: 512,
        language: 'English',
        price: 21.0,
        discountPrice: 17.5,
        stock: 24,
        coverImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800&auto=format&fit=crop',
        rating: 4.7,
        totalReviews: 280,
        totalSold: 175,
        featured: false,
        isBestSeller: true,
        description: 'In the international bestseller, Daniel Kahneman, the renowned psychologist and winner of the Nobel Prize in Economics, takes us on a groundbreaking tour of the mind and explains the two systems that drive the way we think.'
      }
    ];

    const insertedBooks = await Book.insertMany(booksData);
    console.log(`[Seed] Created ${insertedBooks.length} books with complete catalogs and stock`);

    // 4. Create Sample Initial Reviews
    const sampleReviews = [
      {
        bookId: insertedBooks[0]._id,
        userId: customerUser._id,
        userName: customerUser.name,
        rating: 5,
        comment: 'Essential reading for any professional software engineer. Completely transformed the way I structure functions and classes!',
        isVerifiedPurchase: true
      },
      {
        bookId: insertedBooks[1]._id,
        userId: customerUser._id,
        userName: customerUser.name,
        rating: 5,
        comment: 'The definitive book on distributed systems and databases. Unmatched depth and clarity.',
        isVerifiedPurchase: true
      },
      {
        bookId: insertedBooks[2]._id,
        userId: customerUser._id,
        userName: customerUser.name,
        rating: 5,
        comment: 'Practical, actionable, and life changing. The 2-minute rule helped me establish consistent reading habits.',
        isVerifiedPurchase: true
      }
    ];

    await Review.insertMany(sampleReviews);
    console.log(`[Seed] Created ${sampleReviews.length} sample reviews`);

    // 5. Create Sample Initial Paid Order with Payment Reference
    const sampleBook = insertedBooks[0];
    const sampleOrder = await Order.create({
      userId: customerUser._id,
      items: [
        {
          bookId: sampleBook._id,
          title: sampleBook.title,
          author: sampleBook.author,
          coverImage: sampleBook.coverImage,
          price: sampleBook.discountPrice || sampleBook.price,
          quantity: 1,
          subtotal: sampleBook.discountPrice || sampleBook.price
        }
      ],
      subtotal: sampleBook.discountPrice || sampleBook.price,
      discount: 0,
      deliveryFee: 0,
      tax: 0,
      total: sampleBook.discountPrice || sampleBook.price,
      shippingAddress: {
        fullName: customerUser.name,
        email: customerUser.email,
        phone: customerUser.phone,
        city: 'Mogadishu',
        district: 'Waberi',
        street: 'Airport Road, Block 4',
        zipCode: '10002',
        notes: 'Deliver to front desk'
      },
      paymentMethod: 'MWALLET_ACCOUNT',
      payerAccount: '252615554433',
      paymentStatus: 'SUCCESS',
      orderStatus: 'PAID',
      paymentReference: 'BOOKPAY-20260814-SEED0001',
      requestId: 'REQ-SEED-0001',
      invoiceId: 'INV-20260814-55123',
      paidAt: new Date()
    });

    await Payment.create({
      orderId: sampleOrder._id,
      userId: customerUser._id,
      referenceId: sampleOrder.paymentReference,
      requestId: sampleOrder.requestId,
      invoiceId: sampleOrder.invoiceId,
      amount: sampleOrder.total,
      currency: 'USD',
      paymentMethod: 'MWALLET_ACCOUNT',
      payerAccount: sampleOrder.payerAccount,
      status: 'SUCCESS',
      providerResponse: {
        schemaVersion: '1.0',
        responseCode: '200',
        responseMessage: 'Transaction approved',
        status: 'SUCCESS'
      }
    });

    console.log('[Seed] Created sample order & payment reference');

    console.log('✅ [Seed] Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedDatabase();
