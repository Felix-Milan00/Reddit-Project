export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  karma: number;
  created_at: string;
}

export interface Community {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  banner_url: string | null;
  avatar_url: string | null;
  rules: string | null;
  created_by: string | null;
  created_at: string;
  
  // Joined/Computed fields
  member_count?: number;
  post_count?: number;
}

export interface Post {
  id: string;
  community_id: string;
  user_id: string;
  title: string;
  content: string | null;
  type: 'text' | 'image' | 'link';
  image_url: string | null;
  link_url: string | null;
  score: number;
  comment_count: number;
  created_at: string;
  
  // Joined fields
  author?: Profile;
  community?: Community;
  user_vote?: number; // 1, -1, or 0/undefined
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  score: number;
  created_at: string;

  // Joined fields
  author?: Profile;
  user_vote?: number;
  replies?: Comment[];
}
