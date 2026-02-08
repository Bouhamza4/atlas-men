export type Database = {
    public: {
      Tables: {
        profiles: {
          Row: {
            id: string
            full_name: string | null
            email: string | null
            role: 'user' | 'admin' | 'moderator'
            phone: string | null
            city: string | null
            address: string | null
            last_login: string | null
            created_at: string
            updated_at: string
          }
          Insert: {
            id: string
            full_name?: string | null
            email?: string | null
            role?: 'user' | 'admin' | 'moderator'
            phone?: string | null
            city?: string | null
            address?: string | null
            last_login?: string | null
            created_at?: string
            updated_at?: string
          }
          Update: {
            full_name?: string | null
            email?: string | null
            role?: 'user' | 'admin' | 'moderator'
            phone?: string | null
            city?: string | null
            address?: string | null
            last_login?: string | null
            updated_at?: string
          }
          Relationships: []
        }
  
        categories: {
          Row: {
            id: string
            name: string
            slug: string
            created_at?: string | null
          }
          Insert: {
            id?: string
            name: string
            slug: string
            created_at?: string | null
          }
          Update: {
            name?: string
            slug?: string
            created_at?: string | null
          }
          Relationships: []
        }

        products: {
          Row: {
            id: string
            name: string
            description: string | null
            price: number
            stock: number
            image_url: string | null
            category_id: string | null
          }
          Insert: {
            name: string
            description?: string | null
            price: number
            stock: number
            image_url?: string | null
            category_id?: string | null
          }
          Update: {
            name?: string
            description?: string | null
            price?: number
            stock?: number
            image_url?: string | null
            category_id?: string | null
          }
          Relationships: [
            {
              foreignKeyName: 'products_category_id_fkey'
              columns: ['category_id']
              isOneToOne: false
              referencedRelation: 'categories'
              referencedColumns: ['id']
            }
          ]
        }

        carts: {
          Row: {
            id: string
            user_id: string
          }
          Insert: {
            user_id: string
          }
          Update: {}
          Relationships: []
        }
  
        cart_items: {
          Row: {
            id: string
            cart_id: string
            product_id: string
            quantity: number
          }
          Insert: {
            cart_id: string
            product_id: string
            quantity: number
          }
          Update: {
            quantity?: number
          }
          Relationships: []
        }

        orders: {
          Row: {
            id: string
            user_id: string
            status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
            payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
            payment_method: string
            subtotal: number
            shipping_cost: number
            tax_amount: number
            total: number
            shipping_address: Record<string, any>
            billing_address?: Record<string, any> | null
            stripe_payment_intent_id?: string | null
            stripe_session_id?: string | null
            created_at: string
            updated_at: string
          }
          Insert: {
            id?: string
            user_id: string
            status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
            payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
            payment_method: string
            subtotal: number
            shipping_cost: number
            tax_amount: number
            total: number
            shipping_address: Record<string, any>
            billing_address?: Record<string, any> | null
            stripe_payment_intent_id?: string | null
            stripe_session_id?: string | null
            created_at?: string
            updated_at?: string
          }
          Update: {
            status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
            payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
            payment_method?: string
            subtotal?: number
            shipping_cost?: number
            tax_amount?: number
            total?: number
            shipping_address?: Record<string, any>
            billing_address?: Record<string, any> | null
            stripe_payment_intent_id?: string | null
            stripe_session_id?: string | null
            updated_at?: string
          }
          Relationships: [
            {
              foreignKeyName: 'orders_user_id_fkey'
              columns: ['user_id']
              isOneToOne: false
              referencedRelation: 'profiles'
              referencedColumns: ['id']
            }
          ]
        }

        order_items: {
          Row: {
            id: string
            order_id: string
            product_id: string
            quantity: number
            price: number
            total: number
          }
          Insert: {
            id?: string
            order_id: string
            product_id: string
            quantity: number
            price: number
            total: number
          }
          Update: {
            quantity?: number
            price?: number
            total?: number
          }
          Relationships: [
            {
              foreignKeyName: 'order_items_order_id_fkey'
              columns: ['order_id']
              isOneToOne: false
              referencedRelation: 'orders'
              referencedColumns: ['id']
            },
            {
              foreignKeyName: 'order_items_product_id_fkey'
              columns: ['product_id']
              isOneToOne: false
              referencedRelation: 'products'
              referencedColumns: ['id']
            }
          ]
        }
      }
      Views: {}
      Functions: {}
      Enums: {}
      CompositeTypes: {}
    }
  }
  