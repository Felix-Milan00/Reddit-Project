import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '../lib/supabase';
import { AlertCircle } from 'lucide-react';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(20, 'Username too long'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type RegisterForm = z.infer<typeof registerSchema>;

export function Register() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            username: data.username,
            full_name: data.username, // Default to username
          }
        }
      });

      if (error) throw error;
      
      // Usually supabase auto-logs in if email confirmation is off, but we can just redirect to home
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-[#1a1a1b] rounded-xl shadow-md p-8 border border-gray-200 dark:border-[#343536]">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-reddit-orange mb-4">
            <span className="text-white font-bold text-2xl">r</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sign Up</h1>
          <p className="text-sm text-gray-500 mt-2">By continuing, you are setting up a Reddit account and agree to our User Agreement and Privacy Policy.</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-md flex items-center gap-2 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <input
              {...register('email')}
              type="email"
              placeholder="Email"
              className={`w-full px-4 py-3 bg-gray-50 dark:bg-[#272729] border ${errors.email ? 'border-red-500' : 'border-gray-200 dark:border-[#343536]'} rounded-full outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all dark:text-white`}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1 ml-4">{errors.email.message}</p>}
          </div>

          <div>
            <input
              {...register('username')}
              type="text"
              placeholder="Username"
              className={`w-full px-4 py-3 bg-gray-50 dark:bg-[#272729] border ${errors.username ? 'border-red-500' : 'border-gray-200 dark:border-[#343536]'} rounded-full outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all dark:text-white`}
            />
            {errors.username && <p className="text-red-500 text-xs mt-1 ml-4">{errors.username.message}</p>}
          </div>

          <div>
            <input
              {...register('password')}
              type="password"
              placeholder="Password"
              className={`w-full px-4 py-3 bg-gray-50 dark:bg-[#272729] border ${errors.password ? 'border-red-500' : 'border-gray-200 dark:border-[#343536]'} rounded-full outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all dark:text-white`}
            />
            {errors.password && <p className="text-red-500 text-xs mt-1 ml-4">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-reddit-orange hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-full transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          Already a redditor?{' '}
          <Link to="/login" className="font-semibold text-blue-600 hover:underline">
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}
