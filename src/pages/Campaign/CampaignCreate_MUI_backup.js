import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';
import { Button, TextField, Select, MenuItem, FormControl, InputLabel, RadioGroup, FormControlLabel, Radio, Checkbox, ListItemText, OutlinedInput, Chip, Box } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import UMKMSidebar from '../../components/umkm/UMKMSidebar';
import UMKMTopbar from '../../components/umkm/UMKMTopbar';
import DeleteIcon from '../../assets/delete.svg';
import BackIcon from '../../assets/back.svg';
import UploadIcon from '../../assets/upload.svg';
import { useToast } from '../../hooks/useToast';
import { Modal } from '../../components/common';

function CollapsibleSection({ title, children, status = '', defaultOpen = false, disabled = false }) {
  const [open, setOpen] = useState(defaultOpen);
  
  const handleClick = () => {
    if (!disabled) {
      setOpen(!open);
    }
  };
  
  return (
    <div style={{ 
      marginBottom: '24px', 
      background: '#fff', 
      borderRadius: '12px', 
      boxShadow: '0 2px 8px #e3e3e3',
      opacity: disabled ? 0.5 : 1
    }}>
      <div
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          cursor: disabled ? 'not-allowed' : 'pointer', 
          fontWeight: 600, 
          fontSize: '1.2rem', 
          padding: '18px 24px', 
          borderBottom: open ? '1px solid #eee' : 'none',
          color: disabled ? '#999' : 'inherit'
        }}
        onClick={handleClick}
      >
        <span>
          <span style={{ marginRight: '8px', color: disabled ? '#ccc' : 'inherit' }}>
            {disabled ? '▶' : (open ? '▼' : '▶')}
          </span>
          {title}
        </span>
        <span style={{ color: status === 'done' ? 'green' : (disabled ? '#ccc' : '#888'), fontWeight: 600, fontSize: '1rem' }}>
          {status === 'done' ? <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>Done <FaCheckCircle /></span> : status || ''}
        </span>
      </div>
      {open && !disabled && (
        <div style={{ padding: '24px' }}>{children}</div>
      )}
    </div>
  );
}

function CampaignCreate() {
  const navigate = useNavigate();
  const { id } = useParams(); // Get campaign ID from URL params
  const isEditMode = Boolean(id); // Check if we're in edit mode
  const [isReadOnly, setIsReadOnly] = useState(false); // Check if campaign is paid (read-only)
  
  // Image upload state
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedGender, setSelectedGender] = useState('');
  const [selectedAge, setSelectedAge] = useState('');

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Handle reference file upload (multiple files)
  const handleReferenceFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newFiles = files.map(file => ({
        file,
        preview: (file.type.startsWith('image/') || file.type.startsWith('video/')) 
          ? URL.createObjectURL(file) 
          : null,
        type: file.type.startsWith('image/') ? 'image' : (file.type.startsWith('video/') ? 'video' : 'other'),
        name: file.name
      }));
      setReferenceFiles([...referenceFiles, ...newFiles]);
    }
    // Reset input value to allow re-selecting the same file
    e.target.value = '';
  };

  // Remove reference file
  const handleRemoveReferenceFile = (index) => {
    const newFiles = referenceFiles.filter((_, i) => i !== index);
    // Revoke object URL to free memory
    if (referenceFiles[index].preview) {
      URL.revokeObjectURL(referenceFiles[index].preview);
    }
    setReferenceFiles(newFiles);
  };

  // Helper function untuk membuat label dengan asterisk merah
  const RequiredLabel = ({ children }) => (
    <span>
      {children} <span style={{ color: 'red' }}>*</span>
    </span>
  );

  // Helper function untuk format currency
  const formatCurrency = (value) => {
    if (!value) return '';
    // Remove non-digit characters
    const number = value.replace(/\D/g, '');
    // Format dengan thousand separator
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // Helper function untuk parse currency ke number
  const parseCurrency = (value) => {
    if (!value) return '';
    return value.replace(/\D/g, '');
  };

  // Form state
  const [title, setTitle] = useState('');
  const [campaignCategory, setCampaignCategory] = useState('');
  const [category, setCategory] = useState([]); // Influencer categories (multi-select)
  const [hasProduct, setHasProduct] = useState(false); // Toggle untuk produk
  const [productName, setProductName] = useState('');
  const [productValue, setProductValue] = useState('');
  const [productDesc, setProductDesc] = useState('');
  
  // Modal state
  const [showBackModal, setShowBackModal] = useState(false);
  const [showHeaderBackModal, setShowHeaderBackModal] = useState(false);
  
  // Brief Campaign state
  const [start_date, setStartDate] = useState('');
  const [end_date, setEndDate] = useState('');
  const [submission_deadline, setContentDeadline] = useState('');
  const [content_guidelines, setPhotoRules] = useState('');
  const [caption_guidelines, setCaptionRules] = useState('');
  const [contentReference, setContentReference] = useState('');
  const [referenceFiles, setReferenceFiles] = useState([]);
  
  // Content & Budget state
  const [influencer_count, setInfluencerCount] = useState(1);
  const [price_per_post, setPricePerPost] = useState('');
  const [contentItems, setContentItems] = useState([
    { id: 1, post_count: 1, content_type: 'foto' }
  ]);
  const [min_followers, setMinFollowers] = useState('');
  
  // Settings dropdown state
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  
  // Delete popup state
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  
  // Toast notification
  const { showToast } = useToast();
  
  // Wizard step state
  const [currentStep, setCurrentStep] = useState(1);

  // Fungsi validasi untuk setiap step
  const validateStep1 = () => {
    const errors = [];
    if (!title.trim()) errors.push('Judul Campaign');
    if (!campaignCategory) errors.push('Jenis Campaign');
    if (hasProduct) {
      if (!productName.trim()) errors.push('Nama Produk');
      if (!productValue) errors.push('Nilai Produk');
    }
    if (!productDesc.trim()) errors.push(hasProduct ? 'Deskripsi Produk' : 'Deskripsi Campaign');
    if (!image && !imagePreview) errors.push('Upload Foto');
    
    if (errors.length > 0) {
      showToast(`Field wajib belum diisi: ${errors.join(', ')}`, 'error');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    const errors = [];
    if (!category || category.length === 0) errors.push('Kategori Influencer');
    if (!min_followers) errors.push('Jumlah Minimum Followers');
    if (!selectedGender) errors.push('Target Gender');
    if (!selectedAge) errors.push('Target Usia');
    
    if (errors.length > 0) {
      showToast(`Field wajib belum diisi: ${errors.join(', ')}`, 'error');
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    const errors = [];
    if (!influencer_count || influencer_count < 1) errors.push('Jumlah Influencer');
    if (!price_per_post) errors.push('Harga per Task');
    
    if (errors.length > 0) {
      showToast(`Field wajib belum diisi: ${errors.join(', ')}`, 'error');
      return false;
    }
    return true;
  };

  const validateStep4 = () => {
    const errors = [];
    if (!submission_deadline) errors.push('Deadline Proposal Konten');
    if (!start_date) errors.push('Tanggal Campaign Mulai');
    if (!end_date) errors.push('Tanggal Campaign Selesai');
    
    // Validasi jarak tanggal minimal 1 minggu
    if (start_date && end_date) {
      const start = new Date(start_date);
      const end = new Date(end_date);
      const diffTime = end - start;
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      if (diffDays < 7) {
        errors.push('Jarak antara tanggal mulai dan selesai minimal 1 minggu');
      }
    }
    
    if (start_date && submission_deadline) {
      const start = new Date(start_date);
      const deadline = new Date(submission_deadline);
      const diffTime = start - deadline;
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      if (diffDays < 7) {
        errors.push('Jarak antara deadline proposal dan tanggal mulai minimal 1 minggu');
      }
    }
    
    if (errors.length > 0) {
      showToast(`Validasi gagal: ${errors.join(', ')}`, 'error');
      return false;
    }
    return true;
  };

  // Original data for change detection
  const [originalData, setOriginalData] = useState(null);
  
  // Flag to prevent duplicate useEffect calls (React StrictMode)
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Load campaign data when in edit mode
  useEffect(() => {
    if (isEditMode && id && !isDataLoaded) {
      // Load campaign from localStorage instead of backend
      const fetchCampaign = () => {
        try {
          const existingCampaigns = JSON.parse(localStorage.getItem('campaigns') || '[]');
          console.log('🔍 Looking for campaign with ID:', id, '(type:', typeof id, ')');
          
          // Match both string and number IDs
          const campaign = existingCampaigns.find(c => 
            c.campaign_id === id || c.campaign_id === parseInt(id) || String(c.campaign_id) === String(id)
          );
          
          if (!campaign) {
            console.error('❌ Campaign not found. Available IDs:', existingCampaigns.map(c => c.campaign_id));
            showToast('Campaign tidak ditemukan', 'error');
            setTimeout(() => navigate('/campaigns'), 500);
            return;
          }
          
          console.log('✅ Campaign found:', campaign.title);
          
          // Set read-only mode if campaign is paid
          if (campaign.isPaid) {
            setIsReadOnly(true);
          }
          
          const data = {
            title: campaign.title || '',
            campaignCategory: campaign.campaignCategory || '',
            category: Array.isArray(campaign.category) ? campaign.category : (campaign.category ? [campaign.category] : []),
            productName: campaign.productName || '',
            productValue: campaign.productValue ? String(campaign.productValue) : '',
            productDesc: campaign.productDesc || '',
            start_date: campaign.start_date ? campaign.start_date.split('T')[0] : '',
            end_date: campaign.end_date ? campaign.end_date.split('T')[0] : '',
            submission_deadline: campaign.submission_deadline ? campaign.submission_deadline.split('T')[0] : '',
            content_guidelines: campaign.content_guidelines || '',
            caption_guidelines: campaign.caption_guidelines || '',
            contentReference: campaign.contentReference || '',
            influencer_count: campaign.influencer_count || 1,
            price_per_post: campaign.price_per_post ? String(campaign.price_per_post) : '',
            min_followers: campaign.min_followers || '',
            selectedGender: campaign.selectedGender || '',
            selectedAge: campaign.selectedAge || '',
            contentItems: campaign.contentItems || [{ id: 1, post_count: 1, content_type: 'foto' }],
            imagePreview: campaign.bannerImage || campaign.image || null,
            referenceFiles: campaign.referenceFiles || []
          };
        
        // Set form state
        setTitle(data.title);
        setCampaignCategory(data.campaignCategory);
        setCategory(data.category);
        setProductName(data.productName);
        setProductValue(data.productValue);
        setProductDesc(data.productDesc);
        setStartDate(data.start_date);
        setEndDate(data.end_date);
        setContentDeadline(data.submission_deadline);
        setPhotoRules(data.content_guidelines);
        setCaptionRules(data.caption_guidelines);
        setContentReference(data.contentReference);
        setInfluencerCount(data.influencer_count);
        setPricePerPost(data.price_per_post);
        setMinFollowers(data.min_followers);
        setSelectedGender(data.selectedGender);
        setSelectedAge(data.selectedAge);
        setContentItems(data.contentItems);
        if (data.imagePreview) {
          setImagePreview(data.imagePreview);
        }
        
        // Save original data for comparison
          setOriginalData(data);
          setIsDataLoaded(true); // Mark as loaded to prevent duplicate calls
        } catch (err) {
          console.error('load campaign (frontend)', err);
          showToast('Gagal memuat campaign', 'error');
          setIsDataLoaded(true);
        }
      };

      fetchCampaign();
    } else if (!isEditMode) {
      // For new campaigns, set empty original data
      setOriginalData({
        title: '',
        campaignCategory: '',
        category: [],
        productName: '',
        productValue: '',
        productDesc: '',
        start_date: '',
        end_date: '',
        submission_deadline: '',
        content_guidelines: '',
        caption_guidelines: '',
        contentReference: '',
        influencer_count: 1,
        price_per_post: '',
        min_followers: '',
        selectedGender: '',
        selectedAge: '',
        contentItems: [{ id: 1, post_count: 1, content_type: 'foto' }],
        imagePreview: null
      });
      setIsDataLoaded(true);
    }
  }, [isEditMode, id, isDataLoaded]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSettingsDropdown && !event.target.closest('.settings-dropdown')) {
        setShowSettingsDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSettingsDropdown]);
  
  // Calculate estimated budget based on influencer count and task price
  const estimatedBudget = influencer_count * (parseFloat(parseCurrency(price_per_post)) || 0);
  
  // Check if form data has changed
  const hasChanges = () => {
    if (!originalData) return false;
    
    const currentData = {
      title,
      category,
      productName,
      productValue,
      productDesc,
      start_date,
      end_date,
      submission_deadline,
      content_guidelines,
      caption_guidelines,
      contentReference,
      influencer_count,
      price_per_post,
      min_followers,
      selectedGender,
      selectedAge,
      contentItems,
      imagePreview
    };
    
    return JSON.stringify(currentData) !== JSON.stringify(originalData);
  };
  
  // Add new content item
  const addContentItem = () => {
    setContentItems([
      ...contentItems,
      { id: Date.now(), post_count: 1, content_type: 'foto' }
    ]);
  };

  // Update content item
  const updateContentItem = (id, field, value) => {
    setContentItems(contentItems.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  // Remove content item
  const removeContentItem = (id) => {
    setContentItems(contentItems.filter(item => item.id !== id));
  };

  // Updated options for category
  const categoryOptions = [
    'Entertainment',
    'Health & Sport',
    'Lifestyle & Travel',
    'Technology',
    'Family & Parenting',
    'Food & Beverages',
    'Beauty & Fashion',
    'Gaming'
  ];

  // Check if all required fields are filled for Step 1
  const allFilled = title && 
    campaignCategory && 
    (hasProduct ? (productName && productValue) : true) && 
    productDesc && 
    (image || imagePreview);
  
  // Check if brief campaign fields are filled
  const briefFilled = start_date && end_date && submission_deadline && content_guidelines && caption_guidelines;

  // Check if kriteria influencer fields are filled
  const kriteriaFilled = category.length > 0 && min_followers && selectedGender && selectedAge;

  // Check if konten & anggaran fields are filled
  const kontenFilled = influencer_count && price_per_post && contentItems.length > 0;

  // Status for collapsible sections
  const detailStatus = allFilled ? 'done' : 'in progress';
  const kriteriaStatus = kriteriaFilled ? 'done' : 'in progress';
  const kontenStatus = kontenFilled ? 'done' : 'in progress';
  const briefStatus = briefFilled ? 'done' : 'in progress';

  // Save as Draft handler
  const handleSaveAsDraft = () => {
    // Prepare campaign data - no validation required for draft
    const campaignData = {
      title: title || 'Draft Campaign',
      campaignCategory,
      category,
      hasProduct,
      productName,
      productValue: productValue ? parseCurrency(productValue) : 0,
      productDesc,
      start_date,
      end_date,
      submission_deadline,
      content_guidelines,
      caption_guidelines,
      contentReference,
      referenceFiles: referenceFiles.map(rf => rf.name),
      influencer_count,
      price_per_post: price_per_post ? parseCurrency(price_per_post) : 0,
      min_followers,
      selectedGender,
      selectedAge,
      contentItems,
      status: 'Draft',
      image: imagePreview
    };
    
    if (isEditMode) {
      // BYPASS BACKEND - Simpan langsung di frontend
      try {
        const existingCampaigns = JSON.parse(localStorage.getItem('campaigns') || '[]');
        const updatedCampaigns = existingCampaigns.map(c => 
          c.campaign_id === id ? { ...campaignData, campaign_id: id, created_at: c.created_at, updated_at: new Date().toISOString() } : c
        );
        localStorage.setItem('campaigns', JSON.stringify(updatedCampaigns));
        showToast('Campaign berhasil disimpan sebagai draft!', 'success');
        setShowHeaderBackModal(false);
        setTimeout(() => navigate('/campaigns'), 500);
      } catch (err) {
        console.error('save draft (frontend)', err);
        showToast('Gagal menyimpan draft', 'error');
      }
    } else {
      // BYPASS BACKEND - Simpan langsung di frontend
      try {
        const campaignId = Date.now().toString();
        const existingCampaigns = JSON.parse(localStorage.getItem('campaigns') || '[]');
        const newCampaign = {
          ...campaignData,
          campaign_id: campaignId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        existingCampaigns.push(newCampaign);
        localStorage.setItem('campaigns', JSON.stringify(existingCampaigns));
        showToast('Campaign berhasil disimpan sebagai draft!', 'success');
        setShowHeaderBackModal(false);
        setTimeout(() => navigate('/campaigns'), 500);
      } catch (err) {
        console.error('save draft (frontend)', err);
        showToast('Gagal menyimpan draft', 'error');
      }
    }
  };

  // Save handler
  const handleSave = (e) => {
    e.preventDefault();
    
    // Validasi semua step
    const step1Valid = validateStep1();
    const step2Valid = validateStep2();
    const step3Valid = validateStep3();
    const step4Valid = validateStep4();
    
    if (!step1Valid || !step2Valid || !step3Valid || !step4Valid) {
      showToast('Masih ada field wajib yang belum diisi atau validasi yang belum terpenuhi', 'error');
      return;
    }
    
    // Prepare campaign data
    const campaignData = {
      title,
      campaignCategory,
      category,
      hasProduct,
      productName,
      productValue: parseCurrency(productValue),
      productDesc,
      start_date,
      end_date,
      submission_deadline,
      content_guidelines,
      caption_guidelines,
      contentReference,
      referenceFiles: referenceFiles.map(rf => rf.name),
      influencer_count,
      price_per_post: parseCurrency(price_per_post),
      min_followers,
      selectedGender,
      selectedAge,
      contentItems: contentItems.map(item => ({
        id: item.id,
        post_count: item.post_count,
        content_type: item.content_type
      })),
      status: 'Draft',
      isPaid: false,
      image: imagePreview
    };
    
    // BYPASS BACKEND - Simpan langsung di frontend
    try {
      // Generate campaign ID
      const campaignId = isEditMode ? id : Date.now().toString();
      
      // Get existing campaigns from localStorage
      const existingCampaigns = JSON.parse(localStorage.getItem('campaigns') || '[]');
      
      if (isEditMode) {
        // Update existing campaign
        const updatedCampaigns = existingCampaigns.map(c => 
          c.campaign_id === id ? { ...campaignData, campaign_id: id, created_at: c.created_at, updated_at: new Date().toISOString() } : c
        );
        localStorage.setItem('campaigns', JSON.stringify(updatedCampaigns));
        showToast('Campaign berhasil diupdate!', 'success');
      } else {
        // Add new campaign
        const newCampaign = {
          ...campaignData,
          campaign_id: campaignId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        existingCampaigns.push(newCampaign);
        localStorage.setItem('campaigns', JSON.stringify(existingCampaigns));
        showToast('Campaign berhasil dibuat!', 'success');
      }
      
      // Navigate to payment confirmation
      setTimeout(() => navigate(`/campaign/${campaignId}/payment`), 1500);
    } catch (err) {
      console.error('save campaign (frontend)', err);
      showToast('Gagal menyimpan campaign', 'error');
    }
  };

  // Delete handler
  const handleDelete = () => {
    setShowDeletePopup(true);
  };

  const confirmDelete = () => {
    // BYPASS BACKEND - Hapus dari localStorage
    try {
      const existingCampaigns = JSON.parse(localStorage.getItem('campaigns') || '[]');
      const updatedCampaigns = existingCampaigns.filter(c => c.campaign_id !== id);
      localStorage.setItem('campaigns', JSON.stringify(updatedCampaigns));
      showToast('Campaign berhasil dihapus', 'success');
      setShowDeletePopup(false);
      navigate('/campaigns');
    } catch (err) {
      console.error('delete campaign (frontend)', err);
      showToast('Gagal menghapus campaign', 'error');
    }
  };

  const cancelDelete = () => {
    setShowDeletePopup(false);
  };

  // Show alert toast
  const showAlert = (message, type = 'error') => {
    showToast(message, type);
    
    // If success, navigate after delay
    if (type === 'success') {
      setTimeout(() => {
        navigate('/campaigns');
      }, 1500);
    }
  };

  // Step navigation handlers
  const handleNext = () => {
    // Validasi berdasarkan step saat ini
    let isValid = true;
    if (currentStep === 1) {
      isValid = validateStep1();
    } else if (currentStep === 2) {
      isValid = validateStep2();
    } else if (currentStep === 3) {
      isValid = validateStep3();
    }
    
    if (isValid && currentStep < 4) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    if (currentStep === 1) {
      // Show modal confirmation
      setShowBackModal(true);
    } else if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const goToStep = (step) => {
    // Selalu bisa kembali ke step sebelumnya
    if (step < currentStep) {
      setCurrentStep(step);
      window.scrollTo(0, 0);
      return;
    }
    
    // In edit mode, allow jumping to any step
    if (isEditMode) {
      setCurrentStep(step);
      window.scrollTo(0, 0);
      return;
    }
    
    // Untuk maju ke step berikutnya, cek apakah step sebelumnya sudah valid
    let canNavigate = false;
    if (step === 1) {
      canNavigate = true;
    } else if (step === 2) {
      canNavigate = validateStep1();
    } else if (step === 3) {
      canNavigate = validateStep1() && validateStep2();
    } else if (step === 4) {
      canNavigate = validateStep1() && validateStep2() && validateStep3();
    }
    
    if (canNavigate) {
      setCurrentStep(step);
      window.scrollTo(0, 0);
    }
  };

  // Check if can proceed to next step
  const canProceed = () => {
    if (currentStep === 1) return allFilled;
    if (currentStep === 2) return kriteriaFilled;
    if (currentStep === 3) return kontenFilled;
    if (currentStep === 4) return briefFilled;
    return false;
  };

  return (
    <div style={{ display: 'flex', fontFamily: "'Inter', sans-serif" }}>
      <UMKMSidebar />
      
      <div style={{ marginLeft: '260px', flex: 1 }}>
        <UMKMTopbar />
        
        <div style={{ marginTop: '72px', background: '#f7fafc', minHeight: 'calc(100vh - 72px)', padding: '32px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ background: '#fff', borderRadius: '20px', boxShadow: '0 4px 24px #e3e3e3', padding: '32px', marginBottom: '32px' }}>
          {/* Back Button */}
          
          {/* Header with Title and Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                type="button"
                onClick={() => {
                  // If read-only (paid/active), go directly back to campaign list
                  if (isReadOnly) {
                    navigate('/campaigns');
                  } else {
                    setShowHeaderBackModal(true);
                  }
                }}
                aria-label="Kembali ke daftar campaign"
                style={{
                  background: 'rgba(102,126,234,0.12)', // soft purple
                  border: 'none',
                  borderRadius: '18px',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 24px rgba(102,126,234,0.08)',
                  cursor: 'pointer',
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(102,126,234,0.12)';
                  e.currentTarget.style.boxShadow = '0 4px 24px rgba(102,126,234,0.08)';
                }}
              >
                <img src={BackIcon} alt="Back" style={{ width: '16px', height: '16px' }} />
              </button>
              <h2 style={{ fontWeight: 600, margin: 0 }}>
                {isReadOnly ? 'Campaign Details' : 
                 isEditMode ? 'Edit Campaign' : 'Create Campaign'}
              </h2>
              {isEditMode && !isReadOnly && (
                <img 
                  onClick={handleDelete}
                  src={DeleteIcon}
                  alt="Campaign" 
                  style={{ width: '20px', height: '20px', borderRadius: '50%' }} 
                />
              )}
            </div>
          </div>

          {/* Step Indicator */}
          <div 
            className="step-indicator-container"
            style={{ 
              background: '#f8f9fa', 
              borderRadius: '12px', 
              padding: '14px 16px', 
              marginBottom: '24px',
              overflowX: 'auto',
              overflowY: 'hidden',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'thin',
              scrollbarColor: '#cbd5e0 #f8f9fa'
            }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              flexWrap: 'nowrap',
              minWidth: 'fit-content',
              justifyContent: 'flex-start'
            }}>
              {[
                { num: 1, name: 'Detail Campaign', shortName: 'Detail', completed: allFilled },
                { num: 2, name: 'Kriteria Influencer', shortName: 'Kriteria', completed: kriteriaFilled },
                { num: 3, name: 'Konten & Anggaran', shortName: 'Konten', completed: kontenFilled },
                { num: 4, name: 'Brief Campaign', shortName: 'Brief', completed: briefFilled }
              ].map((step, index) => {
                const isActive = currentStep === step.num;
                // Bisa akses jika: edit mode, step saat ini, step sebelumnya, atau step yang sudah completed
                const canAccess = isEditMode || 
                  step.num === currentStep || 
                  step.num < currentStep || 
                  step.completed;
                
                return (
                  <React.Fragment key={step.num}>
                    <div 
                      onClick={() => canAccess && goToStep(step.num)}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px',
                        cursor: canAccess ? 'pointer' : 'not-allowed',
                        opacity: canAccess ? 1 : 0.4,
                        transition: 'all 0.3s ease',
                        padding: '6px 10px',
                        borderRadius: '8px',
                        background: isActive ? 'rgba(0, 123, 255, 0.1)' : 'transparent',
                        flexShrink: 0
                      }}
                      onMouseEnter={(e) => {
                        if (canAccess && !isActive) {
                          e.currentTarget.style.transform = 'scale(1.05)';
                          e.currentTarget.style.background = 'rgba(0, 123, 255, 0.05)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        if (!isActive) {
                          e.currentTarget.style.background = 'transparent';
                        }
                      }}
                    >
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: step.completed ? 'linear-gradient(135deg, #28a745 0%, #20c997 100%)' : (isActive ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#e9ecef'),
                        color: step.completed || isActive ? 'white' : '#6c757d',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: step.completed ? '1rem' : '0.85rem',
                        fontWeight: 'bold',
                        border: isActive && !step.completed ? '2px solid #667eea' : 'none',
                        boxShadow: step.completed ? '0 2px 8px rgba(40, 167, 69, 0.3)' : (isActive ? '0 2px 8px rgba(102, 126, 234, 0.3)' : 'none'),
                        transition: 'all 0.3s ease',
                        flexShrink: 0
                      }}>
                        {step.completed ? '✓' : step.num}
                      </div>
                      <span style={{ 
                        fontSize: '0.8rem', 
                        color: step.completed ? '#28a745' : (isActive ? '#007bff' : '#6c757d'),
                        fontWeight: isActive ? '700' : (step.completed ? '600' : '400'),
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: window.innerWidth < 768 ? '70px' : '150px'
                      }}>
                        {window.innerWidth < 768 ? step.shortName : step.name}
                      </span>
                    </div>
                    {index < 3 && (
                      <div style={{ 
                        width: window.innerWidth < 768 ? '20px' : '24px',
                        height: '2px',
                        background: step.completed ? '#28a745' : '#dee2e6',
                        margin: '0 2px',
                        flexShrink: 0
                      }} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Step Content Card */}
          {currentStep === 1 && (
            <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px #e3e3e3', padding: '32px', marginBottom: '24px' }}>
              <h3 style={{ margin: '0 0 24px 0', fontSize: '1.3rem', fontWeight: 600 }}>Detail Campaign</h3>
            <form onSubmit={handleSave}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '18px', marginTop: '6px' }}>
                <div style={{ 
                  width: '180px', 
                  height: '160px', 
                  background: imagePreview ? '#fff' : '#f5f5f5',
                  borderRadius: '8px', 
                  marginRight: '18px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  overflow: 'hidden', 
                  position: 'relative',
                  border: '1px solid #ccc',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  if (!imagePreview) {
                    e.currentTarget.style.borderColor = '#999';
                    e.currentTarget.style.background = '#ebebeb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!imagePreview) {
                    e.currentTarget.style.borderColor = '#ccc';
                    e.currentTarget.style.background = '#f5f5f5';
                  }
                }}
                >
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} alt="Campaign" style={{ 
                        maxWidth: '100%', 
                        maxHeight: '100%', 
                        width: 'auto', 
                        height: 'auto', 
                        objectFit: 'cover', 
                        borderRadius: '14px'
                      }} />
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0,
                        transition: 'opacity 0.3s ease',
                        borderRadius: '14px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '1';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '0';
                      }}
                      >
                        <div style={{ textAlign: 'center', color: '#fff' }}>
                          <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>📷</div>
                          <div style={{ fontSize: '0.8rem' }}>Change Image</div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div style={{ textAlign: 'center', color: '#000000ff' }}>
                      <img src={UploadIcon} alt="Upload" style={{ width: '32px', height: '32px', marginBottom: '8px' }} />
                      <div style={{ fontSize: '0.9rem', fontWeight: '500', opacity: 0.9 }}><RequiredLabel>Upload Image</RequiredLabel></div>
                      <div style={{ fontSize: '0.7rem', opacity: 0.7, marginTop: '4px' }}>Click to browse</div>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0, cursor: 'pointer', left: 0, top: 0 }}
                    title="Upload campaign image"
                    disabled={isReadOnly}
                  />
                </div>
                <TextField
                  label={<RequiredLabel>Judul Campaign</RequiredLabel>}
                  variant="outlined"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  style={{ flex: 1, marginBottom: '18px' }}
                  InputLabelProps={{ shrink: true }}
                  disabled={isReadOnly}
                />
              </div>
              <div style={{ marginBottom: '18px', marginTop: '6px' }}>
                <FormControl fullWidth variant="outlined" disabled={isReadOnly}>
                  <InputLabel shrink><RequiredLabel>Jenis Campaign</RequiredLabel></InputLabel>
                  <Select
                    value={campaignCategory}
                    onChange={e => setCampaignCategory(e.target.value)}
                    label="Jenis Campaign *"
                    disabled={isReadOnly}
                  >
                    {categoryOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                  </Select>
                </FormControl>
              </div>
              
              {/* Toggle untuk produk */}
              <div style={{ marginBottom: '18px' }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={hasProduct}
                      onChange={(e) => setHasProduct(e.target.checked)}
                      color="primary"
                      disabled={isReadOnly}
                    />
                  }
                  label="Campaign ini memiliki produk yang dipromosikan"
                />
              </div>
              {hasProduct && (
                <>
                  <div style={{ marginBottom: '18px' }}>
                    <TextField
                      label={<RequiredLabel>Nama Produk</RequiredLabel>}
                      variant="outlined"
                      placeholder="Input nama produk"
                      value={productName}
                      onChange={e => setProductName(e.target.value)}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      disabled={isReadOnly}
                    />
                  </div>
                  <div style={{ marginBottom: '18px' }}>
                    <TextField
                      label={<RequiredLabel>Nilai Produk</RequiredLabel>}
                      variant="outlined"
                      placeholder="Contoh: 89000"
                      value={formatCurrency(productValue)}
                      onChange={e => setProductValue(e.target.value)}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      InputProps={{
                        startAdornment: <span style={{ marginRight: '4px', color: '#666' }}>Rp</span>,
                      }}
                      // helperText="Format otomatis: 89000 → Rp 89.000"
                      disabled={isReadOnly}
                    />
                  </div>
                </>
              )}
              
              <div style={{ marginBottom: '18px' }}>
                <TextField
                  label={<RequiredLabel>{hasProduct ? 'Deskripsi Produk' : 'Deskripsi Campaign'}</RequiredLabel>}
                  variant="outlined"
                  placeholder={hasProduct 
                    ? "Tulis detail produk yang akan dipromosikan (kandungan, manfaat, dll)..."
                    : "Tulis tujuan dan detail campaign di sini..."
                  }
                  value={productDesc}
                  onChange={e => setProductDesc(e.target.value)}
                  fullWidth
                  multiline
                  rows={4}
                  InputLabelProps={{ shrink: true }}
                  disabled={isReadOnly}
                />
              </div>
            </form>
            
            {/* Navigation Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #eee' }}>
              <div></div>
              <Button
                onClick={handleNext}
                variant="contained"
                color="primary"
                size="large"
                style={{ 
                  borderRadius: '8px',
                  fontWeight: 600,
                  padding: '12px 32px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none'
                }}
              >
                Next →
              </Button>
            </div>
          </div>
          )}

          {/* Step 2: Kriteria Influencer */}
          {currentStep === 2 && (
            <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px #e3e3e3', padding: '32px', marginBottom: '24px' }}>
              <h3 style={{ margin: '0 0 24px 0', fontSize: '1.3rem', fontWeight: 600 }}>Kriteria Influencer</h3>
            <form>
              <div style={{ marginBottom: '18px', marginTop: '6px' }}>
                <Autocomplete
                  multiple
                  options={[
                    'Entertainment',
                    'Health & Sport',
                    'Lifestyle & Travel',
                    'Technology',
                    'Family & Parenting',
                    'Food & Beverages',
                    'Beauty & Fashion',
                    'Gaming'
                  ]}
                  value={category}
                  onChange={(event, newValue) => setCategory(newValue)}
                  disabled={isReadOnly}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        label={option}
                        {...getTagProps({ index })}
                        onDelete={isReadOnly ? undefined : () => {
                          setCategory(category.filter((cat) => cat !== option));
                        }}
                        style={{
                          backgroundColor: '#f0f0f0',
                          border: '1px solid #ccc',
                          borderRadius: '16px'
                        }}
                      />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      label={<RequiredLabel>Kategori Influencer</RequiredLabel>}
                      placeholder="Pilih kategori"
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <TextField
                  label={<RequiredLabel>Minimal Jumlah Followers</RequiredLabel>}
                  variant="outlined"
                  placeholder="Contoh: 10000"
                  value={min_followers}
                  onChange={e => setMinFollowers(e.target.value)}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  helperText="💡 Tentukan minimal followers yang dibutuhkan influencer (contoh: 1000, 10000, dst)"
                  disabled={isReadOnly}
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  <RequiredLabel>Target Gender</RequiredLabel>
                </label>
                <RadioGroup
                  row
                  value={selectedGender}
                  onChange={(e) => setSelectedGender(e.target.value)}
                  style={{ marginBottom: '12px' }}
                >
                  <FormControlLabel value="male" control={<Radio disabled={isReadOnly} />} label="Laki-Laki" />
                  <FormControlLabel value="female" control={<Radio disabled={isReadOnly} />} label="Perempuan" />
                </RadioGroup>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  <RequiredLabel>Target Usia</RequiredLabel>
                </label>
                <RadioGroup
                  row
                  value={selectedAge}
                  onChange={(e) => setSelectedAge(e.target.value)}
                  style={{ marginBottom: '12px' }}
                >
                  <FormControlLabel value="< 18 tahun" control={<Radio disabled={isReadOnly} />} label="< 18 tahun" />
                  <FormControlLabel value="18-24 tahun" control={<Radio disabled={isReadOnly} />} label="18-24 tahun" />
                  <FormControlLabel value="25-34 tahun" control={<Radio disabled={isReadOnly} />} label="25-34 tahun" />
                  <FormControlLabel value="35-49 tahun" control={<Radio disabled={isReadOnly} />} label="35-49 tahun" />
                  <FormControlLabel value="> 50 tahun" control={<Radio disabled={isReadOnly} />} label="> 50 tahun" />
                </RadioGroup>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ fontWeight: 600 }}>Lainnya..</label>
                <TextField
                  placeholder="Tambahkan kriteria lainnya jika ada"
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={2}
                  style={{ marginTop: '6px' }}
                  disabled={isReadOnly}
                />
              </div>
            </form>
            
            {/* Navigation Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #eee' }}>
              <Button
                onClick={handleBack}
                variant="outlined"
                size="large"
                style={{ 
                  borderRadius: '8px',
                  fontWeight: 600,
                  padding: '12px 32px'
                }}
              >
                ← Back
              </Button>
              <Button
                onClick={handleNext}
                variant="contained"
                color="primary"
                size="large"
                style={{ 
                  borderRadius: '8px',
                  fontWeight: 600,
                  padding: '12px 32px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none'
                }}
              >
                Next →
              </Button>
            </div>
          </div>
          )}

          {/* Step 3: Konten & Anggaran */}
          {currentStep === 3 && (
            <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px #e3e3e3', padding: '32px', marginBottom: '24px' }}>
              <h3 style={{ margin: '0 0 24px 0', fontSize: '1.3rem', fontWeight: 600 }}>Konten & Anggaran</h3>
            <form>
              <div style={{ marginBottom: '18px' }}>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: '6px' }}>Platform:</label>
                <span style={{ fontSize: '1.1rem' }}>Instagram</span>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  <RequiredLabel>Jumlah Influencer yang Dibutuhkan</RequiredLabel>
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Button 
                    variant="outlined" 
                    onClick={() => setInfluencerCount(Math.max(1, influencer_count - 1))}
                    disabled={isReadOnly}
                    style={{ 
                      padding: '8px 16px',
                      borderRadius: '8px',
                      flex: '0 0 auto',
                      minWidth: '40px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    -
                  </Button>
                  <TextField
                    type="number"
                    min="1"
                    value={influencer_count}
                    onChange={(e) => setInfluencerCount(Math.max(1, parseInt(e.target.value) || 1))}
                    style={{ width: '80px', padding: '8px', borderRadius: '8px', textAlign: 'center' }}
                    disabled={isReadOnly}
                  />
                  <Button 
                    variant="outlined" 
                    onClick={() => setInfluencerCount(influencer_count + 1)}
                    disabled={isReadOnly}
                    style={{ 
                      padding: '8px 16px',
                      borderRadius: '8px',
                      flex: '0 0 auto',
                      minWidth: '40px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    +
                  </Button>
                </div>
              </div>

              {contentItems.map((item, index) => (
                <div key={item.id} style={{ 
                  marginBottom: '18px',
                  padding: '16px',
                  border: '1px solid #e3e3e3',
                  borderRadius: '8px',
                  background: '#fff'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h4 style={{ margin: 0, fontWeight: 600 }}>Konten {index + 1}</h4>
                    {contentItems.length > 1 && !isReadOnly && (
                      <Button
                        variant="outlined"
                        onClick={() => removeContentItem(item.id)}
                        style={{ 
                          padding: '4px 8px',
                          borderColor: '#dc3545',
                          color: '#dc3545',
                          borderRadius: '4px',
                          height: '36px',
                          minWidth: '80px'
                        }}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
                    <div style={{ flex: '0 0 auto' }}>
                      <label style={{ fontWeight: 600, display: 'block', marginBottom: '6px' }}>Jumlah Post</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Button
                          variant="outlined"
                          onClick={() => updateContentItem(item.id, 'post_count', Math.max(1, item.post_count - 1))}
                          disabled={isReadOnly}
                          style={{ 
                            padding: '8px 16px',
                            borderRadius: '8px',
                            flex: '0 0 auto',
                            minWidth: '40px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          -
                        </Button>
                        <TextField
                          type="number"
                          min="1"
                          value={item.post_count}
                          onChange={(e) => updateContentItem(item.id, 'post_count', parseInt(e.target.value) || 1)}
                          style={{ width: '80px', padding: '8px', borderRadius: '8px', textAlign: 'center' }}
                          disabled={isReadOnly}
                        />
                        <Button
                          variant="outlined"
                          onClick={() => updateContentItem(item.id, 'post_count', item.post_count + 1)}
                          disabled={isReadOnly}
                          style={{ 
                            padding: '8px 16px',
                            borderRadius: '8px',
                            flex: '0 0 auto',
                            minWidth: '40px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          +
                        </Button>
                      </div>
                    </div>

                    <div style={{ flex: 1 }}>
                      <label style={{ fontWeight: 600, display: 'block', marginBottom: '6px' }}>Jenis Konten</label>
                      <FormControl fullWidth variant="outlined" disabled={isReadOnly}>
                        <Select
                          value={item.content_type}
                          onChange={(e) => updateContentItem(item.id, 'content_type', e.target.value)}
                          label="Jenis Konten"
                          disabled={isReadOnly}
                        >
                          <MenuItem value="foto">Instagram Foto</MenuItem>
                          <MenuItem value="video">Instagram Video</MenuItem>
                          <MenuItem value="reels">Instagram Reels</MenuItem>
                          <MenuItem value="story">Instagram Story</MenuItem>
                        </Select>
                      </FormControl>
                    </div>
                  </div>
                </div>
              ))}
              
              {!isReadOnly && (
              <div style={{ marginBottom: '18px' }}>
                <Button 
                  variant="outlined" 
                  onClick={addContentItem}
                  style={{ 
                    width: '100%',
                    padding: '12px',
                    border: '1px dashed #ccc',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    color: '#666',
                    fontSize: '1rem'
                  }}
                >
                  + Add Konten
                </Button>
              </div>
              )}

              <div style={{ marginBottom: '18px' }}>
                <TextField
                  label={<RequiredLabel>Harga per Task</RequiredLabel>}
                  variant="outlined"
                  placeholder="Contoh: 50000"
                  value={formatCurrency(price_per_post)}
                  onChange={e => setPricePerPost(e.target.value)}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: <span style={{ marginRight: '4px', color: '#666' }}>Rp</span>,
                  }}
                  // helperText="💰 Format otomatis: 50000 → Rp 50.000"
                  disabled={isReadOnly}
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: '6px' }}>Estimasi Total Anggaran</label>
                <div style={{ 
                  padding: '12px', 
                  borderRadius: '8px', 
                  background: '#f8f9fa',
                  border: '1px solid #dee2e6',
                  fontSize: '1.1rem'
                }}>
                  Rp {estimatedBudget.toLocaleString()}
                </div>
              </div>

            </form>
            
            {/* Navigation Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #eee' }}>
              <Button
                onClick={handleBack}
                variant="outlined"
                size="large"
                style={{ 
                  borderRadius: '8px',
                  fontWeight: 600,
                  padding: '12px 32px'
                }}
              >
                ← Back
              </Button>
              <Button
                onClick={handleNext}
                variant="contained"
                color="primary"
                size="large"
                style={{ 
                  borderRadius: '8px',
                  fontWeight: 600,
                  padding: '12px 32px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none'
                }}
              >
                Next →
              </Button>
            </div>
          </div>
          )}

          {/* Step 4: Brief Campaign */}
          {currentStep === 4 && (
            <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px #e3e3e3', padding: '32px', marginBottom: '24px' }}>
              <h3 style={{ margin: '0 0 24px 0', fontSize: '1.3rem', fontWeight: 600 }}>Brief Campaign</h3>
            <form>
              <p style={{ color: '#666', marginBottom: '16px', fontSize: '14px' }}>
                💡 <strong>Tips:</strong> Berikan waktu lebih jika campaign memerlukan pengiriman barang ke influencer. Minimal 1 minggu antar tanggal.
              </p>
              
              <div style={{ marginBottom: '18px' }}>
                <TextField
                  label={<RequiredLabel>Deadline Proposal Konten</RequiredLabel>}
                  type="date"
                  value={submission_deadline}
                  onChange={e => setContentDeadline(e.target.value)}
                  fullWidth
                  InputLabelProps={{
                    shrink: true,
                  }}
                  variant="outlined"
                  helperText="Batas waktu influencer mengirimkan proposal konten"
                  disabled={isReadOnly}
                />
              </div>
              
              <div style={{ marginBottom: '18px' }}>
                <TextField
                  label={<RequiredLabel>Tanggal Campaign Mulai</RequiredLabel>}
                  type="date"
                  value={start_date}
                  onChange={e => setStartDate(e.target.value)}
                  fullWidth
                  InputLabelProps={{
                    shrink: true,
                  }}
                  variant="outlined"
                  helperText="Minimal 1 minggu setelah deadline proposal"
                  disabled={isReadOnly}
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <TextField
                  label={<RequiredLabel>Tanggal Campaign Selesai</RequiredLabel>}
                  type="date"
                  value={end_date}
                  onChange={e => setEndDate(e.target.value)}
                  min={start_date}
                  fullWidth
                  InputLabelProps={{
                    shrink: true,
                  }}
                  variant="outlined"
                  helperText="Minimal 1 minggu setelah tanggal mulai"
                  disabled={isReadOnly}
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <TextField
                  label="Aturan Foto/Video (Opsional)"
                  variant="outlined"
                  placeholder="misalnya: wajib ada selfie"
                  value={content_guidelines}
                  onChange={e => setPhotoRules(e.target.value)}
                  fullWidth
                  multiline
                  rows={2}
                  disabled={isReadOnly}
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <TextField
                  label="Aturan Caption (Opsional)"
                  variant="outlined"
                  placeholder="misalnya: wajib mencantumkan #hashtagbrand"
                  value={caption_guidelines}
                  onChange={e => setCaptionRules(e.target.value)}
                  fullWidth
                  multiline
                  rows={2}
                  disabled={isReadOnly}
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                  Referensi Foto (Opsional)
                </label>
                
                {/* Upload Button */}
                <div 
                  style={{ 
                    border: '2px solid #667eea', 
                    borderRadius: '12px', 
                    padding: '16px', 
                    textAlign: 'center',
                    background: '#fff',
                    cursor: 'pointer',
                    marginBottom: '16px',
                    transition: 'all 0.3s ease'
                  }}
                  onClick={() => document.getElementById('referenceFileInput').click()}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f8f9ff';
                    e.currentTarget.style.borderColor = '#5568d3';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#fff';
                    e.currentTarget.style.borderColor = '#667eea';
                  }}
                >
                  <input
                    id="referenceFileInput"
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={handleReferenceFileChange}
                    style={{ display: 'none' }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <img src={UploadIcon} alt="Upload" style={{ width: '24px', height: '24px', marginBottom: '4px' }} />
                    <span style={{ color: '#667eea', fontWeight: 600, fontSize: '15px' }}>
                      Cari foto
                    </span>
                  </div>
                </div>

                {/* File Previews Grid */}
                {referenceFiles.length > 0 && (
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', 
                    gap: '12px',
                    marginTop: '16px'
                  }}>
                    {referenceFiles.map((fileObj, index) => (
                      <div 
                        key={index}
                        style={{ 
                          position: 'relative',
                          border: '1px solid #e0e0e0',
                          borderRadius: '8px',
                          padding: '8px',
                          background: '#fff',
                          overflow: 'hidden'
                        }}
                      >
                        {/* Delete Button */}
                        <button
                          onClick={() => handleRemoveReferenceFile(index)}
                          style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            background: '#fff',
                            border: 'none',
                            borderRadius: '50%',
                            width: '28px',
                            height: '28px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                            zIndex: 1,
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#ff4444';
                            e.currentTarget.style.color = '#fff';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#fff';
                            e.currentTarget.style.color = '#000';
                          }}
                        >
                          <img 
                            src={DeleteIcon} 
                            alt="Delete" 
                            style={{ width: '14px', height: '14px' }} 
                          />
                        </button>

                        {/* Preview */}
                        {fileObj.preview ? (
                          <div style={{ 
                            width: '100%', 
                            height: '120px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            background: '#f5f5f5',
                            borderRadius: '4px',
                            overflow: 'hidden'
                          }}>
                            {fileObj.type === 'image' ? (
                              <img 
                                src={fileObj.preview} 
                                alt="Preview" 
                                style={{ 
                                  maxWidth: '100%', 
                                  maxHeight: '100%', 
                                  objectFit: 'cover' 
                                }} 
                              />
                            ) : fileObj.type === 'video' ? (
                              <video 
                                src={fileObj.preview} 
                                style={{ 
                                  maxWidth: '100%', 
                                  maxHeight: '100%', 
                                  objectFit: 'cover' 
                                }} 
                              />
                            ) : null}
                          </div>
                        ) : (
                          <div style={{ 
                            width: '100%', 
                            height: '120px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            background: '#f5f5f5',
                            borderRadius: '4px'
                          }}>
                            <span style={{ fontSize: '32px' }}>📄</span>
                          </div>
                        )}

                        {/* File Name */}
                        <p style={{ 
                          marginTop: '8px', 
                          fontSize: '11px', 
                          color: '#666',
                          textAlign: 'center',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {fileObj.name}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </form>
            
            {/* Navigation Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #eee' }}>
              <Button
                onClick={handleBack}
                variant="outlined"
                size="large"
                style={{ 
                  borderRadius: '8px',
                  fontWeight: 600,
                  padding: '12px 32px'
                }}
              >
                ← Back
              </Button>
              {!isReadOnly && (
              <Button
                onClick={handleSave}
                variant="contained"
                color="primary"
                size="large"
                style={{ 
                  borderRadius: '8px',
                  fontWeight: 600,
                  padding: '12px 32px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none'
                }}
              >
                Save Campaign
              </Button>
              )}
            </div>
          </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Popup */}
      {showDeletePopup && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
          onClick={cancelDelete}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '450px',
              width: '90%',
              boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
              animation: 'slideIn 0.3s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🗑️</div>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '1.5rem', fontWeight: 600, color: '#333' }}>
                Delete Campaign?
              </h3>
              <p style={{ margin: 0, color: '#666', fontSize: '0.95rem', lineHeight: '1.5' }}>
                Are you sure you want to delete this campaign? This action cannot be undone and all data will be permanently removed.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={cancelDelete}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  border: '2px solid #ddd',
                  background: '#fff',
                  color: '#333',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#f8f9fa';
                  e.target.style.borderColor = '#999';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#fff';
                  e.target.style.borderColor = '#ddd';
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  border: 'none',
                  background: '#dc3545',
                  color: '#fff',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#c82333';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(220, 53, 69, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#dc3545';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Back Confirmation Modal */}
      <Modal
        isOpen={showBackModal}
        onClose={() => setShowBackModal(false)}
        title="Keluar dari Halaman Ini?"
        showActions={false}
      >
        <div>
          <p style={{ marginBottom: '24px', color: '#666' }}>
            Apakah Anda ingin menyimpan draft atau keluar tanpa menyimpan?
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <Button 
              variant="secondary" 
              onClick={() => setShowBackModal(false)}
            >
              Tetap di Halaman
            </Button>
            <Button 
              variant="primary" 
              onClick={() => {
                setShowBackModal(false);
                navigate('/campaigns');
              }}
            >
              Keluar Tanpa Menyimpan
            </Button>
          </div>
        </div>
      </Modal>

      {/* Header Back Button Modal */}
      <Modal
        isOpen={showHeaderBackModal}
        onClose={() => setShowHeaderBackModal(false)}
        title="Simpan atau Keluar?"
        showActions={false}
      >
        <div>
          <p style={{ marginBottom: '24px', color: '#666' }}>
            Apakah Anda ingin menyimpan campaign sebagai draft atau keluar tanpa menyimpan?
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <Button 
              variant="secondary"
              style={{
                background: '#d32020ff',
                borderColor: '#ccc',
                color: '#000000ff',
                fontWeight: 'bold'
              }}
              onClick={() => setShowHeaderBackModal(false)}
            >
              Batal
            </Button>
            <Button 
              variant="primary" 
              style={{
                background: '#16b751ff',
                borderColor: '#ccc',
                color: '#000000ff',
                fontWeight: 'bold'
              }}
              onClick={handleSaveAsDraft}
            >
              Simpan sebagai Draft
            </Button>
          </div>
        </div>
      </Modal>
        </div>
      </div>
    </div>
  );
}

export default CampaignCreate;
