/**
 * FIX NO APPLICANTS - Run this in browser console
 */

console.log('🔧 Checking why applicants not showing...\n');

// Step 1: Check URL
const url = window.location.pathname;
const urlParts = url.split('/');
const campaignIdFromUrl = urlParts[2]; // Should be after '/campaign/'
console.log('1️⃣ URL Analysis:');
console.log('   Full URL:', window.location.href);
console.log('   Campaign ID from URL:', campaignIdFromUrl, `(${typeof campaignIdFromUrl})`);

// Step 2: Check localStorage campaigns
const campaigns = JSON.parse(localStorage.getItem('campaigns') || '[]');
console.log('\n2️⃣ Campaigns in localStorage:', campaigns.length);
campaigns.forEach(c => {
  console.log(`   - ID: "${c.campaign_id}" (${typeof c.campaign_id}) | Title: ${c.title} | Status: ${c.status} | Paid: ${c.isPaid}`);
});

// Step 3: Check localStorage applicants
const applicants = JSON.parse(localStorage.getItem('applicants') || '[]');
console.log('\n3️⃣ Applicants in localStorage:', applicants.length);

// Group by campaign
const byCampaign = {};
applicants.forEach(a => {
  const cid = a.campaignId;
  if (!byCampaign[cid]) byCampaign[cid] = [];
  byCampaign[cid].push(a);
});

console.log('   Grouped by campaign:');
Object.keys(byCampaign).forEach(cid => {
  console.log(`   - Campaign "${cid}" (${typeof cid}): ${byCampaign[cid].length} applicants`);
});

// Step 4: Try to match
console.log('\n4️⃣ Matching Analysis:');
const matchedCampaign = campaigns.find(c => 
  c.campaign_id === campaignIdFromUrl || 
  String(c.campaign_id) === String(campaignIdFromUrl)
);

if (matchedCampaign) {
  console.log('   ✅ Campaign FOUND:', matchedCampaign.title);
  
  const matchedApplicants = applicants.filter(a => 
    a.campaignId === matchedCampaign.campaign_id || 
    String(a.campaignId) === String(matchedCampaign.campaign_id)
  );
  
  console.log(`   ✅ Found ${matchedApplicants.length} applicants for this campaign`);
  
  if (matchedApplicants.length === 0) {
    console.error('   ❌ No applicants match this campaign ID!');
    console.log('   💡 Applicant campaign IDs:', [...new Set(applicants.map(a => a.campaignId))]);
  }
} else {
  console.error('   ❌ Campaign NOT FOUND');
  console.log('   Available campaign IDs:', campaigns.map(c => c.campaign_id));
  console.log('   Looking for:', campaignIdFromUrl);
}

// Step 5: Diagnosis
console.log('\n5️⃣ Diagnosis:');

if (campaigns.length === 0) {
  console.error('   ❌ PROBLEM: No campaigns in localStorage');
  console.log('   🔧 FIX: Run window.campaignStorage.seedDummyData()');
}

if (applicants.length === 0) {
  console.error('   ❌ PROBLEM: No applicants in localStorage');
  console.log('   🔧 FIX: Run window.campaignStorage.seedDummyData()');
}

if (campaigns.length > 0 && applicants.length > 0) {
  // Check ID type consistency
  const campaignIdTypes = [...new Set(campaigns.map(c => typeof c.campaign_id))];
  const applicantIdTypes = [...new Set(applicants.map(a => typeof a.campaignId))];
  
  console.log('   Campaign ID types:', campaignIdTypes);
  console.log('   Applicant campaignId types:', applicantIdTypes);
  
  if (campaignIdTypes.length > 1 || applicantIdTypes.length > 1) {
    console.error('   ❌ PROBLEM: Inconsistent ID types (mixed string/number)');
    console.log('   🔧 FIX: Normalize all IDs to strings');
  }
  
  // Check if any applicants exist for active paid campaigns
  const activePaidCampaigns = campaigns.filter(c => c.status === 'Active' && c.isPaid);
  console.log(`\n   Active+Paid campaigns: ${activePaidCampaigns.length}`);
  
  activePaidCampaigns.forEach(c => {
    const count = applicants.filter(a => 
      a.campaignId === c.campaign_id || 
      String(a.campaignId) === String(c.campaign_id)
    ).length;
    console.log(`   - ${c.title} (ID: ${c.campaign_id}): ${count} applicants`);
  });
}

// Step 6: Auto-fix
console.log('\n6️⃣ AUTO-FIX OPTIONS:\n');

console.log('Option A - Reseed data (recommended):');
console.log('```javascript');
console.log('localStorage.removeItem("campaigns");');
console.log('localStorage.removeItem("applicants");');
console.log('window.campaignStorage.seedDummyData();');
console.log('window.location.reload();');
console.log('```\n');

console.log('Option B - Normalize IDs:');
console.log('```javascript');
console.log('let c = JSON.parse(localStorage.getItem("campaigns") || "[]");');
console.log('let a = JSON.parse(localStorage.getItem("applicants") || "[]");');
console.log('c = c.map(x => ({...x, campaign_id: String(x.campaign_id)}));');
console.log('a = a.map(x => ({...x, campaignId: String(x.campaignId)}));');
console.log('localStorage.setItem("campaigns", JSON.stringify(c));');
console.log('localStorage.setItem("applicants", JSON.stringify(a));');
console.log('window.location.reload();');
console.log('```\n');

console.log('Option C - Nuclear (clear everything):');
console.log('```javascript');
console.log('localStorage.clear();');
console.log('window.location.reload();');
console.log('// After reload: window.campaignStorage.seedDummyData();');
console.log('```\n');

console.log('='.repeat(60));
console.log('Copy salah satu option di atas dan paste di console!');
