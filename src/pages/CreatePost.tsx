import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';
import type { Community } from '../types';
import { Image, Type, Link as LinkIcon } from 'lucide-react';
import { cn } from '../lib/utils';

const postSchema = z.object({
  title: z.string().min(1, 'Title is required').max(300, 'Title is too long'),
  content: z.string().optional(),
  link_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  community_id: z.string().min(1, 'Community is required'),
});

type PostForm = z.infer<typeof postSchema>;

export function CreatePost() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get('type') as 'text' | 'image' | 'link' || 'text';
  
  const { user } = useAuthStore();
  const [type, setType] = useState<'text' | 'image' | 'link'>(initialType);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<PostForm>({
    resolver: zodResolver(postSchema),
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchCommunities = async () => {
      const { data } = await supabase.from('communities').select('*');
      if (data) setCommunities(data);
    };

    fetchCommunities();
  }, [user, navigate]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: PostForm) => {
    if (!user) return;
    
    setLoading(true);
    setError(null);

    try {
      let imageUrl = null;

      if (type === 'image' && imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('post_images')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('post_images')
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      const { error: insertError } = await supabase.from('posts').insert({
        community_id: data.community_id,
        user_id: user.id,
        title: data.title,
        content: type === 'text' ? data.content : null,
        type: type,
        image_url: imageUrl,
        link_url: type === 'link' ? data.link_url : null,
      });

      if (insertError) throw insertError;

      const community = communities.find(c => c.id === data.community_id);
      navigate(community ? `/r/${community.name}` : '/');
    } catch (err: any) {
      setError(err.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[740px] px-4 mx-auto">
      <div className="border-b border-gray-200 dark:border-[#343536] pb-4 mb-6">
        <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">Create a post</h1>
      </div>

      <div className="bg-white dark:bg-[#1a1a1b] rounded-md border border-gray-200 dark:border-[#343536] overflow-hidden">
        {/* Post Type Tabs */}
        <div className="flex border-b border-gray-200 dark:border-[#343536]">
          <button
            onClick={() => setType('text')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 font-semibold text-sm transition-colors",
              type === 'text' 
                ? "text-blue-500 border-b-2 border-blue-500 bg-blue-50 dark:bg-blue-900/10" 
                : "text-gray-500 hover:bg-gray-50 dark:hover:bg-[#272729] border-b-2 border-transparent"
            )}
          >
            <Type className="w-5 h-5" /> Post
          </button>
          <button
            onClick={() => setType('image')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 font-semibold text-sm transition-colors",
              type === 'image' 
                ? "text-blue-500 border-b-2 border-blue-500 bg-blue-50 dark:bg-blue-900/10" 
                : "text-gray-500 hover:bg-gray-50 dark:hover:bg-[#272729] border-b-2 border-transparent"
            )}
          >
            <Image className="w-5 h-5" /> Image & Video
          </button>
          <button
            onClick={() => setType('link')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 font-semibold text-sm transition-colors",
              type === 'link' 
                ? "text-blue-500 border-b-2 border-blue-500 bg-blue-50 dark:bg-blue-900/10" 
                : "text-gray-500 hover:bg-gray-50 dark:hover:bg-[#272729] border-b-2 border-transparent"
            )}
          >
            <LinkIcon className="w-5 h-5" /> Link
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
          {error && <div className="text-red-500 text-sm">{error}</div>}

          <div>
            <select
              {...register('community_id')}
              className="w-full sm:w-64 px-3 py-2 bg-white dark:bg-[#272729] border border-gray-200 dark:border-[#343536] rounded-md outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            >
              <option value="">Choose a community</option>
              {communities.map(c => (
                <option key={c.id} value={c.id}>r/{c.name}</option>
              ))}
            </select>
            {errors.community_id && <p className="text-red-500 text-xs mt-1">{errors.community_id.message}</p>}
          </div>

          <div>
            <input
              {...register('title')}
              type="text"
              placeholder="Title"
              className="w-full px-4 py-2 bg-white dark:bg-[#272729] border border-gray-200 dark:border-[#343536] rounded-md outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>

          {type === 'text' && (
            <div>
              <textarea
                {...register('content')}
                rows={6}
                placeholder="Text (optional)"
                className="w-full px-4 py-2 bg-white dark:bg-[#272729] border border-gray-200 dark:border-[#343536] rounded-md outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-y"
              />
            </div>
          )}

          {type === 'link' && (
            <div>
              <input
                {...register('link_url')}
                type="url"
                placeholder="Url"
                className="w-full px-4 py-2 bg-white dark:bg-[#272729] border border-gray-200 dark:border-[#343536] rounded-md outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
              {errors.link_url && <p className="text-red-500 text-xs mt-1">{errors.link_url.message}</p>}
            </div>
          )}

          {type === 'image' && (
            <div className="border-2 border-dashed border-gray-300 dark:border-[#343536] rounded-md p-8 text-center flex flex-col items-center justify-center min-h-[200px]">
              {imagePreview ? (
                <div className="relative">
                  <img src={imagePreview} alt="Preview" className="max-h-[300px] rounded object-contain" />
                  <button 
                    type="button" 
                    onClick={() => { setImageFile(null); setImagePreview(null); }}
                    className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-blue-500 font-semibold mb-2">Drag and drop images or</p>
                  <label className="cursor-pointer bg-white dark:bg-[#272729] text-blue-500 border border-blue-500 px-4 py-1.5 rounded-full font-semibold hover:bg-blue-50 dark:hover:bg-[#343536] transition-colors">
                    Upload
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                </>
              )}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-reddit-orange hover:bg-orange-600 text-white font-bold py-1.5 px-6 rounded-full transition-colors disabled:opacity-50"
            >
              {loading ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
