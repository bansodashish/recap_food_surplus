// Simple CSV Upload Service

export interface CSVUploadResult {
  success: number;
  failed: number;
  errors: string[];
  items: any[];
}

export interface SimpleCSVRow {
  name: string;
  description?: string;
  category: string;
  condition: string;
  type: string;
  price?: string;
  quantity?: string;
  unit?: string;
  expiryDate?: string;
  address?: string;
  city?: string;
  zipCode?: string;
}

class CSVUploadService {
  parseCSV(csvContent: string): SimpleCSVRow[] {
    const lines = csvContent.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV must contain at least a header row and one data row');
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
    const rows: SimpleCSVRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      const row: any = {};

      headers.forEach((header, index) => {
        const value = values[index]?.trim().replace(/"/g, '') || '';
        
        switch (header) {
          case 'name':
          case 'title':
            row.name = value;
            break;
          case 'description':
          case 'desc':
            row.description = value;
            break;
          case 'category':
            row.category = value;
            break;
          case 'condition':
            row.condition = value;
            break;
          case 'type':
            row.type = value;
            break;
          case 'price':
            row.price = value;
            break;
          case 'quantity':
          case 'qty':
            row.quantity = value;
            break;
          case 'unit':
            row.unit = value;
            break;
          case 'expirydate':
          case 'expiry_date':
          case 'expiry':
            row.expiryDate = value;
            break;
          case 'address':
            row.address = value;
            break;
          case 'city':
            row.city = value;
            break;
          case 'zipcode':
          case 'zip_code':
          case 'zip':
            row.zipCode = value;
            break;
        }
      });

      if (row.name) {
        rows.push(row);
      }
    }

    return rows;
  }

  private parseCSVLine(line: string): string[] {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current);
    return result;
  }

  async uploadFromCSV(
    csvContent: string, 
    maxItems: number, 
    onProgress: (current: number, total: number) => void
  ): Promise<CSVUploadResult> {
    const rows = this.parseCSV(csvContent);
    const result: CSVUploadResult = {
      success: 0,
      failed: 0,
      errors: [],
      items: []
    };

    if (rows.length > maxItems) {
      result.errors.push(`CSV contains ${rows.length} items, but your plan allows only ${maxItems} items.`);
      return result;
    }

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      onProgress(i + 1, rows.length);

      try {
        // Simulate item creation - replace with actual API call
        const newItem = {
          ...row,
          id: `csv-${Date.now()}-${i}`,
          createdAt: new Date().toISOString()
        };

        result.items.push(newItem);
        result.success++;
      } catch (error) {
        result.failed++;
        result.errors.push(`Row ${i + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return result;
  }

  generateTemplate(): string {
    const headers = [
      'name',
      'description', 
      'category',
      'condition',
      'type',
      'price',
      'quantity',
      'unit',
      'expiryDate',
      'address',
      'city',
      'zipCode'
    ];

    const sampleRows = [
      [
        'Fresh Apples',
        'Organic red apples from local farm',
        'produce',
        'good',
        'sale',
        '3.99',
        '5',
        'kg',
        '2024-08-20',
        '123 Farm St',
        'Cityville',
        '12345'
      ]
    ];

    const csvLines = [
      headers.join(','),
      ...sampleRows.map(row => row.map(cell => `"${cell}"`).join(','))
    ];

    return csvLines.join('\n');
  }
}

export const csvUploadService = new CSVUploadService();
