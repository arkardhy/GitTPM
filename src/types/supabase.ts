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
      employees: {
        Row: {
          id: string
          name: string
          position: string
          join_date: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          position: string
          join_date: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          position?: string
          join_date?: string
          created_at?: string
        }
      }
      working_hours: {
        Row: {
          id: string
          employee_id: string
          date: string
          check_in: string
          check_out: string | null
          total_hours: number
          created_at: string
        }
        Insert: {
          id?: string
          employee_id: string
          date: string
          check_in: string
          check_out?: string | null
          total_hours?: number
          created_at?: string
        }
        Update: {
          id?: string
          employee_id?: string
          date?: string
          check_in?: string
          check_out?: string | null
          total_hours?: number
          created_at?: string
        }
      }
      leave_requests: {
        Row: {
          id: string
          employee_id: string
          start_date: string
          end_date: string
          reason: string
          status: 'pending' | 'approved' | 'rejected'
          created_at: string
        }
        Insert: {
          id?: string
          employee_id: string
          start_date: string
          end_date: string
          reason: string
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
        }
        Update: {
          id?: string
          employee_id?: string
          start_date?: string
          end_date?: string
          reason?: string
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
        }
      }
      resignation_requests: {
        Row: {
          id: string
          employee_id: string
          passport: string
          reason_ic: string
          reason_ooc: string
          request_date: string
          status: 'pending' | 'approved' | 'rejected'
          created_at: string
        }
        Insert: {
          id?: string
          employee_id: string
          passport: string
          reason_ic: string
          reason_ooc: string
          request_date: string
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
        }
        Update: {
          id?: string
          employee_id?: string
          passport?: string
          reason_ic?: string
          reason_ooc?: string
          request_date?: string
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
        }
      }
    }
  }
}