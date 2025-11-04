import React from 'react';

function SubmitButton({ 
  isLoading = false, 
  text = 'Submit', 
  loadingText = 'Loading...', 
  type = 'submit',
  onClick = null,
  fullWidth = true,
  disabled = false
}) {
  return (
    <>
      <button
        type={type}
        disabled={isLoading || disabled}
        onClick={onClick}
        style={{
          width: fullWidth ? '100%' : 'auto',
          padding: '16px',
          fontSize: '1rem',
          fontWeight: '600',
          color: 'white',
          background: (isLoading || disabled) ? '#a0aec0' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none',
          borderRadius: '12px',
          cursor: (isLoading || disabled) ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s',
          boxShadow: (isLoading || disabled) ? 'none' : '0 4px 15px rgba(102, 126, 234, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          fontFamily: "'Montserrat', sans-serif"
        }}
        onMouseEnter={(e) => {
          if (!isLoading && !disabled) {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = (isLoading || disabled) ? 'none' : '0 4px 15px rgba(102, 126, 234, 0.4)';
        }}
      >
        {isLoading ? (
          <>
            <div style={{
              width: '20px',
              height: '20px',
              border: '3px solid rgba(255,255,255,0.3)',
              borderTop: '3px solid white',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            {loadingText}
          </>
        ) : (
          text
        )}
      </button>
      <style>
        {`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}
      </style>
    </>
  );
}

export default SubmitButton;
