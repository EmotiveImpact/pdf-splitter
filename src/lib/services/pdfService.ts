import {
  supabase,
  PDFBatch,
  PDFBatchInsert,
  ProcessedPDF,
  ProcessedPDFInsert
} from '../supabase';

export class PDFService {
  // Create a new PDF batch
  static async createBatch(batch: PDFBatchInsert) {
    const { data, error } = await supabase
      .from('pdf_batches')
      .insert(batch)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Update batch status and metrics
  static async updateBatch(batchId: string, updates: Partial<PDFBatch>) {
    const { data, error } = await supabase
      .from('pdf_batches')
      .update(updates)
      .eq('id', batchId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Get all batches for an organization
  static async getBatches(organizationId: string) {
    const { data, error } = await supabase
      .from('pdf_batches')
      .select(
        `
        *,
        processed_pdfs(count)
      `
      )
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  // Get a single batch with its processed PDFs
  static async getBatchWithPDFs(batchId: string) {
    const { data, error } = await supabase
      .from('pdf_batches')
      .select(
        `
        *,
        processed_pdfs(
          *,
          clients(customer_name, email)
        )
      `
      )
      .eq('id', batchId)
      .single();

    if (error) throw error;
    return data;
  }

  // Add processed PDF to batch
  static async addProcessedPDF(pdf: ProcessedPDFInsert) {
    const { data, error } = await supabase
      .from('processed_pdfs')
      .insert(pdf)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Bulk add processed PDFs
  static async bulkAddProcessedPDFs(pdfs: ProcessedPDFInsert[]) {
    const { data, error } = await supabase
      .from('processed_pdfs')
      .insert(pdfs)
      .select();

    if (error) throw error;
    return data;
  }

  // Get processing statistics for an organization
  static async getProcessingStats(organizationId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('pdf_batches')
      .select(
        `
        id,
        status,
        total_pages,
        processed_pages,
        failed_pages,
        processing_time_seconds,
        created_at,
        processed_pdfs(count)
      `
      )
      .eq('organization_id', organizationId)
      .gte('created_at', startDate.toISOString());

    if (error) throw error;

    // Calculate statistics
    const stats = {
      totalBatches: data.length,
      completedBatches: data.filter((b) => b.status === 'completed').length,
      processingBatches: data.filter((b) => b.status === 'processing').length,
      failedBatches: data.filter((b) => b.status === 'failed').length,
      totalPages: data.reduce((sum, b) => sum + (b.total_pages || 0), 0),
      processedPages: data.reduce((sum, b) => sum + b.processed_pages, 0),
      failedPages: data.reduce((sum, b) => sum + b.failed_pages, 0),
      averageProcessingTime: data
        .filter((b) => b.processing_time_seconds)
        .reduce(
          (sum, b, _, arr) =>
            sum + (b.processing_time_seconds || 0) / arr.length,
          0
        ),
      successRate: 0
    };

    if (stats.totalPages > 0) {
      stats.successRate = (stats.processedPages / stats.totalPages) * 100;
    }

    return stats;
  }

  // Get recent processing activity
  static async getRecentActivity(organizationId: string, limit: number = 10) {
    const { data, error } = await supabase
      .from('pdf_batches')
      .select(
        `
        id,
        batch_name,
        original_filename,
        status,
        processed_pages,
        total_pages,
        created_at,
        completed_at,
        user_profiles(full_name)
      `
      )
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  // Upload PDF file to Supabase Storage
  static async uploadPDFFile(file: File, path: string) {
    const { data, error } = await supabase.storage
      .from('processed-pdfs')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;
    return data;
  }

  // Get signed URL for PDF file
  static async getPDFSignedUrl(path: string, expiresIn: number = 3600) {
    const { data, error } = await supabase.storage
      .from('processed-pdfs')
      .createSignedUrl(path, expiresIn);

    if (error) throw error;
    return data;
  }

  // Delete PDF file from storage
  static async deletePDFFile(path: string) {
    const { error } = await supabase.storage
      .from('processed-pdfs')
      .remove([path]);

    if (error) throw error;
  }

  // Complete batch processing
  static async completeBatch(batchId: string, processingTimeSeconds: number) {
    const { data, error } = await supabase
      .from('pdf_batches')
      .update({
        status: 'completed',
        processing_time_seconds: processingTimeSeconds,
        completed_at: new Date().toISOString()
      })
      .eq('id', batchId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Mark batch as failed
  static async failBatch(batchId: string, errorMessage?: string) {
    const { data, error } = await supabase
      .from('pdf_batches')
      .update({
        status: 'failed',
        completed_at: new Date().toISOString()
      })
      .eq('id', batchId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Get PDF processing trends
  static async getProcessingTrends(organizationId: string, days: number = 30) {
    const { data, error } = await supabase
      .from('pdf_batches')
      .select('created_at, processed_pages, status')
      .eq('organization_id', organizationId)
      .gte(
        'created_at',
        new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
      )
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Group by day
    const trends = data.reduce(
      (acc, batch) => {
        const date = new Date(batch.created_at).toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = { date, pages: 0, batches: 0, successful: 0 };
        }
        acc[date].pages += batch.processed_pages;
        acc[date].batches += 1;
        if (batch.status === 'completed') {
          acc[date].successful += 1;
        }
        return acc;
      },
      {} as Record<string, any>
    );

    return Object.values(trends);
  }
}
