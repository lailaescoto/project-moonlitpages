'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../auth-context';
import Link from 'next/link';

export default function SignUpPage() {
  const { createUser } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation 
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }
    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    setLoading(true);
    try {
      await createUser(formData.email, formData.password);
      router.push('/profile'); // Redirect after successful sign-up
    } catch (err) {
      setError(getErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (code) => {
    switch (code) {
      case 'auth/email-already-in-use':
        return 'Email already in use';
      case 'auth/invalid-email':
        return 'Invalid email address';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters';
      default:
        return 'Sign up failed. Please try again';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8">Create Account</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-lg text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email Address
            </label>
            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-yellow-400 focus:outline-none" placeholder="your@email.com"/>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Password
            </label>
            <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required minLength={6} className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-yellow-400 focus:outline-none" placeholder="••••••••"/>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
              Confirm Password
            </label>
            <input type="password" id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required minLength={6} className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-yellow-400 focus:outline-none" placeholder="••••••••"/>
          </div>

          <button type="submit" disabled={loading} className={`w-full py-3 rounded-lg font-semibold transition-colors ${loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-yellow-400 hover:bg-yellow-300 text-black'}`}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link href="/sign-in" className="text-yellow-400 hover:underline">
            Sign in instead
          </Link>
        </div>
      </div>
    </div>
  );
}