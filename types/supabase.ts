export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          role: 'user' | 'admin';
          created_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          role?: 'user' | 'admin';
        };
        Update: {
          email?: string | null;
          role?: 'user' | 'admin';
        };
      };

      products: {
        Row: {
          id: string;
          name: string;
          slug: string;
          price: number;
          description: string | null;
          image_url: string | null;
          category_id: string | null;
          created_at: string;
        };
        Insert: {
          name: string;
          slug: string;
          price: number;
          description?: string | null;
          image_url?: string | null;
          category_id?: string | null;
        };
        Update: Partial<this['Insert']>;
      };
    };
  };
};
