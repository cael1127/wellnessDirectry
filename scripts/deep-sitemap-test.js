#!/usr/bin/env node

/**
 * Deep Sitemap Test Script
 * Comprehensive testing for Google Search Console issues
 */

const https = require('https');
const http = require('http');

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://minbod.netlify.app';
const SITEMAP_URL = `${BASE_URL}/sitemap.xml`;
const ROBOTS_URL = `${BASE_URL}/robots.txt`;

function makeRequest(url, userAgent = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)') {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    const options = {
      headers: {
        'User-Agent': userAgent,
        'Accept': 'application/xml, text/xml, */*',
        'Accept-Encoding': 'gzip, deflate',
      }
    };
    
    client.get(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
          url: url
        });
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

function analyzeHeaders(headers) {
  const analysis = {
    contentType: headers['content-type'] || 'Not set',
    contentLength: headers['content-length'] || 'Not set',
    server: headers['server'] || 'Not set',
    cacheControl: headers['cache-control'] || 'Not set',
    lastModified: headers['last-modified'] || 'Not set',
    etag: headers['etag'] || 'Not set',
    xRobotsTag: headers['x-robots-tag'] || 'Not set',
    issues: []
  };

  // Check for potential issues
  if (!analysis.contentType.includes('xml')) {
    analysis.issues.push('Content-Type is not XML');
  }
  
  if (analysis.contentType.includes('text/html')) {
    analysis.issues.push('Content-Type is HTML instead of XML');
  }
  
  if (analysis.xRobotsTag.includes('noindex')) {
    analysis.issues.push('X-Robots-Tag contains noindex - this blocks Google!');
  }
  
  if (analysis.cacheControl.includes('no-cache') || analysis.cacheControl.includes('private')) {
    analysis.issues.push('Cache-Control might prevent proper crawling');
  }

  return analysis;
}

function validateXMLStructure(xml) {
  const issues = [];
  
  // Check XML declaration
  if (!xml.trim().startsWith('<?xml')) {
    issues.push('Missing XML declaration');
  }
  
  // Check for BOM or invisible characters
  if (xml.charCodeAt(0) === 0xFEFF) {
    issues.push('File has BOM (Byte Order Mark) - remove it');
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
  
  // Check for malformed URLs
  const locMatches = xml.match(/<loc>(.*?)<\/loc>/g) || [];
  locMatches.forEach((match, index) => {
    const url = match.replace(/<\/?loc>/g, '');
    if (!url.startsWith('http')) {
      issues.push(`URL ${index + 1}: Not a valid HTTP URL - ${url}`);
    }
    if (url.includes('localhost') || url.includes('127.0.0.1')) {
      issues.push(`URL ${index + 1}: Contains localhost - ${url}`);
    }
  });
  
  return {
    isValid: issues.length === 0,
    issues,
    urlCount
  };
}

async function testWithDifferentUserAgents() {
  console.log('🤖 Testing with different User Agents...\n');
  
  const userAgents = [
    'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'curl/7.68.0'
  ];
  
  for (const ua of userAgents) {
    try {
      const response = await makeRequest(SITEMAP_URL, ua);
      console.log(`User-Agent: ${ua.substring(0, 50)}...`);
      console.log(`Status: ${response.statusCode}`);
      console.log(`Content-Type: ${response.headers['content-type']}`);
      console.log(`X-Robots-Tag: ${response.headers['x-robots-tag'] || 'Not set'}`);
      console.log('---');
    } catch (error) {
      console.log(`User-Agent: ${ua.substring(0, 50)}...`);
      console.log(`Error: ${error.message}`);
      console.log('---');
    }
  }
}

async function runDeepTest() {
  console.log('🔍 Deep Sitemap Analysis for Google Search Console\n');
  console.log(`Testing: ${SITEMAP_URL}\n`);
  
  try {
    // Test 1: Basic accessibility
    console.log('📊 Test 1: Basic Accessibility');
    const response = await makeRequest(SITEMAP_URL);
    console.log(`Status Code: ${response.statusCode}`);
    
    if (response.statusCode !== 200) {
      console.log('❌ Sitemap not accessible - this is the problem!');
      return;
    }
    
    // Test 2: Header analysis
    console.log('\n📋 Test 2: Header Analysis');
    const headerAnalysis = analyzeHeaders(response.headers);
    console.log(`Content-Type: ${headerAnalysis.contentType}`);
    console.log(`Content-Length: ${headerAnalysis.contentLength}`);
    console.log(`Server: ${headerAnalysis.server}`);
    console.log(`Cache-Control: ${headerAnalysis.cacheControl}`);
    console.log(`X-Robots-Tag: ${headerAnalysis.xRobotsTag}`);
    
    if (headerAnalysis.issues.length > 0) {
      console.log('\n⚠️  Header Issues Found:');
      headerAnalysis.issues.forEach(issue => console.log(`  - ${issue}`));
    } else {
      console.log('\n✅ Headers look good!');
    }
    
    // Test 3: XML structure validation
    console.log('\n🔍 Test 3: XML Structure Validation');
    const xmlValidation = validateXMLStructure(response.body);
    
    if (xmlValidation.isValid) {
      console.log('✅ XML structure is valid!');
      console.log(`📈 Found ${xmlValidation.urlCount} URLs`);
    } else {
      console.log('❌ XML structure issues:');
      xmlValidation.issues.forEach(issue => console.log(`  - ${issue}`));
    }
    
    // Test 4: Different user agents
    await testWithDifferentUserAgents();
    
    // Test 5: Robots.txt check
    console.log('\n🤖 Test 5: Robots.txt Check');
    try {
      const robotsResponse = await makeRequest(ROBOTS_URL);
      const robotsContent = robotsResponse.body;
      
      if (robotsContent.includes('Sitemap:') && robotsContent.includes('sitemap.xml')) {
        console.log('✅ Sitemap referenced in robots.txt');
      } else {
        console.log('❌ Sitemap NOT referenced in robots.txt');
      }
      
      if (robotsContent.includes('Disallow: /sitemap')) {
        console.log('❌ Sitemap is disallowed in robots.txt!');
      } else {
        console.log('✅ Sitemap is not disallowed');
      }
    } catch (error) {
      console.log(`❌ Could not fetch robots.txt: ${error.message}`);
    }
    
    // Summary
    console.log('\n📊 Summary:');
    console.log(`Status: ${response.statusCode === 200 ? '✅ Accessible' : '❌ Not accessible'}`);
    console.log(`Headers: ${headerAnalysis.issues.length === 0 ? '✅ Good' : '❌ Issues found'}`);
    console.log(`XML: ${xmlValidation.isValid ? '✅ Valid' : '❌ Invalid'}`);
    console.log(`URLs: ${xmlValidation.urlCount}`);
    
    if (response.statusCode === 200 && headerAnalysis.issues.length === 0 && xmlValidation.isValid) {
      console.log('\n🎉 Your sitemap is perfect! The "couldn\'t fetch" error is likely:');
      console.log('  1. Google\'s cache lag (wait 24-48 hours)');
      console.log('  2. Crawl budget limits');
      console.log('  3. Temporary Google issues');
      console.log('\n💡 Try these advanced solutions:');
      console.log('  - Use URL Inspection tool to request indexing of your homepage');
      console.log('  - Submit a sitemap index instead of individual sitemap');
      console.log('  - Check if your domain has any manual actions in GSC');
    }
    
  } catch (error) {
    console.error('❌ Error testing sitemap:', error.message);
  }
}

// Run the test
runDeepTest();
