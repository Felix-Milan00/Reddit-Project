import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';

const communitySchema = z.object({
  name: z.string()
    .min(3, 'Name must be at least 3 characters')
    .max(21, 'Name must be at most 21 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores are allowed'),
  display_name: z.string().min(1, 'Display name is required'),
  description: z.string().optional(),
});

type CommunityForm = z.infer<typeof communitySchema>;

export function CreateCommunity() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<CommunityForm>({
    resolver: zodResolver(communitySchema),
  });

  if (!user) {
    navigate('/login');
    return null;
  }

  const onSubmit = async (data: CommunityForm) => {
    setLoading(true);
    setError(null);

    try {
      // 1. Check if name exists (optional but good for user experience, supabase will also fail on unique constraint)
      const { data: existing } = await supabase
        .from('communities')
        .select('name')
        .eq('name', data.name)
        .single();
        
      if (existing) {
        throw new Error(`Community r/${data.name} already exists.`);
      }

      // 2. Create community
      const { data: newCommunity, error: createError } = await supabase
        .from('communities')
        .insert({
          name: data.name.toLowerCase(),
          display_name: data.display_name,
          description: data.description,
          created_by: user.id
        })
        .select()
        .single();

      if (createError) throw createError;

      // 3. Add user as admin member
      if (newCommunity) {
         await supabase.from('community_members').insert({
            user_id: user.id,
            community_id: newCommunity.id,
            role: 'admin'
         });
         
         // Redirect to the new community
         navigate(`/r/${newCommunity.name}`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create community');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[740px] px-4 mx-auto">
      <div className="border-b border-gray-200 dark:border-[#343536] pb-4 mb-6">
        <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">Create a community</h1>
      </div>

      <div className="bg-white dark:bg-[#1a1a1b] p-6 rounded-md border border-gray-200 dark:border-[#343536]">
        {error && <div className="mb-4 text-red-500 text-sm font-semibold">{error}</div>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block font-semibold text-gray-900 dark:text-gray-100 mb-1">Name</label>
            <p className="text-xs text-gray-500 mb-2">Community names including capitalization cannot be changed.</p>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">r/</span>
              <input
                {...register('name')}
                type="text"
                className={`w-full pl-7 pr-4 py-2 bg-white dark:bg-[#272729] border ${errors.name ? 'border-red-500' : 'border-gray-200 dark:border-[#343536]'} rounded-md outline-none focus:ring-1 focus:ring-blue-500 transition-colors`}
              />
            </div>
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block font-semibold text-gray-900 dark:text-gray-100 mb-1">Display Name</label>
            <p className="text-xs text-gray-500 mb-2">The title of your community that shows up on the page.</p>
            <input
              {...register('display_name')}
              type="text"
              className={`w-full px-4 py-2 bg-white dark:bg-[#272729] border ${errors.display_name ? 'border-red-500' : 'border-gray-200 dark:border-[#343536]'} rounded-md outline-none focus:ring-1 focus:ring-blue-500 transition-colors`}
            />
            {errors.display_name && <p className="text-red-500 text-xs mt-1">{errors.display_name.message}</p>}
          </div>

          <div>
            <label className="block font-semibold text-gray-900 dark:text-gray-100 mb-1">Description</label>
            <p className="text-xs text-gray-500 mb-2">Brief description about your community.</p>
            <textarea
              {...register('description')}
              rows={4}
              className="w-full px-4 py-2 bg-white dark:bg-[#272729] border border-gray-200 dark:border-[#343536] rounded-md outline-none focus:ring-1 focus:ring-blue-500 transition-colors resize-y"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-[#343536]">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-1.5 font-bold text-blue-500 border border-blue-500 rounded-full hover:bg-blue-50 dark:hover:bg-[#272729] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-1.5 font-bold text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Community'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
