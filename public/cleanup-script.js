/**
 * localStorage Cleanup & Fix Script
 * Paste this in browser console to fix data issues
 */

console.log('🧹 Starting localStorage cleanup...\n');

// Step 1: Backup existing data
console.log('📦 Step 1: Backing up existing data...');
const backupData = {};
['campaigns', 'applicants', 'campaignDatabase', 'applicantDatabase'].forEach(key => {
  const value = localStorage.getItem(key);
  if (value) {
    backupData[key] = value;
    console.log(`  ✓ Backed up ${key}: ${(new Blob([value]).size / 1024).toFixed(2)} KB`);
  }
});

// Step 2: Merge and deduplicate data
console.log('\n🔄 Step 2: Merging data from old and new keys...');

let finalCampaigns = [];
let finalApplicants = [];

// Merge campaigns
const campaignsNew = localStorage.getItem('campaigns');
const campaignsOld = localStorage.getItem('campaignDatabase');

if (campaignsNew) {
  finalCampaigns = JSON.parse(campaignsNew);
  console.log(`  ✓ Loaded ${finalCampaigns.length} campaigns from 'campaigns'`);
}

if (campaignsOld && !campaignsNew) {
  finalCampaigns = JSON.parse(campaignsOld);
  console.log(`  ✓ Migrated ${finalCampaigns.length} campaigns from 'campaignDatabase'`);
}

// Merge applicants
const applicantsNew = localStorage.getItem('applicants');
const applicantsOld = localStorage.getItem('applicantDatabase');

if (applicantsNew) {
  finalApplicants = JSON.parse(applicantsNew);
  console.log(`  ✓ Loaded ${finalApplicants.length} applicants from 'applicants'`);
}

if (applicantsOld && !applicantsNew) {
  finalApplicants = JSON.parse(applicantsOld);
  console.log(`  ✓ Migrated ${finalApplicants.length} applicants from 'applicantDatabase'`);
}

// Step 3: Ensure data consistency
console.log('\n🔧 Step 3: Ensuring data consistency...');

// Normalize campaign IDs to strings
finalCampaigns = finalCampaigns.map(c => ({
  ...c,
  campaign_id: String(c.campaign_id)
}));
console.log('  ✓ Normalized campaign IDs to strings');

// Ensure all applicants have isSelected field
let updatedCount = 0;
finalApplicants = finalApplicants.map(a => {
  if (a.isSelected === undefined) {
    updatedCount++;
    return { ...a, isSelected: false };
  }
  return a;
});
if (updatedCount > 0) {
  console.log(`  ✓ Added isSelected field to ${updatedCount} applicants`);
}

// Normalize applicant campaign IDs
finalApplicants = finalApplicants.map(a => ({
  ...a,
  campaignId: String(a.campaignId)
}));
console.log('  ✓ Normalized applicant campaign IDs to strings');

// Step 4: Remove old keys and save new data
console.log('\n💾 Step 4: Cleaning up and saving...');

// Remove old keys
if (localStorage.getItem('campaignDatabase')) {
  localStorage.removeItem('campaignDatabase');
  console.log('  ✓ Removed old key: campaignDatabase');
}

if (localStorage.getItem('applicantDatabase')) {
  localStorage.removeItem('applicantDatabase');
  console.log('  ✓ Removed old key: applicantDatabase');
}

// Save clean data
localStorage.setItem('campaigns', JSON.stringify(finalCampaigns));
console.log(`  ✓ Saved ${finalCampaigns.length} campaigns to 'campaigns'`);

localStorage.setItem('applicants', JSON.stringify(finalApplicants));
console.log(`  ✓ Saved ${finalApplicants.length} applicants to 'applicants'`);

// Step 5: Verify data
console.log('\n✅ Step 5: Verification...');
console.log(`  Campaigns: ${finalCampaigns.length}`);
console.log(`  Applicants: ${finalApplicants.length}`);

if (finalCampaigns.length > 0) {
  console.log('\n📋 Campaign Summary:');
  finalCampaigns.forEach(c => {
    const applicantCount = finalApplicants.filter(a => a.campaignId === c.campaign_id).length;
    console.log(`  - ${c.campaign_id}: ${c.title} (${c.status}) - ${applicantCount} applicants`);
  });
}

// Step 6: Check for issues
console.log('\n🔍 Step 6: Checking for issues...');
let issueCount = 0;

// Check for orphaned applicants
const orphanedApplicants = finalApplicants.filter(a => 
  !finalCampaigns.find(c => c.campaign_id === a.campaignId)
);
if (orphanedApplicants.length > 0) {
  console.warn(`  ⚠️  Found ${orphanedApplicants.length} orphaned applicants (no matching campaign)`);
  issueCount++;
}

// Check for campaigns with no applicants (if they should have some)
const campaignsWithoutApplicants = finalCampaigns.filter(c => 
  c.status === 'Active' && 
  c.isPaid && 
  finalApplicants.filter(a => a.campaignId === c.campaign_id).length === 0
);
if (campaignsWithoutApplicants.length > 0) {
  console.warn(`  ⚠️  Found ${campaignsWithoutApplicants.length} active paid campaigns with no applicants`);
  issueCount++;
}

if (issueCount === 0) {
  console.log('  ✓ No issues found!');
}

// Final summary
console.log('\n' + '='.repeat(50));
console.log('✨ Cleanup Complete!');
console.log('='.repeat(50));
console.log(`
📊 Final Status:
  - localStorage keys: ${Object.keys(localStorage).length}
  - Campaigns: ${finalCampaigns.length}
  - Applicants: ${finalApplicants.length}
  - Issues: ${issueCount}

💡 Next Steps:
  1. Refresh the page (F5 or Ctrl+R)
  2. Check if campaigns load properly
  3. Try viewing applicants on active campaigns
  4. Check browser console for any errors

🔧 Debug Commands:
  - window.campaignStorage.getAllCampaigns()
  - window.applicantStorage.getAllApplicants()
  - window.campaignStorage.seedDummyData() (reset all data)
`);

console.log('='.repeat(50));
