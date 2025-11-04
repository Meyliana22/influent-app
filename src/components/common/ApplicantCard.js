import React from 'react';
import { COLORS } from '../../constants/colors';
import Button from './Button';

/**
 * ApplicantCard Component - untuk menampilkan detail applicant
 */
const ApplicantCard = ({ 
  applicant, 
  onAccept, 
  onReject,
  onCancel,
  onToggleSelection,
  onChat,
  onShowDetail,
  showActions = true,
  showSelection = false 
}) => {
  // Get status badge style
  const getStatusStyle = (status) => {
    const styles = {
      'Pending': { 
        background: 'linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%)', 
        color: '#856404',
        icon: '⏳'
      },
      'Accepted': { 
        background: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)', 
        color: '#155724',
        icon: '✅'
      },
      'Rejected': { 
        background: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)', 
        color: '#721c24',
        icon: '❌'
      }
    };
    return styles[status] || styles['Pending'];
  };

  const statusStyle = getStatusStyle(applicant.status);
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  return (
    <div style={{
      background: COLORS.white,
      borderRadius: '16px',
      padding: '24px',
      boxShadow: applicant.isSelected 
        ? '0 6px 28px rgba(102, 126, 234, 0.4)' 
        : `0 4px 20px ${COLORS.shadowMedium}`,
      border: applicant.isSelected 
        ? '2px solid #667eea' 
        : `1px solid ${COLORS.border}`,
      marginBottom: '20px',
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.3s ease'
    }}>
      {/* Decorative line based on status */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: applicant.isSelected 
          ? 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
          : statusStyle.background
      }}></div>

      {/* Selection Checkbox - Top Right */}
      {showSelection && applicant.status !== 'Rejected' && (
        <div style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          zIndex: 10
        }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            background: applicant.isSelected ? '#667eea' : COLORS.white,
            padding: '8px 16px',
            borderRadius: '24px',
            border: applicant.isSelected ? '2px solid #667eea' : '2px solid #e0e0e0',
            fontSize: '0.85rem',
            fontWeight: '600',
            color: applicant.isSelected ? COLORS.white : COLORS.textPrimary,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            transition: 'all 0.2s ease'
          }}>
            <input
              type="checkbox"
              checked={applicant.isSelected || false}
              onChange={() => onToggleSelection && onToggleSelection(applicant)}
              style={{
                width: '18px',
                height: '18px',
                cursor: 'pointer',
                accentColor: '#667eea'
              }}
            />
            <span>{applicant.isSelected ? '✓ Dipilih' : 'Pilih'}</span>
          </label>
        </div>
      )}

      <div style={{ display: 'flex', gap: '24px' }}>
        {/* Left section - Profile */}
        <div style={{ flex: '0 0 200px' }}>
          {/* Avatar placeholder */}
          <div style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: COLORS.gradient,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '3rem',
            color: COLORS.white,
            fontWeight: 'bold',
            margin: '0 auto 16px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
          }}>
            {applicant.fullName.charAt(0).toUpperCase()}
          </div>

          {/* Status Badge */}
          <div style={{
            ...statusStyle,
            padding: '8px 16px',
            borderRadius: '24px',
            fontSize: '0.85rem',
            fontWeight: '600',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            marginBottom: '12px'
          }}>
            {statusStyle.icon} {applicant.status}
          </div>

          {/* Applied Date */}
          <div style={{
            textAlign: 'center',
            fontSize: '0.75rem',
            color: COLORS.textSecondary,
            fontWeight: '500'
          }}>
            Applied: {formatDate(applicant.appliedDate)}
          </div>
        </div>

        {/* Right section - Details */}
        <div style={{ flex: 1 }}>
          {/* Header - Name & Username */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{
              margin: '0 0 6px 0',
              fontSize: '1.4rem',
              fontWeight: '700',
              color: COLORS.textPrimary
            }}>
              {applicant.fullName}
            </h3>
            <div style={{
              fontSize: '1rem',
              color: COLORS.primary,
              fontWeight: '600'
            }}>
              {applicant.influencerName}
            </div>
          </div>

          {/* Bio */}
          <p style={{
            margin: '0 0 20px 0',
            color: COLORS.textSecondary,
            fontSize: '0.95rem',
            lineHeight: '1.6',
            fontStyle: 'italic'
          }}>
            "{applicant.bio}"
          </p>

          {/* Stats Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '16px',
            marginBottom: '20px'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '12px 16px',
              borderRadius: '12px',
              color: COLORS.white
            }}>
              <div style={{ fontSize: '0.75rem', opacity: 0.9, marginBottom: '4px' }}>
                📍 Location
              </div>
              <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>
                {applicant.location}
              </div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              padding: '12px 16px',
              borderRadius: '12px',
              color: COLORS.white
            }}>
              <div style={{ fontSize: '0.75rem', opacity: 0.9, marginBottom: '4px' }}>
                🎂 Age
              </div>
              <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>
                {applicant.age} years
              </div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              padding: '12px 16px',
              borderRadius: '12px',
              color: COLORS.white
            }}>
              <div style={{ fontSize: '0.75rem', opacity: 0.9, marginBottom: '4px' }}>
                👥 Followers
              </div>
              <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>
                {applicant.followers.toLocaleString('id-ID')}
              </div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
              padding: '12px 16px',
              borderRadius: '12px',
              color: COLORS.white
            }}>
              <div style={{ fontSize: '0.75rem', opacity: 0.9, marginBottom: '4px' }}>
                📊 Engagement
              </div>
              <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>
                {applicant.engagementRate}%
              </div>
            </div>
          </div>

          {/* Contact & Additional Info */}
          <div style={{
            background: '#f8f9fa',
            padding: '16px',
            borderRadius: '12px',
            marginBottom: '20px'
          }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              fontSize: '0.85rem'
            }}>
              <div>
                <span style={{ fontWeight: '600', color: COLORS.textPrimary }}>
                  📧 Email:
                </span>
                <span style={{ marginLeft: '8px', color: COLORS.textSecondary }}>
                  {applicant.email}
                </span>
              </div>
              <div>
                <span style={{ fontWeight: '600', color: COLORS.textPrimary }}>
                  📱 Phone:
                </span>
                <span style={{ marginLeft: '8px', color: COLORS.textSecondary }}>
                  {applicant.phone}
                </span>
              </div>
              <div>
                <span style={{ fontWeight: '600', color: COLORS.textPrimary }}>
                  👤 Gender:
                </span>
                <span style={{ marginLeft: '8px', color: COLORS.textSecondary }}>
                  {applicant.gender}
                </span>
              </div>
              <div>
                <span style={{ fontWeight: '600', color: COLORS.textPrimary }}>
                  📸 Instagram:
                </span>
                <span style={{ marginLeft: '8px', color: COLORS.textSecondary }}>
                  {applicant.instagram}
                </span>
              </div>
            </div>
          </div>

          {/* Niche Tags */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ 
              fontSize: '0.85rem', 
              fontWeight: '600', 
              color: COLORS.textPrimary,
              marginBottom: '8px'
            }}>
              🎯 Niche:
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {applicant.niche.map((tag, index) => (
                <span key={index} style={{
                  padding: '6px 14px',
                  background: COLORS.gradient,
                  color: COLORS.white,
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Previous Brands */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ 
              fontSize: '0.85rem', 
              fontWeight: '600', 
              color: COLORS.textPrimary,
              marginBottom: '8px'
            }}>
              🏢 Previous Collaborations:
            </div>
            <div style={{ 
              color: COLORS.textSecondary,
              fontSize: '0.85rem',
              lineHeight: '1.6'
            }}>
              {applicant.previousBrands.join(', ')}
            </div>
          </div>

          {/* Quick Action Buttons - Chat & Detail */}
          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            marginBottom: '20px'
          }}>
            <Button
              variant="outline"
              onClick={() => onChat && onChat(applicant)}
              style={{
                flex: 1,
                background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                color: COLORS.white,
                border: 'none',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              💬 Chat
            </Button>
            <Button
              variant="outline"
              onClick={() => onShowDetail && onShowDetail(applicant)}
              style={{
                flex: 1,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: COLORS.white,
                border: 'none',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              👤 Detail
            </Button>
          </div>

          {/* Action Buttons */}
          {showActions && (
            <div style={{ 
              display: 'flex', 
              gap: '12px', 
              marginTop: '24px',
              paddingTop: '20px',
              borderTop: `2px solid ${COLORS.border}`
            }}>
              {applicant.status === 'Pending' && (
                <>
                  <Button 
                    variant="success" 
                    onClick={() => onAccept(applicant.id)}
                    style={{ flex: 1 }}
                  >
                    ✅ Accept
                  </Button>
                  <Button 
                    variant="danger" 
                    onClick={() => onReject(applicant.id)}
                    style={{ flex: 1 }}
                  >
                    ❌ Reject
                  </Button>
                </>
              )}
              {applicant.status === 'Accepted' && (
                <Button 
                  variant="outline" 
                  onClick={() => onCancel(applicant.id)}
                  style={{ flex: 1 }}
                >
                  ↩️ Cancel Acceptance
                </Button>
              )}
              {applicant.status === 'Rejected' && (
                <Button 
                  variant="outline" 
                  onClick={() => onCancel(applicant.id)}
                  style={{ flex: 1 }}
                >
                  ↩️ Reconsider
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicantCard;
