export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      advance_salary: {
        Row: {
          amount: number;
          created_at: string;
          date: string;
          employee_id: string;
          id: string;
          reason: string | null;
          settled: boolean;
        };
        Insert: {
          amount: number;
          created_at?: string;
          date?: string;
          employee_id: string;
          id?: string;
          reason?: string | null;
          settled?: boolean;
        };
        Update: {
          amount?: number;
          created_at?: string;
          date?: string;
          employee_id?: string;
          id?: string;
          reason?: string | null;
          settled?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "advance_salary_employee_id_fkey";
            columns: ["employee_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
        ];
      };
      attendance: {
        Row: {
          created_at: string;
          date: string;
          employee_id: string;
          id: string;
          notes: string | null;
          status: Database["public"]["Enums"]["attendance_status"];
        };
        Insert: {
          created_at?: string;
          date?: string;
          employee_id: string;
          id?: string;
          notes?: string | null;
          status?: Database["public"]["Enums"]["attendance_status"];
        };
        Update: {
          created_at?: string;
          date?: string;
          employee_id?: string;
          id?: string;
          notes?: string | null;
          status?: Database["public"]["Enums"]["attendance_status"];
        };
        Relationships: [
          {
            foreignKeyName: "attendance_employee_id_fkey";
            columns: ["employee_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
        ];
      };
      employees: {
        Row: {
          age: number | null;
          created_at: string;
          created_by: string | null;
          employee_type: Database["public"]["Enums"]["employee_type"];
          full_name: string;
          gender: Database["public"]["Enums"]["gender_type"] | null;
          id: string;
          joining_date: string;
          phone: string | null;
          profile_image: string | null;
          salary: number;
          updated_at: string;
        };
        Insert: {
          age?: number | null;
          created_at?: string;
          created_by?: string | null;
          employee_type?: Database["public"]["Enums"]["employee_type"];
          full_name: string;
          gender?: Database["public"]["Enums"]["gender_type"] | null;
          id?: string;
          joining_date?: string;
          phone?: string | null;
          profile_image?: string | null;
          salary?: number;
          updated_at?: string;
        };
        Update: {
          age?: number | null;
          created_at?: string;
          created_by?: string | null;
          employee_type?: Database["public"]["Enums"]["employee_type"];
          full_name?: string;
          gender?: Database["public"]["Enums"]["gender_type"] | null;
          id?: string;
          joining_date?: string;
          phone?: string | null;
          profile_image?: string | null;
          salary?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      part_time_work_logs: {
        Row: {
          id: string;
          worker_id: string;
          client_name: string;
          working_date: string;
          slab_quantity: number;
          slab_price: number;
          total_price: number;
          delivery_location: string | null;
          advance_paid: number;
          remaining_balance: number;
          payment_status: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          worker_id: string;
          client_name: string;
          working_date?: string;
          slab_quantity?: number;
          slab_price?: number;
          delivery_location?: string | null;
          advance_paid?: number;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          worker_id?: string;
          client_name?: string;
          working_date?: string;
          slab_quantity?: number;
          slab_price?: number;
          delivery_location?: string | null;
          advance_paid?: number;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "part_time_work_logs_worker_id_fkey";
            columns: ["worker_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          full_name: string | null;
          id: string;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          full_name?: string | null;
          id: string;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          full_name?: string | null;
          id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      salary_records: {
        Row: {
          absent_days: number;
          advance_salary: number;
          created_at: string;
          daily_salary: number;
          deducted_amount: number;
          employee_id: string;
          final_salary: number;
          id: string;
          month: number;
          monthly_salary: number;
          notes: string | null;
          payment_date: string | null;
          payment_status: Database["public"]["Enums"]["payment_status"];
          updated_at: string;
          year: number;
        };
        Insert: {
          absent_days?: number;
          advance_salary?: number;
          created_at?: string;
          daily_salary: number;
          deducted_amount?: number;
          employee_id: string;
          final_salary: number;
          id?: string;
          month: number;
          monthly_salary: number;
          notes?: string | null;
          payment_date?: string | null;
          payment_status?: Database["public"]["Enums"]["payment_status"];
          updated_at?: string;
          year: number;
        };
        Update: {
          absent_days?: number;
          advance_salary?: number;
          created_at?: string;
          daily_salary?: number;
          deducted_amount?: number;
          employee_id?: string;
          final_salary?: number;
          id?: string;
          month?: number;
          monthly_salary?: number;
          notes?: string | null;
          payment_date?: string | null;
          payment_status?: Database["public"]["Enums"]["payment_status"];
          updated_at?: string;
          year?: number;
        };
        Relationships: [
          {
            foreignKeyName: "salary_records_employee_id_fkey";
            columns: ["employee_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
        ];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: "admin" | "user";
      attendance_status: "present" | "absent";
      employee_type: "full_time" | "part_time";
      gender_type: "male" | "female" | "other";
      payment_status: "pending" | "paid" | "partial";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      attendance_status: ["present", "absent"],
      employee_type: ["full_time", "part_time"],
      gender_type: ["male", "female", "other"],
      payment_status: ["pending", "paid", "partial"],
    },
  },
} as const;
