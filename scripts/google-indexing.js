#!/usr/bin/env node

import fs from 'fs';
import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

// Path to your service account key
const KEY_FILE = process.env.GOOGLE_SERVICE_ACCOUNT_KEY || 
  './google-indexing-key.json';

// Your sitemap URL or path
const SITEMAP_URL = process.env.SITEMAP_URL || 
  'https://gamecity.vercel.app/sitemap.xml';

// Google Indexing API scope
const SCOPES = ['https://www.googleapis.com/auth/indexing'];

async function getAuthClient() {
  const keyFile = JSON.parse(fs.readFileSync(KEY_FILE, 'utf8'));
  
  return new JWT({
    email: keyFile.client_email,
    key: keyFile.private_key,
    scopes: SCOPES,
  });
}

async function fetchSitemapUrls(sitemapUrl) {
  // For simplicity, return some common URLs
  // In production, you'd parse the actual sitemap XML
  return [
    'https://gamecity.vercel.app/',
    'https://gamecity.vercel.app/category/laptops',
    'https://gamecity.vercel.app/category/monitors',
    'https://gamecity.vercel.app/category/graphics-cards',
    // Add more URLs as needed
  ];
}

async function submitUrl(authClient, url) {
  try {
    const indexing = google.indexing({ version: 'v3', auth: authClient });
    
    const response = await indexing.urlNotifications.publish({
      requestBody: {
        url: url,
        type: 'URL_UPDATED',
      },
    });
    
    console.log(`✓ Submitted: ${url}`);
    return response.data;
  } catch (error) {
    console.error(`✗ Failed to submit ${url}:`, error.message);
    return null;
  }
}

async function main() {
  console.log('🚀 Starting Google Indexing API submission...');
  
  try {
    // Get auth client
    const authClient = await getAuthClient();
    console.log('✓ Authenticated with Google');
    
    // Get URLs to submit
    const urls = await fetchSitemapUrls(SITEMAP_URL);
    console.log(`📋 Found ${urls.length} URLs to submit`);
    
    // Submit each URL (Google allows 200/day)
    const results = [];
    for (const url of urls.slice(0, 200)) {
      const result = await submitUrl(authClient, url);
      results.push(result);
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(`\n✅ Done! Submitted ${results.filter(r => r).length}/${urls.length} URLs`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
