import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { User, Lock, Mail, Eye, EyeOff, X } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/store';
import { login, register } from '@/store/slices/authSlice';
import { setModalState } from '@/store/slices/uiSlice';

export const AuthModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.ui.modals.auth);
  const authLoading = useAppSelector((state) => state.auth.loading);
  const authError = useAppSelector((state) => state.auth.error);
  
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.password.trim()) newErrors.password = 'Password is required';
    
    if (isRegister) {
      if (!formData.name.trim()) newErrors.name = 'Name is required';
      if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
      if (!formData.confirmPassword.trim()) newErrors.confirmPassword = 'Confirm password is required';
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      if (isRegister) {
        // Mock API call for register
        const response = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
          }),
        });
        
        if (response.ok) {
          const userData = await response.json();
          dispatch(register(userData));
          handleClose();
        } else {
          const errorData = await response.json();
          setErrors({ submit: errorData.message || 'Registration failed' });
        }
      } else {
        // Mock API call for login
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        });
        
        if (response.ok) {
          const userData = await response.json();
          dispatch(login(userData));
          handleClose();
        } else {
          const errorData = await response.json();
          setErrors({ submit: errorData.message || 'Invalid credentials' });
        }
      }
    } catch (error) {
      setErrors({ submit: 'Network error. Please try again.' });
    }
  };

  const handleClose = () => {
    dispatch(setModalState({ modal: 'auth', visible: false }));
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
    setErrors({});
    setIsRegister(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Clear auth errors when switching between login/register
  useEffect(() => {
    setErrors({});
  }, [isRegister]);

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleClose}>
      <Dialog.Portal>
        <Dialog.Overlay 
          className="fixed inset-0 bg-black/50 dark:bg-black/70" 
          data-testid="modal-overlay"
        />
        <Dialog.Content 
          className="fixed left-1/2 top-1/2 max-h-[90vh] w-[95vw] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-auto rounded-lg bg-white dark:bg-gray-800 p-6 shadow-xl"
        >
          <Dialog.Description className="sr-only">
            {isRegister ? 'Register for a new account' : 'Login to your account'}
          </Dialog.Description>
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {isRegister ? 'Register' : 'Login'}
            </Dialog.Title>
            <button
              onClick={handleClose}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mb-6">
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-sm text-sirsi-500 hover:underline"
            >
              {isRegister ? 'Already have an account? Sign In' : 'New here? Register now'}
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sirsi-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Enter your name"
                />
                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500 dark:text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sirsi-500 dark:bg-gray-700 dark:text-gray-100 ${
                    errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500 dark:text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`w-full pl-10 pr-12 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sirsi-500 dark:bg-gray-700 dark:text-gray-100 ${
                    errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
            </div>

            {isRegister && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500 dark:text-gray-400" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={`w-full pl-10 pr-12 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sirsi-500 dark:bg-gray-700 dark:text-gray-100 ${
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    aria-label="Toggle confirm password visibility"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>}
              </div>
            )}

            {errors.submit && (
              <div className="text-sm text-red-500">
                {errors.submit}
              </div>
            )}

            {authError && (
              <div className="text-sm text-red-500">
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className={`w-full py-2 px-4 rounded-md text-white font-medium focus:outline-none focus:ring-2 focus:ring-sirsi-500 ${
                authLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-sirsi-500 hover:bg-sirsi-600'
              }`}
            >
              {authLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  {isRegister ? 'Creating Account...' : 'Signing In...'}
                </div>
              ) : (
                isRegister ? 'Register' : 'Sign In'
              )}
            </button>

            {isRegister ? (
              <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
                By registering, you agree to our{' '}
                <a href="#" className="text-sirsi-500 hover:underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-sirsi-500 hover:underline">
                  Privacy Policy
                </a>
                .
              </p>
            ) : (
              <p className="mt-4 text-center text-sm text-sirsi-500">
                Forgot password?{' '}
                <a href="#" className="hover:underline">
                  Reset here
                </a>
              </p>
            )}
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

