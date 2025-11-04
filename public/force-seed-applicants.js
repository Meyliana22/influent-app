/**
 * FORCE SEED & FIX APPLICANTS
 * Copy dan paste seluruh file ini ke browser console
 */

console.log('🔧 FORCE SEEDING APPLICANTS DATA\n');
console.log('='.repeat(60));

// Get current URL to check campaign ID
const urlPath = window.location.pathname;
const urlParts = urlPath.split('/');
const campaignIdFromUrl = urlParts[2];
console.log('Current Campaign ID from URL:', campaignIdFromUrl);

// FORCE SEED - Manually create applicants
const forceApplicants = [
  // 10 applicants for campaign 1001 (Beauty)
  {
    id: '1',
    campaignId: '1001',
    influencerName: 'beautyguru_ina',
    fullName: 'Sarah Johnson',
    location: 'Jakarta',
    age: 26,
    gender: 'Female',
    followers: 45000,
    engagementRate: 6.5,
    status: 'Accepted',
    isSelected: true,
    appliedDate: new Date('2025-10-16T10:30:00').toISOString(),
    bio: 'Beauty enthusiast & skincare lover 💄✨',
    instagram: 'https://instagram.com/beautyguru_ina',
    email: 'sarah.j@email.com',
    phone: '+6281234567890',
    niche: ['Beauty & Fashion', 'Lifestyle & Travel'],
    proofUploaded: true,
    portfolioLink: 'https://instagram.com/beautyguru_ina',
    previousBrands: ['Loreal', 'Maybelline', 'Wardah']
  },
  {
    id: '2',
    campaignId: '1001',
    influencerName: 'makeupbyme',
    fullName: 'Linda Chen',
    location: 'Bandung',
    age: 24,
    gender: 'Female',
    followers: 32000,
    engagementRate: 7.8,
    status: 'Accepted',
    isSelected: true,
    appliedDate: new Date('2025-10-16T14:20:00').toISOString(),
    bio: 'Makeup artist & beauty content creator 🎨',
    instagram: 'https://instagram.com/makeupbyme',
    email: 'linda.chen@email.com',
    phone: '+6281234567891',
    niche: ['Beauty & Fashion'],
    proofUploaded: true,
    portfolioLink: 'https://instagram.com/makeupbyme',
    previousBrands: ['MAC', 'Sephora']
  },
  {
    id: '3',
    campaignId: '1001',
    influencerName: 'skincare_diary',
    fullName: 'Amanda Putri',
    location: 'Surabaya',
    age: 28,
    gender: 'Female',
    followers: 38000,
    engagementRate: 5.9,
    status: 'Pending',
    isSelected: false,
    appliedDate: new Date('2025-10-17T09:15:00').toISOString(),
    bio: 'Skincare enthusiast | Product reviews 🧴',
    instagram: 'https://instagram.com/skincare_diary',
    email: 'amanda.p@email.com',
    phone: '+6281234567892',
    niche: ['Beauty & Fashion', 'Health & Sport'],
    proofUploaded: true,
    portfolioLink: 'https://instagram.com/skincare_diary',
    previousBrands: ['The Ordinary', 'Cetaphil']
  },
  {
    id: '4',
    campaignId: '1001',
    influencerName: 'beauty_byjess',
    fullName: 'Jessica Tan',
    location: 'Jakarta',
    age: 25,
    gender: 'Female',
    followers: 28000,
    engagementRate: 6.2,
    status: 'Pending',
    isSelected: false,
    appliedDate: new Date('2025-10-17T11:30:00').toISOString(),
    bio: 'Beauty blogger | Honest reviews ✨',
    instagram: 'https://instagram.com/beauty_byjess',
    email: 'jessica.tan@email.com',
    phone: '+6281234567893',
    niche: ['Beauty & Fashion'],
    proofUploaded: true,
    portfolioLink: 'https://instagram.com/beauty_byjess',
    previousBrands: []
  },
  {
    id: '5',
    campaignId: '1001',
    influencerName: 'glam_queen',
    fullName: 'Michelle Lee',
    location: 'Bali',
    age: 27,
    gender: 'Female',
    followers: 52000,
    engagementRate: 7.1,
    status: 'Pending',
    isSelected: false,
    appliedDate: new Date('2025-10-17T13:45:00').toISOString(),
    bio: 'Glamorous lifestyle | Beauty & fashion 👑',
    instagram: 'https://instagram.com/glam_queen',
    email: 'michelle.lee@email.com',
    phone: '+6281234567894',
    niche: ['Beauty & Fashion', 'Lifestyle & Travel'],
    proofUploaded: true,
    portfolioLink: 'https://instagram.com/glam_queen',
    previousBrands: ['Estee Lauder', 'Clinique']
  },
  {
    id: '6',
    campaignId: '1001',
    influencerName: 'natural_beauty',
    fullName: 'Olivia Wong',
    location: 'Jakarta',
    age: 23,
    gender: 'Female',
    followers: 19000,
    engagementRate: 5.4,
    status: 'Rejected',
    isSelected: false,
    appliedDate: new Date('2025-10-17T15:00:00').toISOString(),
    bio: 'Natural beauty advocate 🌿',
    instagram: 'https://instagram.com/natural_beauty',
    email: 'olivia.wong@email.com',
    phone: '+6281234567895',
    niche: ['Beauty & Fashion', 'Health & Sport'],
    proofUploaded: true,
    portfolioLink: 'https://instagram.com/natural_beauty',
    previousBrands: []
  },
  {
    id: '7',
    campaignId: '1001',
    influencerName: 'luxe_makeup',
    fullName: 'Patricia Gunawan',
    location: 'Medan',
    age: 29,
    gender: 'Female',
    followers: 61000,
    engagementRate: 6.8,
    status: 'Pending',
    isSelected: false,
    appliedDate: new Date('2025-10-17T16:20:00').toISOString(),
    bio: 'Luxury makeup & beauty reviews 💎',
    instagram: 'https://instagram.com/luxe_makeup',
    email: 'patricia.g@email.com',
    phone: '+6281234567896',
    niche: ['Beauty & Fashion'],
    proofUploaded: true,
    portfolioLink: 'https://instagram.com/luxe_makeup',
    previousBrands: ['Chanel', 'Dior', 'YSL']
  },
  {
    id: '8',
    campaignId: '1001',
    influencerName: 'skincare_tips',
    fullName: 'Rachel Kim',
    location: 'Jakarta',
    age: 26,
    gender: 'Female',
    followers: 34000,
    engagementRate: 6.3,
    status: 'Pending',
    isSelected: false,
    appliedDate: new Date('2025-10-18T08:30:00').toISOString(),
    bio: 'K-beauty enthusiast | Skincare tips 🇰🇷',
    instagram: 'https://instagram.com/skincare_tips',
    email: 'rachel.kim@email.com',
    phone: '+6281234567897',
    niche: ['Beauty & Fashion'],
    proofUploaded: true,
    portfolioLink: 'https://instagram.com/skincare_tips',
    previousBrands: ['Innisfree', 'Laneige']
  },
  {
    id: '9',
    campaignId: '1001',
    influencerName: 'makeup_magic',
    fullName: 'Sophia Lim',
    location: 'Surabaya',
    age: 25,
    gender: 'Female',
    followers: 41000,
    engagementRate: 7.2,
    status: 'Pending',
    isSelected: false,
    appliedDate: new Date('2025-10-18T10:15:00').toISOString(),
    bio: 'Makeup tutorials & beauty hacks ✨',
    instagram: 'https://instagram.com/makeup_magic',
    email: 'sophia.lim@email.com',
    phone: '+6281234567898',
    niche: ['Beauty & Fashion'],
    proofUploaded: true,
    portfolioLink: 'https://instagram.com/makeup_magic',
    previousBrands: ['Benefit', 'Urban Decay']
  },
  {
    id: '10',
    campaignId: '1001',
    influencerName: 'beauty_blogger',
    fullName: 'Diana Wijaya',
    location: 'Bandung',
    age: 24,
    gender: 'Female',
    followers: 29000,
    engagementRate: 5.8,
    status: 'Pending',
    isSelected: false,
    appliedDate: new Date('2025-10-18T12:00:00').toISOString(),
    bio: 'Beauty blogger | Product reviews 💄',
    instagram: 'https://instagram.com/beauty_blogger',
    email: 'diana.w@email.com',
    phone: '+6281234567899',
    niche: ['Beauty & Fashion', 'Lifestyle & Travel'],
    proofUploaded: true,
    portfolioLink: 'https://instagram.com/beauty_blogger',
    previousBrands: ['Pixy', 'Emina']
  }
];

// Save to localStorage
localStorage.setItem('applicants', JSON.stringify(forceApplicants));
console.log('✅ Saved', forceApplicants.length, 'applicants to localStorage');

// Verify
const saved = JSON.parse(localStorage.getItem('applicants') || '[]');
console.log('✅ Verified:', saved.length, 'applicants in localStorage');

// Check match with current campaign
const matchingApplicants = saved.filter(a => a.campaignId === campaignIdFromUrl);
console.log(`✅ Found ${matchingApplicants.length} applicants for campaign ${campaignIdFromUrl}`);

console.log('\n' + '='.repeat(60));
console.log('✅ DONE! Reloading page...');
console.log('='.repeat(60));

setTimeout(() => window.location.reload(), 1000);
