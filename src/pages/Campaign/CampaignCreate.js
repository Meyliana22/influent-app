import UploadFileIcon from '@mui/icons-material/UploadFile';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
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
  const [selectedAge, setSelectedAge] = useState([]);
  
  const [title, setTitle] = useState('');

  // Helper component used for required labels in forms
  const RequiredLabel = ({ children }) => (
    <Typography component="span" sx={{ display: 'inline-flex', alignItems: 'center', fontWeight: 600 }}>
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

  // Helper function untuk get current date in Jakarta timezone
  const getTodayJakarta = () => {
    const now = new Date();
    // Convert to Jakarta timezone (UTC+7)
    const jakartaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
    return jakartaTime.toISOString().split('T')[0];
  };

  // Helper function untuk menghitung minimum date
  const getMinDate = (daysFromNow) => {
    const today = getTodayJakarta();
    const date = new Date(today);
    date.setDate(date.getDate() + daysFromNow);
    return date.toISOString().split('T')[0];
  };

  // Helper function untuk add days ke tanggal tertentu
  const addDaysToDate = (dateString, days) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  };

  // Helper function untuk add working days (exclude weekends)
  const addWorkingDays = (dateString, workingDays) => {
    if (!dateString) return '';
    let date = new Date(dateString);
    let daysAdded = 0;
    
    while (daysAdded < workingDays) {
      date.setDate(date.getDate() + 1);
      const dayOfWeek = date.getDay();
      // Skip weekends (0 = Sunday, 6 = Saturday)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        daysAdded++;
      }
    }
    
    return date.toISOString().split('T')[0];
  };

  // Special function for start posting date: adds working days + 1 buffer day
  // Used to ensure UMKM has full working days for review before posting starts
  const addWorkingDaysWithBuffer = (dateString, workingDays) => {
    if (!dateString) return '';
    let date = new Date(dateString);
    let daysAdded = 0;
    
    // Count working days
    while (daysAdded < workingDays) {
      date.setDate(date.getDate() + 1);
      const dayOfWeek = date.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        daysAdded++;
      }
    }
    
    // Add 1 more day buffer
    date.setDate(date.getDate() + 1);
    
    return date.toISOString().split('T')[0];
  };

  // Calculate total revision days based on max_revisions and revision_duration
  const calculateTotalRevisionDays = () => {
    if (!enable_revision || !revision_duration || !max_revisions) return 0;
    const daysPerRevision = parseInt(revision_duration) || 0;
    const totalRevisions = parseInt(max_revisions) || 0;
    return daysPerRevision * totalRevisions;
  };

  // Calculate minimum dates based on dependencies
  const getMinRegistrationDeadline = () => {
    // Minimum 2 working days buffer - admin needs time to review
    // Example: Sat Dec 14 → Mon 16 (day 1, disabled) + Tue 17 (day 2, disabled) → can select from Wed 18
    const today = getTodayJakarta();
    const todayDate = new Date(today);
    const dayOfWeek = todayDate.getDay();
    
    let startDate = today;
    // If today is Saturday (6), move to Monday
    if (dayOfWeek === 6) {
      startDate = addDaysToDate(today, 2); // Saturday + 2 = Monday
    } else if (dayOfWeek === 0) {
      // If today is Sunday (0), move to Monday
      startDate = addDaysToDate(today, 1); // Sunday + 1 = Monday
    }
    
    // Add 2 working days from Monday → Wednesday (Mon 16 + Tue 17 = 2 days, so Wed 18 selectable)
    return addWorkingDays(startDate, 2);
  };
  const getMinSubmissionDeadline = () => {
    // 2 working days AFTER registration deadline: 1 hari UMKM select + 1 hari student konfirmasi
    // Example: Reg deadline Wed 10 → Thu 11 (select) + Fri 12 (confirm) + skip weekend → Mon 15
    if (!registration_deadline) return addWorkingDays(getTodayJakarta(), 4);
    const dayAfterRegistration = addDaysToDate(registration_deadline, 1);
    return addWorkingDays(dayAfterRegistration, 2);
  };
  const getMinStartDate = () => {
    if (!enable_revision) {
      // If revision inactive, need 2 working days for UMKM review + 1 buffer day
      // Deadline 22 → review 23-24 → can post from 25
      return submission_deadline ? addWorkingDaysWithBuffer(submission_deadline, 2) : getMinDate(4);
    }
    // If revision active, must be after total revision period + 2 review days + 1 buffer
    if (submission_deadline && revision_duration && max_revisions) {
      const totalRevisionDays = calculateTotalRevisionDays();
      // Add 2 working days for review + 1 buffer day
      return addWorkingDaysWithBuffer(submission_deadline, totalRevisionDays + 2);
    }
    return getMinDate(4);
  };
  const getMinEndDate = () => {
    return start_date ? addWorkingDays(start_date, 1) : getMinDate(5);
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
  
  // Brief Campaign state - Updated with 5 new fields
  const [registration_deadline, setRegistrationDeadline] = useState('');
  const [submission_deadline, setSubmissionDeadline] = useState('');
  const [revision_duration, setRevisionDuration] = useState('');
  const [max_revisions, setMaxRevisions] = useState(1);
  const [enable_revision, setEnableRevision] = useState(true);
  const [start_date, setStartDate] = useState('');
  const [end_date, setEndDate] = useState('');
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
  const [criteriaDesc, setCriteriaDesc] = useState(''); // Field "Lainnya.." untuk kriteria tambahan
  const [isFree, setIsFree] = useState(false); // Toggle untuk campaign tidak berbayar (gratis)
  
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
    if (!category || category.length === 0) errors.push('Kategori Akun UMKM');
    if (!min_followers) errors.push('Jumlah Minimum Followers');
    if (!selectedGender) errors.push('Target Gender');
    if (!selectedAge || selectedAge.length === 0) errors.push('Target Usia');
    
    if (errors.length > 0) {
      showToast(`Field wajib belum diisi: ${errors.join(', ')}`, 'error');
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    const errors = [];
    if (!influencer_count || influencer_count < 1) errors.push('Jumlah Mahasiswa');
    
    // Only validate price if campaign is not free (hasProduct = false means campaign is paid)
    if (!hasProduct && !price_per_post) {
      errors.push('Total Bayaran per Mahasiswa');
    }
    
    if (errors.length > 0) {
      showToast(`Field wajib belum diisi: ${errors.join(', ')}`, 'error');
      return false;
    }
    return true;
  };

  const validateStep4 = () => {
    const errors = [];
    if (!registration_deadline) errors.push('Deadline Registrasi Campaign');
    if (!submission_deadline) errors.push('Deadline Submit Konten');
    
    // Validate revision fields only if revision is enabled
    if (enable_revision) {
      if (!revision_duration) errors.push('Durasi Revisi');
      if (!max_revisions) errors.push('Maksimal Revisi');
    }
    
    if (!start_date) errors.push('Tanggal Mulai Posting');
    if (!end_date) errors.push('Tanggal Selesai Posting');
    
    // Remove 1 week validation - dates are controlled by minimum date constraints
    
    if (errors.length > 0) {
      showToast(`Masih ada field wajib yang belum diisi atau validasi yang belum terpenuhi: ${errors.join(', ')}`, 'error');
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
          // Set read-only mode if campaign is not draft
          if (data.status !== 'draft') {
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
          // Parse product_value - backend returns as DECIMAL (e.g., "28000.00")
          // Convert to integer by removing decimal part
          setProductValue(data.product_value ? Math.floor(parseFloat(data.product_value)).toString() : '');
          setProductDesc(data.product_desc || '');
          
          // Helper function to convert ISO date to YYYY-MM-DD
          const formatDateForInput = (isoDate) => {
            if (!isoDate) return '';
            try {
              return isoDate.split('T')[0]; // Extract YYYY-MM-DD from ISO format
            } catch (e) {
              return '';
            }
          };
          
          // Date fields
          setRegistrationDeadline(formatDateForInput(data.registration_deadline));
          setSubmissionDeadline(formatDateForInput(data.submission_deadline));
          setStartDate(formatDateForInput(data.start_date));
          setEndDate(formatDateForInput(data.end_date));
          
          setRevisionDuration(data.revision_duration ? data.revision_duration.toString() : '');
          setMaxRevisions(data.max_revisions || 1);
          setEnableRevision(data.enable_revision !== undefined ? data.enable_revision : true);
          
          // Guidelines
          setPhotoRules(data.content_guidelines || '');
          setCaptionRules(data.caption_guidelines || '');
          setContentReference(data.content_reference || '');
          
          // Budget & criteria
          setInfluencerCount(data.influencer_count || 1);
          // Parse numeric values - backend may return as DECIMAL with .00
          // Convert to integer by removing decimal part
          setPricePerPost(data.price_per_post ? Math.floor(parseFloat(data.price_per_post)).toString() : '');
          setMinFollowers(data.min_followers ? Math.floor(parseFloat(data.min_followers)).toString() : '');
          setIsFree(data.is_free || false);
          
          // Demographics
          setSelectedGender(data.selected_gender || '');
          // Parse selected_age - could be string or array
          if (data.selected_age) {
            if (Array.isArray(data.selected_age)) {
              setSelectedAge(data.selected_age);
            } else if (typeof data.selected_age === 'string') {
              try {
                const parsed = JSON.parse(data.selected_age);
                setSelectedAge(Array.isArray(parsed) ? parsed : [data.selected_age]);
              } catch {
                setSelectedAge([data.selected_age]);
              }
            }
          } else {
            setSelectedAge([]);
          }
          setCriteriaDesc(data.criteria_desc || '');
          
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
  
  // Total budget including admin fee (Rp 5.000)
  const ADMIN_FEE = 5000;
  const totalBudgetWithAdminFee = estimatedBudget + ADMIN_FEE;
  
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
    'Gaming',
    'Gaya Hidup & Travel',
    'Hiburan',
    'Kecantikan & Fashion',
    'Keluarga & Parenting',
    'Kesehatan & Olahraga',
    'Makanan & Minuman',
    'Teknologi'
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
  const kriteriaFilled = category && category.length > 0 && min_followers && selectedGender && selectedAge && selectedAge.length > 0;

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
      productName: hasProduct ? productName : null,
      productValue: hasProduct && productValue ? parseCurrency(productValue) : null,
      productDesc: productDesc || null,
      start_date,
      end_date,
      registration_deadline,
      submission_deadline,
      revision_duration: revision_duration ? parseInt(revision_duration) : null,
      max_revisions: max_revisions ? parseInt(max_revisions) : 1,
      enable_revision,
      content_guidelines,
      caption_guidelines,
      contentReference,
      referenceFiles: referenceFiles.map(rf => rf.name),
      influencer_count,
      price_per_post: price_per_post ? parseCurrency(price_per_post) : null,
      min_followers: min_followers ? parseCurrency(min_followers) : null,
      isFree,
      selectedGender,
      selectedAge,
      criteriaDesc,
      contentItems,
      status: 'draft', // Save as draft
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
      
      setTimeout(() => navigate('/campaigns'), 800);
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
      productName: hasProduct ? productName : null,
      productValue: hasProduct && productValue ? parseCurrency(productValue) : null,
      productDesc,
      start_date,
      end_date,
      registration_deadline,
      submission_deadline,
      revision_duration: parseInt(revision_duration),
      max_revisions: parseInt(max_revisions),
      enable_revision,
      content_guidelines,
      caption_guidelines,
      contentReference,
      referenceFiles: referenceFiles.map(rf => rf.name),
      influencer_count,
      price_per_post: parseCurrency(price_per_post),
      min_followers: parseCurrency(min_followers),
      isFree,
      selectedGender,
      selectedAge,
      criteriaDesc,
      contentItems: contentItems.map(item => ({
        id: item.id,
        post_count: item.post_count,
        content_type: item.content_type
      })),
      status: 'admin_review', // Submit to admin for review
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
        showToast('Campaign submitted for admin review!', 'success');
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
        showToast('Campaign submitted for admin review!', 'success');
      }
      
      // Redirect to campaigns list
      setTimeout(() => navigate('/campaigns'), 1500);
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
                  onClick={async () => {
                    if (isReadOnly) {
                      navigate('/campaigns');
                    } else {
                      // Save as draft when navigating back during create/edit
                      await handleSaveAsDraft();
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

              {/* Cancellation Reason Alert */}
              {isEditMode && originalData?.status === 'cancelled' && originalData?.cancellation_reason && (
                <Box sx={{ 
                  p: 3, 
                  mb: 3, 
                  background: '#fee2e2', 
                  border: '2px solid #ef4444',
                  borderRadius: 2
                }}>
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <Box sx={{ fontSize: '32px', lineHeight: 1, mt: -0.5 }}>⚠️</Box>
                    <Box flex={1}>
                      <Typography variant="h6" fontWeight={700} color="#dc2626" mb={1}>
                        Campaign Dibatalkan oleh Admin
                      </Typography>
                      <Typography fontSize={15} color="#7f1d1d" lineHeight={1.6}>
                        <strong>Alasan:</strong> {originalData.cancellation_reason}
                      </Typography>
                      <Typography fontSize={14} color="#991b1b" mt={2} fontStyle="italic">
                        💡 Anda dapat membuat campaign baru dengan memperbaiki masalah di atas.
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              )}

              {/* Pending Review Info */}
              {isEditMode && originalData?.status === 'pending_review' && (
                <Box sx={{ 
                  p: 3, 
                  mb: 3, 
                  background: '#fff3cd', 
                  border: '2px solid #ffc107',
                  borderRadius: 2
                }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box sx={{ fontSize: '28px' }}>⏳</Box>
                    <Box flex={1}>
                      <Typography variant="h6" fontWeight={700} color="#856404" mb={0.5}>
                        Campaign Dalam Review
                      </Typography>
                      <Typography fontSize={15} color="#856404">
                        Campaign Anda sedang ditinjau oleh tim admin. Mohon tunggu konfirmasi.
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              )}

              {/* Pending Payment Success */}
              {isEditMode && originalData?.status === 'pending_payment' && (
                <Box sx={{ 
                  p: 3, 
                  mb: 3, 
                  background: '#d1fae5', 
                  border: '2px solid #10b981',
                  borderRadius: 2
                }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box sx={{ fontSize: '28px' }}>✅</Box>
                    <Box flex={1}>
                      <Typography variant="h6" fontWeight={700} color="#065f46" mb={0.5}>
                        Campaign Disetujui!
                      </Typography>
                      <Typography fontSize={15} color="#065f46">
                        Selamat! Campaign Anda telah disetujui. Silakan lakukan pembayaran untuk mengaktifkan campaign.
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              )}

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
                        placeholder={"Launching Menu Baru: Nasi Mentai Edition"}
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
                            onChange={(e) => {
                              setHasProduct(e.target.checked);
                            }}
                            color="primary"
                            disabled={isReadOnly}
                          />
                        }
                        label="Campaign ini memiliki produk yang dipromosikan"
                      />
                    </Box>
                    {hasProduct && (
                      <>
                        <Box sx={{ mb: 2.5, pl: 4 }}>
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
                        <Box sx={{ mb: 2.5, pl: 4 }}>
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
                        InputLabelProps={{ shrink: true }}
                        disabled={isReadOnly}
                      />
                    </Box>
                  </form>
                  {/* Navigation Buttons - Step 1: No Back button, only Next */}
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2.5, mb: 2.5, pt: 2.5, borderTop: '1px solid #eee' }}>
                    <Button
                      onClick={handleNext}
                      variant="contained"
                      color="primary"
                      size="large"
                      disabled={!allFilled}
                      sx={{ 
                        borderRadius: 2,
                        fontWeight: 600,
                        pt: 1.5,
                        pb: 1.5,
                        pl: 4,
                        pr: 4,
                        background: allFilled ? '#667eea' : '#cbd5e0',
                        border: 'none',
                        color: allFilled ? '#fff' : '#a0aec0',
                        '&:hover': {
                          background: allFilled ? '#5568d3' : '#cbd5e0'
                        }
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
                            label={<RequiredLabel>Kategori Akun Influencer</RequiredLabel>}
                            placeholder="Pilih kategori akun Influencer"
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
                        <FormControlLabel value="all" control={<Radio disabled={isReadOnly} />} label="Semua Gender" />
                        <FormControlLabel value="male" control={<Radio disabled={isReadOnly} />} label="Laki-Laki" />
                        <FormControlLabel value="female" control={<Radio disabled={isReadOnly} />} label="Perempuan" />
                      </RadioGroup>
                    </Box>
                    <Box sx={{ mb: 2.5 }}>
                      <Autocomplete
                        multiple
                        options={['< 18 tahun', '18-24 tahun', '25-34 tahun', '35-49 tahun', '> 50 tahun']}
                        value={selectedAge}
                        onChange={(event, newValue) => setSelectedAge(newValue)}
                        disabled={isReadOnly}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            variant="outlined"
                            label={<RequiredLabel>Target Usia</RequiredLabel>}
                            placeholder="Pilih rentang usia"
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
                    <Box sx={{ mb: 2.25 }}>
                      <TextField
                        label="Lainnya (Opsional)"
                        placeholder="Tambahkan kriteria lainnya jika ada"
                        variant="outlined"
                        fullWidth
                        multiline
                        rows={2}
                        value={criteriaDesc}
                        onChange={(e) => setCriteriaDesc(e.target.value)}
                        InputLabelProps={{ shrink: true }}
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
                      disabled={!kriteriaFilled}
                      sx={{ 
                        borderRadius: 2,
                        fontWeight: 600,
                        pt: 1.5,
                        pb: 1.5,
                        pl: 4,
                        pr: 4,
                        background: kriteriaFilled ? '#667eea' : '#cbd5e0',
                        border: 'none',
                        color: kriteriaFilled ? '#fff' : '#a0aec0',
                        '&:hover': {
                          background: kriteriaFilled ? '#5568d3' : '#cbd5e0'
                        }
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
                        <RequiredLabel sx={{ fontWeight: 600 }}>Jumlah Mahasiswa yang Dibutuhkan</RequiredLabel>
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Button
                          variant="outlined"
                          onClick={() => setInfluencerCount(Math.max(1, influencer_count - 1))}
                          disabled={isReadOnly}
                          sx={{ 
                            minWidth: '40px',
                            width: '40px',
                            height: '40px',
                            p: 0,
                            borderColor: '#d1d5db',
                            '&:hover': {
                              borderColor: '#667eea',
                              bgcolor: '#f5f7ff'
                            }
                          }}
                        >
                          <RemoveIcon fontSize="small" />
                        </Button>
                        <TextField
                          type="number"
                          min="1"
                          value={influencer_count}
                          onChange={(e) => setInfluencerCount(Math.max(1, parseInt(e.target.value) || 1))}
                          disabled={isReadOnly}
                          sx={{ 
                            width: '120px',
                            '& input': { 
                              textAlign: 'center',
                              fontWeight: 600,
                              fontSize: '16px'
                            }
                          }}
                        />
                        <Button
                          variant="outlined"
                          onClick={() => setInfluencerCount(influencer_count + 1)}
                          disabled={isReadOnly}
                          sx={{ 
                            minWidth: '40px',
                            width: '40px',
                            height: '40px',
                            p: 0,
                            borderColor: '#d1d5db',
                            '&:hover': {
                              borderColor: '#667eea',
                              bgcolor: '#f5f7ff'
                            }
                          }}
                        >
                          <AddIcon fontSize="small" />
                        </Button>
                      </Box>
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 600, mb: 1, fontSize: '16px' }}>
                        <RequiredLabel>Detail Konten yang Dibutuhkan</RequiredLabel>
                      </Typography>
                      <Typography sx={{ fontSize: '13px', color: '#666', mb: 2 }}>
                        Tentukan jenis dan jumlah konten yang harus dibuat oleh setiap mahasiswa
                      </Typography>
                      {contentItems.map((item, index) => (
                        <Box key={item.id} sx={{ 
                          mb: 2,
                          p: 2.5,
                          border: '1px solid #e8eaf6',
                          borderRadius: 2,
                          // background: '#fafbff',
                          position: 'relative'
                        }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Grid container spacing={2}>
                              <Grid item xs={12} sm={4}>
                                <Typography sx={{ fontWeight: 600, display: 'block', mb: 1, fontSize: '14px' }}>
                                  Jumlah Post
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Button
                                    variant="outlined"
                                    onClick={() => updateContentItem(item.id, 'post_count', Math.max(1, item.post_count - 1))}
                                    disabled={isReadOnly}
                                    sx={{ 
                                      minWidth: '40px',
                                      width: '40px',
                                      height: '40px',
                                      p: 0,
                                      borderColor: '#d1d5db',
                                      '&:hover': {
                                        borderColor: '#667eea',
                                        bgcolor: '#f5f7ff'
                                      }
                                    }}
                                  >
                                    <RemoveIcon fontSize="small" />
                                  </Button>
                                  <TextField
                                    type="number"
                                    min="1"
                                    value={item.post_count}
                                    onChange={(e) => updateContentItem(item.id, 'post_count', Math.max(1, parseInt(e.target.value) || 1))}
                                    disabled={isReadOnly}
                                    sx={{ 
                                      width: '80px',
                                      '& input': { 
                                        textAlign: 'center',
                                        fontWeight: 600,
                                        fontSize: '16px'
                                      }
                                    }}
                                  />
                                  <Button
                                    variant="outlined"
                                    onClick={() => updateContentItem(item.id, 'post_count', item.post_count + 1)}
                                    disabled={isReadOnly}
                                    sx={{ 
                                      minWidth: '40px',
                                      width: '40px',
                                      height: '40px',
                                      p: 0,
                                      borderColor: '#d1d5db',
                                      '&:hover': {
                                        borderColor: '#667eea',
                                        bgcolor: '#f5f7ff'
                                      }
                                    }}
                                  >
                                    <AddIcon fontSize="small" />
                                  </Button>
                                </Box>
                              </Grid>

                              <Grid item xs={12} sm={8}>
                                <FormControl fullWidth variant="outlined" disabled={isReadOnly}>
                                  <Typography sx={{ fontWeight: 600, display: 'block', mb: 1, fontSize: '14px' }}>
                                    Jenis Konten
                                  </Typography>
                                  <Select
                                    value={item.content_type}
                                    onChange={(e) => updateContentItem(item.id, 'content_type', e.target.value)}
                                    label="Jenis Konten"
                                    disabled={isReadOnly}
                                  >
                                    <MenuItem value="foto">Instagram Foto</MenuItem>
                                    <MenuItem value="reels">Instagram Reels</MenuItem>
                                    <MenuItem value="story">Instagram Story</MenuItem>
                                    <MenuItem value="video">Instagram Video</MenuItem>
                                  </Select>
                                </FormControl>
                              </Grid>
                            </Grid>

                            {contentItems.length > 1 && !isReadOnly && (
                              <Button
                                variant="outlined"
                                onClick={() => removeContentItem(item.id)}
                                sx={{ 
                                  py: 0.5,
                                  px: 1.5,
                                  borderColor: '#dc3545',
                                  color: '#dc3545',
                                  fontSize: '13px',
                                  '&:hover': {
                                    borderColor: '#bd2130',
                                    bgcolor: '#fff5f5'
                                  }
                                }}
                              >
                                Hapus
                              </Button>
                            )}
                          </Box>

                        </Box>
                      ))}

                      {!isReadOnly && (
                      <Box sx={{ mb: 2.5 }}>
                        <Button 
                          variant="outlined" 
                          onClick={addContentItem}
                          disabled={contentItems.length >= 4}
                          style={{ 
                            width: '100%',
                            paddingTop: 1.5,
                            paddingBottom: 1.5,
                            border: contentItems.length >= 4 ? '1px dashed #ccc' : '1px dashed #667eea',
                            borderRadius: 2,
                            cursor: contentItems.length >= 4 ? 'not-allowed' : 'pointer',
                            color: contentItems.length >= 4 ? '#ccc' : '#667eea',
                            fontSize: 16,
                            opacity: contentItems.length >= 4 ? 0.5 : 1
                          }}
                        >
                          + Tambah Konten Lain {contentItems.length >= 4 ? '(Maksimal 4)' : ''}
                        </Button>
                      </Box>
                      )}
                    </Box>

                    {/* Toggle untuk campaign tidak berbayar */}
                    <Box sx={{ mb: 2.5, mt: 2 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={isFree}
                            onChange={(e) => setIsFree(e.target.checked)}
                            color="primary"
                            disabled={isReadOnly}
                          />
                        }
                        label="Campaign ini tidak berbayar (gratis)"
                      />
                      <Typography sx={{ fontSize: '12px', color: '#666', ml: 4, mt: 0.5 }}>
                        Centang opsi ini jika mahasiswa tidak menerima bayaran uang dari campaign ini.
                      </Typography>
                    </Box>

                    {!isFree && (
                      <>
                        <Box sx={{ mb: 2.5, mt: 3, pl: 4 }}>
                          <TextField
                            label={<RequiredLabel>Total Bayaran per Mahasiswa</RequiredLabel>}
                            variant="outlined"
                            placeholder="Contoh: 50000"
                            value={formatCurrency(price_per_post)}
                            onChange={e => setPricePerPost(e.target.value)}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            InputProps={{
                              startAdornment: <span style={{ marginRight: 8, color: '#666', fontWeight: 600 }}>Rp</span>,
                            }}
                            helperText="Total bayaran yang diterima mahasiswa setelah menyelesaikan semua konten."
                            disabled={isReadOnly}
                          />
                        </Box>

                        <Box sx={{ mb: 2.5, pl: 4 }}>
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
                          <Typography sx={{ fontSize: '12px', color: '#666', mt: 1, fontStyle: 'italic' }}>
                            Dihitung dari: {influencer_count} influencer × Rp {parseInt(parseCurrency(price_per_post) || 0).toLocaleString('id-ID')}
                          </Typography>
                        </Box>
                      </>
                    )}

                    {/* Info biaya admin */}
                    <Box sx={{ 
                      mb: 2.5, 
                      p: 2, 
                      borderRadius: 2, 
                      bgcolor: '#f0f4ff',
                      border: '1px solid #d1d9ff',
                      display: 'flex',
                      gap: 1.5
                    }}>
                      <InfoOutlinedIcon sx={{ color: '#667eea', fontSize: '20px', mt: 0.2 }} />
                      <Box>
                        <Typography sx={{ fontSize: '13px', color: '#667eea', fontWeight: 600, mb: 0.5 }}>
                          Informasi Biaya
                        </Typography>
                        <Typography sx={{ fontSize: '12px', color: '#666' }}>
                          {isFree 
                            ? 'Campaign akan dikenakan biaya admin sebesar Rp 5.000'
                            : `Total yang harus dibayar: Rp ${totalBudgetWithAdminFee.toLocaleString('id-ID')} (termasuk biaya admin Rp 5.000)`
                          }
                        </Typography>
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
                      disabled={!kontenFilled}
                      sx={{ 
                        borderRadius: 2,
                        fontWeight: 600,
                        pt: 1.5,
                        pb: 1.5,
                        pl: 4,
                        pr: 4,
                        background: kontenFilled ? '#667eea' : '#cbd5e0',
                        border: 'none',
                        color: kontenFilled ? '#fff' : '#a0aec0',
                        '&:hover': {
                          background: kontenFilled ? '#5568d3' : '#cbd5e0'
                        }
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
                  <Typography sx={{ color: '#666', mb: 3, fontSize: 14, gap: 1 }}>
                    <strong>Tips: </strong> Beri jeda waktu yang cukup di setiap tahap campaign. Sistem otomatis menentukan tanggal paling awal berdasarkan urutan proses.
                  </Typography>

                  {/* 1. Deadline Registrasi Campaign */}
                  <Box sx={{ mb: 2.5 }}>
                    <TextField
                      label={<RequiredLabel>Deadline Registrasi Campaign</RequiredLabel>}
                      type="date"
                      value={registration_deadline}
                      onChange={e => setRegistrationDeadline(e.target.value)}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ min: getMinRegistrationDeadline() }}
                      variant="outlined"
                      helperText="Minimal 2 hari kerja dari hari ini untuk admin meninjau campaign dan UMKM menyelesaikan pembayaran."
                      disabled={isReadOnly}
                    />
                  </Box>

                  {/* 2. Deadline Submit Konten */}
                  <Box sx={{ mb: 2.5 }}>
                    <TextField
                      label={<RequiredLabel>Deadline Submit Konten</RequiredLabel>}
                      type="date"
                      value={submission_deadline}
                      onChange={e => setSubmissionDeadline(e.target.value)}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ min: getMinSubmissionDeadline() }}
                      variant="outlined"
                      helperText={registration_deadline 
                        ? `Minimal 2 hari kerja setelah tanggal deadline registrasi untuk UMKM memilih student & student melakukan konfirmasi.`
                        : "Pilih deadline registrasi terlebih dahulu"
                      }
                      disabled={isReadOnly || !registration_deadline}
                    />
                  </Box>

                  {/* 3. Revision Settings */}
                  <Box sx={{ mb: 2.5, borderRadius: 2 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={enable_revision}
                          onChange={(e) => {
                            setEnableRevision(e.target.checked);
                            if (!e.target.checked) {
                              setRevisionDuration('');
                              setMaxRevisions(0);
                            }
                          }}
                          color="primary"
                          disabled={isReadOnly}
                        />
                      }
                      label={<Typography sx={{ fontWeight: 600 }}>Aktifkan Periode Revisi Konten</Typography>}
                    />
                    
                    {enable_revision && (
                      <Box sx={{ mt: 2, pl: 4 }}>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <Typography sx={{ fontWeight: 600, display: 'block', mb: 0.75, fontSize: '14px' }}>
                              <RequiredLabel>Maksimal Revisi</RequiredLabel>
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <Button
                                variant="outlined"
                                onClick={() => setMaxRevisions(Math.max(1, max_revisions - 1))}
                                disabled={isReadOnly}
                                sx={{ 
                                  minWidth: '40px',
                                  width: '40px',
                                  height: '40px',
                                  p: 0,
                                  borderColor: '#d1d5db',
                                  '&:hover': {
                                    borderColor: '#667eea',
                                    bgcolor: '#f5f7ff'
                                  }
                                }}
                              >
                                <RemoveIcon fontSize="small" />
                              </Button>
                              <TextField
                                type="number"
                                min="1"
                                max="5"
                                value={max_revisions}
                                onChange={(e) => setMaxRevisions(Math.min(5, Math.max(1, parseInt(e.target.value) || 1)))}
                                disabled={isReadOnly}
                                sx={{ 
                                  width: '80px',
                                  '& input': { 
                                    textAlign: 'center',
                                    fontWeight: 600,
                                    fontSize: '16px'
                                  }
                                }}
                              />
                              <Button
                                variant="outlined"
                                onClick={() => setMaxRevisions(Math.min(5, max_revisions + 1))}
                                disabled={isReadOnly}
                                sx={{ 
                                  minWidth: '40px',
                                  width: '40px',
                                  height: '40px',
                                  p: 0,
                                  borderColor: '#d1d5db',
                                  '&:hover': {
                                    borderColor: '#667eea',
                                    bgcolor: '#f5f7ff'
                                  }
                                }}
                              >
                                <AddIcon fontSize="small" />
                              </Button>
                            </Box>
                            <Typography sx={{ fontSize: '12px', color: '#666', ml: 0.5 }}>
                              Banyaknya revisi yang diizinkan (1–5 kali)
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography sx={{ fontWeight: 600, display: 'block', mb: 0.75, fontSize: '14px' }}>
                              <RequiredLabel>Durasi Revisi (Hari)</RequiredLabel>
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <Button
                                variant="outlined"
                                onClick={() => setRevisionDuration(Math.max(1, parseInt(revision_duration || 1) - 1).toString())}
                                disabled={isReadOnly}
                                sx={{ 
                                  minWidth: '40px',
                                  width: '40px',
                                  height: '40px',
                                  p: 0,
                                  borderColor: '#d1d5db',
                                  '&:hover': {
                                    borderColor: '#667eea',
                                    bgcolor: '#f5f7ff'
                                  }
                                }}
                              >
                                <RemoveIcon fontSize="small" />
                              </Button>
                              <TextField
                                type="number"
                                min="1"
                                max="30"
                                value={revision_duration}
                                onChange={(e) => setRevisionDuration(Math.min(30, Math.max(1, parseInt(e.target.value) || 1)).toString())}
                                disabled={isReadOnly}
                                sx={{ 
                                  width: '80px',
                                  '& input': { 
                                    textAlign: 'center',
                                    fontWeight: 600,
                                    fontSize: '16px'
                                  }
                                }}
                              />
                              <Button
                                variant="outlined"
                                onClick={() => setRevisionDuration(Math.min(30, parseInt(revision_duration || 1) + 1).toString())}
                                disabled={isReadOnly}
                                sx={{ 
                                  minWidth: '40px',
                                  width: '40px',
                                  height: '40px',
                                  p: 0,
                                  borderColor: '#d1d5db',
                                  '&:hover': {
                                    borderColor: '#667eea',
                                    bgcolor: '#f5f7ff'
                                  }
                                }}
                              >
                                <AddIcon fontSize="small" />
                              </Button>
                            </Box>
                            <Typography sx={{ fontSize: '12px', color: '#666', ml: 0.5 }}>
                              Lama waktu untuk 1 kali revisi (hari kerja)
                            </Typography>
                          </Grid>
                        </Grid>
                      </Box>
                    )}
                  </Box>

                  {/* 4. Start Posting */}
                  <Box sx={{ mb: 2.5 }}>
                    <TextField
                      label={<RequiredLabel>Tanggal Mulai Posting</RequiredLabel>}
                      type="date"
                      value={start_date}
                      onChange={e => setStartDate(e.target.value)}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ min: getMinStartDate() }}
                      variant="outlined"
                      helperText={
                        enable_revision && submission_deadline && revision_duration && max_revisions
                          ? `Minimal 2 hari kerja setelah semua revisi selesai untuk UMKM konfirmasi konten. Sabtu-Minggu tidak termasuk hari kerja.`
                          : !enable_revision && submission_deadline
                          ? `Minimal 2 hari kerja setelah deadline submit untuk UMKM konfirmasi konten. Sabtu-Minggu tidak termasuk hari kerja.`
                          : "Tentukan deadline submit konten dan pengaturan revisi terlebih dahulu"
                      }
                      disabled={isReadOnly || !submission_deadline || (enable_revision && (!revision_duration || !max_revisions))}
                    />
                  </Box>

                  {/* 5. End Posting */}
                  <Box sx={{ mb: 2.5 }}>
                    <TextField
                      label={<RequiredLabel>Tanggal Selesai Posting</RequiredLabel>}
                      type="date"
                      value={end_date}
                      onChange={e => setEndDate(e.target.value)}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ min: getMinEndDate() }}
                      variant="outlined"
                      helperText={start_date 
                        ? `Minimal 1 hari kerja setelah mulai posting`
                        : "Pilih tanggal mulai posting terlebih dahulu"
                      }
                      disabled={isReadOnly || !start_date}
                    />
                  </Box>

                  {/* Aturan Konten */}
                  <Box sx={{ mb: 2.25 }}>
                    <TextField
                      label="Aturan Foto/Video (Opsional)"
                      variant="outlined"
                      placeholder="Contoh: wajib ada selfie, lighting yang baik, background minimalis"
                      value={content_guidelines}
                      onChange={e => setPhotoRules(e.target.value)}
                      fullWidth
                      multiline
                      rows={2}
                      InputLabelProps={{ shrink: true }}
                      disabled={isReadOnly}
                    />
                  </Box>
                  <Box sx={{ mb: 2.25 }}>
                    <TextField
                      label="Aturan Caption (Opsional)"
                      variant="outlined"
                      placeholder="Contoh: wajib mencantumkan #hashtagbrand, tag akun @namabrand, minimal 50 kata"
                      value={caption_guidelines}
                      onChange={e => setCaptionRules(e.target.value)}
                      fullWidth
                      multiline
                      rows={2}
                      InputLabelProps={{ shrink: true }}
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
