export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      assets: {
        Row: {
          account_number: string | null
          amount: number
          created_at: string | null
          currency: string | null
          id: string
          institution_name: string | null
          type: Database["public"]["Enums"]["asset_type"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_number?: string | null
          amount: number
          created_at?: string | null
          currency?: string | null
          id?: string
          institution_name?: string | null
          type: Database["public"]["Enums"]["asset_type"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_number?: string | null
          amount?: number
          created_at?: string | null
          currency?: string | null
          id?: string
          institution_name?: string | null
          type?: Database["public"]["Enums"]["asset_type"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          created_at: string | null
          id: string
          new_data: Json | null
          old_data: Json | null
          operation: string
          record_id: string
          table_name: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          operation: string
          record_id: string
          table_name: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          operation?: string
          record_id?: string
          table_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      beneficiaries: {
        Row: {
          contact_email: string | null
          created_at: string | null
          date_of_birth: string | null
          full_name: string
          id: string
          is_primary: boolean | null
          percentage: number | null
          relationship: Database["public"]["Enums"]["relationship_type"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          contact_email?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          full_name: string
          id?: string
          is_primary?: boolean | null
          percentage?: number | null
          relationship: Database["public"]["Enums"]["relationship_type"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          contact_email?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          full_name?: string
          id?: string
          is_primary?: boolean | null
          percentage?: number | null
          relationship?: Database["public"]["Enums"]["relationship_type"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "beneficiaries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      consultations: {
        Row: {
          consultant_id: string | null
          created_at: string | null
          date: string
          id: string
          meeting_url: string | null
          notes: string | null
          status: Database["public"]["Enums"]["consultation_status"] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          consultant_id?: string | null
          created_at?: string | null
          date: string
          id?: string
          meeting_url?: string | null
          notes?: string | null
          status?: Database["public"]["Enums"]["consultation_status"] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          consultant_id?: string | null
          created_at?: string | null
          date?: string
          id?: string
          meeting_url?: string | null
          notes?: string | null
          status?: Database["public"]["Enums"]["consultation_status"] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "consultations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      debts: {
        Row: {
          balance: number
          created_at: string | null
          debt_type: Database["public"]["Enums"]["debt_type"]
          due_date: string | null
          id: string
          interest_rate: number | null
          monthly_payment: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          balance: number
          created_at?: string | null
          debt_type: Database["public"]["Enums"]["debt_type"]
          due_date?: string | null
          id?: string
          interest_rate?: number | null
          monthly_payment?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string | null
          debt_type?: Database["public"]["Enums"]["debt_type"]
          due_date?: string | null
          id?: string
          interest_rate?: number | null
          monthly_payment?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "debts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string | null
          encryption_key: string | null
          file_url: string | null
          id: string
          is_template: boolean | null
          metadata: Json | null
          mime_type: string | null
          ocr_text: string | null
          renewal_date: string | null
          size_bytes: number | null
          tags: string[] | null
          type: Database["public"]["Enums"]["document_type"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          encryption_key?: string | null
          file_url?: string | null
          id?: string
          is_template?: boolean | null
          metadata?: Json | null
          mime_type?: string | null
          ocr_text?: string | null
          renewal_date?: string | null
          size_bytes?: number | null
          tags?: string[] | null
          type: Database["public"]["Enums"]["document_type"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          encryption_key?: string | null
          file_url?: string | null
          id?: string
          is_template?: boolean | null
          metadata?: Json | null
          mime_type?: string | null
          ocr_text?: string | null
          renewal_date?: string | null
          size_bytes?: number | null
          tags?: string[] | null
          type?: Database["public"]["Enums"]["document_type"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      income_sources: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          end_date: string | null
          frequency: Database["public"]["Enums"]["income_frequency"]
          id: string
          source_type: string
          start_date: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          end_date?: string | null
          frequency: Database["public"]["Enums"]["income_frequency"]
          id?: string
          source_type: string
          start_date?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          end_date?: string | null
          frequency?: Database["public"]["Enums"]["income_frequency"]
          id?: string
          source_type?: string
          start_date?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "income_sources_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      investment_options: {
        Row: {
          asset_class: string
          created_at: string | null
          description: string | null
          expense_ratio: number | null
          id: string
          name: string
          performance_1y: number | null
          performance_3y: number | null
          performance_5y: number | null
          region: string
          risk_level: number | null
          symbol: string
          type: string
          updated_at: string | null
        }
        Insert: {
          asset_class: string
          created_at?: string | null
          description?: string | null
          expense_ratio?: number | null
          id?: string
          name: string
          performance_1y?: number | null
          performance_3y?: number | null
          performance_5y?: number | null
          region?: string
          risk_level?: number | null
          symbol: string
          type: string
          updated_at?: string | null
        }
        Update: {
          asset_class?: string
          created_at?: string | null
          description?: string | null
          expense_ratio?: number | null
          id?: string
          name?: string
          performance_1y?: number | null
          performance_3y?: number | null
          performance_5y?: number | null
          region?: string
          risk_level?: number | null
          symbol?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          link: string | null
          message: string
          read: boolean
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          link?: string | null
          message: string
          read?: boolean
          title: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          link?: string | null
          message?: string
          read?: boolean
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      portfolio_allocations: {
        Row: {
          asset_class: string
          created_at: string | null
          current_percentage: number | null
          id: string
          rebalance_threshold: number | null
          target_percentage: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          asset_class: string
          created_at?: string | null
          current_percentage?: number | null
          id?: string
          rebalance_threshold?: number | null
          target_percentage: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          asset_class?: string
          created_at?: string | null
          current_percentage?: number | null
          id?: string
          rebalance_threshold?: number | null
          target_percentage?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      portfolio_performance: {
        Row: {
          benchmark_return: number | null
          created_at: string | null
          daily_return: number | null
          date: string
          id: string
          total_return: number | null
          total_value: number
          user_id: string
        }
        Insert: {
          benchmark_return?: number | null
          created_at?: string | null
          daily_return?: number | null
          date: string
          id?: string
          total_return?: number | null
          total_value: number
          user_id: string
        }
        Update: {
          benchmark_return?: number | null
          created_at?: string | null
          daily_return?: number | null
          date?: string
          id?: string
          total_return?: number | null
          total_value?: number
          user_id?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: Json
          created_at: string | null
          estimated_value: number | null
          id: string
          mortgage_balance: number | null
          mortgage_rate: number | null
          property_type: Database["public"]["Enums"]["property_type"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address: Json
          created_at?: string | null
          estimated_value?: number | null
          id?: string
          mortgage_balance?: number | null
          mortgage_rate?: number | null
          property_type: Database["public"]["Enums"]["property_type"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: Json
          created_at?: string | null
          estimated_value?: number | null
          id?: string
          mortgage_balance?: number | null
          mortgage_rate?: number | null
          property_type?: Database["public"]["Enums"]["property_type"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "properties_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      retirement_savings: {
        Row: {
          account_type: Database["public"]["Enums"]["account_type"]
          balance: number
          contribution_amount: number | null
          contribution_frequency:
            | Database["public"]["Enums"]["income_frequency"]
            | null
          created_at: string | null
          id: string
          institution_name: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_type: Database["public"]["Enums"]["account_type"]
          balance: number
          contribution_amount?: number | null
          contribution_frequency?:
            | Database["public"]["Enums"]["income_frequency"]
            | null
          created_at?: string | null
          id?: string
          institution_name?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_type?: Database["public"]["Enums"]["account_type"]
          balance?: number
          contribution_amount?: number | null
          contribution_frequency?:
            | Database["public"]["Enums"]["income_frequency"]
            | null
          created_at?: string | null
          id?: string
          institution_name?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "retirement_savings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          accessibility: Json | null
          created_at: string | null
          currency: string | null
          id: string
          language: string | null
          notifications: Json | null
          privacy: Json | null
          theme: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          accessibility?: Json | null
          created_at?: string | null
          currency?: string | null
          id?: string
          language?: string | null
          notifications?: Json | null
          privacy?: Json | null
          theme?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          accessibility?: Json | null
          created_at?: string | null
          currency?: string | null
          id?: string
          language?: string | null
          notifications?: Json | null
          privacy?: Json | null
          theme?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      translations: {
        Row: {
          created_at: string
          id: string
          key: string
          language: string
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          language: string
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          language?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          address: Json | null
          country: string | null
          created_at: string | null
          currency: string | null
          date_of_birth: string | null
          email: string
          full_name: string | null
          id: string
          phone: string | null
          ssn: string | null
          updated_at: string | null
        }
        Insert: {
          address?: Json | null
          country?: string | null
          created_at?: string | null
          currency?: string | null
          date_of_birth?: string | null
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          ssn?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: Json | null
          country?: string | null
          created_at?: string | null
          currency?: string | null
          date_of_birth?: string | null
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          ssn?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      account_type:
        | "401k"
        | "403b"
        | "ira"
        | "roth_ira"
        | "pension"
        | "sep_ira"
        | "simple_ira"
      asset_type:
        | "checking"
        | "savings"
        | "investment"
        | "retirement"
        | "crypto"
        | "other"
      consultation_status:
        | "scheduled"
        | "completed"
        | "cancelled"
        | "rescheduled"
      debt_type:
        | "mortgage"
        | "credit_card"
        | "auto_loan"
        | "student_loan"
        | "personal_loan"
        | "other"
      document_type:
        | "will"
        | "trust"
        | "insurance_policy"
        | "tax_return"
        | "bank_statement"
        | "investment_statement"
        | "other"
      income_frequency:
        | "weekly"
        | "biweekly"
        | "monthly"
        | "quarterly"
        | "annually"
      property_type:
        | "primary_residence"
        | "vacation_home"
        | "rental_property"
        | "land"
        | "commercial"
      relationship_type:
        | "spouse"
        | "child"
        | "parent"
        | "sibling"
        | "friend"
        | "other"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      account_type: [
        "401k",
        "403b",
        "ira",
        "roth_ira",
        "pension",
        "sep_ira",
        "simple_ira",
      ],
      asset_type: [
        "checking",
        "savings",
        "investment",
        "retirement",
        "crypto",
        "other",
      ],
      consultation_status: [
        "scheduled",
        "completed",
        "cancelled",
        "rescheduled",
      ],
      debt_type: [
        "mortgage",
        "credit_card",
        "auto_loan",
        "student_loan",
        "personal_loan",
        "other",
      ],
      document_type: [
        "will",
        "trust",
        "insurance_policy",
        "tax_return",
        "bank_statement",
        "investment_statement",
        "other",
      ],
      income_frequency: [
        "weekly",
        "biweekly",
        "monthly",
        "quarterly",
        "annually",
      ],
      property_type: [
        "primary_residence",
        "vacation_home",
        "rental_property",
        "land",
        "commercial",
      ],
      relationship_type: [
        "spouse",
        "child",
        "parent",
        "sibling",
        "friend",
        "other",
      ],
    },
  },
} as const
