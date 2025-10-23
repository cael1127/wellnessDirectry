#!/usr/bin/env node

/**
 * Sitemap Test Script
 * Tests sitemap accessibility and validates XML structure
 */

const https = require('https');
const http = require('http');

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://minbod.netlify.app';
const SITEMAP_URL = `${BASE_URL}/sitemap.xml`;

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    client.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

function validateXML(xml) {
  const issues = [];
  
  // Check for XML declaration
  if (!xml.startsWith('<?xml')) {
    issues.push('Missing XML declaration');
  }
  
  // Check for proper namespace
  if (!xml.includes('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"')) {
    issues.push('Missing or incorrect sitemap namespace');
  }
  
  // Check for urlset tags
  if (!xml.includes('<urlset') || !xml.includes('</urlset>')) {
    issues.push('Missing urlset tags');
  }
  
  // Count URLs
  const urlMatches = xml.match(/<url>/g);
  const urlCount = urlMatches ? urlMatches.length : 0;
  
  if (urlCount === 0) {
    issues.push('No URLs found in sitemap');
  }
  
  // Check for required elements in each URL
  const urlBlocks = xml.match(/<url>[\s\S]*?<\/url>/g) || [];
  urlBlocks.forEach((block, index) => {
    if (!block.includes('<loc>')) {
      issues.push(`URL ${index + 1}: Missing <loc> element`);
    }
    if (!block.includes('<lastmod>')) {
      issues.push(`URL ${index + 1}: Missing <lastmod> element`);
    }
    if (!block.includes('<changefreq>')) {
      issues.push(`URL ${index + 1}: Missing <changefreq> element`);
    }
    if (!block.includes('<priority>')) {
      issues.push(`URL ${index + 1}: Missing <priority> element`);
    }
  });
  
  return {
    isValid: issues.length === 0,
    issues,
    urlCount
  };
}

async function testSitemap() {
  console.log('🔍 Testing Sitemap...\n');
  console.log(`URL: ${SITEMAP_URL}\n`);
  
  try {
    const response = await makeRequest(SITEMAP_URL);
    
    console.log('📊 Response Details:');
    console.log(`Status Code: ${response.statusCode}`);
    console.log(`Content-Type: ${response.headers['content-type']}`);
    console.log(`Content-Length: ${response.headers['content-length'] || 'Unknown'}`);
    console.log(`Cache-Control: ${response.headers['cache-control'] || 'Not set'}\n`);
    
    if (response.statusCode !== 200) {
      console.log('❌ Sitemap returned non-200 status code');
      return;
    }
    
    if (!response.headers['content-type']?.includes('xml')) {
      console.log('⚠️  Warning: Content-Type is not XML');
    }
    
    console.log('🔍 Validating XML Structure...\n');
    const validation = validateXML(response.body);
    
    if (validation.isValid) {
      console.log('✅ Sitemap is valid!');
      console.log(`📈 Found ${validation.urlCount} URLs`);
    } else {
      console.log('❌ Sitemap has issues:');
      validation.issues.forEach(issue => {
        console.log(`  - ${issue}`);
      });
    }
    
    console.log('\n📋 Sample URLs:');
    const urlMatches = response.body.match(/<loc>(.*?)<\/loc>/g);
    if (urlMatches) {
      urlMatches.slice(0, 5).forEach(match => {
        const url = match.replace(/<\/?loc>/g, '');
        console.log(`  - ${url}`);
      });
      if (urlMatches.length > 5) {
        console.log(`  ... and ${urlMatches.length - 5} more`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error testing sitemap:', error.message);
  }
}

// Run the test
testSitemap();
