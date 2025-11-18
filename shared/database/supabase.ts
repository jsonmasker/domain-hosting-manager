import { createClient } from '@supabase/supabase-js'
import type { DatabaseConnection } from './connection'
import type { APIResponse } from '../types/database'

export interface SupabaseConfig {
  url: string
  anonKey: string
  serviceRoleKey?: string
}

export const getSupabaseConfig = (): SupabaseConfig => {
  // Check environment variables
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase configuration. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.')
  }

  return {
    url: supabaseUrl,
    anonKey: supabaseAnonKey,
    serviceRoleKey: supabaseServiceKey
  }
}

export class SupabaseConnection implements DatabaseConnection {
  private client: any
  private serviceClient: any

  constructor(config: SupabaseConfig) {
    // Regular client for public operations
    this.client = createClient(config.url, config.anonKey)
    
    // Service role client for admin operations (if available)
    if (config.serviceRoleKey) {
      this.serviceClient = createClient(config.url, config.serviceRoleKey)
    }
  }

  async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    try {
      // For Supabase, we'll convert SQL to query builder calls
      // This is a simplified approach - in production you'd use stored procedures or edge functions
      const tableName = this.extractTableFromQuery(sql)
      
      if (!tableName) {
        throw new Error('Could not extract table name from query')
      }

      // Handle different query types
      if (sql.toUpperCase().includes('COUNT(*)')) {
        const { count, error } = await this.client
          .from(tableName)
          .select('*', { count: 'exact', head: true })
        
        if (error) throw error
        return [{ count }] as T[]
      }

      // Handle JOIN queries (like domain with client info)
      if (sql.toUpperCase().includes('JOIN')) {
        return this.handleJoinQuery(sql, params) as T[]
      }

      // Basic SELECT query
      const { data, error } = await this.client
        .from(tableName)
        .select('*')
      
      if (error) throw error
      return (data || []) as T[]
    } catch (error) {
      console.error('Query error:', error)
      throw error
    }
  }

  async queryOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
    const results = await this.query<T>(sql, params)
    return results.length > 0 ? results[0] : null
  }

  async execute(sql: string, params: any[] = []): Promise<{ changes: number; lastInsertRowid: number | string }> {
    try {
      const upperSql = sql.toUpperCase().trim()
      const tableName = this.extractTableFromQuery(sql)
      
      if (!tableName) {
        throw new Error('Could not extract table name from query')
      }

      if (upperSql.startsWith('INSERT')) {
        return this.handleInsert(sql, params, tableName)
      } else if (upperSql.startsWith('UPDATE')) {
        return this.handleUpdate(sql, params, tableName)
      } else if (upperSql.startsWith('DELETE')) {
        return this.handleDelete(sql, params, tableName)
      } else if (upperSql.startsWith('CREATE TABLE')) {
        // Tables should be created through Supabase dashboard or migrations
        console.log('Table creation should be done through Supabase dashboard')
        return { changes: 0, lastInsertRowid: 0 }
      }
      
      return { changes: 0, lastInsertRowid: 0 }
    } catch (error) {
      console.error('Execute error:', error)
      throw error
    }
  }

  async transaction<T>(callback: (conn: DatabaseConnection) => Promise<T>): Promise<T> {
    // Supabase doesn't support explicit transactions in the same way
    // Each operation is atomic by default
    return callback(this)
  }

  async close(): Promise<void> {
    // Supabase client doesn't need explicit closing
  }

  private extractTableFromQuery(sql: string): string | null {
    // Extract table name from various SQL patterns
    const patterns = [
      /FROM\s+(\w+)/i,
      /INSERT INTO\s+(\w+)/i,
      /UPDATE\s+(\w+)/i,
      /DELETE FROM\s+(\w+)/i
    ]

    for (const pattern of patterns) {
      const match = sql.match(pattern)
      if (match) {
        return match[1].toLowerCase()
      }
    }
    return null
  }

  private async handleJoinQuery(sql: string, params: any[]): Promise<any[]> {
    // Handle specific JOIN patterns we use in the app
    if (sql.includes('domains d JOIN clients c')) {
      const { data, error } = await this.client
        .from('domains')
        .select(`
          *,
          clients!inner (
            id,
            full_name,
            email,
            company_name
          )
        `)
      
      if (error) throw error
      
      // Transform the result to match expected format
      return (data || []).map((domain: any) => ({
        ...domain,
        client_name: domain.clients?.full_name,
        client_email: domain.clients?.email,
        client_company: domain.clients?.company_name
      }))
    }

    if (sql.includes('hosting h JOIN clients c')) {
      const { data, error } = await this.client
        .from('hosting')
        .select(`
          *,
          clients!inner (
            id,
            full_name,
            email,
            company_name
          )
        `)
      
      if (error) throw error
      
      return (data || []).map((hosting: any) => ({
        ...hosting,
        client_name: hosting.clients?.full_name,
        client_email: hosting.clients?.email,
        client_company: hosting.clients?.company_name
      }))
    }

    // Fallback to basic query
    const tableName = this.extractTableFromQuery(sql)
    if (tableName) {
      const { data, error } = await this.client
        .from(tableName)
        .select('*')
      
      if (error) throw error
      return data || []
    }

    return []
  }

  private async handleInsert(sql: string, params: any[], tableName: string): Promise<{ changes: number; lastInsertRowid: number | string }> {
    // Extract column names and values from INSERT statement
    const columnMatch = sql.match(/\(([^)]+)\)/i)
    if (!columnMatch) {
      throw new Error('Could not parse INSERT statement columns')
    }

    const columns = columnMatch[1].split(',').map(col => col.trim())
    const record: any = {}
    
    columns.forEach((col, index) => {
      if (params[index] !== undefined) {
        record[col] = params[index]
      }
    })

    const { data, error } = await this.client
      .from(tableName)
      .insert(record)
      .select()
    
    if (error) throw error
    
    return {
      changes: 1,
      lastInsertRowid: data?.[0]?.id || 'generated-id'
    }
  }

  private async handleUpdate(sql: string, params: any[], tableName: string): Promise<{ changes: number; lastInsertRowid: number | string }> {
    // This is a simplified implementation
    // In production, you'd parse the WHERE clause and SET values properly
    const { error } = await this.client
      .from(tableName)
      .update({}) // Would need to parse SET values
      .eq('id', params[params.length - 1]) // Assuming last param is ID
    
    if (error) throw error
    
    return { changes: 1, lastInsertRowid: 0 }
  }

  private async handleDelete(sql: string, params: any[], tableName: string): Promise<{ changes: number; lastInsertRowid: number | string }> {
    // Simplified DELETE implementation
    const { error } = await this.client
      .from(tableName)
      .delete()
      .eq('id', params[0]) // Assuming first param is ID
    
    if (error) throw error
    
    return { changes: 1, lastInsertRowid: 0 }
  }
}
