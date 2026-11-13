import mysql from 'mysql2/promise';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

import User from '../models/User.js';
import Category from '../models/Category.js';
import Tag from '../models/Tag.js';
import Post from '../models/Post.js';
import Page from '../models/Page.js';
import Setting from '../models/Setting.js';
import Subscriber from '../models/Subscriber.js';

dotenv.config();

const WP_PREFIX = process.env.WP_TABLE_PREFIX || 'wa18_';

async function migrate() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/waytoonerd');
  console.log('Connected to MongoDB.');

  console.log('Connecting to WordPress MySQL database...');
  const connection = await mysql.createConnection({
    host: process.env.WP_DB_HOST || '127.0.0.1',
    port: parseInt(process.env.WP_DB_PORT) || 3306,
    user: process.env.WP_DB_USER || 'waytoo',
    password: process.env.WP_DB_PASS || 'waWA18!*',
    database: process.env.WP_DB_NAME || 'nerd_waytoonerd'
  });
  console.log('Connected to WordPress MySQL database.');

  // 1. Migrate Users
  console.log('--- Migrating Users ---');
  const [users] = await connection.query(`SELECT * FROM ${WP_PREFIX}users`);
  const userMap = new Map();

  for (const u of users) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Admin@12345', salt);
    
    let user = await User.findOne({ username: u.user_login });
    if (!user) {
      user = await User.create({
        wpId: u.ID,
        username: u.user_login,
        email: u.user_email,
        password: passwordHash,
        displayName: u.display_name || u.user_login,
        role: u.user_login === 'admin' ? 'admin' : 'editor',
        registeredAt: u.user_registered
      });
      console.log(`Created user: ${u.user_login}`);
    }
    userMap.set(u.ID, user);
  }

  // 2. Migrate Categories
  console.log('--- Migrating Categories ---');
  const [categories] = await connection.query(`
    SELECT t.term_id, t.name, t.slug, tt.description, tt.count
    FROM ${WP_PREFIX}terms t
    JOIN ${WP_PREFIX}term_taxonomy tt ON t.term_id = tt.term_id
    WHERE tt.taxonomy = 'category'
  `);
  
  // Yoast SEO per category
  const [yoastTaxMetaRow] = await connection.query(`SELECT option_value FROM ${WP_PREFIX}options WHERE option_name = 'wpseo_taxonomy_meta'`);
  let yoastTax = {};
  if (yoastTaxMetaRow.length > 0 && yoastTaxMetaRow[0].option_value) {
    try {
      // PHP serialized data contains text
      const val = yoastTaxMetaRow[0].option_value;
      // Simple regex parser for Yoast categories
    } catch (e) {}
  }

  const categoryMap = new Map();
  const catIcons = {
    'latest-tech-news': '/uploads/2019/07/news.png',
    'latest-android-updates': '/uploads/2019/07/android.png',
    'iphone': '/uploads/2019/07/apple-icon-1.png',
    'latest-ios-updates': '/uploads/2019/07/apple-icon-1.png',
    'windows-os': '/uploads/2019/07/windows.png',
    'mac-os': '/uploads/2019/07/mac-pc.png'
  };

  const catSEO = {
    'mac-os': { title: 'macOS support and fixing macOS problems at Waytoonerd', description: 'Want some macOS support? Well! We are gladly ready to assist you with your concern.' },
    'windows-os': { title: 'Windows problems and solutions, Windows Update, Tips and Troubleshooting', description: 'Windows has never gone out of fashion and will never be. Let’s explore some tips and tricks for Windows.' },
    'iphone': { title: 'Introducing latest iPhone release, price, features, rumors and more', description: 'Our team wants to develop your knowledge with respect to upcoming iPhones and latest features.' },
    'latest-ios-updates': { title: 'Acquainting with latest iOS updates and iOS problems', description: 'An iOS software problem is no less than a nightmare. Receiving immediate workarounds is our focus.' },
    'latest-tech-news': { title: 'All Tech News at one Place', description: 'At Waytoonerd, we are all set to equip you with what’s trending in the tech world.' },
    'latest-android-updates': { title: 'From Android Updates to Solving Android Problems; All at one place!', description: 'Here, we destine for providing high-standard blogs required to resolve Android problems.' }
  };

  for (const c of categories) {
    let cat = await Category.findOne({ slug: c.slug });
    if (!cat) {
      cat = await Category.create({
        wpTermId: c.term_id,
        name: c.name,
        slug: c.slug,
        description: c.description || '',
        postCount: c.count,
        icon: catIcons[c.slug] || '',
        seo: catSEO[c.slug] || { title: '', description: '', focusKeyword: '' }
      });
    } else {
      cat.icon = catIcons[c.slug] || cat.icon;
      cat.postCount = c.count;
      await cat.save();
    }
    categoryMap.set(c.term_id, cat);
  }
  console.log(`Migrated ${categories.length} categories.`);

  // 3. Migrate Tags
  console.log('--- Migrating Tags ---');
  const [tags] = await connection.query(`
    SELECT t.term_id, t.name, t.slug, tt.count
    FROM ${WP_PREFIX}terms t
    JOIN ${WP_PREFIX}term_taxonomy tt ON t.term_id = tt.term_id
    WHERE tt.taxonomy = 'post_tag'
  `);
  const tagMap = new Map();
  for (const t of tags) {
    let tag = await Tag.findOne({ slug: t.slug });
    if (!tag) {
      tag = await Tag.create({
        wpTermId: t.term_id,
        name: t.name,
        slug: t.slug,
        postCount: t.count
      });
    }
    tagMap.set(t.term_id, tag);
  }
  console.log(`Migrated ${tags.length} tags.`);

  // 4. Migrate Post Views ( wa18_post_views )
  console.log('--- Loading View Counts ---');
  const [views] = await connection.query(`
    SELECT id, count FROM ${WP_PREFIX}post_views WHERE type = 4 AND period = 'total'
  `);
  const viewsMap = new Map();
  for (const v of views) {
    viewsMap.set(v.id, v.count);
  }

  // 5. Migrate Posts
  console.log('--- Migrating Posts ---');
  const [posts] = await connection.query(`
    SELECT p.*, att.guid as featured_image_guid
    FROM ${WP_PREFIX}posts p
    LEFT JOIN ${WP_PREFIX}postmeta pm ON p.ID = pm.post_id AND pm.meta_key = '_thumbnail_id'
    LEFT JOIN ${WP_PREFIX}posts att ON pm.meta_value = att.ID
    WHERE p.post_type = 'post' AND p.post_status = 'publish'
  `);

  for (const p of posts) {
    // Get Categories and Tags for this post
    const [terms] = await connection.query(`
      SELECT tt.taxonomy, tt.term_id
      FROM ${WP_PREFIX}term_relationships tr
      JOIN ${WP_PREFIX}term_taxonomy tt ON tr.term_taxonomy_id = tt.term_taxonomy_id
      WHERE tr.object_id = ?
    `, [p.ID]);

    const postCats = [];
    const postCatNames = [];
    const postTags = [];
    const postTagNames = [];

    for (const term of terms) {
      if (term.taxonomy === 'category' && categoryMap.has(term.term_id)) {
        const catObj = categoryMap.get(term.term_id);
        postCats.push(catObj._id);
        postCatNames.push(catObj.name);
      } else if (term.taxonomy === 'post_tag' && tagMap.has(term.term_id)) {
        const tagObj = tagMap.get(term.term_id);
        postTags.push(tagObj._id);
        postTagNames.push(tagObj.name);
      }
    }

    // Get Yoast SEO postmeta
    const [meta] = await connection.query(`
      SELECT meta_key, meta_value FROM ${WP_PREFIX}postmeta WHERE post_id = ?
    `, [p.ID]);
    const metaMap = {};
    for (const m of meta) {
      metaMap[m.meta_key] = m.meta_value;
    }

    // Clean image URLs in content
    let cleanContent = p.post_content || '';
    cleanContent = cleanContent.replace(/https?:\/\/(localhost:8080|waytoonerd\.com)\/wp-content\/uploads\//g, '/uploads/');

    let featImg = p.featured_image_guid || '';
    if (featImg) {
      featImg = featImg.replace(/https?:\/\/(localhost:8080|waytoonerd\.com)\/wp-content\/uploads\//g, '/uploads/');
    }

    const authorObj = userMap.get(p.post_author) || { _id: null, displayName: 'Sachin' };

    await Post.findOneAndUpdate(
      { slug: p.post_name },
      {
        wpId: p.ID,
        title: p.post_title,
        slug: p.post_name,
        content: cleanContent,
        excerpt: p.post_excerpt || cleanContent.substring(0, 150).replace(/<[^>]*>/g, ''),
        status: p.post_status,
        author: {
          id: authorObj._id,
          name: authorObj.displayName
        },
        categories: postCats,
        categoryNames: postCatNames,
        tags: postTags,
        tagNames: postTagNames,
        featuredImage: {
          url: featImg,
          alt: p.post_title
        },
        views: viewsMap.get(p.ID) || 0,
        publishedAt: p.post_date,
        seo: {
          metaTitle: metaMap['_yoast_wpseo_title'] || p.post_title,
          metaDescription: metaMap['_yoast_wpseo_metadesc'] || '',
          focusKeyword: metaMap['_yoast_wpseo_focuskw'] || '',
          canonicalUrl: metaMap['_yoast_wpseo_canonical'] || ''
        }
      },
      { upsert: true, new: true }
    );
  }
  console.log(`Migrated ${posts.length} published posts.`);

  // 6. Migrate Pages
  console.log('--- Migrating Pages ---');
  const [pages] = await connection.query(`
    SELECT * FROM ${WP_PREFIX}posts WHERE post_type = 'page' AND post_status = 'publish'
  `);

  const heroBanners = [
    { title: "HOW TO UNLOCK IPHONE WITHOUT PASSCODE ON IOS 12!", videoUrl: "https://www.youtube.com/watch?v=wefSMq2tl7E", imageUrl: "/uploads/2019/06/assistive-touch-696x392.jpg", gridSpan: 6 },
    { title: "HOW TO UNLOCK IPHONE WITHOUT PASSCODE ON IOS 12!", videoUrl: "https://www.youtube.com/watch?v=wefSMq2tl7E", imageUrl: "/uploads/2019/06/assistive-touch-696x392.jpg", gridSpan: 3 },
    { title: "HOW TO UNLOCK IPHONE WITHOUT PASSCODE ON IOS 12!", videoUrl: "https://www.youtube.com/watch?v=wefSMq2tl7E", imageUrl: "/uploads/2019/06/assistive-touch-696x392.jpg", gridSpan: 3 },
    { title: "Tech News Highlights", videoUrl: "https://www.youtube.com/watch?v=wefSMq2tl7E", imageUrl: "/uploads/2019/07/news.png", gridSpan: 4 },
    { title: "iPhone Tutorials", videoUrl: "https://www.youtube.com/watch?v=wefSMq2tl7E", imageUrl: "/uploads/2019/07/apple-icon-1.png", gridSpan: 4 },
    { title: "Android Solutions", videoUrl: "https://www.youtube.com/watch?v=wefSMq2tl7E", imageUrl: "/uploads/2019/07/android.png", gridSpan: 4 }
  ];

  for (const page of pages) {
    let cleanContent = page.post_content || '';
    cleanContent = cleanContent.replace(/https?:\/\/(localhost:8080|waytoonerd\.com)\/wp-content\/uploads\//g, '/uploads/');

    await Page.findOneAndUpdate(
      { slug: page.post_name },
      {
        wpId: page.ID,
        title: page.post_title,
        slug: page.post_name,
        content: cleanContent,
        status: page.post_status,
        layout: page.post_name === 'home' ? 'home-hero' : 'standard',
        heroBanners: page.post_name === 'home' ? heroBanners : [],
        seo: {
          metaTitle: `${page.post_title} - WayTooNerd`,
          metaDescription: `${page.post_title} on WayTooNerd`
        }
      },
      { upsert: true, new: true }
    );
  }
  console.log(`Migrated ${pages.length} pages.`);

  // 7. Migrate Subscribers
  console.log('--- Migrating Subscribers ---');
  const [subscribers] = await connection.query(`SELECT * FROM ${WP_PREFIX}es_emaillist`);
  for (const s of subscribers) {
    if (s.es_email_mail) {
      await Subscriber.findOneAndUpdate(
        { email: s.es_email_mail },
        {
          name: s.es_email_name || '',
          email: s.es_email_mail,
          status: 'subscribed',
          source: 'wordpress_es_emaillist'
        },
        { upsert: true }
      );
    }
  }
  console.log(`Migrated subscribers.`);

  // 8. Migrate Site Settings & Menus
  console.log('--- Migrating Site Settings & Menus ---');
  const settings = {
    siteName: 'Waytoonerd',
    tagline: 'Waytoonerd',
    contactPhone: '+919953609096',
    contactEmail: 'info@waytoonerd.com',
    socialLinks: {
      facebook: 'https://www.facebook.com/waytoonerd/',
      linkedin: 'https://www.linkedin.com/company/waytoonerd/',
      instagram: 'https://www.instagram.com/waytoonerd_/',
      twitter: 'https://twitter.com/waytoonerd_in',
      youtube: 'https://www.youtube.com/channel/UC03Dea7inYwgaAifNat1oZg',
      pinterest: 'https://in.pinterest.com/waytoonerd/'
    },
    menus: {
      main: [
        { label: 'Tech News', path: '/category/latest-tech-news' },
        { label: 'Android', path: '/category/latest-android-updates' },
        { label: 'iPhone', path: '/category/iphone' },
        { label: 'iOS', path: '/category/latest-ios-updates' },
        { label: 'Windows OS', path: '/category/windows-os' },
        { label: 'Mac OS', path: '/category/mac-os' },
        { label: 'How-tos', path: '/category/how-tos' },
        { label: 'Review Hub', path: '/category/review-hub' },
        { label: 'Top Picks', path: '/category/top-picks' }
      ],
      top: [
        { label: 'Privacy Policy', path: '/privacy-policy' },
        { label: 'Contact Us', path: '/contact-us' },
        { label: 'About Us', path: '/about-us' }
      ],
      footer: [
        { label: 'Tech News', path: '/category/latest-tech-news' },
        { label: 'Android', path: '/category/latest-android-updates' },
        { label: 'iPhone', path: '/category/iphone' },
        { label: 'iOS', path: '/category/latest-ios-updates' },
        { label: 'Windows OS', path: '/category/windows-os' },
        { label: 'Mac OS', path: '/category/mac-os' },
        { label: 'How-tos', path: '/category/how-tos' },
        { label: 'Review Hub', path: '/category/review-hub' },
        { label: 'Top Picks', path: '/category/top-picks' }
      ]
    }
  };

  for (const [key, val] of Object.entries(settings)) {
    await Setting.findOneAndUpdate({ key }, { key, value: val }, { upsert: true });
  }

  console.log('Migration completed successfully!');
  await connection.end();
  await mongoose.disconnect();
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});

