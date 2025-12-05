import UploadFileIcon from '@mui/icons-material/UploadFile';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';
import { Button, TextField, Select, MenuItem, FormControl, InputLabel, RadioGroup, FormControlLabel, Radio, Checkbox, ListItemText, OutlinedInput, Chip, Box } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { Sidebar, Topbar } from '../../components/common';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import DeleteIcon from '../../assets/delete.svg';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import UploadIcon from '../../assets/upload.svg';
import { useToast } from '../../hooks/useToast';
import { Modal } from '../../components/common';
import * as campaignService from '../../services/campaignService';

function CollapsibleSection({ title, children, status = '', defaultOpen = false, disabled = false }) {
  const [open, setOpen] = useState(defaultOpen);
  
  const handleClick = () => {
    if (!disabled) {
      setOpen(!open);
    }
  };
  
  return (
    <div style={{ 
      marginBottom: 3,
      background: '#fff', 
      borderRadius: 3,
      boxShadow: '0 2px 8px #e3e3e3',
      opacity: disabled ? 0.5 : 1
    }}>
      <div
        style={{
          fontSize: 19,
          paddingTop: 2.25,
          paddingBottom: 2.25,
          paddingLeft: 3,
          paddingRight: 3,
          borderBottom: open ? '1px solid #eee' : 'none',
          color: disabled ? '#999' : 'inherit',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: disabled ? 'not-allowed' : 'pointer',
          fontWeight: 600
        }}
        onClick={handleClick}
      >
        <span>
          <span style={{ marginRight: 1, color: disabled ? '#ccc' : 'inherit' }}>
            {disabled ? '▶' : (open ? '▼' : '▶')}
          </span>
          {title}
        </span>
        <span style={{ color: status === 'done' ? 'green' : (disabled ? '#ccc' : '#888'), fontWeight: 600, fontSize: 16 }}>
          {status === 'done' ? <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>Done <FaCheckCircle /></span> : status || ''}
        </span>
      </div>
      {open && !disabled && (
        <div style={{ padding: 3 }}>{children}</div>
      )}
    </div>
  );
}

function CampaignCreate() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const [isReadOnly, setIsReadOnly] = useState(false);
  
  // Responsive state for sidebar
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1000);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Image upload state
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedGender, setSelectedGender] = useState('');
  const [selectedAge, setSelectedAge] = useState('');
  
  const [title, setTitle] = useState('');

  // Helper component used for required labels in forms
  const RequiredLabel = ({ children }) => (
    <Typography component="span" sx={{ display: 'inline-flex', alignItems: 'center' }}>
      {children}
      <Typography component="span" sx={{ color: 'error.main', ml: 0.5 }}>*</Typography>
    </Typography>
  );
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Handle reference file upload (multiple files)
  const handleReferenceFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length) {
      const newFiles = files.map((file) => ({
        file,
        preview:
          file.type.startsWith('image/') || file.type.startsWith('video/')
            ? URL.createObjectURL(file)
            : null,
        type: file.type.startsWith('image/')
          ? 'image'
          : file.type.startsWith('video/')
          ? 'video'
          : 'other',
        name: file.name,
      }));
      setReferenceFiles((prev) => [...prev, ...newFiles]);
    }
    if (e.target) e.target.value = '';
  };

  // Remove a reference file by index
  const handleRemoveReferenceFile = (index) => {
    setReferenceFiles((prev) => prev.filter((_, i) => i !== index));
  };

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
    // Pastikan value adalah string
    if (typeof value === 'number') return value.toString();
    if (typeof value !== 'string') return '';
    return value.replace(/\D/g, '');
  };

                  
                
  const [campaignCategory, setCampaignCategory] = useState('');
  const [category, setCategory] = useState([]); // Influencer categories (multi-select)
  const [hasProduct, setHasProduct] = useState(false); // Toggle untuk produk
  const [productName, setProductName] = useState('');
  const [productValue, setProductValue] = useState('');
  const [productDesc, setProductDesc] = useState('');
  
  // Modal state
  const [showBackModal, setShowBackModal] = useState(false);
  const [showHeaderBackModal, setShowHeaderBackModal] = useState(false);
  const [isHoveringBatal, setIsHoveringBatal] = useState(false);
  
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
    if (!title || !title.trim()) errors.push('Judul Campaign');
    if (!campaignCategory) errors.push('Jenis Campaign');
    if (hasProduct) {
      if (!productName || !productName.trim()) errors.push('Nama Produk');
      if (!productValue) errors.push('Nilai Produk');
    }
    if (!productDesc || !productDesc.trim()) errors.push(hasProduct ? 'Deskripsi Produk' : 'Deskripsi Campaign');
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
      // Load campaign from API
      const fetchCampaign = async () => {
        try {
          const response = await campaignService.getCampaignById(id);
          const data = response;
          // Set read-only mode if campaign is active (paid)
          if (data.status === 'active') {
            setIsReadOnly(true);
          }
          
          // Set form state - mapping API fields to frontend state
          setTitle(data.title || '');
          setCampaignCategory(data.campaign_category || '');
          
          // Parse influencer_category (API returns array)
          if (data.influencer_category && Array.isArray(data.influencer_category)) {
            setCategory(data.influencer_category);
          } else if (typeof data.influencer_category === 'string') {
            try {
              const parsed = JSON.parse(data.influencer_category);
              setCategory(Array.isArray(parsed) ? parsed : []);
            } catch {
              setCategory([]);
            }
          } else {
            setCategory([]);
          }
          
          // Product fields
          setHasProduct(data.has_product || false);
          setProductName(data.product_name || '');
          setProductValue(data.product_value ? data.product_value.toString() : '');
          setProductDesc(data.product_desc || '');
          
          // Date fields
          setStartDate(data.start_date || '');
          setEndDate(data.end_date || '');
          setContentDeadline(data.submission_deadline || '');
          
          // Guidelines
          setPhotoRules(data.content_guidelines || '');
          setCaptionRules(data.caption_guidelines || '');
          setContentReference(data.content_reference || '');
          
          // Budget & criteria
          setInfluencerCount(data.influencer_count || 1);
          setPricePerPost(data.price_per_post ? data.price_per_post.toString() : '');
          setMinFollowers(data.min_followers ? data.min_followers.toString() : '');
          
          // Demographics
          setSelectedGender(data.selected_gender || '');
          setSelectedAge(data.selected_age || '');
          
          // Content types - parse if needed
          if (data.contentTypes && Array.isArray(data.contentTypes) && data.contentTypes.length > 0) {
            setContentItems(data.contentTypes);
          } else {
            // Default content item if none exist
            setContentItems([{ id: 1, post_count: 1, content_type: 'foto' }]);
          }
          
          // Image
          if (data.banner_image) {
            setImagePreview(data.banner_image);
          }
        
        // Save original data for comparison
          setOriginalData(data);
          setIsDataLoaded(true); // Mark as loaded to prevent duplicate calls
        } catch (err) {
          console.error('load campaign (API)', err);
          showToast('Gagal memuat campaign dari server', 'error');
          setIsDataLoaded(true);
        }
      };

      fetchCampaign(); // Call the async function
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

  // Handle window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1000);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

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
  const kriteriaFilled = category && category.length > 0 && min_followers && selectedGender && selectedAge;

  // Check if konten & anggaran fields are filled
  const kontenFilled = influencer_count && price_per_post && contentItems && contentItems.length > 0;

  // Status for collapsible sections
  const detailStatus = allFilled ? 'done' : 'in progress';
  const kriteriaStatus = kriteriaFilled ? 'done' : 'in progress';
  const kontenStatus = kontenFilled ? 'done' : 'in progress';
  const briefStatus = briefFilled ? 'done' : 'in progress';

  // Save as Draft handler
  const handleSaveAsDraft = async () => {
    // Prepare campaign data - no validation required for draft
    const campaignData = {
      title: title || 'Draft Campaign',
      campaignCategory,
      category,
      hasProduct,
      productName,
      productValue: productValue ? parseCurrency(productValue) : '',
      productDesc,
      start_date,
      end_date,
      submission_deadline,
      content_guidelines,
      caption_guidelines,
      contentReference,
      referenceFiles: referenceFiles.map(rf => rf.name),
      influencer_count,
      price_per_post: price_per_post ? parseCurrency(price_per_post) : '',
      min_followers: min_followers ? parseCurrency(min_followers) : '',
      selectedGender,
      selectedAge,
      contentItems,
      status: 'inactive', // Set to inactive for unpaid campaigns
      image: imagePreview
    };
    
    try {
      if (isEditMode) {
        // Update existing campaign as draft
        await campaignService.updateCampaign(id, campaignData);
        showToast('Campaign berhasil disimpan sebagai draft!', 'success');
      } else {
        // Create new campaign as draft
        await campaignService.createCampaign(campaignData);
        showToast('Campaign berhasil disimpan sebagai draft!', 'success');
      }
      
      setShowHeaderBackModal(false);
      setTimeout(() => navigate('/campaigns'), 500);
    } catch (err) {
      console.error('save draft (API)', err);
      showToast(err.message || 'Gagal menyimpan draft ke server', 'error');
    }
  };

  // Save handler
  const handleSave = async (e) => {
    e.preventDefault();
    
    // Check if data is still loading (for edit mode)
    if (isEditMode && !isDataLoaded) {
      showToast('Data campaign masih dimuat. Mohon tunggu sebentar.', 'warning');
      return;
    }
    
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
      min_followers: parseCurrency(min_followers),
      selectedGender,
      selectedAge,
      contentItems: contentItems.map(item => ({
        id: item.id,
        post_count: item.post_count,
        content_type: item.content_type
      })),
      status: 'inactive', // Set to inactive for unpaid campaigns, will be 'active' after payment
      image: imagePreview
    };
    // Save to API
    try {
      let response;
      let campaignId;
      
      if (isEditMode) {
        // Update existing campaign
        response = await campaignService.updateCampaign(id, campaignData);
        campaignId = id; // For update, use existing ID
        showToast('Campaign berhasil diupdate!', 'success');
      } else {
        // Create new campaign
        response = await campaignService.createCampaign(campaignData);
        // Try multiple ways to get campaign_id from response
        campaignId = response?.data?.campaign_id || 
                     response?.campaign_id || 
                     response?.insertId ||
                     response?.id;
        // If campaignId is still not valid, try to extract from any nested structure
        if (!campaignId || campaignId === 'undefined') {
          // Try to find campaign_id in any level of the response
          if (response?.data?.data?.campaign_id) {
            campaignId = response.data.data.campaign_id;
          } else if (response?.result?.campaign_id) {
            campaignId = response.result.campaign_id;
          }
        }
        showToast('Campaign berhasil dibuat!', 'success');
      }
      
      // Check if campaign status is inactive (unpaid) - redirect to payment
      if (campaignData.status === 'inactive') {
        if (campaignId && campaignId !== 'undefined') {
          setTimeout(() => navigate(`/campaign/${campaignId}/payment`), 1500);
        } else {
          console.error('❌ No valid campaign ID returned from API');
          console.error('Full response:', JSON.stringify(response, null, 2));
          showToast(isEditMode ? 'Campaign diupdate tapi tidak bisa redirect.' : 'Campaign dibuat tapi tidak bisa redirect.', 'warning');
          setTimeout(() => navigate('/campaigns'), 1500);
        }
      } else {
        if (isEditMode) {
          showToast('Campaign aktif berhasil diupdate!', 'success');
        }
        setTimeout(() => navigate('/campaigns'), 1500);
      }
    } catch (err) {
      console.error('save campaign (API)', err);
      showToast(err.message || 'Gagal menyimpan campaign ke server', 'error');
    }
  };

  // Delete handler
  const handleDelete = () => {
    setShowDeletePopup(true);
  };

  const confirmDelete = async () => {
    // Delete campaign from API
    try {
      await campaignService.deleteCampaign(id);
      showToast('Campaign berhasil dihapus', 'success');
      setShowDeletePopup(false);
      setTimeout(() => navigate('/campaigns'), 500);
    } catch (err) {
      console.error('delete campaign (API)', err);
      showToast(err.message || 'Gagal menghapus campaign dari server', 'error');
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
    <Box sx={{ display: 'flex', fontFamily: 'Inter, sans-serif' }}>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <Box sx={{ ml: !isMobile ? 32.5 : 0, flex: 1 }}>
        <Topbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <Box sx={{ mt: 9, bgcolor: '#f7fafc', minHeight: 'calc(100vh - 72px)', py: 4 }}>
          <Container maxWidth="md">
            <Paper elevation={3} sx={{ borderRadius: 3, p: { xs: 2, md: 4 }, mb: 4, position: 'relative', overflow: 'hidden', boxShadow: 6 }}>
              {/* Header with Title and Buttons */}
              <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => {
                    if (isReadOnly) {
                      navigate('/campaigns');
                    } else {
                      setShowHeaderBackModal(true);
                    }
                  }}
                  sx={{ minWidth: 36, minHeight: 36, borderRadius: 2, p: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <ArrowBackIosNewIcon sx={{ fontSize: 20, color: '#667eea' }} />
                </Button>
                <Typography variant="h5" fontWeight={600} sx={{ flex: 1 }}>
                  {isReadOnly ? 'Campaign Details' : isEditMode ? 'Edit Campaign' : 'Create Campaign'}
                </Typography>
                {isEditMode && !isReadOnly && (
                  <Button onClick={handleDelete} sx={{ minWidth: 0, p: 0, borderRadius: '50%' }}>
                    <img src={DeleteIcon} alt="Delete" style={{ width: 20, height: 20, borderRadius: '50%' }} />
                  </Button>
                )}
              </Stack>
              <Paper elevation={0} sx={{ bgcolor: '#f8f9fa', borderRadius: 3, px: 2, py: 1, mb: 3, overflowX: 'auto' }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ width: '100%' }}>
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
                        <Box
                          onClick={() => canAccess && goToStep(step.num)}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            cursor: canAccess ? 'pointer' : 'not-allowed',
                            opacity: canAccess ? 1 : 0.6,
                            flex: 1,
                            minWidth: 0,
                            py: 0.5,
                          }}
                        >
                          <Box
                            sx={{
                              width: 24,
                              height: 24,
                              borderRadius: '50%',
                              background: isActive ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#e9ecef',
                              color: isActive ? '#fff' : '#adb5bd',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 13,
                              fontWeight: 700,
                            }}
                          >
                            {step.num}
                          </Box>
                          <Typography
                            sx={{
                              fontSize: 12,
                              color: isActive ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#adb5bd',
                              fontWeight: isActive ? 600 : 500,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              background: isActive ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'none',
                              WebkitBackgroundClip: isActive ? 'text' : 'none',
                              WebkitTextFillColor: isActive ? 'transparent' : 'inherit',
                            }}
                          >
                            {step.name}
                          </Typography>
                        </Box>
                      </React.Fragment>
                    );
                  })}
                </Stack>
              </Paper>

              {/* Step Content Card */}
              {currentStep === 1 && (
                <Box sx={{ background: '#fff', p: '32px 28px', mb: 3, borderRadius: 3, boxShadow: '0 2px 8px #e3e3e3' }}>
                  <Typography component="h3" sx={{ mt: 0, mb: 2.5, fontSize: 21, fontWeight: 600 }}>Detail Campaign</Typography>
                  <form onSubmit={handleSave}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3, mb: 3 }}>
                      <Box
                        sx={{
                          width: { xs: 180, sm: 220 },
                          height: { xs: 140, sm: 180 },
                          bgcolor: imagePreview ? '#fff' : '#f5f5f5',
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                          position: 'relative',
                          border: '1px solid #ccc',
                          cursor: 'pointer',
                          '&:hover': {
                            borderColor: imagePreview ? '#ccc' : '#999',
                            bgcolor: imagePreview ? '#fff' : '#ebebeb',
                          },
                        }}
                      >
                        {imagePreview ? (
                          <>
                            <img
                              src={imagePreview}
                              alt="Campaign"
                              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'cover', borderRadius: 8 }}
                            />
                            <Box
                              sx={{
                                position: 'absolute',
                                inset: 0,
                                bgcolor: 'rgba(0,0,0,0.35)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                opacity: 0,
                                transition: 'opacity 0.3s ease',
                                borderRadius: 2,
                                '&:hover': { opacity: 1 },
                              }}
                            >
                              <Typography sx={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>Change Image</Typography>
                            </Box>
                          </>
                        ) : (
                          <Box sx={{ textAlign: 'center', color: '#1a1f36' }}>
                            <img src={UploadIcon} alt="Upload" style={{ width: 24, height: 24, marginBottom: 8 }} />
                            <Typography sx={{ fontSize: 14, fontWeight: 600 }}><RequiredLabel>Upload Image</RequiredLabel></Typography>
                            <Typography sx={{ fontSize: 12, opacity: 0.7, mt: 0.5 }}>Click to browse</Typography>
                          </Box>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0, cursor: 'pointer', left: 0, top: 0 }}
                          title="Upload campaign image"
                          disabled={isReadOnly}
                        />
                      </Box>
                      <TextField
                        label={<RequiredLabel>Judul Campaign</RequiredLabel>}
                        variant="outlined"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        sx={{ flex: 1, mb: 2.25 }}
                        InputLabelProps={{ shrink: true }}
                        disabled={isReadOnly}
                      />
                    </Box>
                    <Box sx={{ mb: 1.25, mt: 0 }}>
                      <Autocomplete
                        options={categoryOptions}
                        value={campaignCategory}
                        onChange={(event, newValue) => setCampaignCategory(newValue || '')}
                        disabled={isReadOnly}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            variant="outlined"
                            label={<RequiredLabel>Jenis Campaign</RequiredLabel>}
                            placeholder="Pilih jenis campaign"
                            InputLabelProps={{ shrink: true }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                  borderColor: '#d1d5db',
                                  borderWidth: 1
                                },
                                '&:hover fieldset': {
                                  borderColor: '#667eea'
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: '#667eea',
                                  borderWidth: 2
                                }
                              }
                            }}
                          />
                        )}
                      />
                    </Box>
                    {/* Toggle untuk produk */}
                    <Box sx={{ mb: 1.25 }}>
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
                    </Box>
                    {hasProduct && (
                      <>
                        <Box sx={{ mb: 2.5 }}>
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
                        </Box>
                        <Box sx={{ mb: 2.5 }}>
                          <TextField
                            label={<RequiredLabel>Nilai Produk</RequiredLabel>}
                            variant="outlined"
                            placeholder="Contoh: 89000"
                            value={formatCurrency(productValue)}
                            onChange={e => setProductValue(e.target.value)}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            InputProps={{
                              startAdornment: <span style={{ marginRight: 1, color: '#666' }}>Rp</span>,
                            }}
                            disabled={isReadOnly}
                          />
                        </Box>
                      </>
                    )}
                    <Box sx={{ mb: 2.5 }}>
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
                        disabled={isReadOnly}
                      />
                    </Box>
                  </form>
                  {/* Navigation Buttons */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2.5, mb: 2.5, pt: 2.5, borderTop: '1px solid #eee' }}>
                    <Button
                      onClick={handleBack}
                      variant="outlined"
                      size="large"
                      sx={{ 
                        borderRadius: 2,
                        fontWeight: 600,
                        pt: 1.5,
                        pb: 1.5,
                        pl: 4,
                        pr: 4
                      }}
                    >
                      ← Back
                    </Button>
                    <Button
                      onClick={handleNext}
                      variant="contained"
                      color="primary"
                      size="large"
                      sx={{ 
                        borderRadius: 2,
                        fontWeight: 600,
                        pt: 1.5,
                        pb: 1.5,
                        pl: 4,
                        pr: 4,
                        background: '#667eea',
                        border: 'none'
                      }}
                    >
                      Next →
                    </Button>
                  </Box>
                </Box>
              )}

              {/* Step 2: Kriteria Influencer */}
              {currentStep === 2 && (
                <Box sx={{ background: '#fff', p: '32px 28px', mb: 3, borderRadius: 3, boxShadow: '0 2px 8px #e3e3e3' }}>
                  <Typography component="h3" sx={{ m: 0, mb: 0.75, fontSize: 21, fontWeight: 600 }}>Kriteria Influencer</Typography>
                  <Box component="section">
                    <Box sx={{ mb: 2.5, mt: 1.75 }}>
                      <Autocomplete
                        multiple
                        options={categoryOptions}
                        value={category}
                        onChange={(event, newValue) => setCategory(newValue)}
                        disabled={isReadOnly}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            variant="outlined"
                            label={<RequiredLabel>Kategori Influencer</RequiredLabel>}
                            placeholder="Pilih kategori influencer"
                            InputLabelProps={{ shrink: true }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                  borderColor: '#d1d5db',
                                  borderWidth: 1
                                },
                                '&:hover fieldset': {
                                  borderColor: '#667eea'
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: '#667eea',
                                  borderWidth: 2
                                }
                              }
                            }}
                          />
                        )}
                      />
                    </Box>
                    <Box sx={{ mb: 1.25 }}>
                      <TextField
                        label={<RequiredLabel>Minimal Jumlah Followers</RequiredLabel>}
                        variant="outlined"
                        placeholder="Contoh: 10000"
                        value={min_followers}
                        onChange={e => setMinFollowers(e.target.value)}
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        helperText="Tentukan minimal followers yang dibutuhkan influencer (contoh: 1000, 10000, dst)"
                        disabled={isReadOnly}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              borderColor: '#d1d5db',
                              borderWidth: 1
                            },
                            '&:hover fieldset': {
                              borderColor: '#667eea'
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#667eea',
                              borderWidth: 2
                            }
                          }
                        }}
                      />
                    </Box>
                    <Box sx={{ mb: 1.25 }}>
                      <Typography sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                        <RequiredLabel>Target Gender</RequiredLabel>
                      </Typography>
                      <RadioGroup
                        row
                        value={selectedGender}
                        onChange={(e) => setSelectedGender(e.target.value)}
                        sx={{ mb: 1.5 }}
                      >
                        <FormControlLabel value="male" control={<Radio disabled={isReadOnly} />} label="Laki-Laki" />
                        <FormControlLabel value="female" control={<Radio disabled={isReadOnly} />} label="Perempuan" />
                      </RadioGroup>
                    </Box>
                    <Box sx={{ mb: 1.25 }}>
                      <Typography sx={{ fontWeight: 600, display: 'block', mb: 0.75 }}>
                        <RequiredLabel>Target Usia</RequiredLabel>
                      </Typography>
                      <RadioGroup
                        row
                        value={selectedAge}
                        onChange={(e) => setSelectedAge(e.target.value)}
                        sx={{ mb: 1.5 }}
                      >
                        <FormControlLabel value="< 18 tahun" control={<Radio disabled={isReadOnly} />} label="< 18 tahun" />
                        <FormControlLabel value="18-24 tahun" control={<Radio disabled={isReadOnly} />} label="18-24 tahun" />
                        <FormControlLabel value="25-34 tahun" control={<Radio disabled={isReadOnly} />} label="25-34 tahun" />
                        <FormControlLabel value="35-49 tahun" control={<Radio disabled={isReadOnly} />} label="35-49 tahun" />
                        <FormControlLabel value="> 50 tahun" control={<Radio disabled={isReadOnly} />} label="> 50 tahun" />
                      </RadioGroup>
                    </Box>
                    <Box sx={{ mb: 2.25 }}>
                      <Typography sx={{ fontWeight: 600 }}>Lainnya..</Typography>
                      <TextField
                        placeholder="Tambahkan kriteria lainnya jika ada"
                        variant="outlined"
                        fullWidth
                        multiline
                        rows={2}
                        sx={{ mt: 0.75 }}
                        disabled={isReadOnly}
                      />
                    </Box>
                  </Box>
                  {/* Navigation Buttons */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2.5, mb: 2.5, pt: 2.5, borderTop: '1px solid #eee' }}>
                    <Button
                      onClick={handleBack}
                      variant="outlined"
                      size="large"
                      sx={{ 
                        borderRadius: 2,
                        fontWeight: 600,
                        pt: 1.5,
                        pb: 1.5,
                        pl: 4,
                        pr: 4
                      }}
                    >
                      ← Back
                    </Button>
                    <Button
                      onClick={handleNext}
                      variant="contained"
                      color="primary"
                      size="large"
                      sx={{ 
                        borderRadius: 2,
                        fontWeight: 600,
                        pt: 1.5,
                        pb: 1.5,
                        pl: 4,
                        pr: 4,
                        background: '#667eea',
                        border: 'none'
                      }}
                    >
                      Next →
                    </Button>
                  </Box>
                </Box>
              )}

              {/* Step 3: Konten & Anggaran */}
              {currentStep === 3 && (
                <Box sx={{ background: '#fff', p: '32px 28px', mb: 3, borderRadius: 3, boxShadow: '0 2px 8px #e3e3e3' }}>
                  <Typography component="h3" sx={{ m: 0, mb: 2.5, fontSize: 21, fontWeight: 600 }}>Konten & Anggaran</Typography>
                  <form>
                    <Box sx={{ mb: 2.5 }}>
                      <Typography sx={{ fontWeight: 600, display: 'block', mb: 0.75 }}>Platform:</Typography>
                      <Typography sx={{ fontSize: 17 }}>Instagram</Typography>
                    </Box>
                    <Box sx={{ mb: 2.5 }}>
                      <Typography sx={{ fontWeight: 600, display: 'block', mb: 0.75 }}>
                        <RequiredLabel>Jumlah Influencer yang Dibutuhkan</RequiredLabel>
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Button
                          onClick={() => setInfluencerCount(Math.max(1, influencer_count - 1))}
                          disabled={isReadOnly}
                          style={{ 
                            paddingTop: 1,
                            paddingBottom: 1,
                            paddingLeft: 2,
                            paddingRight: 2,
                            borderRadius: 2,
                            flex: '0 0 auto',
                            minWidth: 5,
                            height: 5,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <RemoveIcon fontSize="small" />
                        </Button>
                        <TextField
                          type="number"
                          min="1"
                          value={influencer_count}
                          onChange={(e) => setInfluencerCount(Math.max(1, parseInt(e.target.value) || 1))}
                          style={{ width: 70, padding: 1, borderRadius: 2, textAlign: 'center' }}
                          disabled={isReadOnly}
                        />
                        <Button
                          onClick={() => setInfluencerCount(influencer_count + 1)}
                          disabled={isReadOnly}
                          style={{ 
                            paddingTop: 1,
                            paddingBottom: 1,
                            paddingLeft: 2,
                            paddingRight: 2,
                            borderRadius: 2,
                            flex: '0 0 auto',
                            minWidth: 5,
                            height: 5,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <AddIcon fontSize="small" />
                        </Button>
                      </Box>
                    </Box>
                    {contentItems.map((item, index) => (
                      <Box key={item.id} sx={{ 
                        mb: 2.5,
                        p: 2,
                        border: '1px solid #e3e3e3',
                        borderRadius: 1,
                        background: '#fff'
                      }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                          <Typography component="h4" sx={{ m: 0, fontWeight: 600 }}>Konten {index + 1}</Typography>
                          {contentItems.length > 1 && !isReadOnly && (
                            <Button
                              onClick={() => removeContentItem(item.id)}
                              style={{ 
                                paddingTop: 0.5,
                                paddingBottom: 0.5,
                                paddingLeft: 1,
                                paddingRight: 1,
                                borderColor: '#dc3545',
                                color: '#dc3545',
                                borderRadius: 1,
                                height: 4.5,
                                minWidth: 10
                              }}
                            >
                              Remove
                            </Button>
                          )}
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
                          <Box sx={{ flex: '0 0 auto' }}>
                            <Typography sx={{ fontWeight: 600, display: 'block', mb: 0.75 }}>Jumlah Post</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Button
                                onClick={() => updateContentItem(item.id, 'post_count', Math.max(1, item.post_count - 1))}
                                disabled={isReadOnly}
                                style={{ 
                                  paddingTop: 1,
                                  paddingBottom: 1,
                                  paddingLeft: 2,
                                  paddingRight: 2,
                                  borderRadius: 2,
                                  flex: '0 0 auto',
                                  minWidth: 5,
                                  height: 5,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                <RemoveIcon fontSize="small" />
                              </Button>
                              <TextField
                                type="number"
                                min="1"
                                value={item.post_count}
                                onChange={(e) => updateContentItem(item.id, 'post_count', parseInt(e.target.value) || 1)}
                                style={{ width: 70, padding: 1, borderRadius: 2, textAlign: 'center' }}
                                disabled={isReadOnly}
                              />
                              <Button
                                onClick={() => updateContentItem(item.id, 'post_count', item.post_count + 1)}
                                disabled={isReadOnly}
                                style={{ 
                                  paddingTop: 1,
                                  paddingBottom: 1,
                                  paddingLeft: 2,
                                  paddingRight: 2,
                                  borderRadius: 2,
                                  flex: '0 0 auto',
                                  minWidth: 5,
                                  height: 5,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                <AddIcon fontSize="small" />
                              </Button>
                            </Box>
                          </Box>

                          <Box sx={{ flex: 1 }}>
                            <Typography sx={{ fontWeight: 600, display: 'block', mb: 0.75 }}>Jenis Konten</Typography>
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
                          </Box>
                        </Box>
                      </Box>
                    ))}

                    {!isReadOnly && (
                    <Box sx={{ mb: 2.5 }}>
                      <Button 
                        variant="outlined" 
                        onClick={addContentItem}
                        style={{ 
                          width: '100%',
                          paddingTop: 1.5,
                          paddingBottom: 1.5,
                          border: '1px dashed #ccc',
                          borderRadius: 2,
                          cursor: 'pointer',
                          color: '#666',
                          fontSize: 16
                        }}
                      >
                        + Add Konten
                      </Button>
                    </Box>
                    )}

                    <Box sx={{ mb: 2.5 }}>
                      <TextField
                        label={<RequiredLabel>Harga per Task</RequiredLabel>}
                        variant="outlined"
                        placeholder="Contoh: 50000"
                        value={formatCurrency(price_per_post)}
                        onChange={e => setPricePerPost(e.target.value)}
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        InputProps={{
                          startAdornment: <span style={{ marginRight: 1, color: '#666' }}>Rp</span>,
                        }}
                        // helperText="💰 Format otomatis: 50000 → Rp 50.000"
                        disabled={isReadOnly}
                      />
                    </Box>

                    <Box sx={{ mb: 2.5 }}>
                      <Typography sx={{ fontWeight: 600, display: 'block', mb: 0.75 }}>Estimasi Total Anggaran</Typography>
                      <Box sx={{ 
                        paddingTop: 1.5,
                        paddingBottom: 1.5,
                        paddingLeft: 2,
                        paddingRight: 2,
                        borderRadius: 2,
                        background: '#f8f9fa',
                        border: '1px solid #dee2e6',
                        fontSize: 17
                      }}>
                        Rp {estimatedBudget.toLocaleString()}
                      </Box>
                    </Box>

                  </form>
                  {/* Navigation Buttons */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2.5, mb: 2.5, pt: 2.5, borderTop: '1px solid #eee' }}>
                    <Button
                      onClick={handleBack}
                      variant="outlined"
                      size="large"
                      sx={{ 
                        borderRadius: 2,
                        fontWeight: 600,
                        pt: 1.5,
                        pb: 1.5,
                        pl: 4,
                        pr: 4
                      }}
                    >
                      ← Back
                    </Button>
                    <Button
                      onClick={handleNext}
                      variant="contained"
                      color="primary"
                      size="large"
                      sx={{ 
                        borderRadius: 2,
                        fontWeight: 600,
                        pt: 1.5,
                        pb: 1.5,
                        pl: 4,
                        pr: 4,
                        background: '#667eea',
                        border: 'none'
                      }}
                    >
                      Next →
                    </Button>
                  </Box>
                </Box>
              )}

              {/* Step 4: Brief Campaign */}
              {currentStep === 4 && (
                <Box sx={{ background: '#fff', borderRadius: 3, boxShadow: '0 2px 8px #e3e3e3', p: 4, mb: 3 }}>
                  <Typography component="h3" sx={{ m: 0, mb: 3, fontSize: 21, fontWeight: 600 }}>Brief Campaign</Typography>
                <form>
                  <Typography sx={{ color: '#666', mb: 2, fontSize: 14 }}>
                    💡 <strong>Tips:</strong> Berikan waktu lebih jika campaign memerlukan pengiriman barang ke influencer. Minimal 1 minggu antar tanggal.
                  </Typography>
                  <Box sx={{ mb: 2.25 }}>
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
                  </Box>
                  <Box sx={{ mb: 2.25 }}>
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
                  </Box>
                  <Box sx={{ mb: 2.25 }}>
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
                  </Box>
                  <Box sx={{ mb: 2.25 }}>
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
                  </Box>
                  <Box sx={{ mb: 2.25 }}>
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
                  </Box>
                  <Box sx={{ mb: 2.25 }}>
                    <Typography sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
                      Referensi Foto/Video (Opsional)
                    </Typography>
                    {/* Upload Button */}
                    <Box 
                      sx={{ 
                        border: '2px solid #667eea', 
                        borderRadius: 3, 
                        padding: 2,
                        textAlign: 'center',
                        background: '#fff',
                        cursor: 'pointer',
                        marginBottom: 2,
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
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                        <UploadFileIcon sx={{ color: '#667eea', fontSize: 24, mb: 0.5 }} />
                        <Typography sx={{ color: '#667eea', fontWeight: 600, fontSize: 15 }}>
                          Upload foto atau video
                        </Typography>
                      </Box>
                    </Box>
                    {/* File Previews Grid */}
                    {referenceFiles.length > 0 && (
                      <Box sx={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fill, minmax(19, 1fr))', 
                        gap: 1.5,
                        marginTop: 2
                      }}>
                        {referenceFiles.map((fileObj, index) => (
                          <Box 
                            key={index}
                            sx={{ 
                              position: 'relative',
                              border: '1px solid #e0e0e0',
                              borderRadius: 2,
                              padding: 1,
                              background: '#fff',
                              overflow: 'hidden'
                            }}
                          >
                            {/* Delete Button */}
                            <button
                              onClick={() => handleRemoveReferenceFile(index)}
                              style={{
                                position: 'absolute',
                                top: 1,
                                right: 1,
                                background: '#fff',
                                border: 'none',
                                borderRadius: '50%',
                                width: 3.5,
                                height: 3.5,
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
                                style={{ width: 1.75, height: 1.75 }} 
                              />
                            </button>
                            {/* Preview */}
                            {fileObj.preview ? (
                              <Box sx={{ 
                                width: '100%', 
                                height: 15, 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                background: '#f5f5f5',
                                borderRadius: 1,
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
                              </Box>
                            ) : (
                              <Box sx={{ 
                                width: '100%', 
                                height: 15, 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                background: '#f5f5f5',
                                borderRadius: 1
                              }}>
                                <Typography sx={{ fontSize: 24 }}>📄</Typography>
                              </Box>
                            )}
                            {/* File Name */}
                            <Typography sx={{ 
                              mt: 1, 
                              fontSize: 11, 
                              color: '#666',
                              textAlign: 'center',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}>
                              {fileObj.name}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Box>
                </form>
                {/* Navigation Buttons */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2.5, mb: 2.5, pt: 2.5, borderTop: '1px solid #eee' }}>
                  <Button
                    onClick={handleBack}
                    variant="outlined"
                    size="large"
                    sx={{ 
                      borderRadius: 2,
                      fontWeight: 600,
                      pt: 1.5,
                      pb: 1.5,
                      pl: 4,
                      pr: 4
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
                    sx={{ 
                      borderRadius: 2,
                      fontWeight: 600,
                      pt: 1.5,
                      pb: 1.5,
                      pl: 4,
                      pr: 4,
                      background: '#667eea',
                      border: 'none'
                    }}
                  >
                    Save Campaign
                  </Button>
                  )}
                </Box>
              </Box>
              )}
            </Paper>
          </Container>
        </Box>
      </Box>
    </Box>
  );
}

export default CampaignCreate;
