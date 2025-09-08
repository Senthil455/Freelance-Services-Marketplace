import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from '../config/index.js';
import User from '../models/User.js';
import Gig from '../models/Gig.js';
import Order from '../models/Order.js';
import Review from '../models/Review.js';
import Category from '../models/Category.js';

const CATEGORIES = [
  { name: 'Programming & Tech', slug: 'programming-tech', icon: 'code', popular: true, subCategories: ['Web Development', 'Mobile Apps', 'Desktop Apps', 'AI & Machine Learning', 'Data Science', 'API Integration'] },
  { name: 'Graphic Design', slug: 'graphic-design', icon: 'palette', popular: true, subCategories: ['Logo Design', 'Brand Identity', 'UI/UX Design', 'Illustration', 'Photoshop Editing', 'Packaging Design'] },
  { name: 'Digital Marketing', slug: 'digital-marketing', icon: 'megaphone', popular: true, subCategories: ['SEO', 'Social Media', 'Content Marketing', 'Email Marketing', 'PPC', 'Analytics'] },
  { name: 'Writing & Translation', slug: 'writing-translation', icon: 'pen', popular: true, subCategories: ['Copywriting', 'Blog Writing', 'Resume Writing', 'Translation', 'Technical Writing', 'Proofreading'] },
  { name: 'Video & Animation', slug: 'video-animation', icon: 'video', popular: false, subCategories: ['Video Editing', 'Motion Graphics', '3D Animation', 'Explainer Videos', 'YouTube Editing'] },
  { name: 'Music & Audio', slug: 'music-audio', icon: 'music', popular: false, subCategories: ['Voice Over', 'Mixing & Mastering', 'Music Production', 'Sound Design', 'Jingles'] },
  { name: 'Business', slug: 'business', icon: 'briefcase', popular: false, subCategories: ['Virtual Assistant', 'Market Research', 'Business Plans', 'Financial Consulting', 'Legal Consulting'] },
  { name: 'AI Services', slug: 'ai-services', icon: 'bot', popular: true, subCategories: ['Chatbots', 'Prompt Engineering', 'AI Agents', 'Image Generation', 'LLM Fine-tuning'] },
];

const AVATARS = [
  'https://i.pravatar.cc/300?img=12', 'https://i.pravatar.cc/300?img=32', 'https://i.pravatar.cc/300?img=5',
  'https://i.pravatar.cc/300?img=47', 'https://i.pravatar.cc/300?img=9', 'https://i.pravatar.cc/300?img=56',
  'https://i.pravatar.cc/300?img=16', 'https://i.pravatar.cc/300?img=28', 'https://i.pravatar.cc/300?img=13', 'https://i.pravatar.cc/300?img=44',
];

const GIG_IMAGES = [
  'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=1200&q=80',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80',
  'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=1200&q=80',
  'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1200&q=80',
  'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?w=1200&q=80',
  'https://images.unsplash.com/photo-1547658719-da2b51169166?w=1200&q=80',
  'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=1200&q=80',
  'https://images.unsplash.com/photo-1531501415072-90ba400173d2?w=1200&q=80',
];

const SELLERS = [
  { name: 'Aarav Sharma', email: 'aarav@demo.com', tagline: 'Full-stack developer with 8+ years of experience', bio: 'I build fast, scalable web applications using React, Node.js and MongoDB.', skills: ['React', 'Node.js', 'MongoDB', 'TypeScript'], location: 'India', languages: [{ name: 'English', level: 'Fluent' }, { name: 'Hindi', level: 'Native' }] },
  { name: 'Elena Petrova', email: 'elena@demo.com', tagline: 'Brand identity designer crafting memorable logos', bio: 'Logo and brand identity designer. I create timeless identities.', skills: ['Logo Design', 'Branding', 'Illustrator', 'Figma'], location: 'Ukraine', languages: [{ name: 'English', level: 'Fluent' }, { name: 'Ukrainian', level: 'Native' }] },
  { name: 'Marcus Johnson', email: 'marcus@demo.com', tagline: 'SEO & growth marketing specialist', bio: 'I help businesses grow organically through technical SEO and content.', skills: ['SEO', 'Google Analytics', 'Content Strategy', 'GA4'], location: 'United States', languages: [{ name: 'English', level: 'Native' }] },
  { name: 'Sofia Martinez', email: 'sofia@demo.com', tagline: 'Award-winning UX/UI designer', bio: 'I design intuitive product experiences for apps and sites.', skills: ['UI Design', 'UX Research', 'Figma', 'Design Systems'], location: 'Spain', languages: [{ name: 'English', level: 'Fluent' }, { name: 'Spanish', level: 'Native' }] },
  { name: 'Kenji Watanabe', email: 'kenji@demo.com', tagline: 'Video editor for YouTube & social media', bio: 'I edit engaging videos that keep viewers watching.', skills: ['Video Editing', 'Premiere Pro', 'After Effects', 'Motion Design'], location: 'Japan', languages: [{ name: 'English', level: 'Fluent' }, { name: 'Japanese', level: 'Native' }] },
  { name: 'Amara Okafor', email: 'amara@demo.com', tagline: 'AI automation engineer & prompt specialist', bio: 'I build AI chatbots, agents and automations for businesses.', skills: ['ChatGPT', 'LangChain', 'Python', 'Zapier'], location: 'Nigeria', languages: [{ name: 'English', level: 'Fluent' }] },
];

const GIG_TEMPLATES = [
  { title: 'I will build a modern responsive website with React and Node.js', category: 'Programming & Tech', subCategory: 'Web Development', tags: ['react', 'website', 'responsive', 'mern'], description: 'I will design and develop a full-stack, mobile-first website for your business. Clean code, blazing-fast frontend, secure backend.' },
  { title: 'I will design a professional logo and complete brand identity', category: 'Graphic Design', subCategory: 'Logo Design', tags: ['logo', 'branding', 'identity', 'design'], description: 'Give your brand a face it deserves. Unique logo plus complete visual identity.' },
  { title: 'I will do complete on-page SEO and technical SEO audit', category: 'Digital Marketing', subCategory: 'SEO', tags: ['seo', 'google', 'audit', 'rankings'], description: 'Get your website to rank on Google with a full technical SEO audit and optimization.' },
  { title: 'I will design a beautiful mobile app UI/UX in Figma', category: 'Graphic Design', subCategory: 'UI/UX Design', tags: ['app', 'ui', 'ux', 'figma'], description: 'An intuitive, beautiful app interface that users love, delivered in Figma.' },
  { title: 'I will edit your YouTube video with motion graphics and captions', category: 'Video & Animation', subCategory: 'Video Editing', tags: ['youtube', 'editing', 'captions', 'motion'], description: 'Turn raw footage into a binge-worthy video with pacing and motion graphics.' },
  { title: 'I will build an AI chatbot with custom knowledge base', category: 'AI Services', subCategory: 'Chatbots', tags: ['ai', 'chatbot', 'gpt', 'automation'], description: 'Deploy a custom-trained AI assistant that answers from your data.' },
  { title: 'I will write engaging blog posts that rank on Google', category: 'Writing & Translation', subCategory: 'Blog Writing', tags: ['blog', 'seo', 'content', 'articles'], description: 'Research-driven articles that inform readers and impress Google.' },
  { title: 'I will create 3D product animation for your website', category: 'Video & Animation', subCategory: '3D Animation', tags: ['3d', 'product', 'animation', 'blender'], description: 'Stunning 3D product visuals that make your offering look premium.' },
  { title: 'I will set up your Google and Facebook ads campaigns', category: 'Digital Marketing', subCategory: 'PPC', tags: ['ads', 'google', 'facebook', 'conversions'], description: 'Launch profitable ad campaigns from scratch or fix underperforming ones.' },
  { title: 'I will do professional voice over in English with studio quality', category: 'Music & Audio', subCategory: 'Voice Over', tags: ['voiceover', 'audio', 'narration', 'commercial'], description: 'Warm, clear, professional English voice overs for commercials and videos.' },
];

async function main() {
  await mongoose.connect(config.mongoUri);
  console.log('Connected to MongoDB, dropping old data...');

  await mongoose.connection.dropDatabase();

  console.log('Creating categories...');
  await Category.insertMany(CATEGORIES);

  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@demo.com',
    password: 'admin12345',
    role: 'admin',
    avatar: AVATARS[0],
    bio: 'Platform administrator',
  });

  const buyer = await User.create({
    name: 'Test Buyer',
    email: 'buyer@demo.com',
    password: 'password123',
    role: 'buyer',
    avatar: AVATARS[1],
    location: 'United Kingdom',
  });

  console.log('Creating sellers...');
  const sellers = [];
  for (let i = 0; i < SELLERS.length; i++) {
    const s = SELLERS[i];
    const seller = await User.create({
      name: s.name,
      email: s.email,
      password: 'password123',
      role: 'seller',
      isSeller: true,
      verifiedSeller: i % 3 !== 0,
      avatar: AVATARS[i + 2],
      tagline: s.tagline,
      bio: s.bio,
      skills: s.skills,
      location: s.location,
      languages: s.languages,
      education: [
        { school: 'State University', degree: 'B.Sc in ' + s.skills[0] + ' Studies', field: s.skills[0], startYear: 2012 + i, endYear: 2016 + i },
      ],
      employment: [
        { company: s.skills[0] + ' Studio', title: 'Senior Specialist', description: 'Led client projects end-to-end.', startDate: '06/2016', endDate: '01/2020' },
      ],
    });
    sellers.push(seller);
  }

  console.log('Creating gigs...');
  const gigs = [];
  for (let i = 0; i < GIG_TEMPLATES.length; i++) {
    const t = GIG_TEMPLATES[i];
    const seller = sellers[i % sellers.length];
    const basePrice = 15 + ((i * 13) % 90);

    const gig = await Gig.create({
      seller: seller._id,
      title: t.title,
      description: t.description,
      category: t.category,
      subCategory: t.subCategory,
      tags: t.tags,
      images: [GIG_IMAGES[i % GIG_IMAGES.length], GIG_IMAGES[(i + 3) % GIG_IMAGES.length]],
      packages: {
        basic: { name: 'basic', title: 'Basic', description: 'Essential package to get started', price: basePrice, deliveryDays: 2 + (i % 3), revisions: 0, features: ['Core deliverable', '1 source file', 'Fast turnaround'] },
        standard: { name: 'standard', title: 'Standard', description: 'Most popular — best value', price: basePrice * 2 + 10, deliveryDays: 4 + (i % 4), revisions: 2, features: ['Everything in Basic', 'Full customization', '2 revisions included'] },
        premium: { name: 'premium', title: 'Premium', description: 'Complete solution with full attention', price: basePrice * 4 + 25, deliveryDays: 7 + (i % 5), revisions: 5, features: ['Everything in Standard', 'Unlimited revisions', 'Source files included'] },
      },
      requirements: ['Describe your project goals', 'Share any references or examples', 'Provide brand assets if available'],
      active: true,
      featured: i < 4,
      sales: 20 + i * 37,
      views: 500 + i * 340,
      rating: i % 2 === 0 ? 5 : 4.9,
      ratingCount: 8 + i * 11,
    });
    gigs.push(gig);
  }

  console.log('Creating orders & reviews...');
  for (let i = 0; i < 9; i++) {
    const gig = gigs[i % gigs.length];
    const seller = gig.seller;
    const pkgKeys = ['basic', 'standard', 'premium'];
    const key = pkgKeys[i % 3];
    const pkg = gig.packages[key];
    const serviceFee = Math.round(pkg.price * 0.08 * 100) / 100;
    const done = i % 3 !== 2;

    const order = await Order.create({
      orderId: 'FS-' + (1000 + i),
      buyer: buyer._id,
      seller,
      gig: gig._id,
      gigTitle: gig.title,
      gigImage: gig.images[0],
      packageName: key,
      packageTitle: pkg.title,
      price: pkg.price,
      deliveryDays: pkg.deliveryDays,
      revisions: pkg.revisions,
      serviceFee,
      total: Math.round((pkg.price + serviceFee) * 100) / 100,
      requirements: 'I need this delivered with attention to detail.',
      status: done ? 'completed' : i % 3 === 1 ? 'in_progress' : 'delivered',
      completedAt: done ? new Date(Date.now() - i * 86400000 * 3) : undefined,
      deliveredWork: done
        ? { message: 'Thanks for your order! Please find the deliverable attached.', deliveredAt: new Date(Date.now() - i * 86400000 * 4) }
        : undefined,
      deadline: new Date(Date.now() + 5 * 86400000),
      reviewed: done,
      payoutStatus: done ? 'released' : 'pending',
    });

    if (done) {
      await Review.create({
        order: order._id,
        gig: gig._id,
        reviewer: buyer._id,
        seller,
        rating: i % 2 === 0 ? 5 : 4,
        text: i % 2 === 0
          ? 'Amazing work! Exceeded my expectations and delivered right on time.'
          : 'Very good quality work. Communication was great and the seller was responsive.',
      });
    }
  }

  console.log('Done. Summary:');
  console.log('  - Admin:  admin@demo.com / admin12345');
  console.log('  - Buyer:  buyer@demo.com / password123');
  console.log('  - Seller: aarav@demo.com / password123');
  console.log('  - ' + (await User.countDocuments()) + ' users, ' + (await Gig.countDocuments()) + ' gigs');

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
