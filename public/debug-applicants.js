/**
 * Debug Script for View Applicants Issue
 * Paste this in browser console to diagnose the problem
 */

console.log('🔍 Debugging View Applicants Issue\n');
console.log('='.repeat(50));

// Step 1: Check localStorage
console.log('\n📦 Step 1: Checking localStorage...');
const campaignsRaw = localStorage.getItem('campaigns');
const applicantsRaw = localStorage.getItem('applicants');

if (!campaignsRaw) {
  console.error('❌ No campaigns in localStorage!');
  console.log('💡 Solution: Run window.campaignStorage.seedDummyData()');
} else {
  const campaigns = JSON.parse(campaignsRaw);
  console.log(`✅ Found ${campaigns.length} campaigns`);
  
  // Check each campaign's structure
  console.log('\n📋 Campaign Details:');
  campaigns.forEach((c, idx) => {
    console.log(`\nCampaign ${idx + 1}:`);
    console.log(`  campaign_id: ${c.campaign_id} (${typeof c.campaign_id})`);
    console.log(`  title: ${c.title}`);
    console.log(`  status: ${c.status}`);
    console.log(`  isPaid: ${c.isPaid}`);
    console.log(`  Can view applicants: ${c.status === 'Active' && c.isPaid ? '✅ YES' : '❌ NO'}`);
  });
}

if (!applicantsRaw) {
  console.error('❌ No applicants in localStorage!');
  console.log('💡 Solution: Run window.campaignStorage.seedDummyData()');
} else {
  const applicants = JSON.parse(applicantsRaw);
  console.log(`\n✅ Found ${applicants.length} applicants`);
  
  // Group by campaign
  const byCampaign = {};
  applicants.forEach(a => {
    const cid = a.campaignId;
    if (!byCampaign[cid]) byCampaign[cid] = [];
    byCampaign[cid].push(a);
  });
  
  console.log('\n👥 Applicants by Campaign:');
  Object.keys(byCampaign).forEach(cid => {
    console.log(`  Campaign ${cid}: ${byCampaign[cid].length} applicants`);
  });
}

// Step 2: Check URL routing
console.log('\n🌐 Step 2: Checking URL routing...');
console.log('Current URL:', window.location.href);
const pathParts = window.location.pathname.split('/');
console.log('Path parts:', pathParts);

if (pathParts.includes('applicants')) {
  const campaignIdFromUrl = pathParts[pathParts.indexOf('campaign') + 1];
  console.log(`Campaign ID from URL: ${campaignIdFromUrl} (${typeof campaignIdFromUrl})`);
  
  // Try to find campaign
  if (campaignsRaw) {
    const campaigns = JSON.parse(campaignsRaw);
    const found = campaigns.find(c => 
      c.campaign_id === campaignIdFromUrl || 
      String(c.campaign_id) === String(campaignIdFromUrl)
    );
    
    if (found) {
      console.log('✅ Campaign found:', found.title);
    } else {
      console.error('❌ Campaign NOT found with ID:', campaignIdFromUrl);
      console.log('Available IDs:', campaigns.map(c => c.campaign_id));
    }
  }
}

// Step 3: Test navigation
console.log('\n🧪 Step 3: Test Data...');
if (campaignsRaw) {
  const campaigns = JSON.parse(campaignsRaw);
  const activePaidCampaigns = campaigns.filter(c => c.status === 'Active' && c.isPaid);
  
  if (activePaidCampaigns.length > 0) {
    console.log(`\n✅ Found ${activePaidCampaigns.length} Active+Paid campaigns`);
    console.log('\n📝 Test URLs (copy and paste in browser):');
    activePaidCampaigns.forEach(c => {
      const url = `http://localhost:3000/campaign/${c.campaign_id}/applicants`;
      console.log(`  ${c.title}:\n  ${url}`);
    });
  } else {
    console.warn('⚠️  No Active+Paid campaigns found');
    console.log('💡 Make sure at least one campaign has:');
    console.log('   - status: "Active"');
    console.log('   - isPaid: true');
  }
}

// Step 4: Quick fixes
console.log('\n\n🔧 Quick Fixes:');
console.log('='.repeat(50));

console.log('\n1️⃣ If campaigns not found:');
console.log('   localStorage.removeItem("campaigns");');
console.log('   localStorage.removeItem("applicants");');
console.log('   window.campaignStorage.seedDummyData();');
console.log('   location.reload();');

console.log('\n2️⃣ If ID type mismatch:');
console.log('   // Normalize all IDs to strings');
console.log('   let c = JSON.parse(localStorage.getItem("campaigns") || "[]");');
console.log('   c = c.map(camp => ({...camp, campaign_id: String(camp.campaign_id)}));');
console.log('   localStorage.setItem("campaigns", JSON.stringify(c));');
console.log('   let a = JSON.parse(localStorage.getItem("applicants") || "[]");');
console.log('   a = a.map(app => ({...app, campaignId: String(app.campaignId)}));');
console.log('   localStorage.setItem("applicants", JSON.stringify(a));');
console.log('   location.reload();');

console.log('\n3️⃣ If still not working:');
console.log('   // Nuclear option - complete reset');
console.log('   localStorage.clear();');
console.log('   location.reload();');

console.log('\n' + '='.repeat(50));
console.log('✅ Debug Complete!');
console.log('Check the console output above for issues.');
