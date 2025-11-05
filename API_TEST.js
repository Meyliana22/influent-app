/**
 * API Test Script
 * Use this in browser console to test the campaign API
 */

// Test 1: Fetch all campaigns
async function testGetCampaigns() {
  console.log('🧪 Testing: Get all campaigns');
  try {
    const response = await fetch('https://influent-api-1fnn.vercel.app/api/v1/campaigns?limit=50');
    const data = await response.json();
    console.log('✅ Success:', data);
    console.log(`📊 Found ${data.data?.length || 0} campaigns`);
    return data;
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Test 2: Fetch single campaign
async function testGetCampaignById(id) {
  console.log(`🧪 Testing: Get campaign #${id}`);
  try {
    const response = await fetch(`https://influent-api-1fnn.vercel.app/api/v1/campaigns/${id}`);
    const data = await response.json();
    console.log('✅ Success:', data);
    return data;
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Test 3: Create campaign
async function testCreateCampaign() {
  console.log('🧪 Testing: Create new campaign');
  const campaignData = {
    title: "Test Campaign",
    campaign_category: "Beauty & Fashion",
    influencer_category: "Beauty & Fashion",
    has_product: true,
    product_name: "Test Product",
    product_value: 100000,
    product_desc: "Test product description",
    start_date: "2025-12-01",
    end_date: "2025-12-31",
    submission_deadline: "2025-11-25",
    content_guidelines: "Test guidelines",
    caption_guidelines: "Test caption",
    influencer_count: 5,
    price_per_post: 50000,
    min_followers: 10000,
    selected_gender: "female",
    selected_age: "18-24 tahun",
    status: "draft",
    contentTypes: [
      {
        content_type: "foto",
        post_count: 1
      }
    ]
  };
  
  try {
    const response = await fetch('https://influent-api-1fnn.vercel.app/api/v1/campaigns', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(campaignData)
    });
    const data = await response.json();
    console.log('✅ Success:', data);
    return data;
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Test 4: Update campaign
async function testUpdateCampaign(id) {
  console.log(`🧪 Testing: Update campaign #${id}`);
  const updateData = {
    title: "Updated Test Campaign",
    campaign_category: "Technology",
    status: "active"
  };
  
  try {
    const response = await fetch(`https://influent-api-1fnn.vercel.app/api/v1/campaigns/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData)
    });
    const data = await response.json();
    console.log('✅ Success:', data);
    return data;
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Test 5: Delete campaign
async function testDeleteCampaign(id) {
  console.log(`🧪 Testing: Delete campaign #${id}`);
  try {
    const response = await fetch(`https://influent-api-1fnn.vercel.app/api/v1/campaigns/${id}`, {
      method: 'DELETE'
    });
    const data = await response.json();
    console.log('✅ Success:', data);
    return data;
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Running all API tests...\n');
  
  // Test 1: Get all campaigns
  await testGetCampaigns();
  console.log('\n---\n');
  
  // Test 2: Get specific campaign (using ID 27 from your example)
  await testGetCampaignById(27);
  console.log('\n---\n');
  
  // Test 3: Create campaign
  const createResult = await testCreateCampaign();
  const newCampaignId = createResult?.data?.campaign_id;
  console.log('\n---\n');
  
  if (newCampaignId) {
    // Test 4: Update the newly created campaign
    await testUpdateCampaign(newCampaignId);
    console.log('\n---\n');
    
    // Test 5: Delete the test campaign
    await testDeleteCampaign(newCampaignId);
  }
  
  console.log('\n✅ All tests completed!');
}

// Export for use in browser console
console.log('📝 API Test functions loaded!');
console.log('Available functions:');
console.log('  - testGetCampaigns()');
console.log('  - testGetCampaignById(id)');
console.log('  - testCreateCampaign()');
console.log('  - testUpdateCampaign(id)');
console.log('  - testDeleteCampaign(id)');
console.log('  - runAllTests()');
console.log('\nRun: runAllTests() to test everything');
