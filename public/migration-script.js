/**
 * Data Migration & Debug Script
 * Run this in browser console to fix data issues
 */

console.log('🔧 Data Migration Script');
console.log('=========================\n');

// Check current data
console.log('📊 Current localStorage keys:');
Object.keys(localStorage).forEach(key => {
  const value = localStorage.getItem(key);
  const size = new Blob([value]).size;
  console.log(`  ${key}: ${(size / 1024).toFixed(2)} KB`);
});

console.log('\n🔍 Checking data format...');

// Check if old format exists
const oldCampaigns = localStorage.getItem('campaignDatabase');
const oldApplicants = localStorage.getItem('applicantDatabase');
const newCampaigns = localStorage.getItem('campaigns');
const newApplicants = localStorage.getItem('applicants');

if (oldCampaigns && !newCampaigns) {
  console.log('✅ Found campaignDatabase, migrating to campaigns...');
  localStorage.setItem('campaigns', oldCampaigns);
  console.log('   ✓ Migration complete');
}

if (oldApplicants && !newApplicants) {
  console.log('✅ Found applicantDatabase, migrating to applicants...');
  localStorage.setItem('applicants', oldApplicants);
  console.log('   ✓ Migration complete');
}

// Verify data
console.log('\n📈 Data Summary:');
try {
  const campaigns = JSON.parse(localStorage.getItem('campaigns') || '[]');
  const applicants = JSON.parse(localStorage.getItem('applicants') || '[]');
  
  console.log(`  Campaigns: ${campaigns.length}`);
  console.log(`  Applicants: ${applicants.length}`);
  
  if (campaigns.length > 0) {
    console.log('\n📋 Campaign IDs:');
    campaigns.forEach(c => {
      console.log(`  - ${c.campaign_id}: ${c.title} (${c.status})`);
    });
  }
  
  if (applicants.length > 0) {
    console.log('\n👥 Applicants by Campaign:');
    const byCampaign = {};
    applicants.forEach(a => {
      if (!byCampaign[a.campaignId]) byCampaign[a.campaignId] = [];
      byCampaign[a.campaignId].push(a);
    });
    
    Object.keys(byCampaign).forEach(cid => {
      const campaign = campaigns.find(c => c.campaign_id === cid);
      const campaignName = campaign ? campaign.title : 'Unknown';
      console.log(`  Campaign ${cid} (${campaignName}): ${byCampaign[cid].length} applicants`);
      
      // Show selection status
      const selected = byCampaign[cid].filter(a => a.isSelected).length;
      console.log(`    - ${selected} selected`);
    });
  }
  
  console.log('\n✅ Data check complete!');
  console.log('\n💡 Tips:');
  console.log('  - Use window.campaignStorage to manage campaigns');
  console.log('  - Use window.applicantStorage to manage applicants');
  console.log('  - Run window.campaignStorage.seedDummyData() to reset data');
  console.log('  - Refresh page to see changes');
  
} catch (error) {
  console.error('❌ Error checking data:', error);
}

console.log('\n=========================');
