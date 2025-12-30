import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Paper, 
  Typography, 
  Stepper, 
  Step, 
  StepLabel, 
  Button, 
  Grid, 
  TextField, 
  MenuItem, 
  Select, 
  FormControl, 
  InputLabel, 
  Checkbox, 
  FormControlLabel, 
  RadioGroup, 
  Radio, 
  Slider,
  Chip,
  Stack,
  Autocomplete,
  InputAdornment,
  IconButton,
  Card,
  
  CardContent,
  useTheme,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText
} from '@mui/material';
import { Sidebar, Topbar, Modal } from '../../components/common';
import { useToast } from '../../hooks/useToast';
import * as campaignService from '../../services/campaignService';
import { 
  CameraAlt as CameraIcon, 
  CloudUpload as CloudUploadIcon, 
  Delete as DeleteIcon, 
  Add as AddIcon, 
  Remove as RemoveIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Save as SaveIcon,
  Info as InfoIcon,
  People as PeopleIcon,
  CalendarToday as CalendarIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { FaInstagram, FaQuestionCircle } from 'react-icons/fa';

// Steps configuration
const STEPS = [
  'Detail Campaign',
  'Kriteria Audience',
  'Konten & Budget',
  'Timeline & Brief'
];

function CampaignCreate() {
  const navigate = useNavigate();
  const { id } = useParams();
  const theme = useTheme();
  const { showToast } = useToast();
  
  const isEditMode = Boolean(id);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  const handleBackNavigation = () => {
    if (isReadOnly) {
       navigate('/campaigns/list');
    } else {
       setShowExitModal(true);
    }
  };

  const confirmExitSave = async () => {
     setShowExitModal(false);
     await handleSave(true); // Save as draft
  };

  const confirmExitDiscard = () => {
     setShowExitModal(false);
     navigate('/campaigns/list');
  };
  
  // --- Form State ---
  // Step 1: Details
  const [title, setTitle] = useState('');
  const [campaignCategory, setCampaignCategory] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [hasProduct, setHasProduct] = useState(false);
  const [productName, setProductName] = useState('');
  const [productValue, setProductValue] = useState('');
  const [productDesc, setProductDesc] = useState('');

  // Step 2: Audience
  const [category, setCategory] = useState([]); // Influencer Categories
  const [min_followers, setMinFollowers] = useState('');
  const [selectedGender, setSelectedGender] = useState('all');
  const [selectedAge, setSelectedAge] = useState([]);
  const [criteriaDesc, setCriteriaDesc] = useState('');

  // Step 3: Content & Budget
  const [influencer_count, setInfluencerCount] = useState(1);
  const [contentItems, setContentItems] = useState([{ id: 1, post_count: 1, content_type: 'foto' }]);
  const [isFree, setIsFree] = useState(false);
  const [price_per_post, setPricePerPost] = useState('');
  
  // Step 4: Timeline & Brief
  const [submission_deadline, setSubmissionDeadline] = useState('');
  const [start_date, setStartDate] = useState(''); // Serves as Registration Deadline
  const [end_date, setEndDate] = useState('');
  const [enable_revision, setEnableRevision] = useState(true);
  const [max_revisions, setMaxRevisions] = useState(1);
  const [revision_duration, setRevisionDuration] = useState('2');
  const [content_guidelines, setContentGuidelines] = useState('');
  const [caption_guidelines, setCaptionGuidelines] = useState('');
  const [referenceFiles, setReferenceFiles] = useState([]);

  // Original data for comparisons or revert
  const [originalData, setOriginalData] = useState(null);

  // Constants
  const CATEGORY_OPTIONS = [
    'Gaming', 'Gaya Hidup & Travel', 'Hiburan', 'Kecantikan & Fashion', 
    'Keluarga & Parenting', 'Kesehatan & Olahraga', 'Makanan & Minuman', 'Teknologi'
  ];
  const CONTENT_TYPE_OPTIONS = [
    { value: 'foto', label: 'Instagram Feed' },
    { value: 'story', label: 'Instagram Story' },
    { value: 'reels', label: 'Instagram Reels' },
    { value: 'video', label: 'Instagram Video' },
  ];
  const AGE_OPTIONS = ['< 18 tahun', '18-24 tahun', '25-34 tahun', '35-49 tahun', '> 50 tahun'];

  // --- Helpers ---
  const formatCurrency = (val) => {
    if (!val) return '';
    return val.toString().replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };
  const parseCurrency = (val) => val ? val.replace(/\D/g, '') : '';
  
  // --- Load Data ---
  useEffect(() => {
    if (isEditMode) {
      setLoading(true);
      campaignService.getCampaignById(id)
        .then(res => {
          const data = res.data || res;
          if (data.status !== 'draft') setIsReadOnly(true);

          setTitle(data.title || '');
          setCampaignCategory(data.campaign_category || '');
          
          const bannerUrl = data.banner_image && !data.banner_image.startsWith('http') && !data.banner_image.startsWith('data:')
             ? `http://localhost:8000/api/uploads/${data.banner_image}` 
             : data.banner_image;
          setImagePreview(bannerUrl || null);

          setHasProduct(data.has_product || false);
          setProductName(data.product_name || '');
          setProductValue(data.product_value ? Math.floor(parseFloat(data.product_value)).toString() : '');
          setProductDesc(data.product_desc || '');
          
          // Helper to parse JSON or array
          const parseList = (val) => {
             if (Array.isArray(val)) return val;
             try { return JSON.parse(val) || []; } catch { return [val].filter(Boolean); }
          };
          
          setCategory(parseList(data.influencer_category));
          setMinFollowers(data.min_followers ? Math.floor(parseFloat(data.min_followers)).toString() : '');
          setSelectedGender(data.selected_gender || 'all');
          setSelectedAge(parseList(data.selected_age));
          setCriteriaDesc(data.criteria_desc || '');

          setInfluencerCount(data.influencer_count || 1);
          setPricePerPost(data.price_per_post ? Math.floor(parseFloat(data.price_per_post)).toString() : '');
          setIsFree(data.is_free || false);
          if (data.contentTypes?.length) {
             setContentItems(data.contentTypes);
          } else if (data.content_types) {
             try {
                const parsed = typeof data.content_types === 'string' 
                   ? JSON.parse(data.content_types) 
                   : data.content_types;
                if (Array.isArray(parsed)) setContentItems(parsed);
             } catch (e) {
                console.error("Failed to parse content_types", e);
             }
          }

          const fmtDate = (d) => d ? d.split('T')[0] : '';
          // Map start_date from backend to UI Registration Deadline (which uses start_date state now)
          setStartDate(fmtDate(data.start_date));
          setSubmissionDeadline(fmtDate(data.submission_deadline));
          setEndDate(fmtDate(data.end_date));
          setEnableRevision(data.enable_revision !== undefined ? data.enable_revision : true);
          setMaxRevisions(data.max_revisions || 1);
          setRevisionDuration(data.revision_duration ? data.revision_duration.toString() : '2');
          setContentGuidelines(data.content_guidelines || '');
          setCaptionGuidelines(data.caption_guidelines || '');

          setOriginalData(data);
        })
        .catch(err => {
          console.error(err);
          showToast('Failed to load campaign', 'error');
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEditMode, showToast]);

  // --- Validation ---
  const validateStep1 = () => {
     if (!title.trim()) {
        showToast('Judul Campaign harus diisi', 'error');
        return false;
     }
     if (!campaignCategory) {
        showToast('Kategori Campaign harus dipilih', 'error');
        return false;
     }
     if (!productDesc.trim()) {
        showToast('Deskripsi Campaign harus diisi', 'error');
        return false;
     }
     if (hasProduct) {
        if (!productName.trim()) {
           showToast('Nama Produk harus diisi', 'error');
           return false;
        }
        if (!productValue) {
           showToast('Nilai Produk harus diisi', 'error');
           return false;
        }
     }
     return true;
  };

  const validateStep2 = () => {
     if (category.length === 0) {
        showToast('Minimal pilih 1 Kategori Influencer', 'error');
        return false;
     }
     if (!min_followers) {
        showToast('Minimal Followers harus diisi', 'error');
        return false;
     }
     return true;
  };

  const validateStep3 = () => {
     if (!isFree && !price_per_post) {
        showToast('Fee per Influencer harus diisi', 'error');
        return false;
     }
     if (influencer_count < 1) return false;
     
     // Check content items
     const invalidItem = contentItems.find(item => item.post_count < 1);
     if (invalidItem) {
        showToast('Jumlah post minimal 1', 'error');
        return false;
     }
     return true;
  };

  // Helper: Parse date string (YYYY-MM-DD) to Date object at 00:00:00 local time
  const parseLocalDate = (dateStr) => {
     if (!dateStr) return null;
     const [year, month, day] = dateStr.split('-');
     return new Date(year, month - 1, day);
  };

  const validateStep4 = () => {
    const errors = [];
    console.log('start_date (Registration Deadline)', start_date);
    console.log('submission_deadline', submission_deadline);
    console.log('end_date', end_date);
    if (!start_date) errors.push('Deadline Registrasi');
    if (!submission_deadline) errors.push('Deadline Submit Konten');
    if (!end_date) errors.push('Tanggal Campaign Selesai');
    
    // Convert inputs to local Dates
    // start_date is now used as Registration Deadline
    const regDate = parseLocalDate(start_date);
    const subDate = parseLocalDate(submission_deadline);
    const endDate = parseLocalDate(end_date);
    
    // Get today at 00:00:00 local
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // 1. Validasi Deadline Registrasi (Minimal Besok)
    // "deadline registrasi must +1 from today" -> means > today
    if (regDate) {
        if (regDate <= today) {
           errors.push('Deadline Registrasi minimal besok (H+1 dari hari ini)');
        }
    }

    // 2. Validasi Deadline Registrasi vs Submit Konten
    if (regDate && subDate) {
       if (subDate <= regDate) {
          errors.push('Deadline Submit Konten harus setelah Deadline Registrasi');
       }
    }

    // 3. Validasi Deadline Submit Konten vs Selesai (End Date)
    // "Jarak antara deadline proposal dan tanggal mulai minimal 1 minggu" 
    // Since start_date is removed, we check gap between Submission and End Date
    if (subDate && endDate) {
      if (endDate <= subDate) {
         errors.push('Tanggal Selesai harus setelah Deadline Submit Konten');
      } else {
          const diffTime = endDate - subDate;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays < 7) {
            errors.push('Jarak antara deadline submit konten dan tanggal selesai minimal 1 minggu');
          }
      }
    }

    if (errors.length > 0) {
      showToast(`Validasi gagal: ${errors.join(', ')}`, 'error');
      return false;
    }
    return true;
  };

  // --- Handlers ---
  const handleNext = () => {
     if (activeStep === 0 && !validateStep1()) return;
     if (activeStep === 1 && !validateStep2()) return;
     if (activeStep === 2 && !validateStep3()) return;
     if (activeStep === 3 && !validateStep4()) return;
     
     setActiveStep(prev => prev + 1);
  };
  const handleBack = () => setActiveStep(prev => prev - 1);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

   const handleSave = async (isDraft = false) => {
     // Validate all steps if publishing (not draft)
     if (!isDraft) {
        if (!validateStep1()) { setActiveStep(0); return; }
        if (!validateStep2()) { setActiveStep(1); return; }
        if (!validateStep3()) { setActiveStep(2); return; }
        if (!validateStep4()) { setActiveStep(3); return; }
     }

     const payload = {
        title, campaignCategory, category, hasProduct, 
        productName: hasProduct ? productName : null,
        productValue: hasProduct ? parseCurrency(productValue) : null,
        productDesc, 
        influencer_count, 
        price_per_post: parseCurrency(price_per_post),
        isFree, min_followers: parseCurrency(min_followers),
        selectedGender, selectedAge, criteriaDesc,
       contentItems: contentItems.map(c => ({...c})),
       start_date, // Mapped from "Deadline Registrasi" input
       submission_deadline, 
       end_date,
       enable_revision, max_revisions: parseInt(max_revisions), revision_duration: parseInt(revision_duration),
       content_guidelines, caption_guidelines,
       status: isDraft ? 'draft' : 'admin_review',
       // image: imagePreview - Removed, handled via separate upload endpoint
    };
    console.log(payload);

    try {
      setLoading(true);
      let resultId;
      
      if (isEditMode) {
         await campaignService.updateCampaign(id, payload);
         resultId = id;
         showToast('Campaign updated successfully!', 'success');
      } else {
         const res = await campaignService.createCampaign(payload);
         // Support multiple response formats just in case
         resultId = res.data?.campaign_id || res.campaign_id || res.id || res.data?.id; 
         showToast('Campaign created successfully!', 'success');
      }

      // Upload Banner if new file exists
      if (image && resultId) {
         // image state holds the File object
         await campaignService.uploadBanner(resultId, image);
      }
      
      navigate('/campaigns/list');
    } catch (error) {
       console.error(error);
       showToast('Error saving campaign', 'error');
    } finally {
       setLoading(false);
    }
  };

  // --- Render Steps ---

  const renderStep1 = () => (
     <Grid container spacing={4}>
        {/* Left Column: Banner */}
        <Grid item xs={12} md={4}>
           <Paper 
             sx={{ 
                height: 340, 
                bgcolor: '#f8fafc', 
                border: '2px dashed #cbd5e1',
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                cursor: isReadOnly ? 'default' : 'pointer',
                overflow: 'hidden',
                position: 'relative',
                transition: 'all 0.2s',
                '&:hover': !isReadOnly ? { borderColor: theme.palette.primary.main, bgcolor: '#f1f5f9' } : {}
             }}
             onClick={() => !isReadOnly && document.getElementById('banner-upload').click()}
           >
              {imagePreview ? (
                 <Box component="img" src={imagePreview} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                 <>
                    <CloudUploadIcon sx={{ fontSize: 48, color: '#94a3b8', mb: 2 }} />
                    <Typography color="textSecondary" fontWeight={600}>Upload Banner</Typography>
                    <Typography variant="caption" color="textSecondary">Format: JPG, PNG (Max 5MB)</Typography>
                 </>
              )}
              {!isReadOnly && <input id="banner-upload" type="file" hidden accept="image/*" onChange={handleImageUpload} />}
           </Paper>
        </Grid>

        {/* Right Column: Form Fields */}
        <Grid item xs={12} md={8}>
           <Stack spacing={4}>
              {/* Basic Info Section */}
              <Box sx={{ display: 'flex', flexDirection: 'column',alignItems: 'left', gap: 2 }}>
                 <Typography variant="h6" fontWeight={700}  sx={{ mb: 2, color: '#334155' }}>Informasi Utama</Typography>
                 
                    <Grid item xs={12}>
                       <TextField 
                         label="Judul Campaign" 
                         fullWidth 
                         required 
                         value={title} 
                         onChange={e => setTitle(e.target.value)} 
                         disabled={isReadOnly}
                         placeholder="Contoh: Grand Opening Coffee Shop Jakarta Selatan"
                       />
                    </Grid>
                    <Grid item xs={12}>
                       <FormControl fullWidth required disabled={isReadOnly}>
                          <InputLabel>Kategori Campaign</InputLabel>
                          <Select 
                            value={campaignCategory} 
                            label="Kategori Campaign"
                            onChange={e => setCampaignCategory(e.target.value)}
                          >
                             {CATEGORY_OPTIONS.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                          </Select>
                       </FormControl>
                    </Grid>
                 
              </Box>

              {/* Product Info Section */}
              <Box>
                 <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: '#334155' }}>Detail Produk</Typography>
                 <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, borderColor: '#e2e8f0' }}>
                    <FormControlLabel 
                      control={<Checkbox checked={hasProduct} onChange={e => setHasProduct(e.target.checked)} disabled={isReadOnly}/>}
                      label={<Typography fontWeight={600} color="#475569">Campaign ini melibatkan pengiriman produk fisik/digital</Typography>}
                      sx={{ mb: hasProduct ? 2 : 0 }}
                    />
                    
                    {hasProduct && (
                       <Grid container spacing={2} sx={{ mt: 0 }}>
                          <Grid item xs={12} sm={8}>
                             <TextField 
                               label="Nama Produk" 
                               fullWidth 
                               size="small"
                               value={productName}
                               onChange={e => setProductName(e.target.value)}
                               disabled={isReadOnly}
                               placeholder="Contoh: Paket Bundling Kopi"
                             />
                          </Grid>
                          <Grid item xs={12} sm={4}>
                             <TextField 
                               label="Nilai Produk" 
                               fullWidth 
                               size="small"
                               value={formatCurrency(productValue)}
                               onChange={e => setProductValue(e.target.value)}
                               InputProps={{ startAdornment: <InputAdornment position="start">Rp</InputAdornment> }}
                               disabled={isReadOnly}
                             />
                          </Grid>
                       </Grid>
                    )}
                 </Paper>
              </Box>

              {/* Description Section */}
              <Box>
                 <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: '#334155' }}>Deskripsi Lengkap</Typography>
                 <TextField 
                    multiline
                    rows={6}
                    fullWidth
                    required
                    placeholder="Jelaskan detail campaign, tujuan, usp produk, atau pesan kunci yang ingin disampaikan..."
                    value={productDesc}
                    onChange={e => setProductDesc(e.target.value)}
                    disabled={isReadOnly}
                    sx={{ bgcolor: '#fff' }}
                 />
              </Box>
           </Stack>
        </Grid>
     </Grid>
  );

  const renderStep2 = () => (
    <Grid container spacing={4}>
       {/* Left Column: Influencer Criteria */}
       <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, height: '100%', borderColor: '#e2e8f0' }}>
             <Stack spacing={3}>
                <Box>
                   <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#1e293b' }}>
                      Kriteria Influencer
                   </Typography>
                   <Typography variant="caption" color="textSecondary" sx={{ mb: 2, display: 'block' }}>
                      Tentukan jenis influencer yang Anda cari
                   </Typography>
                </Box>
                
                <Box>
                   <Typography variant="caption" fontWeight={600} gutterBottom sx={{ display: 'block', mb: 1 }}>Kategori Konten</Typography>
                   <Autocomplete
                      multiple
                      options={CATEGORY_OPTIONS}
                      value={category}
                      onChange={(e, val) => setCategory(val)}
                      disabled={isReadOnly}
                      renderInput={(params) => <TextField {...params} placeholder={category.length === 0 ? "Pilih Kategori..." : ""} />}
                      renderTags={(value, getTagProps) =>
                         value.map((option, index) => (
                            <Chip label={option} {...getTagProps({ index })} sx={{ bgcolor: '#eff6ff', color: '#1d4ed8', fontWeight: 500 }} size="small" />
                         ))
                      }
                   />
                </Box>

                <Box>
                   <Typography variant="caption" fontWeight={600} gutterBottom sx={{ display: 'block', mb: 1 }}>Minimal Followers</Typography>
                   <TextField 
                      fullWidth
                      placeholder="Contoh: 10.000"
                      value={formatCurrency(min_followers)}
                      onChange={e => setMinFollowers(e.target.value)}
                      InputProps={{ startAdornment: <InputAdornment position="start">@</InputAdornment> }}
                      disabled={isReadOnly}
                      size="small"
                   />
                </Box>
             </Stack>
          </Paper>
       </Grid>

       {/* Right Column: Demographics */}
       <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, height: '100%', borderColor: '#e2e8f0' }}>
             <Stack spacing={3}>
                <Box>
                   <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#1e293b' }}>
                      Target Audience
                   </Typography>
                   <Typography variant="caption" color="textSecondary" sx={{ mb: 2, display: 'block' }}>
                      Siapa yang ingin Anda jangkau?
                   </Typography>
                </Box>

                <Box>
                   <Typography variant="caption" fontWeight={600} gutterBottom sx={{ display: 'block', mb: 1 }}>Gender Audience</Typography>
                   <RadioGroup row value={selectedGender} onChange={e => setSelectedGender(e.target.value)}>
                      <FormControlLabel value="all" control={<Radio disabled={isReadOnly}/>} label="Semua" />
                      <FormControlLabel value="female" control={<Radio disabled={isReadOnly}/>} label="Perempuan" />
                      <FormControlLabel value="male" control={<Radio disabled={isReadOnly}/>} label="Laki-laki" />
                   </RadioGroup>
                </Box>

                <Box>
                   <Typography variant="caption" fontWeight={600} gutterBottom sx={{ display: 'block', mb: 1 }}>Rentang Usia</Typography>
                   <Autocomplete
                      multiple
                      options={AGE_OPTIONS}
                      value={selectedAge}
                      onChange={(e, val) => setSelectedAge(val)}
                      disabled={isReadOnly}
                      renderInput={(params) => <TextField {...params} placeholder={selectedAge.length === 0 ? "Pilih Usia..." : ""} />}
                      renderTags={(value, getTagProps) =>
                         value.map((option, index) => (
                            <Chip label={option} {...getTagProps({ index })} size="small" sx={{ bgcolor: '#f0fdf4', color: '#15803d' }} />
                         ))
                      }
                   />
                </Box>

                <Box>
                   <Typography variant="caption" fontWeight={600} gutterBottom sx={{ display: 'block', mb: 1 }}>Kriteria Tambahan (Opsional)</Typography>
                   <TextField 
                      multiline
                      rows={3}
                      fullWidth
                      value={criteriaDesc}
                      onChange={e => setCriteriaDesc(e.target.value)}
                      disabled={isReadOnly}
                      placeholder="Contoh: Berdomisili di Jabodetabek, suka kopi..."
                      sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#f8fafc' } }}
                   />
                </Box>
             </Stack>
          </Paper>
       </Grid>
    </Grid>
  );

  const renderStep3 = () => (
    <Box>
       <Grid container spacing={4}>
          <Grid item xs={12} md={7}>
             <Box sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight={700} sx={{ color: '#1e293b' }}>
                   Kebutuhan Konten
                </Typography>
                <Typography variant="body2" color="textSecondary">
                   Tentukan jenis dan jumlah konten yang harus dibuat influencer
                </Typography>
             </Box>

             <Stack spacing={2}>
                {contentItems.map((item, idx) => (
                   <Paper 
                      key={idx} 
                      variant="outlined" 
                      sx={{ 
                         p: 2, 
                         borderRadius: 3, 
                         position: 'relative', 
                         bgcolor: '#fff',
                         borderColor: '#e2e8f0',
                         transition: 'all 0.2s',
                         '&:hover': { borderColor: theme.palette.primary.light }
                      }}
                   >
                      <Grid container spacing={2} alignItems="center">
                         <Grid item xs={12} sm={5}>
                            <FormControl fullWidth size="small">
                               <InputLabel>Tipe Konten</InputLabel>
                               <Select 
                                  label="Tipe Konten" 
                                  value={item.content_type}
                                  onChange={e => {
                                     const newItems = [...contentItems];
                                     newItems[idx].content_type = e.target.value;
                                     setContentItems(newItems);
                                  }}
                                  disabled={isReadOnly}
                               >
                                  {CONTENT_TYPE_OPTIONS.map(opt => {
                                     const isSelectedElsewhere = contentItems.some((c, cIdx) => cIdx !== idx && c.content_type === opt.value);
                                     if (isSelectedElsewhere && item.content_type !== opt.value) return null;
                                     return <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>;
                                  })}
                               </Select>
                            </FormControl>
                         </Grid>
                         <Grid item xs={12} sm={5}>
                            <TextField
                               label="Jumlah Post"
                               type="number"
                               fullWidth
                               size="small"
                               value={item.post_count}
                               onChange={e => {
                                  const newItems = [...contentItems];
                                  newItems[idx].post_count = Math.max(1, parseInt(e.target.value)||1);
                                  setContentItems(newItems);
                               }}
                               disabled={isReadOnly}
                            />
                         </Grid>
                         <Grid item xs={12} sm={2} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            {contentItems.length > 1 && !isReadOnly && (
                               <IconButton 
                                  color="error" 
                                  onClick={() => setContentItems(contentItems.filter((_, i) => i !== idx))}
                                  sx={{ bgcolor: '#fef2f2', '&:hover': { bgcolor: '#fee2e2' } }}
                               >
                                  <DeleteIcon fontSize="small" />
                               </IconButton>
                            )}
                         </Grid>
                      </Grid>
                   </Paper>
                ))}
                {!isReadOnly && contentItems.length < 4 && (
                   <Button 
                      startIcon={<AddIcon />} 
                      onClick={() => {
                         const availableType = CONTENT_TYPE_OPTIONS.find(opt => !contentItems.some(c => c.content_type === opt.value))?.value || 'foto';
                         setContentItems([...contentItems, { id: Date.now(), post_count: 1, content_type: availableType }]);
                      }}
                      variant="outlined"
                      sx={{ borderStyle: 'dashed', borderRadius: 3, py: 1.5 }}
                   >
                      Tambah Tipe Konten
                   </Button>
                )}
             </Stack>
          </Grid>

          <Grid item xs={12} md={5}>
             <Paper sx={{ p: 3, bgcolor: '#f8fafc', borderRadius: 3, border: '1px solid #e2e8f0', position: 'sticky', top: 100 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: '#1e293b' }}>Estimasi Budget</Typography>
                
                <Box sx={{ mb: 3 }}>
                   <Typography variant="subtitle2" gutterBottom color="textSecondary">Jumlah Influencer</Typography>
                   <Stack direction="row" alignItems="center" spacing={1}>
                      <IconButton onClick={() => setInfluencerCount(Math.max(1, influencer_count-1))} disabled={isReadOnly} size="small" sx={{ bgcolor: '#fff', border: '1px solid #cbd5e1' }}><RemoveIcon/></IconButton>
                      <TextField 
                         size="small" 
                         value={influencer_count} 
                         sx={{ width: 80, textAlign: 'center', bgcolor: '#fff' }} 
                         inputProps={{ style: { textAlign: 'center' }}}
                         disabled={isReadOnly}
                      />
                      <IconButton onClick={() => setInfluencerCount(influencer_count+1)} disabled={isReadOnly} size="small" sx={{ bgcolor: '#fff', border: '1px solid #cbd5e1' }}><AddIcon/></IconButton>
                   </Stack>
                </Box>

                <Paper variant="outlined" sx={{ p: 2, bgcolor: '#fff', borderRadius: 2, mb: 3 }}>
                    <FormControlLabel 
                       control={<Checkbox checked={isFree} onChange={e => setIsFree(e.target.checked)} disabled={isReadOnly}/>}
                       label={<Typography variant="body2" fontWeight={600}>Campaign Barter (Tanpa Bayaran)</Typography>}
                    />
                </Paper>

                {!isFree && (
                   <TextField 
                      label="Fee Per Influencer"
                      fullWidth
                      value={formatCurrency(price_per_post)}
                      onChange={e => setPricePerPost(e.target.value)}
                      InputProps={{ startAdornment: <InputAdornment position="start">Rp</InputAdornment> }}
                      sx={{ mb: 3, bgcolor: '#fff' }}
                      disabled={isReadOnly}
                   />
                )}

                <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #cbd5e1' }}>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                       <Typography color="textSecondary">Subtotal</Typography>
                       <Typography fontWeight={600} color="#334155">
                          Rp {((isFree ? 0 : (parseInt(parseCurrency(price_per_post))||0)) * influencer_count).toLocaleString('id-ID')}
                       </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
                       <Typography color="textSecondary">Admin Fee</Typography>
                       <Typography fontWeight={600} color="#334155">Rp 5.000</Typography>
                    </Stack>
                    <Paper elevation={0} sx={{ p: 2, bgcolor: '#eff6ff', borderRadius: 2 }}>
                       <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="subtitle1" fontWeight={700} color="primary">Total Estimasi</Typography>
                          <Typography variant="h6" fontWeight={800} color="primary">
                            Rp {(((isFree ? 0 : (parseInt(parseCurrency(price_per_post))||0)) * influencer_count) + 5000).toLocaleString('id-ID')}
                          </Typography>
                       </Stack>
                    </Paper>
                </Box>
             </Paper>
          </Grid>
       </Grid>
    </Box>
  );

  const renderStep4 = () => (
    <Grid container spacing={4}>
       <Grid item xs={12} md={6}>
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>
             <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, borderColor: '#e2e8f0' }}>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                   Timeline Campaign
                </Typography>
                
                <Stack spacing={3} sx={{ mt: 2 }}>
                   <Box>
                      <Typography variant="caption" fontWeight={700} color="textSecondary" sx={{ mb: 1, display: 'block', textTransform: 'uppercase' }}>Fase Registrasi & Submisi</Typography>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                         <TextField label="Deadline Registrasi" type="date" InputLabelProps={{shrink:true}} fullWidth value={start_date} onChange={e => setStartDate(e.target.value)} disabled={isReadOnly} required />
                         <TextField label="Deadline Submit Konten" type="date" InputLabelProps={{shrink:true}} fullWidth value={submission_deadline} onChange={e => setSubmissionDeadline(e.target.value)} disabled={isReadOnly} required />
                      </Stack>
                   </Box>
                   
                   <Box>
                      <Typography variant="caption" fontWeight={700} color="textSecondary" sx={{ mb: 1, display: 'block', textTransform: 'uppercase' }}>Fase Akhir</Typography>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                          <TextField label="Selesai Campaign" type="date" InputLabelProps={{shrink:true}} fullWidth value={end_date} onChange={e => setEndDate(e.target.value)} disabled={isReadOnly} required />
                      </Stack>
                   </Box>
                </Stack>
             </Paper>

             {/* <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, borderColor: '#e2e8f0', flex: 1 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom>Kebijakan Revisi</Typography>
                <FormControlLabel control={<Checkbox checked={enable_revision} onChange={e => setEnableRevision(e.target.checked)} disabled={isReadOnly}/>} label="Aktifkan Revisi untuk Influencer" />
                {enable_revision && (
                   <Grid container spacing={2} sx={{ mt: 1 }}>
                      <Grid item xs={6}>
                         <TextField label="Max Revisi" type="number" fullWidth size="small" value={max_revisions} onChange={e => setMaxRevisions(e.target.value)} disabled={isReadOnly} helperText="Kali per influencer" />
                      </Grid>
                      <Grid item xs={6}>
                         <TextField label="Durasi Pengerjaan" type="number" fullWidth size="small" value={revision_duration} onChange={e => setRevisionDuration(e.target.value)} disabled={isReadOnly} helperText="Hari setelah feedback" />
                      </Grid>
                   </Grid>
                )}
             </Paper> */}
          </Box>
       </Grid>

       <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, height: '100%', borderColor: '#e2e8f0' }}>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                   Briefing & Guidelines
                </Typography>
             <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                Berikan instruksi yang jelas agar konten influencer sesuai harapan.
             </Typography>

             <Stack spacing={3}>
                <TextField 
                   label="Guideline Visual / Foto / Video" 
                   multiline rows={4} 
                   fullWidth 
                   placeholder="Jelaskan tone warna, angle pengambilan gambar, pencahayaan, atau elemen yang wajib ada dalam foto/video."
                   value={content_guidelines}
                   onChange={e => setContentGuidelines(e.target.value)}
                   disabled={isReadOnly}
                   sx={{ bgcolor: '#f8fafc' }}
                />
                <TextField 
                   label="Guideline Caption & Hashtag" 
                   multiline rows={4} 
                   fullWidth 
                   placeholder="Jelaskan poin-poin yang harus dibahas di caption, hashtag wajib, dan akun yang harus di-tag."
                   value={caption_guidelines}
                   onChange={e => setCaptionGuidelines(e.target.value)}
                   disabled={isReadOnly}
                   sx={{ bgcolor: '#f8fafc' }}
                />
                <Box>
                   <Typography variant="subtitle2" gutterBottom>Referensi Visual (Opsional)</Typography>
                   <Button 
                      variant="outlined" 
                      component="label" 
                      startIcon={<CloudUploadIcon />} 
                      fullWidth 
                      sx={{ height: 100, borderStyle: 'dashed', borderWidth: 2, borderRadius: 2 }} 
                      disabled={isReadOnly}
                   >
                      Drop file referensi atau Klik untuk Upload
                      <input type="file" hidden multiple onChange={(e) => {
                         const files = Array.from(e.target.files);
                         setReferenceFiles(prev => [...prev, ...files]);
                      }} />
                   </Button>
                   {referenceFiles.length > 0 && (
                      <Stack direction="row" spacing={1} sx={{ mt: 2, overflowX: 'auto', pb: 1 }}>
                         {referenceFiles.map((file, idx) => (
                            <Chip 
                               key={idx} 
                               label={file.name} 
                               onDelete={!isReadOnly ? () => setReferenceFiles(referenceFiles.filter((_,i) => i!==idx)) : undefined} 
                               sx={{ bgcolor: '#eff6ff', color: '#1e40af' }}
                            />
                         ))}
                      </Stack>
                   )}
                </Box>
             </Stack>
          </Paper>
       </Grid>
    </Grid>
  );

  return (
    <Box sx={{ display: 'flex', bgcolor: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <Box sx={{ 
        marginLeft: { xs: 0, lg: '260px' },
        width: { xs: '100%', lg: 'calc(100% - 260px)' },
        transition: 'all 0.3s ease'
      }}>
        <Topbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        
        <Container maxWidth="lg" sx={{ pt: '100px', pb: 4 }}>
           {/* Header */}
           <Stack direction="row" alignItems="center" spacing={2} mb={4}>
              <IconButton onClick={handleBackNavigation} sx={{ bgcolor: '#fff', border: '1px solid #e2e8f0' }}>
                 <ArrowBackIcon />
              </IconButton>
              <Typography variant="h5" fontWeight={800} color="#1e293b">
                 {isReadOnly ? 'Detail Campaign' : isEditMode ? 'Edit Campaign' : 'Buat Campaign Baru'}
              </Typography>
           </Stack>

           <Stepper 
              activeStep={activeStep} 
              alternativeLabel 
              sx={{ 
                 mb: 5,
                 '& .MuiStepIcon-root': {
                    color: '#e2e8f0', // Default inactive color
                    '&.Mui-active': { color: '#6E00BE' }, // Active step color
                    '&.Mui-completed': { color: '#6E00BE' }, // Completed step color
                 },
                 '& .MuiStepLabel-label': {
                    '&.Mui-active': { color: '#6E00BE', fontWeight: 600 },
                    '&.Mui-completed': { color: '#6E00BE' }
                 }
              }}
           >
              {STEPS.map((label) => (
                 <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                 </Step>
              ))}
           </Stepper>

           <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid #e2e8f0', bgcolor: '#fff' }}>
              {activeStep === 0 && renderStep1()}
              {activeStep === 1 && renderStep2()}
              {activeStep === 2 && renderStep3()}
              {activeStep === 3 && renderStep4()}

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 6, pt: 3, borderTop: '1px solid #f1f5f9' }}>
                 <Button
                   disabled={activeStep === 0}
                   onClick={handleBack}
                   sx={{ px: 4, visibility: activeStep === 0 ? 'hidden' : 'visible' }}
                 >
                    Kembali
                 </Button>
                 
                 <Stack direction="row" spacing={2}>
                    {activeStep === STEPS.length - 1 ? (
                       !isReadOnly && (
                        <>
                           <Button variant="outlined" onClick={() => handleSave(true)} disabled={loading}>
                              Simpan Draft
                           </Button>
                           <Button variant="contained" onClick={() => handleSave(false)} disabled={loading} startIcon={<SaveIcon />} sx={{ px: 4, borderRadius: 2 }}>
                              {loading ? 'Menyimpan...' : 'Submit Campaign'}
                           </Button>
                        </>
                       )
                    ) : (
                       <Button variant="contained" onClick={handleNext} endIcon={<ArrowForwardIcon />} sx={{ px: 4, borderRadius: 2 }}>
                          Lanjut
                       </Button>
                    )}
                 </Stack>
              </Box>
           </Paper>
        </Container>
      </Box>
      {/* Exit Confirmation Dialog */}
      <Dialog
        open={showExitModal}
        onClose={() => setShowExitModal(false)}
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.25rem', color: '#1e293b' }}>
           Simpan sebagai Draft?
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: '#64748b', fontSize: '1rem' }}>
            Anda memiliki perubahan yang belum disimpan. Apakah Anda ingin menyimpan campaign ini sebagai draft untuk dilanjutkan nanti?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button 
             onClick={confirmExitDiscard} 
             sx={{ 
                color: '#ef4444', 
                fontWeight: 600,
                mr: 'auto' 
             }}
          >
            Buang Perubahan
          </Button>
          <Button 
             onClick={() => setShowExitModal(false)} 
             sx={{ color: '#64748b', fontWeight: 600 }}
          >
            Batal
          </Button>
          <Button 
             onClick={confirmExitSave} 
             variant="contained" 
             autoFocus
             sx={{ 
                bgcolor: '#6E00BE', 
                fontWeight: 600,
                borderRadius: 2,
                px: 3,
                '&:hover': { bgcolor: '#5a009e' }
             }}
          >
            Simpan Draft
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default CampaignCreate;
