import { useCallback } from 'react';
import { toast } from 'react-toastify';

/**
 * Custom hook for managing toast notifications using React-Toastify
 * @returns {object} { showToast }
 */
export const useToast = () => {
  const showToast = useCallback((message, type = 'success') => {
    const options = {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      draggable: true,
    };

    switch (type) {
      case 'success':
        toast.success(message, options);
        break;
      case 'error':
        toast.error(message, options);
        break;
      case 'warning':
        toast.warning(message, options);
        break;
      case 'info':
        toast.info(message, options);
        break;
      default:
        toast(message, options);
    }
  }, []);

  return { showToast };
};
