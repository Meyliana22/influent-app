// Fake database using localStorage for persistence
class CampaignDatabase {
  constructor() {
    this.storageKey = 'campaignDatabase';
    this.init();
  }

  // Initialize with default data if localStorage is empty
  init() {
    if (!localStorage.getItem(this.storageKey)) {
      console.log('localStorage is empty, initializing with dummy data'); // Debug log
      const defaultCampaigns = [
        {
          id: 1,
          title: 'SCARLETT Whitening Body Lotion Campaign',
          category: 'Beauty & Fashion',
          productName: 'SCARLETT Whitening Body Lotion',
          productValue: 'Rp 65.000',
          productDesc: 'Body lotion dengan kandungan glutathione dan vitamin E untuk mencerahkan kulit tubuh. Kemasan 300ml dengan aroma yang menyegarkan.',
          startDate: '2025-10-15',
          endDate: '2025-11-15',
          contentDeadline: '2025-11-10',
          photoRules: 'Wajib foto produk dengan pencahayaan natural, close-up tekstur lotion, foto before-after jika memungkinkan',
          captionRules: 'Wajib mention @scarlett_whitening dan hashtag #ScarlettBodyLotion #GlowingBodyGoals #BodyCareRoutine',
          contentReference: 'Konten menampilkan rutinitas perawatan tubuh, aplikasi produk, testimoni honest review',
          influencerCount: 5,
          taskPrice: '350000',
          followersCount: '15000',
          selectedGender: 'female',
          selectedAge: '18-34 tahun',
          status: 'Active',
          isPaid: true, // User sudah bayar campaign ini
          image: null,
          contentItems: [
            { id: 1, postCount: 1, contentType: 'foto' },
            { id: 2, postCount: 1, contentType: 'story' }
          ],
          createdAt: '2025-09-20T10:00:00.000Z',
          updatedAt: '2025-09-20T10:00:00.000Z'
        },
        {
          id: 2,
          title: 'Razer DeathAdder V3 Gaming Mouse Review',
          category: 'Gaming',
          productName: 'Razer DeathAdder V3 Gaming Mouse',
          productValue: 'Rp 899.000',
          productDesc: 'Gaming mouse ergonomis dengan sensor Focus Pro 30K, switch optik, dan 90 jam battery life. Cocok untuk FPS dan MOBA gaming.',
          startDate: '2025-11-01',
          endDate: '2025-12-01',
          contentDeadline: '2025-11-25',
          photoRules: 'Unboxing shot, detail produk, action shot saat gaming, perbandingan dengan mouse lama',
          captionRules: 'Tag @razer dan gunakan #RazerDeathAdder #GamingSetup #ProGamer #RazerPartner',
          contentReference: 'Gaming setup tour, gameplay dengan mouse baru, review fitur-fitur unggulan, tips gaming',
          influencerCount: 3,
          taskPrice: '1200000',
          followersCount: '25000',
          selectedGender: 'male',
          selectedAge: '18-25 tahun',
          status: 'Active',
          isPaid: true, // User sudah bayar campaign ini
          image: null,
          contentItems: [
            { id: 1, postCount: 1, contentType: 'video' },
            { id: 2, postCount: 2, contentType: 'reels' },
            { id: 3, postCount: 1, contentType: 'foto' }
          ],
          createdAt: '2025-09-18T14:30:00.000Z',
          updatedAt: '2025-09-18T14:30:00.000Z'
        },
        {
          id: 3,
          title: 'SOMETHINC Niacinamide Moisturizer Launch',
          category: 'Beauty & Fashion',
          productName: 'SOMETHINC Calm Down! Skinpair R Moisturizer',
          productValue: 'Rp 89.000',
          productDesc: 'Moisturizer dengan 5% Niacinamide + Zinc PCA untuk mengontrol sebum dan memperbaiki tekstur kulit. Cocok untuk kulit berminyak dan berjerawat.',
          startDate: '2025-10-01',
          endDate: '2025-10-31',
          contentDeadline: '2025-10-28',
          photoRules: 'Flat lay skincare routine, aplikasi produk ke wajah, close-up tekstur product, aesthetic packaging shot',
          captionRules: 'Mention @somethinc dan hashtag #SOMETHINCxNiacinamide #CalmDownMoisturizer #SkincareLocalBrand #GlowUp',
          contentReference: 'Skincare routine morning/night, review jujur setelah pemakaian, tips penggunaan produk, skin goals',
          influencerCount: 8,
          taskPrice: '450000',
          followersCount: '10000',
          selectedGender: 'female',
          selectedAge: '18-30 tahun',
          status: 'Draft',
          isPaid: false, // Campaign belum dibayar (masih draft)
          image: null,
          contentItems: [
            { id: 1, postCount: 1, contentType: 'foto' },
            { id: 2, postCount: 3, contentType: 'story' },
            { id: 3, postCount: 1, contentType: 'reels' }
          ],
          createdAt: '2025-09-22T09:15:00.000Z',
          updatedAt: '2025-09-23T11:20:00.000Z'
        },
        {
          id: 4,
          title: 'Makanan Sehat Realfood Campaign',
          category: 'Food & Beverages',
          productName: 'Realfood Healthy Meal Package',
          productValue: 'Rp 150.000',
          productDesc: 'Paket makanan sehat berisi quinoa bowl, salad organik, dan jus cold-pressed. Menu rendah kalori dan tinggi nutrisi untuk gaya hidup sehat.',
          startDate: '2025-11-15',
          endDate: '2025-12-15',
          contentDeadline: '2025-12-10',
          photoRules: 'Food styling yang menarik, proses makan, flat lay meal prep, foto OOTD saat konsumsi',
          captionRules: 'Tag @realfood.id dengan hashtag #RealfoodHealthy #HealthyEating #MealPrepLife #CleanEating',
          contentReference: 'Meal prep routine, healthy lifestyle tips, workout + healthy food combo, diet journey',
          influencerCount: 4,
          taskPrice: '650000',
          followersCount: '20000',
          selectedGender: 'female',
          selectedAge: '25-35 tahun',
          status: 'Active',
          isPaid: true, // User sudah bayar campaign ini
          image: null,
          contentItems: [
            { id: 1, postCount: 2, contentType: 'foto' },
            { id: 2, postCount: 1, contentType: 'reels' },
            { id: 3, postCount: 4, contentType: 'story' }
          ],
          createdAt: '2025-09-19T16:45:00.000Z',
          updatedAt: '2025-09-21T08:30:00.000Z'
        },
        {
          id: 5,
          title: 'iPhone 15 Pro Max Technology Review',
          category: 'Technology',
          productName: 'iPhone 15 Pro Max 256GB',
          productValue: 'Rp 21.999.000',
          productDesc: 'Smartphone flagship terbaru dengan chip A17 Pro, kamera 48MP, dan fitur Action Button. Tersedia dalam warna Natural Titanium.',
          startDate: '2025-12-01',
          endDate: '2025-12-31',
          contentDeadline: '2025-12-28',
          photoRules: 'Unboxing cinematic, detail kamera dan fitur, comparison dengan iPhone lama, lifestyle shots',
          captionRules: 'Mention @apple dengan hashtag #iPhone15ProMax #ShotOnIPhone #ApplePartner #TechReview',
          contentReference: 'Tech review mendalam, camera test berbagai kondisi, performance test gaming/editing, daily usage',
          influencerCount: 2,
          taskPrice: '2500000',
          followersCount: '50000',
          selectedGender: 'male',
          selectedAge: '25-40 tahun',
          status: 'Draft',
          isPaid: false, // Campaign belum dibayar (masih draft)
          image: null,
          contentItems: [
            { id: 1, postCount: 1, contentType: 'video' },
            { id: 2, postCount: 3, contentType: 'foto' },
            { id: 3, postCount: 2, contentType: 'reels' },
            { id: 4, postCount: 5, contentType: 'story' }
          ],
          createdAt: '2025-09-21T13:20:00.000Z',
          updatedAt: '2025-09-23T10:15:00.000Z'
        },
        {
          id: 6,
          title: 'Family Time with Board Games',
          category: 'Family & Parenting',
          productName: 'Monopoly Jakarta Edition',
          productValue: 'Rp 299.000',
          productDesc: 'Board game Monopoly edisi Jakarta dengan landmark-landmark ikonik Jakarta. Cocok untuk quality time keluarga dan mengajarkan anak tentang kota Jakarta.',
          startDate: '2025-11-01',
          endDate: '2025-11-30',
          contentDeadline: '2025-11-25',
          photoRules: 'Family bonding saat main game, detail board game, candid momen anak-anak main, setup game di rumah',
          captionRules: 'Tag @monopoly_indonesia hashtag #MonopolyJakarta #FamilyTime #QualityTime #BoardGameNight',
          contentReference: 'Dokumentasi family game night, tips bonding dengan anak, review game educational value',
          influencerCount: 6,
          taskPrice: '400000',
          followersCount: '12000',
          selectedGender: 'female',
          selectedAge: '30-45 tahun',
          status: 'Active',
          isPaid: true, // User sudah bayar campaign ini
          image: null,
          contentItems: [
            { id: 1, postCount: 2, contentType: 'foto' },
            { id: 2, postCount: 1, contentType: 'video' },
            { id: 3, postCount: 3, contentType: 'story' }
          ],
          createdAt: '2025-09-17T11:30:00.000Z',
          updatedAt: '2025-09-20T15:45:00.000Z'
        }
      ];
      
      this.saveToStorage(defaultCampaigns);
      console.log('Dummy data saved to localStorage:', defaultCampaigns.length, 'campaigns'); // Debug log
    } else {
      console.log('localStorage already has data, skipping dummy data initialization'); // Debug log
    }
  }

  // Get all campaigns
  getAll() {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  // Get campaign by ID
  getById(id) {
    const campaigns = this.getAll();
    return campaigns.find(campaign => campaign.id === parseInt(id));
  }

  // Create new campaign
  create(campaignData) {
    const campaigns = this.getAll();
    const newId = Math.max(...campaigns.map(c => c.id), 0) + 1;
    
    const newCampaign = {
      ...campaignData,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    campaigns.push(newCampaign);
    this.saveToStorage(campaigns);
    return newCampaign;
  }

  // Update existing campaign
  update(id, campaignData) {
    const campaigns = this.getAll();
    const index = campaigns.findIndex(campaign => campaign.id === parseInt(id));
    
    if (index !== -1) {
      campaigns[index] = {
        ...campaigns[index],
        ...campaignData,
        id: parseInt(id), // Ensure ID doesn't change
        updatedAt: new Date().toISOString()
      };
      this.saveToStorage(campaigns);
      return campaigns[index];
    }
    return null;
  }

  // Delete campaign
  delete(id) {
    const campaigns = this.getAll();
    const filteredCampaigns = campaigns.filter(campaign => campaign.id !== parseInt(id));
    
    if (filteredCampaigns.length !== campaigns.length) {
      this.saveToStorage(filteredCampaigns);
      return true;
    }
    return false;
  }

  // Search campaigns
  search(searchTerm) {
    const campaigns = this.getAll();
    return campaigns.filter(campaign => 
      campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.productName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // Filter campaigns by status
  filterByStatus(status) {
    const campaigns = this.getAll();
    return campaigns.filter(campaign => campaign.status === status);
  }

  // Save to localStorage
  saveToStorage(campaigns) {
    localStorage.setItem(this.storageKey, JSON.stringify(campaigns));
  }

  // Clear all data
  clearAll() {
    localStorage.removeItem(this.storageKey);
    this.init();
  }

  // Force reload with dummy data (for testing)
  reloadDummyData() {
    localStorage.removeItem(this.storageKey);
    this.init();
  }
}

// Create singleton instance
const campaignDB = new CampaignDatabase();

export default campaignDB;