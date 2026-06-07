/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CompanyProfile {
  name: string;
  regNo: string;
  addressLines: string[];
  tel: string;
  fax: string;
}

export interface CustomerProfile {
  id?: string;
  name: string;
  addressLines: string[];
  tel: string;
  fax: string;
  attn: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  uom: string;
  qty: number;
  unitPrice: number;
  discount: number; // Flat discount amount in RM or percent? Let's use flat RM or percent.
  discountType: 'flat' | 'percent';
}

export interface Invoice {
  id: string;
  invoiceType: 'PURCHASE INVOICE' | 'SALES INVOICE' | 'DELIVERY ORDER' | 'CASH BILL';
  invoiceNo: string;
  grnNo?: string;
  terms: string;
  date: string;
  page: string;
  issuer: CompanyProfile;
  customer: CustomerProfile;
  items: InvoiceItem[];
  authorisedSignBy?: string;
  createdAt: string;
}

export interface SavedPresetItem {
  id: string;
  description: string;
  uom: string;
  unitPrice: number;
}
