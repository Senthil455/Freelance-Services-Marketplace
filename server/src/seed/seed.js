import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from '../config/index.js';
import User from '../models/User.js';
import Gig from '../models/Gig.js';
import Order from '../models/Order.js';
import Review from '../models/Review.js';
import Category from '../models/Category.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import Notification from '../models/Notification.js';

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
  'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1200&q=80',
  'https://images.unsplash.com/photo-1547658719-da2b51169166?w=1200&q=80',
  'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=1200&q=80',
  'https://images.unsplash.com/photo-1531501415072-90ba400173d2?w=1200&q=80',
];

const SELLERS = [
  { name: 'Aarav Sharma', email: 'aarav@demo.com', tagline: 'Full-stack developer with 8+ years of experience', bio: 'I build fast, scalable web applications using React, Node.js and MongoDB. I have delivered 500+ projects for startups and enterprises around the world.', skills: ['React', 'Node.js', 'MongoDB', 'TypeScript'], location: 'India', languages: [{ name: 'English', level: 'Fluent' }, { name: 'Hindi', level: 'Native' }] },
  { name: 'Elena Petrova', email: 'elena@demo.com', tagline: 'Brand identity designer crafting memorable logos', bio: 'Logo and brand identity designer. I create timeless identities that help businesses stand out. Bachelor of Fine Arts with 6 years of agency experience.', skills: ['Logo Design', 'Branding', 'Illustrator', 'Figma'], location: 'Ukraine', languages: [{ name: 'English', level: 'Fluent' }, { name: 'Ukrainian', level: 'Native' }] },
  { name: 'Marcus Johnson', email: 'marcus@demo.com', tagline: 'SEO & growth marketing specialist', bio: 'I help businesses grow organically through technical SEO, content strategy and conversion optimization. 120+ successful campaigns.', skills: ['SEO', 'Google Analytics', 'Content Strategy', 'GA4'], location: 'United States', languages: [{ name: 'English', level: 'Native' }] },
  { name: 'Sofia Martinez', email: 'sofia@demo.com', tagline: 'Award-winning UX/UI designer', bio: 'I design intuitive product experiences. Former design lead at fintech startups. Portfolio includes 30+ shipped apps with millions of users.', skills: ['UI Design', 'UX Research', 'Figma', 'Design Systems'], location: 'Spain', languages: [{ name: 'English', level: 'Fluent' }, { name: 'Spanish', level: 'Native' }] },
  { name: 'Kenji Watanabe', email: 'kenji@demo.com', tagline: 'Video editor for YouTube & social media', bio: 'I edit engaging videos that keep viewers watching. 200M+ total views generated for creator clients. Fast turnaround, unlimited revisions on edit style.', skills: ['Video Editing', 'Premiere Pro', 'After Effects', 'Motion Design'], location: 'Japan', languages: [{ name: 'English', level: 'Fluent' }, { name: 'Japanese', level: 'Native' }] },
  { name: 'Amara Okafor', email: 'amara@demo.com', tagline: 'AI automation engineer & prompt specialist', bio: 'I build AI chatbots, agents and automations that save businesses 20+ hours per week. Certified in OpenAI, LangChain and RAG architectures.', skills: ['ChatGPT', 'LangChain', 'Python', 'Zapier'], location: 'Nigeria', languages: [{ name: 'English', level: 'Fluent' }] },
];

const GIG_TEMPLATES = [
  { title: 'I will build a modern responsive website with React and Node.js', category: 'Programming & Tech', subCategory: 'Web Development', tags: ['react', 'website', 'responsive', 'mern'], description: 'I will design and develop a full-stack, mobile-first website for your business. You get clean code, a blazing-fast frontend, a secure backend, and a CMS-friendly structure so you can update content yourself.\n\nWhy work with me:\n- 500+ projects delivered\n- Pixel-perfect, mobile-first design\n- Fast, secure, SEO-friendly code\n- Unlimited communication during the project\n\nI work with React, Next.js, Node.js, Express, MongoDB and PostgreSQL. Share your idea and I will bring it to life.' },
  { title: 'I will design a professional logo and complete brand identity', category: 'Graphic Design', subCategory: 'Logo Design', tags: ['logo', 'branding', 'identity', 'design'], description: 'Give your brand a face it deserves. I will craft a unique, professional logo plus a complete visual identity — color palette, typography, and brand guidelines.\n\nIncludes:\n- 3 original logo concepts\n- Unlimited revisions until you love it\n- Source files in AI, PDF, PNG, SVG\n- 2 days average delivery\n\nYour brand is your story. Let me tell it beautifully.' },
  { title: 'I will do complete on-page SEO and technical SEO audit', category: 'Digital Marketing', subCategory: 'SEO', tags: ['seo', 'google', 'audit', 'rankings'], description: 'Get your website to rank on Google. I perform a full technical SEO audit, on-page optimization, keyword research and competitor analysis.\n\nDeliverables:\n- Full crawl audit report\n- Optimized meta tags and schema\n- Keyword strategy with volume data\n- Prioritized action roadmap\n\n100+ sites ranked and counting. Free mini-audit before you order.' },
  { title: 'I will design a beautiful mobile app UI/UX in Figma', category: 'Graphic Design', subCategory: 'UI/UX Design', tags: ['app', 'ui', 'ux', 'figma'], description: 'An intuitive, beautiful app interface that users love. I deliver high-fidelity Figma designs with working prototypes, design systems and handoff-ready files.\n\nI have designed apps with over 10M downloads. Your app deserves the same treatment.' },
  { title: 'I will edit your YouTube video with motion graphics and captions', category: 'Video & Animation', subCategory: 'Video Editing', tags: ['youtube', 'editing', 'captions', 'motion'], description: 'Turn raw footage into a binge-worthy video. I edit with pacing, sound design, motion graphics, captions and color grading tuned to your niche.\n\nIncluded:\n- 4K export in your aspect ratio\n- Custom intro/outro\n- Auto-captions + subtitles\n- Thumbnail design option' },
  { title: 'I will build an AI chatbot with custom knowledge base', category: 'AI Services', subCategory: 'Chatbots', tags: ['ai', 'chatbot', 'gpt', 'automation'], description: 'Deploy a custom-trained AI assistant that answers from YOUR data — docs, FAQs, product catalogs. Chatbot with your branding, privacy-safe, hosted anywhere.\n\nSet up in days, not months. Includes admin dashboard, analytics and Slack/WhatsApp integration options.' },
  { title: 'I will write engaging blog posts that rank on Google', category: 'Writing & Translation', subCategory: 'Blog Writing', tags: ['blog', 'seo', 'content', 'articles'], description: 'Research-driven articles that inform your readers and impress Google. I write long-form content optimized with on-page SEO, internal linking, and original research.\n\n- 1500+ word SEO articles\n- Keyword optimized\n- Plagiarism-free guarantee\n- Fact-checked, ready to publish' },
  { title: 'I will create 3D product animation for your website', category: 'Video & Animation', subCategory: '3D Animation', tags: ['3d', 'product', 'animation', 'blender'], description: 'Stunning 3D product visuals that make your offering look premium in seconds. Perfect for e-commerce, kickstarter videos or homepage heroes.\n\nFull process: concept → modeling → animation → rendering at 4K.' },
  { title: 'I will set up your Google and Facebook ads campaigns', category: 'Digital Marketing', subCategory: 'PPC', tags: ['ads', 'google', 'facebook', 'conversions'], description: 'Launch profitable ad campaigns from scratch or fix underperforming ones. Audience research, creatives direction, tracking setup, and weekly optimization reports.\n\nAverage ROAS improvement: 3.2x in the first 60 days.' },
  { title: 'I will do professional voice over in English with studio quality', category: 'Music & Audio', subCategory: 'Voice Over', tags: ['voiceover', 'audio', 'narration', 'commercial'], description: 'Warm, clear, professional English voice overs for commercials, e-learning, explainer videos and IVR. Recorded on studio-grade gear with noise-free delivery.\n\n- Broadcast quality delivery (WAV/MP3)\n- 24h first delivery\n- Direction notes welcome' },
];

const ORDER_ID_SEQ = { n: 1000 };

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
        { school: 'State University', degree: `B.Sc in ${s.skills[0]} Studies`, field: s.skills[0], startYear: 2012 + i, endYear: 2016 + i },
      ],
      employment: [
        { company: `${s.skills[0]} Studio`, title: 'Senior Specialist', description: 'Led client projects end-to-end.', startDate: '06/2016', endDate: '01/2020' },
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
        standard: { name: 'standard', title: 'Standard', description: 'Most popular — best value for most projects', price: basePrice * 2 + 10, deliveryDays: 4 + (i % 4), revisions: 2, features: ['Everything in Basic', 'Full customization', '2 revisions included', 'Priority support'] },
        premium: { name: 'premium', title: 'Premium', description: 'Complete solution with full attention', price: basePrice * 4 + 25, deliveryDays: 7 + (i % 5), revisions: 5, features: ['Everything in Standard', 'Unlimited revisions', 'Dedicated support', 'Source files included'] },
      },
      requirements: ['Describe your project goals', 'Share any references or examples', 'Provide brand assets if available'],
      faqs: [
        { question: 'How quickly will I get my delivery?', answer: 'Standard delivery is 3-5 days. Rush delivery available on request.' },
        { question: 'What do you need from me to start?', answer: 'Just a brief description of what you want and any examples you like.' },
      ],
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
  const orders = [];
  for (let i = 0; i < 9; i++) {
    const gig = gigs[i % gigs.length];
    const seller = gig.seller;
    const pkgKeys = ['basic', 'standard', 'premium'];
    const key = pkgKeys[i % 3];
    const pkg = gig.packages[key];
    const serviceFee = Math.round(pkg.price * 0.08 * 100) / 100;
    const done = i % 3 !== 2;

    const order = await Order.create({
      orderId: `FS-${ORDER_ID_SEQ.n++}`,
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
      requirements: 'I need this delivered with attention to detail. Please contact me if you need more info.',
      status: done ? 'completed' : i % 3 === 1 ? 'in_progress' : 'delivered',
      completedAt: done ? new Date(Date.now() - i * 86400000 * 3) : undefined,
      deliveredWork: done
        ? { message: 'Thanks for your order! Please find the deliverable attached and let me know if you would like any changes.', deliveredAt: new Date(Date.now() - i * 86400000 * 4) }
        : undefined,
      deadline: new Date(Date.now() + 5 * 86400000),
      reviewed: done,
      payoutStatus: done ? 'released' : 'pending',
    });
    orders.push(order);

    if (done) {
      await Review.create({
        order: order._id,
        gig: gig._id,
        reviewer: buyer._id,
        seller,
        rating: i % 2 === 0 ? 5 : 4,
        communication: 5,
        quality: i % 2 === 0 ? 5 : 4,
        onTime: 5,
        text: i % 2 === 0
          ? 'Amazing work! Exceeded my expectations and delivered right on time. Highly recommended.'
          : 'Very good quality work. Communication was great and the seller was responsive to feedback.',
      });
      await User.updateOne({ _id: seller }, { $inc: { 'stats.ordersCompleted': 1, 'stats.totalEarnings': pkg.price } });
    }
  }

  console.log('Creating reviews for every gig...');
  const REVIEW_TEXTS = [
    'Absolutely fantastic work. Delivered ahead of schedule and exceeded my expectations in every way. Will definitely order again!',
    'Great experience overall. Quality is top notch and communication was smooth throughout the process.',
    'Very professional and easy to work with. The final result was exactly what I asked for.',
    'Impressive attention to detail. The seller went above and beyond to make sure I was happy with the outcome.',
    'Good work, quick delivery and friendly communication. Would recommend to anyone looking for quality.',
    'The seller understood my requirements perfectly and delivered a polished final product. Highly recommended.',
    'Fast, reliable and talented. Minor revisions were handled instantly without any hassle.',
    'Perfect result! Clear communication and beautiful execution. This seller is a gem on the platform.',
  ];
  for (let i = 0; i < gigs.length; i++) {
    const gig = gigs[i];
    const count = gig.ratingCount;
    const docs = [];
    for (let k = 0; k < count; k++) {
      const isPerfect = gig.rating >= 4.95 || k % 10 !== 0;
      const r = isPerfect ? 5 : 4;
      docs.push({
        gig: gig._id,
        reviewer: buyer._id,
        seller: gig.seller,
        rating: r,
        communication: r,
        quality: r,
        onTime: r,
        text: REVIEW_TEXTS[(i + k) % REVIEW_TEXTS.length],
        createdAt: new Date(Date.now() - (k + 1) * 86400000 * 2),
      });
    }
    await Review.insertMany(docs);
    console.log(`  - ${gig.title.slice(0, 40)}... ${count} reviews`);
  }

  console.log('Creating inbox conversations...');
  const conv = await Conversation.create({
    participants: [buyer._id, sellers[0]._id],
    gig: gigs[0]._id,
    lastMessageAt: new Date(Date.now() - 3600000),
    lastMessagePreview: 'Hi! I am interested in your services.',
  });
  await Message.create({
    conversation: conv._id,
    sender: buyer._id,
    text: 'Hi! I saw your gig and I am very interested. How soon can you start?',
  });
  await Message.create({
    conversation: conv._id,
    sender: sellers[0]._id,
    text: 'Hello! Thanks for reaching out. I can start immediately and deliver within 3 days. What are you building?',
  });

  const conv2 = await Conversation.create({
    participants: [buyer._id, sellers[2]._id],
    lastMessageAt: new Date(Date.now() - 7200000),
    lastMessagePreview: 'Sounds good — sending the brief now.',
  });
  await Message.create({ conversation: conv2._id, sender: sellers[2]._id, text: 'I can help with your SEO campaign. Do you have an analytics setup already?' });
  await Message.create({ conversation: conv2._id, sender: buyer._id, text: 'Sounds good — sending the brief now.' });

  console.log('Done. Summary:');
  console.log(`  - Admin:  admin@demo.com / admin12345`);
  console.log(`  - Buyer:  buyer@demo.com / password123`);
  console.log(`  - Seller: aarav@demo.com / password123`);
  console.log(`  - ${await User.countDocuments()} users, ${await Gig.countDocuments()} gigs, ${await Order.countDocuments()} orders`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});