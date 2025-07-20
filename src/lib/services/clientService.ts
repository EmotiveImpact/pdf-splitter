import { supabase, Client, ClientInsert, ClientUpdate } from '../supabase';

export class ClientService {
  // Get all clients for an organization
  static async getClients(organizationId: string) {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  // Get a single client by ID
  static async getClient(id: string) {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  // Get client by account number
  static async getClientByAccountNumber(
    organizationId: string,
    accountNumber: string
  ) {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('account_number', accountNumber)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
    return data;
  }

  // Create a new client
  static async createClient(client: ClientInsert) {
    const { data, error } = await supabase
      .from('clients')
      .insert(client)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Update a client
  static async updateClient(id: string, updates: ClientUpdate) {
    const { data, error } = await supabase
      .from('clients')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Delete a client
  static async deleteClient(id: string) {
    const { error } = await supabase.from('clients').delete().eq('id', id);

    if (error) throw error;
  }

  // Bulk import clients from CSV data
  static async bulkImportClients(
    organizationId: string,
    clients: Omit<ClientInsert, 'organization_id'>[]
  ) {
    const clientsWithOrgId = clients.map((client) => ({
      ...client,
      organization_id: organizationId
    }));

    const { data, error } = await supabase
      .from('clients')
      .upsert(clientsWithOrgId, {
        onConflict: 'organization_id,account_number',
        ignoreDuplicates: false
      })
      .select();

    if (error) throw error;
    return data;
  }

  // Search clients
  static async searchClients(organizationId: string, searchTerm: string) {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('organization_id', organizationId)
      .or(
        `customer_name.ilike.%${searchTerm}%,account_number.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`
      )
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  // Get client statistics
  static async getClientStats(organizationId: string) {
    const { data, error } = await supabase
      .from('clients')
      .select('status, email, phone')
      .eq('organization_id', organizationId);

    if (error) throw error;

    const stats = {
      total: data.length,
      active: data.filter((c) => c.status === 'active').length,
      inactive: data.filter((c) => c.status === 'inactive').length,
      suspended: data.filter((c) => c.status === 'suspended').length,
      withEmail: data.filter((c) => c.email).length,
      withPhone: data.filter((c) => c.phone).length
    };

    return stats;
  }

  // Update client activity
  static async updateClientActivity(clientId: string) {
    const { error } = await supabase
      .from('clients')
      .update({
        last_activity: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', clientId);

    if (error) throw error;
  }

  // Increment client counters
  static async incrementClientCounters(
    clientId: string,
    type: 'statements' | 'emails'
  ) {
    const field =
      type === 'statements'
        ? 'total_statements_processed'
        : 'total_emails_sent';

    const { error } = await supabase.rpc('increment_client_counter', {
      client_id: clientId,
      counter_field: field
    });

    if (error) throw error;
  }
}

// SQL function to increment counters (needs to be created in Supabase)
/*
CREATE OR REPLACE FUNCTION increment_client_counter(client_id UUID, counter_field TEXT)
RETURNS VOID AS $$
BEGIN
  IF counter_field = 'total_statements_processed' THEN
    UPDATE clients 
    SET total_statements_processed = total_statements_processed + 1,
        last_activity = NOW(),
        updated_at = NOW()
    WHERE id = client_id;
  ELSIF counter_field = 'total_emails_sent' THEN
    UPDATE clients 
    SET total_emails_sent = total_emails_sent + 1,
        last_activity = NOW(),
        updated_at = NOW()
    WHERE id = client_id;
  END IF;
END;
$$ LANGUAGE plpgsql;
*/
