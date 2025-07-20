interface ProcessedFile {
  info: {
    customerName: string;
    accountNumber: string;
    fileName: string;
    pageIndex: number;
  };
  blob: Blob;
}

interface MemoryUsage {
  filesCount: number;
  totalBytes: number;
  estimatedSize: string;
  lastUpdated: Date;
}

interface CleanupSettings {
  autoClearAfterDownload: boolean;
  showMemoryUsage: boolean;
  sessionWarnings: boolean;
  manualDeleteButtons: boolean;
  confirmBeforeDelete: boolean;
}

class MemoryManager {
  private static instance: MemoryManager;
  private processedFiles: Map<string, ProcessedFile[]> = new Map();
  private settings: CleanupSettings;
  private sessionId: string;

  private constructor() {
    this.sessionId = `session_${Date.now()}`;
    this.settings = this.loadSettings();
    this.setupSessionWarnings();
  }

  public static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }

  private loadSettings(): CleanupSettings {
    const defaultSettings: CleanupSettings = {
      autoClearAfterDownload: false,
      showMemoryUsage: true,
      sessionWarnings: true,
      manualDeleteButtons: true,
      confirmBeforeDelete: true
    };

    try {
      const saved = localStorage.getItem('pdfCleanupSettings');
      return saved
        ? { ...defaultSettings, ...JSON.parse(saved) }
        : defaultSettings;
    } catch {
      return defaultSettings;
    }
  }

  public updateSettings(newSettings: CleanupSettings): void {
    this.settings = newSettings;
    localStorage.setItem('pdfCleanupSettings', JSON.stringify(newSettings));
  }

  public getSettings(): CleanupSettings {
    return { ...this.settings };
  }

  private setupSessionWarnings(): void {
    if (this.settings.sessionWarnings) {
      window.addEventListener('beforeunload', (event) => {
        if (this.getTotalFilesCount() > 0) {
          event.preventDefault();
          event.returnValue =
            'You have processed PDF files that will be lost if you leave this page.';
          return event.returnValue;
        }
      });
    }
  }

  public storeFiles(batchId: string, files: ProcessedFile[]): void {
    this.processedFiles.set(batchId, files);
    console.log(`📁 Stored ${files.length} files in batch: ${batchId}`);
    this.logMemoryUsage();
  }

  public getFiles(batchId: string): ProcessedFile[] {
    return this.processedFiles.get(batchId) || [];
  }

  public getAllFiles(): ProcessedFile[] {
    const allFiles: ProcessedFile[] = [];
    this.processedFiles.forEach((files) => allFiles.push(...files));
    return allFiles;
  }

  public clearBatch(batchId: string, confirm: boolean = true): boolean {
    if (confirm && this.settings.confirmBeforeDelete) {
      const files = this.processedFiles.get(batchId);
      if (files && files.length > 0) {
        const confirmed = window.confirm(
          `Are you sure you want to delete ${files.length} processed PDF files from memory?`
        );
        if (!confirmed) return false;
      }
    }

    const deleted = this.processedFiles.delete(batchId);
    if (deleted) {
      console.log(`🗑️ Cleared batch: ${batchId}`);
      this.logMemoryUsage();
    }
    return deleted;
  }

  public clearAllFiles(confirm: boolean = true): boolean {
    const totalFiles = this.getTotalFilesCount();

    if (confirm && this.settings.confirmBeforeDelete && totalFiles > 0) {
      const confirmed = window.confirm(
        `Are you sure you want to delete all ${totalFiles} processed PDF files from memory?`
      );
      if (!confirmed) return false;
    }

    this.processedFiles.clear();
    console.log(`🗑️ Cleared all processed files from memory`);
    this.logMemoryUsage();
    return true;
  }

  public getMemoryUsage(): MemoryUsage {
    let totalBytes = 0;
    let filesCount = 0;

    this.processedFiles.forEach((files) => {
      files.forEach((file) => {
        totalBytes += file.blob.size;
        filesCount++;
      });
    });

    return {
      filesCount,
      totalBytes,
      estimatedSize: this.formatBytes(totalBytes),
      lastUpdated: new Date()
    };
  }

  private getTotalFilesCount(): number {
    let count = 0;
    this.processedFiles.forEach((files) => (count += files.length));
    return count;
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }

  private logMemoryUsage(): void {
    const usage = this.getMemoryUsage();
    console.log(
      `💾 Memory Usage: ${usage.filesCount} files, ${usage.estimatedSize}`
    );
  }

  public onDownloadComplete(batchId: string): void {
    if (this.settings.autoClearAfterDownload) {
      console.log(`🔄 Auto-clearing batch after download: ${batchId}`);
      this.clearBatch(batchId, false); // Don't confirm for auto-clear
    }
  }

  public getBatchIds(): string[] {
    return Array.from(this.processedFiles.keys());
  }

  public hasBatch(batchId: string): boolean {
    return this.processedFiles.has(batchId);
  }

  public getBatchInfo(batchId: string): { count: number; size: string } | null {
    const files = this.processedFiles.get(batchId);
    if (!files) return null;

    const totalBytes = files.reduce((sum, file) => sum + file.blob.size, 0);
    return {
      count: files.length,
      size: this.formatBytes(totalBytes)
    };
  }

  // Utility method to create a unique batch ID
  public static createBatchId(): string {
    return `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Clean up resources when needed
  public dispose(): void {
    this.processedFiles.clear();
    window.removeEventListener('beforeunload', this.setupSessionWarnings);
  }
}

// Export singleton instance
export const memoryManager = MemoryManager.getInstance();

// Export types
export type { ProcessedFile, MemoryUsage, CleanupSettings };
export { MemoryManager };
