
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';
import campaignDB from '../../data/campaignDatabase';

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
  const [category, setCategory] = useState('Entertainment');
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

  // Original data for change detection
  const [originalData, setOriginalData] = useState(null);

  // Load campaign data when in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      const campaign = campaignDB.getById(id);
      if (campaign) {
        const data = {
          title: campaign.title || '',
          category: campaign.category || 'Entertainment',
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
        category: 'Entertainment',
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
  const allFilled = title && category && productName && productValue && productDesc;
  
  // Check if brief campaign fields are filled
  const briefFilled = startDate && endDate && contentDeadline && photoRules && captionRules;

  // Check if kriteria influencer fields are filled
  const kriteriaFilled = followersCount && selectedGender && selectedAge;

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
      alert('Campaign title is required.');
      return;
    }
    
    // Validate dates if they are filled
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      alert('Campaign start date cannot be later than end date.');
      return;
    }
    if (contentDeadline && endDate && new Date(contentDeadline) > new Date(endDate)) {
      alert('Content deadline cannot be later than campaign end date.');
      return;
    }
    
    // Determine campaign status based on completion of all sections
    const allSectionsComplete = allFilled && kriteriaFilled && kontenFilled && briefFilled;
    const campaignStatus = allSectionsComplete ? 'Active' : 'Draft';
    
    // Prepare campaign data
    const campaignData = {
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
      status: campaignStatus,
      image: imagePreview
    };
    
    if (isEditMode) {
      campaignDB.update(id, campaignData);
      alert(`Campaign updated successfully as ${campaignStatus}!`);
    } else {
      campaignDB.create(campaignData);
      alert(`Campaign created successfully as ${campaignStatus}!`);
    }
    
    // Navigate back to campaign list
    navigate('/');
  };

  // Delete handler
  const handleDelete = () => {
    setShowSettingsDropdown(false);
    if (window.confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
      campaignDB.delete(id);
      alert('Campaign deleted successfully!');
      navigate('/');
    }
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <h2 style={{ fontWeight: 600, margin: 0 }}>
                {isEditMode ? 'Edit Campaign' : 'Create Campaign'}
              </h2>
              {isEditMode && (
                <div style={{ position: 'relative' }} className="settings-dropdown">
                  <button
                    onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
                    style={{
                      background: 'transparent',
                      color: '#6c757d',
                      border: 'none',
                      padding: '4px',
                      fontSize: '1.2rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      borderRadius: '4px'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#f8f9fa';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'transparent';
                    }}
                  >
                    ⚙️
                  </button>
                  {showSettingsDropdown && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: '0',
                        background: '#fff',
                        border: '1px solid #ccc',
                        borderRadius: '6px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        zIndex: 1000,
                        marginTop: '4px',
                        minWidth: '150px'
                      }}
                    >
                      <button
                        onClick={handleDelete}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: 'none',
                          background: 'transparent',
                          color: '#dc3545',
                          textAlign: 'left',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          fontWeight: '500',
                          borderRadius: '6px'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = '#f8f9fa';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'transparent';
                        }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* Save/Cancel buttons appear when there are changes */}
            {title.trim() && hasChanges() && (
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <button 
                  onClick={handleSave} 
                  style={{ 
                    background: '#28a745', 
                    color: 'white',
                    border: 'none', 
                    cursor: 'pointer', 
                    fontSize: '0.9rem',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#218838';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#28a745';
                  }}
                  title={`Save Campaign as ${allFilled && kriteriaFilled && kontenFilled && briefFilled ? 'Active' : 'Draft'}`}
                >
                  💾 Save {allFilled && kriteriaFilled && kontenFilled && briefFilled ? 'as Active' : 'as Draft'}
                </button>
                <button 
                  onClick={() => navigate('/')} 
                  style={{ 
                    background: '#6c757d', 
                    color: 'white',
                    border: 'none', 
                    cursor: 'pointer', 
                    fontSize: '0.9rem',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontWeight: '500'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#5a6268';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#6c757d';
                  }}
                  title="Cancel and return to campaign list"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Progress Indicator */}
          <div style={{ 
            background: '#fff', 
            borderRadius: '12px', 
            boxShadow: '0 2px 8px #e3e3e3', 
            padding: '20px 24px', 
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {[
                  { name: 'Detail Campaign', completed: allFilled },
                  { name: 'Kriteria Influencer', completed: kriteriaFilled },
                  { name: 'Konten & Anggaran', completed: kontenFilled },
                  { name: 'Brief Campaign', completed: briefFilled }
                ].map((step, index) => (
                  <React.Fragment key={step.name}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: step.completed ? '#28a745' : '#e9ecef',
                        color: step.completed ? 'white' : '#6c757d',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.7rem',
                        fontWeight: 'bold'
                      }}>
                        {step.completed ? '✓' : index + 1}
                      </div>
                      <span style={{ 
                        fontSize: '0.75rem', 
                        color: step.completed ? '#28a745' : '#6c757d',
                        fontWeight: step.completed ? '600' : '400',
                        whiteSpace: 'nowrap'
                      }}>
                        {step.name}
                      </span>
                    </div>
                    {index < 3 && (
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        margin: '0 4px',
                        color: '#dee2e6',
                        fontSize: '0.8rem'
                      }}>
                        →
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
              <div style={{ 
                fontSize: '0.75rem', 
                color: '#6c757d',
                fontWeight: '500',
                marginLeft: '16px',
                whiteSpace: 'nowrap'
              }}>
                Step {[allFilled, kriteriaFilled, kontenFilled, briefFilled].filter(Boolean).length} of 4
              </div>
            </div>
          </div>

          {/* Main Card */}
          <CollapsibleSection title="Detail Campaign" status={detailStatus} defaultOpen={true}>
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
                <input
                  type="text"
                  placeholder="Judul Campaign"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '1.1rem' }}
                  required
                />
              </div>
              <div style={{ marginBottom: '18px', marginTop: '6px' }}>
                <label style={{ fontWeight: 600 }}>Kategori</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', marginTop: '6px' }}
                  required
                >
                  {categoryOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '18px' }}>
                <div style={{ marginBottom: '18px' }}>
                  <label style={{ fontWeight: 600 }}>Nama Produk</label>
                  <input
                    type="text"
                    placeholder="Input nama produk"
                    value={productName}
                    onChange={e => setProductName(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', marginTop: '6px' }}
                    required
                  />
                </div>
                <div style={{ marginBottom: '18px' }}>
                  <label style={{ fontWeight: 600 }}>Nilai Produk</label>
                  <input
                    type="text"
                    placeholder="Input nilai produk"
                    value={productValue}
                    onChange={e => setProductValue(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', marginTop: '6px' }}
                    required
                  />
                </div>
                <div style={{ marginBottom: '18px' }}>
                  <label style={{ fontWeight: 600 }}>Deskripsi Produk</label>
                  <textarea
                    placeholder="Cantumkan ketentuan penggunaan produk (misalnya, apakah influencer harus memiliki produk sendiri atau produk akan dikirimkan)."
                    value={productDesc}
                    onChange={e => setProductDesc(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', marginTop: '6px', minHeight: '70px', resize: 'vertical' }}
                    required
                  />
                </div>
              </div>
            </form>
          </CollapsibleSection>

          <CollapsibleSection title="Kriteria Influencer" status={kriteriaStatus} disabled={!allFilled}>
            <form>
              <div style={{ marginBottom: '18px', marginTop: '6px' }}>
                <label style={{ fontWeight: 600 }}>Kategori (isi lainnya)</label>
                <select
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', marginTop: '6px' }}
                  required
                >
                  <option value="Entertainment">Entertainment</option>
                  <option value="Health">Health & Sport</option>
                  <option value="Lifestyle">Lifestyle & Travel</option>
                  <option value="Technology">Technology</option>
                  <option value="Family">Family & Parenting</option>
                  <option value="Food">Food & Beverages</option>
                  <option value="Beauty">Beauty & Fashion</option>
                  <option value="Gaming">Gaming</option>
                </select>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>Minimal Jumlah Followers</label>
                <div style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '6px' }}>
                  💡 Tentukan minimal followers yang dibutuhkan influencer (contoh: 1000, 10000, dst)
                </div>
                <input
                  type="number"
                  placeholder="Contoh: 10000"
                  value={followersCount}
                  onChange={e => setFollowersCount(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: '6px' }}>Jenis Kelamin</label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <label style={{ position: 'relative' }}>
                    <input
                      type="radio"
                      name="gender"
                      value="male"
                      checked={selectedGender === 'male'}
                      onChange={(e) => setSelectedGender(e.target.value)}
                      style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                    />
                    <span style={{ 
                      display: 'block', 
                      padding: '8px 16px', 
                      border: '1px solid #ccc', 
                      borderRadius: '8px', 
                      cursor: 'pointer', 
                      transition: '0.3s',
                      background: selectedGender === 'male' ? '#007bff' : 'white',
                      color: selectedGender === 'male' ? 'white' : 'inherit',
                      borderColor: selectedGender === 'male' ? '#007bff' : '#ccc'
                    }}>
                      Laki-Laki
                    </span>
                  </label>
                  <label style={{ position: 'relative' }}>
                    <input
                      type="radio"
                      name="gender"
                      value="female"
                      checked={selectedGender === 'female'}
                      onChange={(e) => setSelectedGender(e.target.value)}
                      style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                    />
                    <span style={{ 
                      display: 'block', 
                      padding: '8px 16px', 
                      border: '1px solid #ccc', 
                      borderRadius: '8px', 
                      cursor: 'pointer', 
                      transition: '0.3s',
                      background: selectedGender === 'female' ? '#007bff' : 'white',
                      color: selectedGender === 'female' ? 'white' : 'inherit',
                      borderColor: selectedGender === 'female' ? '#007bff' : '#ccc'
                    }}>
                      Perempuan
                    </span>
                  </label>
                </div>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: '6px' }}>Rentang Usia</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {['< 18 tahun', '18-24 tahun', '25-34 tahun', '35-49 tahun', '> 50 tahun'].map((age) => (
                    <label key={age} style={{ position: 'relative' }}>
                      <input
                        type="radio"
                        name="ageRange"
                        value={age}
                        checked={selectedAge === age}
                        onChange={(e) => setSelectedAge(e.target.value)}
                        style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                      />
                      <span style={{ 
                        display: 'block', 
                        padding: '8px 16px', 
                        border: '1px solid #ccc', 
                        borderRadius: '8px', 
                        cursor: 'pointer', 
                        transition: '0.3s',
                        background: selectedAge === age ? '#007bff' : 'white',
                        color: selectedAge === age ? 'white' : 'inherit',
                        borderColor: selectedAge === age ? '#007bff' : '#ccc'
                      }}>
                        {age}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ fontWeight: 600 }}>Lainnya..</label>
                <textarea
                  placeholder="Tambahkan kriteria lainnya jika ada"
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', marginTop: '6px', minHeight: '70px', resize: 'vertical' }}
                />
              </div>
            </form>
          </CollapsibleSection>

          <CollapsibleSection title="Konten & Anggaran" status={kontenStatus} disabled={!allFilled || !kriteriaFilled}>
            <form>
              <div style={{ marginBottom: '18px' }}>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: '6px' }}>Platform:</label>
                <span style={{ fontSize: '1.1rem' }}>Instagram</span>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: '6px' }}>Jumlah Influencer yang Dibutuhkan</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button 
                    type="button" 
                    onClick={() => setInfluencerCount(Math.max(1, influencerCount - 1))}
                    style={{ padding: '8px 16px', border: '1px solid #ccc', borderRadius: '8px', background: 'white', cursor: 'pointer' }}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={influencerCount}
                    onChange={(e) => setInfluencerCount(Math.max(1, parseInt(e.target.value) || 1))}
                    style={{ width: '80px', padding: '8px', borderRadius: '8px', border: '1px solid #ccc', textAlign: 'center' }}
                  />
                  <button 
                    type="button" 
                    onClick={() => setInfluencerCount(influencerCount + 1)}
                    style={{ padding: '8px 16px', border: '1px solid #ccc', borderRadius: '8px', background: 'white', cursor: 'pointer' }}
                  >
                    +
                  </button>
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
                      <button
                        type="button"
                        onClick={() => removeContentItem(item.id)}
                        style={{ 
                          padding: '4px 8px',
                          border: '1px solid #dc3545',
                          borderRadius: '4px',
                          background: 'white',
                          color: '#dc3545',
                          cursor: 'pointer'
                        }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
                    <div style={{ flex: '0 0 auto' }}>
                      <label style={{ fontWeight: 600, display: 'block', marginBottom: '6px' }}>Jumlah Post</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => updateContentItem(item.id, 'postCount', Math.max(1, item.postCount - 1))}
                          style={{ padding: '8px 16px', border: '1px solid #ccc', borderRadius: '8px', background: 'white', cursor: 'pointer' }}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={item.postCount}
                          onChange={(e) => updateContentItem(item.id, 'postCount', parseInt(e.target.value) || 1)}
                          style={{ width: '80px', padding: '8px', borderRadius: '8px', border: '1px solid #ccc', textAlign: 'center' }}
                        />
                        <button
                          type="button"
                          onClick={() => updateContentItem(item.id, 'postCount', item.postCount + 1)}
                          style={{ padding: '8px 16px', border: '1px solid #ccc', borderRadius: '8px', background: 'white', cursor: 'pointer' }}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div style={{ flex: 1 }}>
                      <label style={{ fontWeight: 600, display: 'block', marginBottom: '6px' }}>Jenis Konten</label>
                      <select
                        value={item.contentType}
                        onChange={(e) => updateContentItem(item.id, 'contentType', e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
                      >
                        <option value="foto">Instagram Foto</option>
                        <option value="video">Instagram Video</option>
                        <option value="reels">Instagram Reels</option>
                        <option value="story">Instagram Story</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
              
              <div style={{ marginBottom: '18px' }}>
                <button 
                  type="button" 
                  onClick={addContentItem}
                  style={{ 
                    width: '100%',
                    padding: '12px',
                    background: '#f8f9fa',
                    border: '1px dashed #ccc',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    color: '#666',
                    fontSize: '1rem'
                  }}
                >
                  + Add Konten
                </button>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>Harga task campaign per influencer</label>
                <div style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '6px' }}>
                  💰 Tentukan budget yang akan dibayarkan per influencer untuk campaign ini
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button 
                    type="button" 
                    onClick={() => setTaskPrice(Math.max(0, parseFloat(taskPrice) - 1000).toString())}
                    style={{ padding: '8px 16px', border: '1px solid #ccc', borderRadius: '8px', background: 'white', cursor: 'pointer' }}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="0"
                    placeholder="Contoh: 50000"
                    value={taskPrice}
                    onChange={e => setTaskPrice(e.target.value)}
                    style={{ width: '150px', padding: '8px', borderRadius: '8px', border: '1px solid #ccc' }}
                  />
                  <button 
                    type="button"
                    onClick={() => setTaskPrice((parseFloat(taskPrice || 0) + 1000).toString())}
                    style={{ padding: '8px 16px', border: '1px solid #ccc', borderRadius: '8px', background: 'white', cursor: 'pointer' }}
                  >
                    +
                  </button>
                </div>
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
          </CollapsibleSection>

          <CollapsibleSection title="Brief Campaign" status={briefStatus} defaultOpen={false} disabled={!allFilled || !kriteriaFilled || !kontenFilled}>
            <form>
              <div style={{ marginBottom: '18px' }}>
                <label style={{ fontWeight: 600 }}>Tanggal Mulai Campaign</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '10px', 
                    borderRadius: '8px', 
                    border: '1px solid #ccc',
                    marginTop: '6px',
                    fontFamily: 'inherit',
                    fontSize: '1rem'
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ fontWeight: 600 }}>Tanggal Selesai Campaign</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  min={startDate}
                  style={{ 
                    width: '100%', 
                    padding: '10px', 
                    borderRadius: '8px', 
                    border: '1px solid #ccc',
                    marginTop: '6px',
                    fontFamily: 'inherit',
                    fontSize: '1rem'
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ fontWeight: 600 }}>Batas Waktu Pengiriman Konten</label>
                <input
                  type="date"
                  value={contentDeadline}
                  onChange={e => setContentDeadline(e.target.value)}
                  min={startDate}
                  max={endDate}
                  style={{ 
                    width: '100%', 
                    padding: '10px', 
                    borderRadius: '8px', 
                    border: '1px solid #ccc',
                    marginTop: '6px',
                    fontFamily: 'inherit',
                    fontSize: '1rem'
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ fontWeight: 600 }}>Aturan Foto/Video</label>
                <textarea
                  placeholder="misalnya: wajib ada selfie"
                  value={photoRules}
                  onChange={e => setPhotoRules(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '10px', 
                    borderRadius: '8px', 
                    border: '1px solid #ccc',
                    marginTop: '6px',
                    minHeight: '70px',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    fontSize: '1rem'
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ fontWeight: 600 }}>Aturan Caption</label>
                <textarea
                  placeholder="misalnya: wajib mencantumkan #hashtagbrand"
                  value={captionRules}
                  onChange={e => setCaptionRules(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '10px', 
                    borderRadius: '8px', 
                    border: '1px solid #ccc',
                    marginTop: '6px',
                    minHeight: '70px',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    fontSize: '1rem'
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ fontWeight: 600 }}>Referensi Foto/Video</label>
                <textarea
                  value={contentReference}
                  onChange={e => setContentReference(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '10px', 
                    borderRadius: '8px', 
                    border: '1px solid #ccc',
                    marginTop: '6px',
                    minHeight: '70px',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    fontSize: '1rem'
                  }}
                />
              </div>
            </form>
          </CollapsibleSection>
        </div>
      </div>
    </div>
  );
}

export default CampaignCreate;
