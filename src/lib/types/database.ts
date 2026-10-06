export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      wallets: {
        Row: {
          id: string
          user_id: string
          name: string
          balance: number
          type: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          balance?: number
          type?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          balance?: number
          type?: string
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          user_id: string
          name: string
          type: 'income' | 'expense'
          icon: string | null
          color: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type: 'income' | 'expense'
          icon?: string | null
          color?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          type?: 'income' | 'expense'
          icon?: string | null
          color?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          wallet_id: string | null
          dest_wallet_id: string | null
          category_id: string | null
          amount: number
          type: 'income' | 'expense' | 'transfer'
          merchant: string | null
          note: string | null
          tags: string[]
          date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          wallet_id?: string | null
          dest_wallet_id?: string | null
          category_id?: string | null
          amount: number
          type: 'income' | 'expense' | 'transfer'
          merchant?: string | null
          note?: string | null
          tags?: string[]
          date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          wallet_id?: string | null
          dest_wallet_id?: string | null
          category_id?: string | null
          amount?: number
          type?: 'income' | 'expense' | 'transfer'
          merchant?: string | null
          note?: string | null
          tags?: string[]
          date?: string
          created_at?: string
          updated_at?: string
        }
      }
      receipts: {
        Row: {
          id: string
          transaction_id: string
          image_url: string
          merchant_name: string | null
          parsed_data: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          transaction_id: string
          image_url: string
          merchant_name?: string | null
          parsed_data?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          transaction_id?: string
          image_url?: string
          merchant_name?: string | null
          parsed_data?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      budgets: {
        Row: {
          id: string
          user_id: string
          category_id: string
          amount: number
          period: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id: string
          amount: number
          period?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: string
          amount?: number
          period?: string
          created_at?: string
          updated_at?: string
        }
      }
      goals: {
        Row: {
          id: string
          user_id: string
          name: string
          target_amount: number
          current_amount: number
          target_date: string | null
          priority: 'low' | 'medium' | 'high'
          icon: string | null
          color: string | null
          status: string
          is_recurring?: boolean
          recurrence_interval?: string | null
          template_key?: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          name: string
          target_amount: number
          current_amount?: number
          target_date?: string | null
          priority?: 'low' | 'medium' | 'high'
          icon?: string | null
          color?: string | null
          status?: string
          is_recurring?: boolean
          recurrence_interval?: string | null
          template_key?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          target_amount?: number
          current_amount?: number
          target_date?: string | null
          priority?: 'low' | 'medium' | 'high'
          icon?: string | null
          color?: string | null
          status?: string
          is_recurring?: boolean
          recurrence_interval?: string | null
          template_key?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      goal_contributions: {
        Row: {
          id: string
          goal_id: string
          amount: number
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          goal_id: string
          amount: number
          date?: string
          created_at?: string
        }
        Update: {
          id?: string
          goal_id?: string
          amount?: number
          date?: string
          created_at?: string
        }
      }
      recurring_rules: {
        Row: {
          id: string
          user_id: string
          transaction_template: Json
          frequency: string
          next_run: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          transaction_template: Json
          frequency: string
          next_run: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          transaction_template?: Json
          frequency?: string
          next_run?: string
          created_at?: string
          updated_at?: string
        }
      }
      vehicles: {
        Row: {
          id: string
          user_id: string
          name: string
          brand: string | null
          model: string | null
          year: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          brand?: string | null
          model?: string | null
          year?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          brand?: string | null
          model?: string | null
          year?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      vehicle_services: {
        Row: {
          id: string
          vehicle_id: string
          service_date: string
          description: string
          cost: number
          mileage: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          vehicle_id: string
          service_date: string
          description: string
          cost: number
          mileage?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          vehicle_id?: string
          service_date?: string
          description?: string
          cost?: number
          mileage?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      chat_threads: {
        Row: {
          id: string
          user_id: string
          title: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      chat_messages: {
        Row: {
          id: string
          thread_id: string
          role: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          thread_id: string
          role: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          thread_id?: string
          role?: string
          content?: string
          created_at?: string
        }
      }
      debts: {
        Row: {
          id: string
          user_id: string
          name: string
          amount: number
          type: string
          due_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          amount: number
          type: string
          due_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          amount?: number
          type?: string
          due_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      assets: {
        Row: {
          id: string
          user_id: string
          name: string
          value: number
          type: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          value: number
          type: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          value?: number
          type?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Wallet = Database['public']['Tables']['wallets']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type Transaction = Database['public']['Tables']['transactions']['Row']
export type Receipt = Database['public']['Tables']['receipts']['Row']
export type Budget = Database['public']['Tables']['budgets']['Row']
export type Goal = Database['public']['Tables']['goals']['Row']
export type GoalContribution = Database['public']['Tables']['goal_contributions']['Row']
export type RecurringRule = Database['public']['Tables']['recurring_rules']['Row']
export type Vehicle = Database['public']['Tables']['vehicles']['Row']
export type VehicleService = Database['public']['Tables']['vehicle_services']['Row']
export type ChatThread = Database['public']['Tables']['chat_threads']['Row']
export type ChatMessage = Database['public']['Tables']['chat_messages']['Row']
export type Debt = Database['public']['Tables']['debts']['Row']
export type Asset = Database['public']['Tables']['assets']['Row']
