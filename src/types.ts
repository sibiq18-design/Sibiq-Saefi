export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  companyName?: string;
  role: 'Admin' | 'Sales' | 'Staff Gudang';
  createdAt?: string;
}

export interface TextileItem {
  id: string;
  kode: string;
  namaBarang: string;
  kodeWarna: string;
  namaWarna: string;
  rolls: number[]; // Yardage per roll, e.g., [102.90, 63.70, 109.20]
  hargaSatuan: number; // Price per yard in IDR (e.g., 15250)
  diskonPersen: number; // Percentage discount (e.g., 0)
}

export interface DocumentData {
  companyName: string;
  companySubtitle: string;
  companyAddress: string;
  companyPhone: string;
  
  // Document identifiers
  noSuratJalan: string;
  noBuktiSO: string;
  noInvoice: string;
  noOrder: string;
  noPO: string;
  sales: string;
  
  // Dates
  tanggalSuratJalan: string; // YYYY-MM-DD or formatted string
  tanggalInvoice: string;
  jatuhTempo: string;
  
  // Customer details
  customerName: string;
  customerCompany: string;
  customerAddress: string;
  customerPhone: string;
  
  // Pagination & notes
  halamanSuratJalan: string;
  halamanInvoice: string;
  noteSuratJalan: string;
  noteInvoice: string;
  
  // Items list
  items: TextileItem[];
}

export type ViewMode = 'dashboard' | 'edit' | 'surat_jalan' | 'invoice' | 'print_all' | 'history';
