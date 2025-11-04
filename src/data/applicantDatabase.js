// Database untuk applicants/students yang apply ke campaign
class ApplicantDatabase {
  constructor() {
    this.storageKey = 'applicantDatabase';
    this.init();
  }

  // Initialize with default data
  init() {
    if (!localStorage.getItem(this.storageKey)) {
      console.log('Initializing applicant dummy data');
      const defaultApplicants = [
        // Applicants untuk Campaign ID 1 (SCARLETT)
        {
          id: 1,
          campaignId: 1,
          influencerName: '@johndoe',
          fullName: 'John Doe',
          location: 'Jakarta',
          age: 28,
          gender: 'Male',
          followers: 12500,
          engagementRate: 4.8,
          status: 'Pending', // Pending, Accepted, Rejected
          appliedDate: '2025-10-01T10:30:00.000Z',
          bio: 'Beauty & lifestyle content creator passionate about skincare',
          instagram: '@johndoe',
          email: 'johndoe@email.com',
          phone: '+62812345678',
          portfolio: [
            'https://www.instagram.com/p/example1/',
            'https://www.instagram.com/p/example2/'
          ],
          previousBrands: ['Wardah', 'Emina', 'Pond\'s'],
          niche: ['Beauty', 'Skincare', 'Lifestyle']
        },
        {
          id: 2,
          campaignId: 1,
          influencerName: '@janesmith',
          fullName: 'Jane Smith',
          location: 'Bandung',
          age: 32,
          gender: 'Female',
          followers: 18000,
          engagementRate: 3.9,
          status: 'Accepted',
          appliedDate: '2025-09-28T14:20:00.000Z',
          bio: 'Mom blogger sharing beauty tips and family life',
          instagram: '@janesmith',
          email: 'janesmith@email.com',
          phone: '+62823456789',
          portfolio: [
            'https://www.instagram.com/p/example3/',
            'https://www.instagram.com/p/example4/'
          ],
          previousBrands: ['SCARLETT', 'Somethinc', 'Avoskin'],
          niche: ['Beauty', 'Parenting', 'Lifestyle']
        },
        {
          id: 3,
          campaignId: 1,
          influencerName: '@alexxyz',
          fullName: 'Alex Martinez',
          location: 'Bogor',
          age: 26,
          gender: 'Female',
          followers: 9800,
          engagementRate: 5.2,
          status: 'Pending',
          appliedDate: '2025-10-02T09:15:00.000Z',
          bio: 'Skincare enthusiast & beauty reviewer',
          instagram: '@alexxyz',
          email: 'alex.martinez@email.com',
          phone: '+62834567890',
          portfolio: [
            'https://www.instagram.com/p/example5/'
          ],
          previousBrands: ['L\'Oreal', 'Maybelline'],
          niche: ['Beauty', 'Skincare']
        },

        // Applicants untuk Campaign ID 2 (Razer Gaming Mouse)
        {
          id: 4,
          campaignId: 2,
          influencerName: '@progamer_indo',
          fullName: 'Budi Santoso',
          location: 'Jakarta',
          age: 24,
          gender: 'Male',
          followers: 35000,
          engagementRate: 6.5,
          status: 'Pending',
          appliedDate: '2025-09-25T16:45:00.000Z',
          bio: 'Professional esports player & gaming content creator',
          instagram: '@progamer_indo',
          email: 'budi.santoso@email.com',
          phone: '+62845678901',
          portfolio: [
            'https://www.youtube.com/watch?v=example1',
            'https://www.instagram.com/p/example6/'
          ],
          previousBrands: ['Logitech', 'SteelSeries', 'HyperX'],
          niche: ['Gaming', 'Esports', 'Technology']
        },
        {
          id: 5,
          campaignId: 2,
          influencerName: '@gamergirl_id',
          fullName: 'Sarah Wijaya',
          location: 'Surabaya',
          age: 22,
          gender: 'Female',
          followers: 28500,
          engagementRate: 5.8,
          status: 'Accepted',
          appliedDate: '2025-09-24T11:30:00.000Z',
          bio: 'Female gamer breaking stereotypes | Valorant & Mobile Legends',
          instagram: '@gamergirl_id',
          email: 'sarah.wijaya@email.com',
          phone: '+62856789012',
          portfolio: [
            'https://www.twitch.tv/gamergirl_id',
            'https://www.instagram.com/p/example7/'
          ],
          previousBrands: ['Razer', 'Asus ROG', 'Acer Predator'],
          niche: ['Gaming', 'Esports', 'Technology']
        },
        {
          id: 6,
          campaignId: 2,
          influencerName: '@techguru_',
          fullName: 'Andi Pratama',
          location: 'Medan',
          age: 29,
          gender: 'Male',
          followers: 42000,
          engagementRate: 7.2,
          status: 'Pending',
          appliedDate: '2025-09-26T13:00:00.000Z',
          bio: 'Tech reviewer & gaming enthusiast',
          instagram: '@techguru_',
          email: 'andi.pratama@email.com',
          phone: '+62867890123',
          portfolio: [
            'https://www.youtube.com/watch?v=example2',
            'https://www.instagram.com/p/example8/'
          ],
          previousBrands: ['Corsair', 'MSI', 'Razer'],
          niche: ['Technology', 'Gaming', 'Reviews']
        },

        // Applicants untuk Campaign ID 4 (Realfood)
        {
          id: 7,
          campaignId: 4,
          influencerName: '@healthylife_id',
          fullName: 'Dian Putri',
          location: 'Jakarta',
          age: 30,
          gender: 'Female',
          followers: 25000,
          engagementRate: 5.5,
          status: 'Accepted',
          appliedDate: '2025-09-27T08:20:00.000Z',
          bio: 'Certified nutritionist sharing healthy lifestyle tips',
          instagram: '@healthylife_id',
          email: 'dian.putri@email.com',
          phone: '+62878901234',
          portfolio: [
            'https://www.instagram.com/p/example9/',
            'https://www.instagram.com/p/example10/'
          ],
          previousBrands: ['Burgreens', 'Go-Fit', 'Healthy Choice'],
          niche: ['Health', 'Food', 'Nutrition']
        },
        {
          id: 8,
          campaignId: 4,
          influencerName: '@fitnessmom',
          fullName: 'Maya Anggraini',
          location: 'Tangerang',
          age: 34,
          gender: 'Female',
          followers: 19500,
          engagementRate: 4.9,
          status: 'Pending',
          appliedDate: '2025-09-29T15:40:00.000Z',
          bio: 'Fitness enthusiast & mom of two | Healthy eating advocate',
          instagram: '@fitnessmom',
          email: 'maya.anggraini@email.com',
          phone: '+62889012345',
          portfolio: [
            'https://www.instagram.com/p/example11/'
          ],
          previousBrands: ['Realfood', 'FitBar', 'Smoothie Bowl'],
          niche: ['Fitness', 'Health', 'Parenting']
        },

        // Applicants untuk Campaign ID 6 (Monopoly Family Game)
        {
          id: 9,
          campaignId: 6,
          influencerName: '@familyfun_id',
          fullName: 'Rina Kusuma',
          location: 'Bekasi',
          age: 38,
          gender: 'Female',
          followers: 15200,
          engagementRate: 4.3,
          status: 'Accepted',
          appliedDate: '2025-09-23T12:30:00.000Z',
          bio: 'Family lifestyle blogger | Mother of 3 | Quality time advocate',
          instagram: '@familyfun_id',
          email: 'rina.kusuma@email.com',
          phone: '+62890123456',
          portfolio: [
            'https://www.instagram.com/p/example12/',
            'https://www.instagram.com/p/example13/'
          ],
          previousBrands: ['Hasbro', 'Lego', 'Fisher-Price'],
          niche: ['Family', 'Parenting', 'Lifestyle']
        },
        {
          id: 10,
          campaignId: 6,
          influencerName: '@parentingtips_',
          fullName: 'Bambang Hermawan',
          location: 'Jakarta',
          age: 40,
          gender: 'Male',
          followers: 13800,
          engagementRate: 3.8,
          status: 'Pending',
          appliedDate: '2025-09-24T10:00:00.000Z',
          bio: 'Dad blogger sharing parenting tips & family activities',
          instagram: '@parentingtips_',
          email: 'bambang.h@email.com',
          phone: '+62801234567',
          portfolio: [
            'https://www.instagram.com/p/example14/'
          ],
          previousBrands: ['Monopoly', 'Mattel', 'Toys Kingdom'],
          niche: ['Parenting', 'Family', 'Education']
        },

        // More applicants untuk Campaign ID 1 (SCARLETT)
        {
          id: 11,
          campaignId: 1,
          influencerName: '@beautyblogger_jkt',
          fullName: 'Lisa Novita',
          location: 'Jakarta',
          age: 25,
          gender: 'Female',
          followers: 20500,
          engagementRate: 5.8,
          status: 'Pending',
          appliedDate: '2025-10-03T11:00:00.000Z',
          bio: 'Beauty & makeup enthusiast | Product reviewer',
          instagram: '@beautyblogger_jkt',
          email: 'lisa.novita@email.com',
          phone: '+62812345679',
          portfolio: [
            'https://www.instagram.com/p/example15/',
            'https://www.instagram.com/p/example16/'
          ],
          previousBrands: ['Pixy', 'Wardah', 'Make Over'],
          niche: ['Beauty', 'Makeup', 'Fashion']
        },
        {
          id: 12,
          campaignId: 1,
          influencerName: '@skincareaddicted',
          fullName: 'Putri Maharani',
          location: 'Depok',
          age: 27,
          gender: 'Female',
          followers: 16800,
          engagementRate: 6.1,
          status: 'Pending',
          appliedDate: '2025-10-04T09:30:00.000Z',
          bio: 'Skincare addicted | Sharing my skincare journey',
          instagram: '@skincareaddicted',
          email: 'putri.maharani@email.com',
          phone: '+62823456780',
          portfolio: [
            'https://www.instagram.com/p/example17/'
          ],
          previousBrands: ['Somethinc', 'Avoskin', 'SCARLETT'],
          niche: ['Skincare', 'Beauty']
        }
      ];
      
      this.saveToStorage(defaultApplicants);
      console.log('Applicant dummy data saved:', defaultApplicants.length, 'applicants');
    }
  }

  // Get all applicants
  getAll() {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  // Get applicant by ID
  getById(id) {
    const applicants = this.getAll();
    return applicants.find(app => app.id === parseInt(id));
  }

  // Get applicants by campaign ID
  getByCampaignId(campaignId) {
    const applicants = this.getAll();
    return applicants.filter(app => app.campaignId === parseInt(campaignId));
  }

  // Get applicants by status
  getByStatus(campaignId, status) {
    const applicants = this.getByCampaignId(campaignId);
    return applicants.filter(app => app.status === status);
  }

  // Update applicant status
  updateStatus(id, status) {
    const applicants = this.getAll();
    const index = applicants.findIndex(app => app.id === parseInt(id));
    
    if (index !== -1) {
      applicants[index].status = status;
      applicants[index].updatedDate = new Date().toISOString();
      this.saveToStorage(applicants);
      return applicants[index];
    }
    return null;
  }

  // Create new applicant
  create(applicantData) {
    const applicants = this.getAll();
    const newId = Math.max(...applicants.map(a => a.id), 0) + 1;
    
    const newApplicant = {
      ...applicantData,
      id: newId,
      appliedDate: new Date().toISOString()
    };
    
    applicants.push(newApplicant);
    this.saveToStorage(applicants);
    return newApplicant;
  }

  // Search applicants
  search(campaignId, searchTerm) {
    const applicants = this.getByCampaignId(campaignId);
    return applicants.filter(app =>
      app.influencerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // Get statistics for a campaign
  getStats(campaignId) {
    const applicants = this.getByCampaignId(campaignId);
    return {
      total: applicants.length,
      pending: applicants.filter(a => a.status === 'Pending').length,
      accepted: applicants.filter(a => a.status === 'Accepted').length,
      rejected: applicants.filter(a => a.status === 'Rejected').length
    };
  }

  // Save to localStorage
  saveToStorage(applicants) {
    localStorage.setItem(this.storageKey, JSON.stringify(applicants));
  }

  // Clear all data
  clearAll() {
    localStorage.removeItem(this.storageKey);
    this.init();
  }
}

// Create singleton instance
const applicantDB = new ApplicantDatabase();

export default applicantDB;
