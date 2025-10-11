import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';
import campaignDB from '../../data/campaignDatabase';
import { Button, TextField, Select, MenuItem, FormControl, InputLabel, RadioGroup, FormControlLabel, Radio, Checkbox, ListItemText, OutlinedInput, Chip, Box } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';

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

  // Form state
  const [title, setTitle] = useState('');
  const [campaignCategory, setCampaignCategory] = useState('');
  const [category, setCategory] = useState([]); // Influencer categories (multi-select)
  const [productName, setProductName] = useState('');
  const [productValue, setProductValue] = useState('');
  const [productDesc, setProductDesc] = useState('');
  
  // Brief Campaign state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [contentDeadline, setContentDeadline] = useState('');
  const [photoRules, setPhotoRules] = useState('');
  const [captionRules, setCaptionRules] = useState('');
  const [contentReference, setContentReference] = useState('');
  
  // Content & Budget state
  const [influencerCount, setInfluencerCount] = useState(1);
  const [contentItems, setContentItems] = useState([
    { id: 1, postCount: 1, contentType: 'foto' }
  ]);
  const [taskPrice, setTaskPrice] = useState('');
  const [followersCount, setFollowersCount] = useState('');
  
  // Settings dropdown state
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  
  // Delete popup state
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  
  // Alert/Notification popup state
  const [showAlertPopup, setShowAlertPopup] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('error'); // 'error', 'success', 'warning'
  
  // Wizard step state
  const [currentStep, setCurrentStep] = useState(1);

  // Original data for change detection
  const [originalData, setOriginalData] = useState(null);

  // Load campaign data when in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      const campaign = campaignDB.getById(id);
      if (campaign) {
        const data = {
          title: campaign.title || '',
          campaignCategory: campaign.campaignCategory || '',
          category: Array.isArray(campaign.category) ? campaign.category : (campaign.category ? [campaign.category] : []),
          productName: campaign.productName || '',
          productValue: campaign.productValue || '',
          productDesc: campaign.productDesc || '',
          startDate: campaign.startDate || '',
          endDate: campaign.endDate || '',
          contentDeadline: campaign.contentDeadline || '',
          photoRules: campaign.photoRules || '',
          captionRules: campaign.captionRules || '',
          contentReference: campaign.contentReference || '',
          influencerCount: campaign.influencerCount || 1,
          taskPrice: campaign.taskPrice || '',
          followersCount: campaign.followersCount || '',
          selectedGender: campaign.selectedGender || '',
          selectedAge: campaign.selectedAge || '',
          contentItems: campaign.contentItems || [{ id: 1, postCount: 1, contentType: 'foto' }],
          imagePreview: campaign.image || null
        };
        
        // Set form state
        setTitle(data.title);
        setCampaignCategory(data.campaignCategory);
        setCategory(data.category);
        setProductName(data.productName);
        setProductValue(data.productValue);
        setProductDesc(data.productDesc);
        setStartDate(data.startDate);
        setEndDate(data.endDate);
        setContentDeadline(data.contentDeadline);
        setPhotoRules(data.photoRules);
        setCaptionRules(data.captionRules);
        setContentReference(data.contentReference);
        setInfluencerCount(data.influencerCount);
        setTaskPrice(data.taskPrice);
        setFollowersCount(data.followersCount);
        setSelectedGender(data.selectedGender);
        setSelectedAge(data.selectedAge);
        setContentItems(data.contentItems);
        if (data.imagePreview) {
          setImagePreview(data.imagePreview);
        }
        
        // Save original data for comparison
        setOriginalData(data);
      }
    } else {
      // For new campaigns, set empty original data
      setOriginalData({
        title: '',
        campaignCategory: '',
        category: [],
        productName: '',
        productValue: '',
        productDesc: '',
        startDate: '',
        endDate: '',
        contentDeadline: '',
        photoRules: '',
        captionRules: '',
        contentReference: '',
        influencerCount: 1,
        taskPrice: '',
        followersCount: '',
        selectedGender: '',
        selectedAge: '',
        contentItems: [{ id: 1, postCount: 1, contentType: 'foto' }],
        imagePreview: null
      });
    }
  }, [isEditMode, id]);

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
  const estimatedBudget = influencerCount * (parseFloat(taskPrice) || 0);
  
  // Check if form data has changed
  const hasChanges = () => {
    if (!originalData) return false;
    
    const currentData = {
      title,
      category,
      productName,
      productValue,
      productDesc,
      startDate,
      endDate,
      contentDeadline,
      photoRules,
      captionRules,
      contentReference,
      influencerCount,
      taskPrice,
      followersCount,
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
      { id: Date.now(), postCount: 1, contentType: 'foto' }
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

  // Check if all required fields are filled
  const allFilled = title && campaignCategory && productName && productValue && productDesc;
  
  // Check if brief campaign fields are filled
  const briefFilled = startDate && endDate && contentDeadline && photoRules && captionRules;

  // Check if kriteria influencer fields are filled
  const kriteriaFilled = category.length > 0 && followersCount && selectedGender && selectedAge;

  // Check if konten & anggaran fields are filled
  const kontenFilled = influencerCount && taskPrice && contentItems.length > 0;

  // Status for collapsible sections
  const detailStatus = allFilled ? 'done' : 'in progress';
  const kriteriaStatus = kriteriaFilled ? 'done' : 'in progress';
  const kontenStatus = kontenFilled ? 'done' : 'in progress';
  const briefStatus = briefFilled ? 'done' : 'in progress';

  // Save handler
  const handleSave = (e) => {
    e.preventDefault();
    
    // Basic validation only for required Detail Campaign fields
    if (!title.trim()) {
      showAlert('Campaign title is required.', 'error');
      return;
    }
    
    // Validate dates if they are filled
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      showAlert('Campaign start date cannot be later than end date.', 'error');
      return;
    }
    if (contentDeadline && endDate && new Date(contentDeadline) > new Date(endDate)) {
      showAlert('Content deadline cannot be later than campaign end date.', 'error');
      return;
    }
    
    // Determine campaign status based on completion of all sections
    const allSectionsComplete = allFilled && kriteriaFilled && kontenFilled && briefFilled;
    const campaignStatus = allSectionsComplete ? 'Active' : 'Draft';
    
    // Prepare campaign data
    const campaignData = {
      title,
      campaignCategory,
      category,
      productName,
      productValue,
      productDesc,
      startDate,
      endDate,
      contentDeadline,
      photoRules,
      captionRules,
      contentReference,
      influencerCount,
      taskPrice,
      followersCount,
      selectedGender,
      selectedAge,
      contentItems,
      status: campaignStatus,
      image: imagePreview
    };
    
    if (isEditMode) {
      campaignDB.update(id, campaignData);
      showAlert(`Campaign updated successfully as ${campaignStatus}!`, 'success');
    } else {
      campaignDB.create(campaignData);
      showAlert(`Campaign created successfully as ${campaignStatus}!`, 'success');
    }
    
    // Navigate back to campaign list
    navigate('/');
  };

  // Delete handler
  const handleDelete = () => {
    setShowDeletePopup(true);
  };

  const confirmDelete = () => {
    campaignDB.delete(id);
    setShowDeletePopup(false);
    navigate('/');
  };

  const cancelDelete = () => {
    setShowDeletePopup(false);
  };

  // Show alert popup
  const showAlert = (message, type = 'error') => {
    setAlertMessage(message);
    setAlertType(type);
    setShowAlertPopup(true);
  };

  const closeAlert = () => {
    setShowAlertPopup(false);
    if (alertType === 'success') {
      navigate('/');
    }
  };

  // Step navigation handlers
  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const goToStep = (step) => {
    // In edit mode, allow jumping to any step
    // In create mode, only allow going to completed steps or next step
    if (isEditMode) {
      setCurrentStep(step);
      window.scrollTo(0, 0);
    } else {
      // Check if can navigate to this step
      if (step === 1 || 
          (step === 2 && allFilled) || 
          (step === 3 && allFilled && kriteriaFilled) || 
          (step === 4 && allFilled && kriteriaFilled && kontenFilled)) {
        setCurrentStep(step);
        window.scrollTo(0, 0);
      }
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
    <div style={{ background: '#fafafa', minHeight: '100vh', paddingBottom: '32px', fontFamily: 'Montserrat, Arial, sans-serif' }}>
      {/* Top Section */}
      <div style={{ maxWidth: '900px', margin: '0 auto', paddingTop: '48px' }}>
        <div style={{ background: '#fff', borderRadius: '20px', boxShadow: '0 4px 24px #e3e3e3', padding: '32px', marginBottom: '32px' }}>
          {/* Back Button */}
          <button
            type="button"
            onClick={() => navigate('/')}
            style={{ marginBottom: '18px', background: '#eee', color: '#333', border: 'none', borderRadius: '8px', padding: '8px 22px', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 2px 8px #e3e3e3' }}
            aria-label="Kembali ke daftar campaign"
          >
            ← Back
          </button>
          
          {/* Header with Title and Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h2 style={{ fontWeight: 600, margin: 0 }}>
                {isEditMode ? 'Edit Campaign' : 'Create Campaign'}
              </h2>
              {isEditMode && (
                <button
                  onClick={handleDelete}
                  style={{
                    background: 'transparent',
                    color: '#dc3545',
                    border: 'none',
                    padding: '6px',
                    fontSize: '1.3rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    borderRadius: '6px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#fee';
                    e.target.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'transparent';
                    e.target.style.transform = 'scale(1)';
                  }}
                  title="Delete Campaign"
                >
                  🗑️
                </button>
              )}
            </div>
            {/* Save/Cancel buttons appear when there are changes */}
            {title.trim() && hasChanges() && (
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <Button 
                  onClick={handleSave} 
                  variant="contained"
                  color="primary"
                  size="large"
                  style={{ 
                    borderRadius: '6px',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  startIcon={<FaCheckCircle />}
                  title={`Save Campaign as ${allFilled && kriteriaFilled && kontenFilled && briefFilled ? 'Active' : 'Draft'}`}
                >
                  {allFilled && kriteriaFilled && kontenFilled && briefFilled ? 'Save as Active' : 'Save as Draft'}
                </Button>
                <Button 
                  onClick={() => navigate('/')}
                  variant="outlined"
                  color="secondary"
                  size="large"
                  style={{ 
                    borderRadius: '6px',
                    fontWeight: 500
                  }}
                  title="Cancel and return to campaign list"
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>

          {/* Step Indicator */}
          <div style={{ 
            background: '#f8f9fa', 
            borderRadius: '12px', 
            padding: '20px 24px', 
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
              {[
                { num: 1, name: 'Detail Campaign', completed: allFilled },
                { num: 2, name: 'Kriteria Influencer', completed: kriteriaFilled },
                { num: 3, name: 'Konten & Anggaran', completed: kontenFilled },
                { num: 4, name: 'Brief Campaign', completed: briefFilled }
              ].map((step, index) => {
                const isActive = currentStep === step.num;
                const canAccess = isEditMode || step.num === 1 || 
                  (step.num === 2 && allFilled) || 
                  (step.num === 3 && allFilled && kriteriaFilled) || 
                  (step.num === 4 && allFilled && kriteriaFilled && kontenFilled);
                
                return (
                  <React.Fragment key={step.num}>
                    <div 
                      onClick={() => canAccess && goToStep(step.num)}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        cursor: canAccess ? 'pointer' : 'not-allowed',
                        opacity: canAccess ? 1 : 0.5,
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        if (canAccess) e.currentTarget.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: step.completed ? '#28a745' : (isActive ? '#007bff' : '#e9ecef'),
                        color: step.completed || isActive ? 'white' : '#6c757d',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.85rem',
                        fontWeight: 'bold',
                        border: isActive ? '3px solid #0056b3' : 'none'
                      }}>
                        {step.completed ? '✓' : step.num}
                      </div>
                      <span style={{ 
                        fontSize: '0.85rem', 
                        color: step.completed ? '#28a745' : (isActive ? '#007bff' : '#6c757d'),
                        fontWeight: isActive ? '700' : (step.completed ? '600' : '400'),
                        whiteSpace: 'nowrap'
                      }}>
                        {step.name}
                      </span>
                    </div>
                    {index < 3 && (
                      <div style={{ 
                        width: '30px',
                        height: '2px',
                        background: step.completed ? '#28a745' : '#dee2e6',
                        margin: '0 4px'
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
                  background: imagePreview ? '#fff' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '16px', 
                  marginRight: '18px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  overflow: 'hidden', 
                  position: 'relative',
                  border: '2px dashed transparent',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  boxShadow: '0 8px 32px rgba(102, 126, 234, 0.25)'
                }}
                onMouseEnter={(e) => {
                  if (!imagePreview) {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(102, 126, 234, 0.35)';
                    e.currentTarget.style.borderColor = '#667eea';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!imagePreview) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(102, 126, 234, 0.25)';
                    e.currentTarget.style.borderColor = 'transparent';
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
                    <div style={{ textAlign: 'center', color: '#fff' }}>
                      <div style={{ fontSize: '2.5rem', marginBottom: '8px', opacity: 0.9 }}>📸</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: '500', opacity: 0.9 }}>Upload Image</div>
                      <div style={{ fontSize: '0.7rem', opacity: 0.7, marginTop: '4px' }}>Click to browse</div>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0, cursor: 'pointer', left: 0, top: 0 }}
                    title="Upload campaign image"
                  />
                </div>
                <TextField
                  label="Judul Campaign"
                  variant="outlined"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  style={{ flex: 1, marginBottom: '18px' }}
                  required
                />
              </div>
              <div style={{ marginBottom: '18px', marginTop: '6px' }}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Kategori</InputLabel>
                  <Select
                    value={campaignCategory}
                    onChange={e => setCampaignCategory(e.target.value)}
                    label="Kategori"
                    required
                  >
                    {categoryOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                  </Select>
                </FormControl>
              </div>
              <div style={{ marginBottom: '18px' }}>
                <div style={{ marginBottom: '18px' }}>
                  <TextField
                    label="Nama Produk"
                    variant="outlined"
                    placeholder="Input nama produk"
                    value={productName}
                    onChange={e => setProductName(e.target.value)}
                    fullWidth
                    required
                  />
                </div>
                <div style={{ marginBottom: '18px' }}>
                  <TextField
                    label="Nilai Produk"
                    variant="outlined"
                    placeholder="Input nilai produk"
                    value={productValue}
                    onChange={e => setProductValue(e.target.value)}
                    fullWidth
                    required
                  />
                </div>
                <div style={{ marginBottom: '18px' }}>
                  <TextField
                    label="Deskripsi Produk"
                    variant="outlined"
                    placeholder="Cantumkan ketentuan penggunaan produk (misalnya, apakah influencer harus memiliki produk sendiri atau produk akan dikirimkan)."
                    value={productDesc}
                    onChange={e => setProductDesc(e.target.value)}
                    fullWidth
                    multiline
                    rows={2}
                    required
                  />
                </div>
              </div>
            </form>
            
            {/* Navigation Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #eee' }}>
              <div></div>
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                variant="contained"
                color="primary"
                size="large"
                style={{ 
                  borderRadius: '8px',
                  fontWeight: 600,
                  padding: '12px 32px'
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
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        label={option}
                        {...getTagProps({ index })}
                        onDelete={() => {
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
                      label="Kategori (isi lainnya)"
                      placeholder="Pilih kategori"
                    />
                  )}
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <TextField
                  label="Minimal Jumlah Followers"
                  variant="outlined"
                  placeholder="Contoh: 10000"
                  value={followersCount}
                  onChange={e => setFollowersCount(e.target.value)}
                  fullWidth
                  required
                  helperText="💡 Tentukan minimal followers yang dibutuhkan influencer (contoh: 1000, 10000, dst)"
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>Jenis Kelamin</label>
                <RadioGroup
                  row
                  value={selectedGender}
                  onChange={(e) => setSelectedGender(e.target.value)}
                  style={{ marginBottom: '12px' }}
                >
                  <FormControlLabel value="male" control={<Radio />} label="Laki-Laki" />
                  <FormControlLabel value="female" control={<Radio />} label="Perempuan" />
                </RadioGroup>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: '6px' }}>Rentang Usia</label>
                <RadioGroup
                  row
                  value={selectedAge}
                  onChange={(e) => setSelectedAge(e.target.value)}
                  style={{ marginBottom: '12px' }}
                >
                  <FormControlLabel value="< 18 tahun" control={<Radio />} label="< 18 tahun" />
                  <FormControlLabel value="18-24 tahun" control={<Radio />} label="18-24 tahun" />
                  <FormControlLabel value="25-34 tahun" control={<Radio />} label="25-34 tahun" />
                  <FormControlLabel value="35-49 tahun" control={<Radio />} label="35-49 tahun" />
                  <FormControlLabel value="> 50 tahun" control={<Radio />} label="> 50 tahun" />
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
                disabled={!canProceed()}
                variant="contained"
                color="primary"
                size="large"
                style={{ 
                  borderRadius: '8px',
                  fontWeight: 600,
                  padding: '12px 32px'
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
                <label style={{ fontWeight: 600, display: 'block', marginBottom: '6px' }}>Jumlah Influencer yang Dibutuhkan</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Button 
                    variant="outlined" 
                    onClick={() => setInfluencerCount(Math.max(1, influencerCount - 1))}
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
                    value={influencerCount}
                    onChange={(e) => setInfluencerCount(Math.max(1, parseInt(e.target.value) || 1))}
                    style={{ width: '80px', padding: '8px', borderRadius: '8px', textAlign: 'center' }}
                  />
                  <Button 
                    variant="outlined" 
                    onClick={() => setInfluencerCount(influencerCount + 1)}
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
                    {contentItems.length > 1 && (
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
                          onClick={() => updateContentItem(item.id, 'postCount', Math.max(1, item.postCount - 1))}
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
                          value={item.postCount}
                          onChange={(e) => updateContentItem(item.id, 'postCount', parseInt(e.target.value) || 1)}
                          style={{ width: '80px', padding: '8px', borderRadius: '8px', textAlign: 'center' }}
                        />
                        <Button
                          variant="outlined"
                          onClick={() => updateContentItem(item.id, 'postCount', item.postCount + 1)}
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
                      <FormControl fullWidth variant="outlined">
                        <Select
                          value={item.contentType}
                          onChange={(e) => updateContentItem(item.id, 'contentType', e.target.value)}
                          label="Jenis Konten"
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

              <div style={{ marginBottom: '18px' }}>
                <TextField
                  label="Harga task campaign per influencer"
                  variant="outlined"
                  placeholder="Contoh: 50000"
                  value={taskPrice}
                  onChange={e => setTaskPrice(e.target.value)}
                  fullWidth
                  required
                  helperText="💰 Tentukan budget yang akan dibayarkan per influencer untuk campaign ini"
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
                disabled={!canProceed()}
                variant="contained"
                color="primary"
                size="large"
                style={{ 
                  borderRadius: '8px',
                  fontWeight: 600,
                  padding: '12px 32px'
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
              <div style={{ marginBottom: '18px' }}>
                <TextField
                  label="Tanggal Mulai Campaign"
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  fullWidth
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
                  variant="outlined"
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <TextField
                  label="Tanggal Selesai Campaign"
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  min={startDate}
                  fullWidth
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
                  variant="outlined"
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <TextField
                  label="Batas Waktu Pengiriman Konten"
                  type="date"
                  value={contentDeadline}
                  onChange={e => setContentDeadline(e.target.value)}
                  min={startDate}
                  max={endDate}
                  fullWidth
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
                  variant="outlined"
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <TextField
                  label="Aturan Foto/Video"
                  variant="outlined"
                  placeholder="misalnya: wajib ada selfie"
                  value={photoRules}
                  onChange={e => setPhotoRules(e.target.value)}
                  fullWidth
                  multiline
                  rows={2}
                  required
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <TextField
                  label="Aturan Caption"
                  variant="outlined"
                  placeholder="misalnya: wajib mencantumkan #hashtagbrand"
                  value={captionRules}
                  onChange={e => setCaptionRules(e.target.value)}
                  fullWidth
                  multiline
                  rows={2}
                  required
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <TextField
                  label="Referensi Foto/Video"
                  variant="outlined"
                  value={contentReference}
                  onChange={e => setContentReference(e.target.value)}
                  fullWidth
                  multiline
                  rows={2}
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
                onClick={handleSave}
                variant="contained"
                color="primary"
                size="large"
                style={{ 
                  borderRadius: '8px',
                  fontWeight: 600,
                  padding: '12px 32px'
                }}
              >
                {allFilled && kriteriaFilled && kontenFilled && briefFilled ? 'Save as Active' : 'Save as Draft'}
              </Button>
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

      {/* Alert/Notification Popup */}
      {showAlertPopup && (
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
          onClick={closeAlert}
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
              <div style={{ fontSize: '4rem', marginBottom: '16px' }}>
                {alertType === 'success' ? '✅' : alertType === 'warning' ? '⚠️' : '❌'}
              </div>
              <h3 style={{ 
                margin: '0 0 12px 0', 
                fontSize: '1.5rem', 
                fontWeight: 600, 
                color: alertType === 'success' ? '#28a745' : alertType === 'warning' ? '#ffc107' : '#dc3545'
              }}>
                {alertType === 'success' ? 'Success!' : alertType === 'warning' ? 'Warning' : 'Error'}
              </h3>
              <p style={{ margin: 0, color: '#666', fontSize: '0.95rem', lineHeight: '1.5' }}>
                {alertMessage}
              </p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={closeAlert}
                style={{
                  padding: '12px 32px',
                  border: 'none',
                  background: alertType === 'success' ? '#28a745' : alertType === 'warning' ? '#ffc107' : '#007bff',
                  color: '#fff',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  minWidth: '120px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CampaignCreate;
