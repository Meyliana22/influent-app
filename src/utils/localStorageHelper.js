/**
 * Local Storage Helper Utilities
 * Untuk manage campaign data di localStorage
 */

export const localStorageHelper = {
  /**
   * Initialize and migrate data if needed
   */
  initializeData: () => {
    try {
      // Check if we already have data in new format
      const campaigns = localStorage.getItem('campaigns');
      const applicants = localStorage.getItem('applicants');
      
      // Try to migrate from old format
      const oldCampaigns = localStorage.getItem('campaignDatabase');
      const oldApplicants = localStorage.getItem('applicantDatabase');
      
      // If we have old format, migrate and clean up
      if (oldCampaigns && !campaigns) {
        console.log('🔄 Migrating campaignDatabase → campaigns');
        localStorage.setItem('campaigns', oldCampaigns);
        // Remove old key to prevent duplicates
        localStorage.removeItem('campaignDatabase');
      }
      
      if (oldApplicants && !applicants) {
        console.log('🔄 Migrating applicantDatabase → applicants');
        localStorage.setItem('applicants', oldApplicants);
        // Remove old key to prevent duplicates
        localStorage.removeItem('applicantDatabase');
      }
      
      // If new format exists, remove old keys if they still exist
      if (campaigns && oldCampaigns) {
        console.log('🧹 Cleaning up old campaignDatabase key');
        localStorage.removeItem('campaignDatabase');
      }
      
      if (applicants && oldApplicants) {
        console.log('🧹 Cleaning up old applicantDatabase key');
        localStorage.removeItem('applicantDatabase');
      }
      
      // If no data at all, seed dummy data
      if (!localStorage.getItem('campaigns')) {
        console.log('📦 Seeding dummy data...');
        localStorageHelper.seedDummyData();
      } else {
        console.log('✅ Data loaded successfully');
      }
    } catch (error) {
      console.error('Error initializing data:', error);
    }
  },

  /**
   * Get all campaigns from localStorage
   */
  getAllCampaigns: () => {
    try {
      return JSON.parse(localStorage.getItem('campaigns') || '[]');
    } catch (error) {
      console.error('Error reading campaigns from localStorage:', error);
      return [];
    }
  },

  /**
   * Get single campaign by ID
   */
  getCampaignById: (campaignId) => {
    try {
      const campaigns = JSON.parse(localStorage.getItem('campaigns') || '[]');
      return campaigns.find(c => c.campaign_id === campaignId);
    } catch (error) {
      console.error('Error reading campaign from localStorage:', error);
      return null;
    }
  },

  /**
   * Save/Update campaign
   */
  saveCampaign: (campaign) => {
    try {
      const campaigns = JSON.parse(localStorage.getItem('campaigns') || '[]');
      const existingIndex = campaigns.findIndex(c => c.campaign_id === campaign.campaign_id);
      
      if (existingIndex >= 0) {
        // Update existing
        campaigns[existingIndex] = {
          ...campaign,
          updated_at: new Date().toISOString()
        };
      } else {
        // Add new
        campaigns.push({
          ...campaign,
          campaign_id: campaign.campaign_id || Date.now().toString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
      
      localStorage.setItem('campaigns', JSON.stringify(campaigns));
      return true;
    } catch (error) {
      console.error('Error saving campaign to localStorage:', error);
      return false;
    }
  },

  /**
   * Delete campaign by ID
   */
  deleteCampaign: (campaignId) => {
    try {
      const campaigns = JSON.parse(localStorage.getItem('campaigns') || '[]');
      const filtered = campaigns.filter(c => c.campaign_id !== campaignId);
      localStorage.setItem('campaigns', JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Error deleting campaign from localStorage:', error);
      return false;
    }
  },

  /**
   * Clear all campaigns (DANGER!)
   */
  clearAllCampaigns: () => {
    try {
      localStorage.removeItem('campaigns');
      return true;
    } catch (error) {
      console.error('Error clearing campaigns from localStorage:', error);
      return false;
    }
  },

  /**
   * Export campaigns as JSON file
   */
  exportCampaigns: () => {
    try {
      const campaigns = JSON.parse(localStorage.getItem('campaigns') || '[]');
      const dataStr = JSON.stringify(campaigns, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `campaigns-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error('Error exporting campaigns:', error);
      return false;
    }
  },

  /**
   * Import campaigns from JSON file
   */
  importCampaigns: (jsonData) => {
    try {
      const campaigns = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      if (!Array.isArray(campaigns)) {
        throw new Error('Invalid data format. Expected array.');
      }
      localStorage.setItem('campaigns', JSON.stringify(campaigns));
      return true;
    } catch (error) {
      console.error('Error importing campaigns:', error);
      return false;
    }
  },

  /**
   * Get storage statistics
   */
  getStorageStats: () => {
    try {
      const campaigns = JSON.parse(localStorage.getItem('campaigns') || '[]');
      const dataSize = new Blob([JSON.stringify(campaigns)]).size;
      const dataSizeKB = (dataSize / 1024).toFixed(2);
      
      return {
        totalCampaigns: campaigns.length,
        dataSize: dataSizeKB + ' KB',
        active: campaigns.filter(c => c.status === 'Active').length,
        draft: campaigns.filter(c => c.status === 'Draft').length,
        closed: campaigns.filter(c => c.status === 'Closed').length,
        paid: campaigns.filter(c => c.isPaid).length
      };
    } catch (error) {
      console.error('Error getting storage stats:', error);
      return null;
    }
  },

  /**
   * Seed dummy data for testing
   */
  seedDummyData: () => {
    try {
      const dummyCampaigns = [
        {
          campaign_id: '1001',
          title: 'Beauty Product Launch',
          campaignCategory: 'Beauty & Fashion',
          category: ['Beauty & Fashion'],
          influencer_count: 5,
          price_per_post: 100000,
          min_followers: 10000,
          start_date: '2025-11-01',
          end_date: '2025-11-30',
          submission_deadline: '2025-10-25',
          content_guidelines: 'Wajib ada selfie dengan produk',
          caption_guidelines: 'Mention @brandname dan hashtag #beautycampaign',
          status: 'Active',
          isPaid: true,
          paidAt: new Date('2025-10-16').toISOString(),
          selectedGender: 'female',
          selectedAge: '18-24 tahun',
          productName: 'Skincare Serum',
          productValue: 250000,
          productDesc: 'Serum anti-aging dengan vitamin C',
          contentItems: [{ id: 1, post_count: 2, content_type: 'foto' }],
          created_at: new Date('2025-10-15').toISOString(),
          updated_at: new Date('2025-10-15').toISOString()
        },
        {
          campaign_id: '1002',
          title: 'Food Delivery Promo',
          campaignCategory: 'Food & Beverages',
          category: ['Food & Beverages'],
          influencer_count: 10,
          price_per_post: 75000,
          min_followers: 5000,
          start_date: '2025-10-25',
          end_date: '2025-11-15',
          submission_deadline: '2025-10-20',
          content_guidelines: 'Review makanan dengan honest opinion',
          caption_guidelines: 'Include promo code FOOD10',
          status: 'Draft',
          isPaid: false,
          selectedGender: 'male',
          selectedAge: '25-34 tahun',
          productDesc: 'Promosi aplikasi delivery makanan dengan diskon 50%',
          contentItems: [
            { id: 1, post_count: 1, content_type: 'foto' },
            { id: 2, post_count: 1, content_type: 'story' }
          ],
          created_at: new Date('2025-10-16').toISOString(),
          updated_at: new Date('2025-10-16').toISOString()
        },
        {
          campaign_id: '1003',
          title: 'Gaming Tournament',
          campaignCategory: 'Gaming',
          category: ['Gaming', 'Entertainment'],
          influencer_count: 3,
          price_per_post: 200000,
          min_followers: 50000,
          start_date: '2025-12-01',
          end_date: '2025-12-31',
          submission_deadline: '2025-11-20',
          content_guidelines: 'Gameplay footage minimum 5 menit',
          caption_guidelines: 'Tag official tournament account',
          status: 'Active',
          isPaid: true,
          paidAt: new Date('2025-10-17').toISOString(),
          selectedGender: 'male',
          selectedAge: '18-24 tahun',
          productName: 'Gaming Mouse',
          productValue: 500000,
          productDesc: 'Tournament gaming untuk promosi produk gaming gear',
          contentItems: [{ id: 1, post_count: 3, content_type: 'video' }],
          created_at: new Date('2025-10-17').toISOString(),
          updated_at: new Date('2025-10-17').toISOString()
        }
      ];
      
      localStorage.setItem('campaigns', JSON.stringify(dummyCampaigns));
      
      // Seed applicants data
      const dummyApplicants = [
        // Applicants for campaign 1001 (Beauty) - 10 applicants
        {
          id: '1',
          campaignId: '1001',
          influencerName: '@beautyguru_ina',
          fullName: 'Sarah Johnson',
          location: 'Jakarta',
          age: 26,
          gender: 'Female',
          followers: 45000,
          engagementRate: 5.2,
          status: 'Accepted',
          isSelected: true,
          appliedDate: new Date('2025-10-16T10:30:00').toISOString(),
          bio: 'Beauty enthusiast & skincare lover 💄✨ | Collab: sarah@email.com',
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
          influencerName: '@makeupbyme',
          fullName: 'Linda Tan',
          location: 'Bandung',
          age: 24,
          gender: 'Female',
          followers: 32000,
          engagementRate: 4.8,
          status: 'Accepted',
          isSelected: true,
          appliedDate: new Date('2025-10-16T11:15:00').toISOString(),
          bio: 'MUA & beauty content creator 💋 | Book me: linda@email.com',
          instagram: 'https://instagram.com/makeupbyme',
          email: 'linda.tan@email.com',
          phone: '+6281234567891',
          niche: ['Beauty & Fashion'],
          proofUploaded: true,
          portfolioLink: 'https://instagram.com/makeupbyme',
          previousBrands: ['MAC', 'Sephora']
        },
        {
          id: '3',
          campaignId: '1001',
          influencerName: '@skincare_diary',
          fullName: 'Amanda Lee',
          location: 'Surabaya',
          age: 28,
          gender: 'Female',
          followers: 38000,
          engagementRate: 5.5,
          status: 'Pending',
          isSelected: false,
          appliedDate: new Date('2025-10-17T09:20:00').toISOString(),
          bio: 'Skincare addict sharing my journey 🧴 | DM for collab',
          instagram: 'https://instagram.com/skincare_diary',
          email: 'amanda.lee@email.com',
          phone: '+6281234567892',
          niche: ['Beauty & Fashion', 'Health & Sport'],
          proofUploaded: true,
          portfolioLink: 'https://instagram.com/skincare_diary',
          previousBrands: ['The Ordinary', 'Cetaphil']
        },
        {
          id: '10',
          campaignId: '1001',
          influencerName: '@beauty_byjess',
          fullName: 'Jessica Wijaya',
          location: 'Jakarta',
          age: 25,
          gender: 'Female',
          followers: 28000,
          engagementRate: 4.2,
          status: 'Pending',
          isSelected: false,
          appliedDate: new Date('2025-10-17T10:30:00').toISOString(),
          bio: 'Beauty & lifestyle blogger ✨ | Honest reviews only',
          instagram: 'https://instagram.com/beauty_byjess',
          email: 'jessica.w@email.com',
          phone: '+6281234567899',
          niche: ['Beauty & Fashion', 'Lifestyle & Travel'],
          proofUploaded: false,
          portfolioLink: 'https://instagram.com/beauty_byjess',
          previousBrands: []
        },
        {
          id: '11',
          campaignId: '1001',
          influencerName: '@glam_queen',
          fullName: 'Michelle Tania',
          location: 'Medan',
          age: 27,
          gender: 'Female',
          followers: 52000,
          engagementRate: 6.1,
          status: 'Pending',
          isSelected: false,
          appliedDate: new Date('2025-10-17T11:45:00').toISOString(),
          bio: 'Makeup artist & beauty influencer 💅',
          instagram: 'https://instagram.com/glam_queen',
          email: 'michelle.t@email.com',
          phone: '+6281234567810',
          niche: ['Beauty & Fashion'],
          proofUploaded: true,
          portfolioLink: 'https://instagram.com/glam_queen',
          previousBrands: ['Estee Lauder', 'Clinique']
        },
        {
          id: '12',
          campaignId: '1001',
          influencerName: '@natural_beauty',
          fullName: 'Olivia Chen',
          location: 'Semarang',
          age: 23,
          gender: 'Female',
          followers: 19000,
          engagementRate: 3.8,
          status: 'Rejected',
          isSelected: false,
          appliedDate: new Date('2025-10-17T13:20:00').toISOString(),
          bio: 'Natural beauty advocate 🌿',
          instagram: 'https://instagram.com/natural_beauty',
          email: 'olivia.c@email.com',
          phone: '+6281234567811',
          niche: ['Beauty & Fashion', 'Health & Sport'],
          proofUploaded: false,
          portfolioLink: 'https://instagram.com/natural_beauty',
          previousBrands: []
        },
        {
          id: '13',
          campaignId: '1001',
          influencerName: '@luxe_makeup',
          fullName: 'Patricia Lim',
          location: 'Surabaya',
          age: 29,
          gender: 'Female',
          followers: 61000,
          engagementRate: 5.9,
          status: 'Pending',
          isSelected: false,
          appliedDate: new Date('2025-10-17T14:50:00').toISOString(),
          bio: 'Luxury beauty content 💎 | Collabs: patricia@agency.com',
          instagram: 'https://instagram.com/luxe_makeup',
          email: 'patricia.l@email.com',
          phone: '+6281234567812',
          niche: ['Beauty & Fashion'],
          proofUploaded: true,
          portfolioLink: 'https://instagram.com/luxe_makeup',
          previousBrands: ['Chanel', 'Dior', 'YSL']
        },
        {
          id: '14',
          campaignId: '1001',
          influencerName: '@skincare_tips',
          fullName: 'Rachel Tan',
          location: 'Bali',
          age: 26,
          gender: 'Female',
          followers: 34000,
          engagementRate: 4.5,
          status: 'Pending',
          isSelected: false,
          appliedDate: new Date('2025-10-17T16:10:00').toISOString(),
          bio: 'Skincare tips & routine 🌸',
          instagram: 'https://instagram.com/skincare_tips',
          email: 'rachel.t@email.com',
          phone: '+6281234567813',
          niche: ['Beauty & Fashion'],
          proofUploaded: false,
          portfolioLink: 'https://instagram.com/skincare_tips',
          previousBrands: ['Innisfree', 'Laneige']
        },
        {
          id: '15',
          campaignId: '1001',
          influencerName: '@makeup_magic',
          fullName: 'Sophia Gunawan',
          location: 'Jakarta',
          age: 24,
          gender: 'Female',
          followers: 41000,
          engagementRate: 5.3,
          status: 'Pending',
          isSelected: false,
          appliedDate: new Date('2025-10-18T08:30:00').toISOString(),
          bio: 'Transforming faces with makeup ✨',
          instagram: 'https://instagram.com/makeup_magic',
          email: 'sophia.g@email.com',
          phone: '+6281234567814',
          niche: ['Beauty & Fashion'],
          proofUploaded: true,
          portfolioLink: 'https://instagram.com/makeup_magic',
          previousBrands: ['Benefit', 'Urban Decay']
        },
        {
          id: '16',
          campaignId: '1001',
          influencerName: '@beauty_blogger',
          fullName: 'Diana Putri',
          location: 'Yogyakarta',
          age: 27,
          gender: 'Female',
          followers: 29000,
          engagementRate: 4.1,
          status: 'Pending',
          isSelected: false,
          appliedDate: new Date('2025-10-18T09:45:00').toISOString(),
          bio: 'Beauty blogger & vlogger 📸',
          instagram: 'https://instagram.com/beauty_blogger',
          email: 'diana.p@email.com',
          phone: '+6281234567815',
          niche: ['Beauty & Fashion', 'Lifestyle & Travel'],
          proofUploaded: false,
          portfolioLink: 'https://instagram.com/beauty_blogger',
          previousBrands: ['Pixy', 'Emina']
        },
        // Applicants for campaign 1003 (Gaming) - 7 applicants
        {
          id: '4',
          campaignId: '1003',
          influencerName: '@progamer_id',
          fullName: 'Kevin Pratama',
          location: 'Jakarta',
          age: 22,
          gender: 'Male',
          followers: 125000,
          engagementRate: 6.8,
          status: 'Accepted',
          isSelected: true,
          appliedDate: new Date('2025-10-17T14:30:00').toISOString(),
          bio: 'Professional gamer & streamer 🎮 | Esports athlete',
          instagram: 'https://instagram.com/progamer_id',
          email: 'kevin.p@email.com',
          phone: '+6281234567893',
          niche: ['Gaming', 'Entertainment'],
          proofUploaded: true,
          portfolioLink: 'https://twitch.tv/progamer_id',
          previousBrands: ['Razer', 'Logitech', 'Asus ROG']
        },
        {
          id: '5',
          campaignId: '1003',
          influencerName: '@gamingwithbudi',
          fullName: 'Budi Santoso',
          location: 'Yogyakarta',
          age: 25,
          gender: 'Male',
          followers: 89000,
          engagementRate: 5.9,
          status: 'Accepted',
          isSelected: true,
          appliedDate: new Date('2025-10-17T15:45:00').toISOString(),
          bio: 'Let\'s game together! 🕹️ | Sponsored by @brands',
          instagram: 'https://instagram.com/gamingwithbudi',
          email: 'budi.s@email.com',
          phone: '+6281234567894',
          niche: ['Gaming', 'Entertainment'],
          proofUploaded: true,
          portfolioLink: 'https://twitch.tv/gamingwithbudi',
          previousBrands: ['Acer Predator', 'SteelSeries']
        },
        {
          id: '17',
          campaignId: '1003',
          influencerName: '@esports_pro',
          fullName: 'Arya Wijaya',
          location: 'Jakarta',
          age: 21,
          gender: 'Male',
          followers: 145000,
          engagementRate: 7.2,
          status: 'Pending',
          isSelected: false,
          appliedDate: new Date('2025-10-18T10:20:00').toISOString(),
          bio: 'Pro player & content creator 🏆',
          instagram: 'https://instagram.com/esports_pro',
          email: 'arya.w@email.com',
          phone: '+6281234567816',
          niche: ['Gaming'],
          proofUploaded: true,
          portfolioLink: 'https://twitch.tv/esports_pro',
          previousBrands: ['Intel', 'MSI', 'HyperX']
        },
        {
          id: '18',
          campaignId: '1003',
          influencerName: '@mobile_gamer',
          fullName: 'Rizky Fadillah',
          location: 'Bandung',
          age: 23,
          gender: 'Male',
          followers: 78000,
          engagementRate: 5.4,
          status: 'Pending',
          isSelected: false,
          appliedDate: new Date('2025-10-18T11:30:00').toISOString(),
          bio: 'Mobile gaming specialist 📱🎮',
          instagram: 'https://instagram.com/mobile_gamer',
          email: 'rizky.f@email.com',
          phone: '+6281234567817',
          niche: ['Gaming'],
          proofUploaded: false,
          portfolioLink: 'https://instagram.com/mobile_gamer',
          previousBrands: ['PUBG Mobile', 'Mobile Legends']
        },
        {
          id: '19',
          campaignId: '1003',
          influencerName: '@streamer_mania',
          fullName: 'Denny Kurniawan',
          location: 'Surabaya',
          age: 24,
          gender: 'Male',
          followers: 103000,
          engagementRate: 6.3,
          status: 'Pending',
          isSelected: false,
          appliedDate: new Date('2025-10-18T13:15:00').toISOString(),
          bio: 'Full-time streamer & gamer 🔴 LIVE',
          instagram: 'https://instagram.com/streamer_mania',
          email: 'denny.k@email.com',
          phone: '+6281234567818',
          niche: ['Gaming', 'Entertainment'],
          proofUploaded: true,
          portfolioLink: 'https://twitch.tv/streamer_mania',
          previousBrands: ['Corsair', 'Cooler Master']
        },
        {
          id: '20',
          campaignId: '1003',
          influencerName: '@fps_master',
          fullName: 'Tommy Gunawan',
          location: 'Jakarta',
          age: 22,
          gender: 'Male',
          followers: 67000,
          engagementRate: 5.1,
          status: 'Rejected',
          isSelected: false,
          appliedDate: new Date('2025-10-18T14:40:00').toISOString(),
          bio: 'FPS games expert 🎯',
          instagram: 'https://instagram.com/fps_master',
          email: 'tommy.g@email.com',
          phone: '+6281234567819',
          niche: ['Gaming'],
          proofUploaded: false,
          portfolioLink: 'https://instagram.com/fps_master',
          previousBrands: []
        },
        {
          id: '21',
          campaignId: '1003',
          influencerName: '@gaming_review',
          fullName: 'Andi Pratama',
          location: 'Medan',
          age: 26,
          gender: 'Male',
          followers: 92000,
          engagementRate: 5.8,
          status: 'Pending',
          isSelected: false,
          appliedDate: new Date('2025-10-18T15:50:00').toISOString(),
          bio: 'Gaming hardware reviews & gameplay 🎬',
          instagram: 'https://instagram.com/gaming_review',
          email: 'andi.p@email.com',
          phone: '+6281234567820',
          niche: ['Gaming', 'Technology'],
          proofUploaded: true,
          portfolioLink: 'https://youtube.com/gaming_review',
          previousBrands: ['Nvidia', 'AMD']
        }
      ];
      
      localStorage.setItem('applicants', JSON.stringify(dummyApplicants));
      
      return true;
    } catch (error) {
      console.error('Error seeding dummy data:', error);
      return false;
    }
  }
};

// Console helper for debugging
if (typeof window !== 'undefined') {
  window.campaignStorage = localStorageHelper;
  console.log('💾 Campaign Storage Helper loaded! Use window.campaignStorage in console');
  console.log('Available methods:', Object.keys(localStorageHelper));
}

export default localStorageHelper;
