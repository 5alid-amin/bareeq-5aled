// ─── Location Constants ──────────────────────────────────────────────────────
export const MAIN_WAREHOUSE = "المستودع الرئيسي";
export const MAIN_GARAGE = "الجراج الرئيسي";

export type PaymentMethod = "كاش" | "فيزا" | "فودافون كاش" | "إنستاباي";

export interface Van {
  id: string;
  driverName: string;
  location: string;
  status: "نشطة" | "تحميل" | "متوقفة" | "صيانة";
  totalSalesToday: number;
  phone: string;
  plate: string;
  openingBalance: number;
  expenses: number;
  workshopName?: string;
}

export function getVanDisplayLocation(van: Van): string {
  switch (van.status) {
    case "نشطة":
      return van.location;
    case "تحميل":
      return MAIN_WAREHOUSE;
    case "متوقفة":
    case "صيانة":
      return MAIN_GARAGE;
    default:
      return van.location;
  }
}

export interface Product {
  id: string;
  name: string;
  category: string;
  costPrice: number;
  sellingPrice: number;
  barcode: string;
  quantity: number;
  minQuantity: number;
}

export interface VanInventoryItem {
  productId: string;
  productName: string;
  quantity: number;
  sellingPrice: number;
  minQuantity: number;
}

export interface Transfer {
  id: string;
  date: string;
  vanId: string;
  vanName: string;
  productName: string;
  quantity: number;
  status: "مكتمل" | "معلق";
}

export interface LoadingOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface LoadingOrder {
  id: string;
  date: string;
  vanId: string;
  vanName: string;
  items: LoadingOrderItem[];
  totalValue: number;
  status: "مكتمل" | "معلق";
}

export interface ReturnOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  reason?: string;
}

export interface ReturnOrder {
  id: string;
  date: string;
  vanId: string;
  vanName: string;
  items: ReturnOrderItem[];
  status: "مكتمل" | "معلق";
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "مدير" | "مدير مخزن" | "مندوب" | "محاسب";
  status: "نشط" | "غير نشط";
  joinDate: string;
}

export interface SalesDataPoint {
  label: string;
  sales: number;
  profit: number;
}

// ─── Vans ───────────────────────────────────────────────────────────────────
export const vans: Van[] = [
  {
    id: "VAN-001",
    driverName: "أحمد محمد السعيد",
    location: "القاهرة - مدينة نصر",
    status: "نشطة",
    totalSalesToday: 4850,
    phone: "0501234567",
    plate: "أ ب ج 1234",
    openingBalance: 1200,
    expenses: 150,
  },
  {
    id: "VAN-002",
    driverName: "محمد علي البحيري",
    location: "القاهرة - الدقي",
    status: "نشطة",
    totalSalesToday: 3620,
    phone: "0509876543",
    plate: "د ه و 5678",
    openingBalance: 900,
    expenses: 80,
  },
  {
    id: "VAN-003",
    driverName: "خالد إبراهيم سلامة",
    location: "القاهرة - المعادي",
    status: "تحميل",
    totalSalesToday: 1200,
    phone: "0555554444",
    plate: "ز ح ط 9012",
    openingBalance: 500,
    expenses: 60,
  },
  {
    id: "VAN-004",
    driverName: "عمر حسن الشاذلي",
    location: "القاهرة - مصر الجديدة",
    status: "متوقفة",
    totalSalesToday: 0,
    phone: "0533332222",
    plate: "ي ك ل 3456",
    openingBalance: 0,
    expenses: 0,
  },
  {
    id: "VAN-005",
    driverName: "سعد عبدالله الشربيني",
    location: "القاهرة - المهندسين",
    status: "صيانة",
    totalSalesToday: 0,
    phone: "0511112222",
    plate: "م ن س 7890",
    openingBalance: 0,
    expenses: 0,
  },
  {
    id: "VAN-006",
    driverName: "فيصل محمد الجمال",
    location: "القاهرة - الزمالك",
    status: "نشطة",
    totalSalesToday: 5200,
    phone: "0566667777",
    plate: "ع غ ف 2345",
    openingBalance: 1500,
    expenses: 200,
  },
];

// ─── Products ────────────────────────────────────────────────────────────────
export const products: Product[] = [
  {
    id: "PRD-001",
    name: "منظف الأطباق سائل ليمون",
    category: "منظفات سائلة",
    costPrice: 8.5,
    sellingPrice: 14.0,
    barcode: "6281001234567",
    quantity: 450,
    minQuantity: 50,
  },
  {
    id: "PRD-002",
    name: "مسحوق غسيل الملابس برايت",
    category: "مساحيق الغسيل",
    costPrice: 22.0,
    sellingPrice: 35.0,
    barcode: "6281009876543",
    quantity: 30,
    minQuantity: 40,
  },
  {
    id: "PRD-003",
    name: "منظف الأرضيات بالصنوبر",
    category: "منظفات عامة",
    costPrice: 12.0,
    sellingPrice: 20.0,
    barcode: "6281005551234",
    quantity: 320,
    minQuantity: 30,
  },
  {
    id: "PRD-004",
    name: "صابون غسيل السيارات",
    category: "منظفات السيارات",
    costPrice: 18.0,
    sellingPrice: 28.0,
    barcode: "6281003334567",
    quantity: 15,
    minQuantity: 25,
  },
  {
    id: "PRD-005",
    name: "منظف الحمام والمرحاض",
    category: "منظفات الحمام",
    costPrice: 9.0,
    sellingPrice: 16.0,
    barcode: "6281007778901",
    quantity: 280,
    minQuantity: 30,
  },
  {
    id: "PRD-006",
    name: "معطر الجو روز",
    category: "معطرات",
    costPrice: 15.0,
    sellingPrice: 25.0,
    barcode: "6281001112345",
    quantity: 8,
    minQuantity: 20,
  },
  {
    id: "PRD-007",
    name: "منظف الزجاج والمرايا",
    category: "منظفات عامة",
    costPrice: 7.5,
    sellingPrice: 13.0,
    barcode: "6281004445678",
    quantity: 190,
    minQuantity: 25,
  },
  {
    id: "PRD-008",
    name: "مبيض الملابس كلور",
    category: "مساحيق الغسيل",
    costPrice: 6.0,
    sellingPrice: 11.0,
    barcode: "6281006669012",
    quantity: 400,
    minQuantity: 50,
  },
  {
    id: "PRD-009",
    name: "صابون اليدين المضاد للبكتيريا",
    category: "منظفات شخصية",
    costPrice: 11.0,
    sellingPrice: 19.0,
    barcode: "6281002223456",
    quantity: 22,
    minQuantity: 30,
  },
  {
    id: "PRD-010",
    name: "منظف المطبخ متعدد الأغراض",
    category: "منظفات المطبخ",
    costPrice: 13.5,
    sellingPrice: 22.0,
    barcode: "6281008887890",
    quantity: 240,
    minQuantity: 25,
  },
];

// ─── Van Inventory ────────────────────────────────────────────────────────────
export const vanInventory: Record<string, VanInventoryItem[]> = {
  "VAN-001": [
    { productId: "PRD-001", productName: "منظف الأطباق سائل ليمون", quantity: 5, sellingPrice: 14.0, minQuantity: 15 },
    { productId: "PRD-003", productName: "منظف الأرضيات بالصنوبر", quantity: 30, sellingPrice: 20.0, minQuantity: 10 },
    { productId: "PRD-005", productName: "منظف الحمام والمرحاض", quantity: 24, sellingPrice: 16.0, minQuantity: 12 },
    { productId: "PRD-008", productName: "مبيض الملابس كلور", quantity: 60, sellingPrice: 11.0, minQuantity: 20 },
  ],
  "VAN-002": [
    { productId: "PRD-002", productName: "مسحوق غسيل الملابس برايت", quantity: 20, sellingPrice: 35.0, minQuantity: 15 },
    { productId: "PRD-007", productName: "منظف الزجاج والمرايا", quantity: 3, sellingPrice: 13.0, minQuantity: 10 },
    { productId: "PRD-010", productName: "منظف المطبخ متعدد الأغراض", quantity: 18, sellingPrice: 22.0, minQuantity: 12 },
  ],
  "VAN-003": [
    { productId: "PRD-004", productName: "صابون غسيل السيارات", quantity: 15, sellingPrice: 28.0, minQuantity: 10 },
    { productId: "PRD-006", productName: "معطر الجو روز", quantity: 1, sellingPrice: 25.0, minQuantity: 10 },
  ],
  "VAN-006": [
    { productId: "PRD-001", productName: "منظف الأطباق سائل ليمون", quantity: 55, sellingPrice: 14.0, minQuantity: 15 },
    { productId: "PRD-002", productName: "مسحوق غسيل الملابس برايت", quantity: 25, sellingPrice: 35.0, minQuantity: 15 },
    { productId: "PRD-005", productName: "منظف الحمام والمرحاض", quantity: 40, sellingPrice: 16.0, minQuantity: 12 },
    { productId: "PRD-009", productName: "صابون اليدين المضاد للبكتيريا", quantity: 30, sellingPrice: 19.0, minQuantity: 10 },
  ],
};

// ─── Transfers ────────────────────────────────────────────────────────────────
export const transfers: Transfer[] = [
  { id: "TRF-001", date: "2026-03-03", vanId: "VAN-001", vanName: "VAN-001 - أحمد السعيد", productName: "منظف الأطباق سائل ليمون", quantity: 48, status: "مكتمل" },
  { id: "TRF-002", date: "2026-03-03", vanId: "VAN-002", vanName: "VAN-002 - محمد البحيري", productName: "مسحوق غسيل الملابس برايت", quantity: 20, status: "مكتمل" },
  { id: "TRF-003", date: "2026-03-02", vanId: "VAN-006", vanName: "VAN-006 - فيصل الجمال", productName: "منظف الحمام والمرحاض", quantity: 40, status: "مكتمل" },
  { id: "TRF-004", date: "2026-03-02", vanId: "VAN-003", vanName: "VAN-003 - خالد سلامة", productName: "صابون غسيل السيارات", quantity: 15, status: "مكتمل" },
  { id: "TRF-005", date: "2026-03-01", vanId: "VAN-001", vanName: "VAN-001 - أحمد السعيد", productName: "مبيض الملابس كلور", quantity: 60, status: "مكتمل" },
  { id: "TRF-006", date: "2026-03-01", vanId: "VAN-002", vanName: "VAN-002 - محمد البحيري", productName: "منظف الزجاج والمرايا", quantity: 35, status: "مكتمل" },
];

// ─── Loading Orders ─────────────────────────────────────────────────────────────
export let loadingOrders: LoadingOrder[] = [
  {
    id: "LO-001",
    date: "2026-03-03T08:30:00Z",
    vanId: "VAN-001",
    vanName: "VAN-001 - أحمد السعيد",
    items: [
      { productId: "PRD-001", productName: "منظف الأطباق سائل ليمون", quantity: 48, unitPrice: 14.0, totalPrice: 672.0 },
      { productId: "PRD-005", productName: "منظف الحمام والمرحاض", quantity: 20, unitPrice: 16.0, totalPrice: 320.0 }
    ],
    totalValue: 992.0,
    status: "مكتمل"
  }
];

// ─── Return Orders ──────────────────────────────────────────────────────────────
export let returnOrders: ReturnOrder[] = [
  {
    id: "RO-001",
    date: "2026-03-02T16:00:00Z",
    vanId: "VAN-002",
    vanName: "VAN-002 - محمد البحيري",
    items: [
      { productId: "PRD-007", productName: "منظف الزجاج والمرايا", quantity: 5, reason: "تالف" }
    ],
    status: "مكتمل"
  }
];

// ─── Users ────────────────────────────────────────────────────────────────────
export const users: User[] = [
  { id: "USR-001", name: "عبدالله فؤاد الشافعي", email: "manager@bareeq.eg", role: "مدير", status: "نشط", joinDate: "2024-01-15" },
  { id: "USR-002", name: "فهد عبد العزيز الصاوي", email: "warehouse@bareeq.eg", role: "مدير مخزن", status: "نشط", joinDate: "2024-02-01" },
  { id: "USR-003", name: "أحمد محمد السعيد", email: "van1@bareeq.eg", role: "مندوب", status: "نشط", joinDate: "2024-03-10" },
  { id: "USR-004", name: "محمد علي البحيري", email: "van2@bareeq.eg", role: "مندوب", status: "نشط", joinDate: "2024-03-10" },
  { id: "USR-005", name: "خالد إبراهيم سلامة", email: "van3@bareeq.eg", role: "مندوب", status: "نشط", joinDate: "2024-04-05" },
  { id: "USR-006", name: "عمر حسن الشاذلي", email: "van4@bareeq.eg", role: "مندوب", status: "غير نشط", joinDate: "2024-04-05" },
  { id: "USR-007", name: "سعد عبدالله الشربيني", email: "van5@bareeq.eg", role: "مندوب", status: "غير نشط", joinDate: "2024-05-20" },
  { id: "USR-008", name: "فيصل محمد الجمال", email: "van6@bareeq.eg", role: "مندوب", status: "نشط", joinDate: "2024-06-01" },
  { id: "USR-009", name: "يوسف أحمد الحكيم", email: "accountant@bareeq.eg", role: "محاسب", status: "نشط", joinDate: "2024-07-01" },
];

// ─── Sales Chart Data ─────────────────────────────────────────────────────────
export const dailySalesData: SalesDataPoint[] = [
  { label: "السبت", sales: 12400, profit: 4200 },
  { label: "الأحد", sales: 15800, profit: 5600 },
  { label: "الاثنين", sales: 13200, profit: 4500 },
  { label: "الثلاثاء", sales: 18600, profit: 6800 },
  { label: "الأربعاء", sales: 16400, profit: 5900 },
  { label: "الخميس", sales: 21000, profit: 7800 },
  { label: "اليوم", sales: 14870, profit: 5320 },
];

export const monthlySalesData: SalesDataPoint[] = [
  { label: "أغسطس", sales: 320000, profit: 98000 },
  { label: "سبتمبر", sales: 285000, profit: 85000 },
  { label: "أكتوبر", sales: 350000, profit: 112000 },
  { label: "نوفمبر", sales: 410000, profit: 138000 },
  { label: "ديسمبر", sales: 390000, profit: 125000 },
  { label: "يناير", sales: 425000, profit: 142000 },
  { label: "فبراير", sales: 398000, profit: 131000 },
  { label: "مارس", sales: 142000, profit: 48000 },
];

// ─── Top Performing Vans ──────────────────────────────────────────────────────
export const topVans = [
  { id: "VAN-006", driver: "فيصل محمد الجمال", sales: 5200, trips: 18, efficiency: 95 },
  { id: "VAN-001", driver: "أحمد محمد السعيد", sales: 4850, trips: 16, efficiency: 91 },
  { id: "VAN-002", driver: "محمد علي البحيري", sales: 3620, trips: 14, efficiency: 85 },
  { id: "VAN-003", driver: "خالد إبراهيم سلامة", sales: 1200, trips: 6, efficiency: 62 },
];

// ─── Low Stock Products ───────────────────────────────────────────────────────
export const lowStockProducts = products.filter((p) => p.quantity < p.minQuantity);

export interface InvoiceItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  date: string;
  vanId: string;
  representativeId: string;
  items: InvoiceItem[];
  paymentMethod: PaymentMethod;
  transferImage?: string;
  total: number;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: "حاضر" | "غائب" | "متأخر" | "إجازة";
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  role: string;
  month: string;
  baseSalary: number;
  deductions: number;
  bonuses: number;
  netPay: number;
  status: "مدفوع" | "معلق";
}

// ─── Invoices ────────────────────────────────────────────────────────────
export let invoices: Invoice[] = [
  {
    id: "INV-001",
    date: "2026-03-03T10:30:00Z",
    vanId: "VAN-001",
    representativeId: "USR-003",
    items: [
      { productId: "PRD-001", productName: "منظف الأطباق سائل ليمون", quantity: 5, unitPrice: 14.0, total: 70.0 },
      { productId: "PRD-003", productName: "منظف الأرضيات بالصنوبر", quantity: 2, unitPrice: 20.0, total: 40.0 },
    ],
    paymentMethod: "كاش",
    total: 110.0,
  },
  {
    id: "INV-002",
    date: "2026-03-03T14:15:00Z",
    vanId: "VAN-001",
    representativeId: "USR-003",
    items: [
      { productId: "PRD-005", productName: "منظف الحمام والمرحاض", quantity: 3, unitPrice: 16.0, total: 48.0 },
    ],
    paymentMethod: "فودافون كاش",
    transferImage: "",
    total: 48.0,
  },
  {
    id: "INV-003",
    date: "2026-03-02T09:00:00Z",
    vanId: "VAN-002",
    representativeId: "USR-004",
    items: [
      { productId: "PRD-002", productName: "مسحوق غسيل الملابس برايت", quantity: 4, unitPrice: 35.0, total: 140.0 },
      { productId: "PRD-010", productName: "منظف المطبخ متعدد الأغراض", quantity: 6, unitPrice: 22.0, total: 132.0 },
    ],
    paymentMethod: "فيزا",
    total: 272.0,
  },
];

// ─── Attendance ─────────────────────────────────────────────────────────
export let attendanceRecords: AttendanceRecord[] = [
  { id: "ATT-001", employeeId: "USR-003", employeeName: "أحمد محمد السعيد", date: "2026-03-03", checkIn: "08:15", checkOut: "17:05", status: "حاضر" },
  { id: "ATT-002", employeeId: "USR-004", employeeName: "محمد علي البحيري", date: "2026-03-03", checkIn: "08:45", checkOut: "17:00", status: "متأخر" },
  { id: "ATT-003", employeeId: "USR-005", employeeName: "خالد إبراهيم سلامة", date: "2026-03-03", checkIn: null, checkOut: null, status: "غائب" },
];

// ─── Payroll ────────────────────────────────────────────────────────────
export let payrollRecords: PayrollRecord[] = [
  { id: "PAY-001", employeeId: "USR-003", employeeName: "أحمد محمد السعيد", role: "مندوب", month: "2026-02", baseSalary: 4500, deductions: 0, bonuses: 500, netPay: 5000, status: "مدفوع" },
  { id: "PAY-002", employeeId: "USR-004", employeeName: "محمد علي البحيري", role: "مندوب", month: "2026-02", baseSalary: 4500, deductions: 200, bonuses: 300, netPay: 4600, status: "مدفوع" },
  { id: "PAY-003", employeeId: "USR-005", employeeName: "خالد إبراهيم سلامة", role: "مندوب", month: "2026-02", baseSalary: 4500, deductions: 500, bonuses: 0, netPay: 4000, status: "مدفوع" },
];
export interface RestockRequestItem {
  productId: string;
  productName: string;
  requestedQty: number;
}

export interface RestockRequest {
  id: string;
  vanId: string;
  representativeId: string;
  representativeName: string;
  items: RestockRequestItem[];
  requestDate: string;
  notes?: string;
  status: "معلق" | "موافق" | "مرفوض" | "تم التسليم";
}

export interface StockMovement {
  id: string;
  restockRequestId: string;
  productId: string;
  productName: string;
  quantity: number;
  toVanId: string;
  date: string;
}

// ─── Restock Requests ─────────────────────────────────────────────────────────
export let restockRequests: RestockRequest[] = [
  {
    id: "REQ-001",
    vanId: "VAN-001",
    representativeId: "USR-003",
    representativeName: "أحمد محمد السعيد",
    items: [
      { productId: "PRD-001", productName: "منظف الأطباق سائل ليمون", requestedQty: 50 },
    ],
    requestDate: "2026-03-03T09:00:00Z",
    notes: "نقص حاد في سائل ليمون",
    status: "معلق",
  },
  {
    id: "REQ-002",
    vanId: "VAN-002",
    representativeId: "USR-004",
    representativeName: "محمد علي البحيري",
    items: [
      { productId: "PRD-007", productName: "منظف الزجاج والمرايا", requestedQty: 30 },
    ],
    requestDate: "2026-03-02T14:30:00Z",
    status: "موافق",
  },
  {
    id: "REQ-003",
    vanId: "VAN-003",
    representativeId: "USR-005",
    representativeName: "خالد إبراهيم سلامة",
    items: [
      { productId: "PRD-006", productName: "معطر الجو روز", requestedQty: 20 },
    ],
    requestDate: "2026-03-01T11:15:00Z",
    status: "تم التسليم",
  },
];

// ─── Stock Movements ──────────────────────────────────────────────────────────
export let stockMovements: StockMovement[] = [
  {
    id: "MOV-001",
    restockRequestId: "REQ-003",
    productId: "PRD-006",
    productName: "معطر الجو روز",
    quantity: 20,
    toVanId: "VAN-003",
    date: "2026-03-01T16:00:00Z",
  },
];

// ─── Accountant Models & Data ──────────────────────────────────────────────────
export interface JournalEntry {
  id: string;
  date: string;
  description: string;
  accountType: "إيرادات" | "مصروفات" | "أصول" | "خصوم" | "حقوق ملكية";
  debit: number;
  credit: number;
}

export let journalEntries: JournalEntry[] = [
  { id: "JE-001", date: "2026-03-03", description: "تحصيل نقدية من المندوب أحمد السعيد", accountType: "إيرادات", debit: 4850, credit: 0 },
  { id: "JE-002", date: "2026-03-03", description: "مصروف صيانة سيارة (VAN-005)", accountType: "مصروفات", debit: 0, credit: 1500 },
  { id: "JE-003", date: "2026-03-02", description: "فاتورة شراء بضاعة نقدية", accountType: "أصول", debit: 12000, credit: 0 },
  { id: "JE-004", date: "2026-03-02", description: "مصروفات بنزين", accountType: "مصروفات", debit: 0, credit: 350 },
];

export interface CashReceipt {
  id: string;
  date: string;
  representativeName: string;
  amount: number;
  notes: string;
  status: "مكتمل" | "معلق";
}

export let cashReceipts: CashReceipt[] = [
  { id: "CR-001", date: "2026-03-03", representativeName: "أحمد محمد السعيد", amount: 4850, notes: "توريد مبيعات اليوم", status: "مكتمل" },
  { id: "CR-002", date: "2026-03-03", representativeName: "محمد علي البحيري", amount: 3620, notes: "توريد مبيعات اليوم", status: "مكتمل" },
  { id: "CR-003", date: "2026-03-02", representativeName: "فيصل محمد الجمال", amount: 5200, notes: "توريد مبيعات اليوم", status: "مكتمل" },
];

export interface ExpenseRecord {
  id: string;
  date: string;
  category: "بنزين" | "تالف" | "مستلزمات سيارات" | "سلف";
  amount: number;
  notes: string;
  status: "مدفوع" | "معلق";
}

export let expenseRecords: ExpenseRecord[] = [
  { id: "EXP-001", date: "2026-03-03", category: "مستلزمات سيارات", amount: 1500, notes: "صيانة وتغيير زيت VAN-005", status: "مدفوع" },
  { id: "EXP-002", date: "2026-03-03", category: "بنزين", amount: 350, notes: "بنزين VAN-001 و VAN-002", status: "مدفوع" },
  { id: "EXP-003", date: "2026-03-02", category: "تالف", amount: 120, notes: "تالف منظف زجاج (2 حبة)", status: "مدفوع" },
  { id: "EXP-004", date: "2026-03-01", category: "سلف", amount: 500, notes: "سلفة للمندوب خالد إبراهيم", status: "مدفوع" },
];
