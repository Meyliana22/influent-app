import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, CircularProgress, Container, Paper } from '@mui/material';
import authService from '../../services/authService';
import studentService from '../../services/studentService';
import { useToast } from '../../hooks/useToast';

const InstagramCallback = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { showToast } = useToast();
    const [status, setStatus] = useState('Processing...');

    useEffect(() => {
        const processCallback = async () => {
            // Extract code from URL query parameters
            const searchParams = new URLSearchParams(location.search);
            const code = searchParams.get('code');
            const error = searchParams.get('error');

            if (error) {
                console.error('Instagram auth error:', error);
                showToast('Instagram authentication cancelled or failed', 'error');
                navigate('/login');
                return;
            }

            if (!code) {
                console.error('No code found in callback URL');
                showToast('Invalid callback URL', 'error');
                navigate('/login');
                return;
            }

            try {
                // Determine context: Login or Connect?
                // If user token exists in localStorage, assume it's a "Connect" action from Profile
                const token = localStorage.getItem('token');
                
                // However, there is a edge case where a user might be logged in but clicked "Login with Instagram" 
                // which implies they might want to switch accounts or just re-login. 
                // A safer way is checking a stored "auth_action" in localStorage before redirect if we want to be explicit.
                // For now, simpler heuristic:
                if (token && !authService.isTokenExpired(token)) {
                    setStatus('Connecting Instagram account...');
                    await studentService.connectInstagram(code);
                    showToast('Instagram account connected successfully!', 'success');
                    navigate('/student/profile'); 
                } else {
                    setStatus('Logging in with Instagram...');
                    const data = await authService.loginWithInstagram(code);
                    showToast(`Welcome back, ${data.user?.name || 'User'}!`, 'success');
                    
                    // Redirect based on role
                    if (data.user?.role === 'admin') {
                        navigate('/admin/dashboard');
                    } else if (data.user?.role === 'student' || data.user?.role === 'influencer') {
                        navigate('/student/dashboard');
                    } else {
                        navigate('/dashboard');
                    }
                }
            } catch (err) {
                console.error('Instagram callback processing error:', err);
                showToast(err.message || 'Authentication processing failed', 'error');
                navigate('/login');
            }
        };

        processCallback();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location, navigate]);

    return (
        <Box 
            sx={{ 
                minHeight: '100vh', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                bgcolor: '#f8fafc' 
            }}
        >
            <Container maxWidth="sm">
                <Paper 
                    elevation={3} 
                    sx={{ 
                        p: 4, 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        gap: 3, 
                        borderRadius: 3 
                    }}
                >
                    <CircularProgress size={48} sx={{ color: '#E1306C' }} /> 
                    <Typography variant="h6" color="textPrimary" fontWeight={600}>
                        {status}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" align="center">
                        Please wait while we communicate with Instagram...
                    </Typography>
                </Paper>
            </Container>
        </Box>
    );
};

export default InstagramCallback;
