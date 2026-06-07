/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Invoice, InvoiceItem, CompanyProfile, CustomerProfile, SavedPresetItem } from '../types';
import { DEFAULT_COMPANY, DEFAULT_CUSTOMERS, DEFAULT_PRESET_ITEMS } from '../presets';
import { Plus, Trash2, Calendar, UserPlus, FileText, ChevronDown, ChevronUp, Copy, HelpCircle, Archive } from 'lucide-react';
import { SignaturePad } from './SignaturePad';

interface InvoiceFormProps {
  invoice: Invoice;
  onChange: (updated: Invoice) => void;
  onLoadInvoice: (loaded: Invoice) => void;
  savedInvoices: Invoice[];
  onSaveCurrentInvoice: () => void;
  onDeleteInvoice: (id: string) => void;
  t: any;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({
  invoice,
  onChange,
  onLoadInvoice,
  savedInvoices,
  onSaveCurrentInvoice,
  onDeleteInvoice,
  t
}) => {
  // Collapsible accordion states
  const [openSection, setOpenSection] = useState<'items' | 'issuer' | 'customer' | 'meta' | 'saved' | 'signature'>('items');

  // Input states for creating a custom brand-new item
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemUom, setNewItemUom] = useState('KG');
  const [newItemQty, setNewItemQty] = useState<number>(1);
  const [newItemPrice, setNewItemPrice] = useState<number>(0);
  const [newItemDisc, setNewItemDisc] = useState<number>(0);
  const [newItemDiscType, setNewItemDiscType] = useState<'flat' | 'percent'>('flat');

  const toggleSection = (section: 'items' | 'issuer' | 'customer' | 'meta' | 'saved' | 'signature') => {
    setOpenSection(openSection === section ? 'items' : section);
  };

  const updateIssuer = (fields: Partial<CompanyProfile>) => {
    onChange({
      ...invoice,
      issuer: { ...invoice.issuer, ...fields }
    });
  };

  const updateCustomer = (fields: Partial<CustomerProfile>) => {
    onChange({
      ...invoice,
      customer: { ...invoice.customer, ...fields }
    });
  };

  const handleCustomerPresetSelect = (idx: number) => {
    const selected = DEFAULT_CUSTOMERS[idx];
    updateCustomer({
      name: selected.name,
      addressLines: [...selected.addressLines],
      tel: selected.tel,
      fax: selected.fax,
      attn: selected.attn
    });
  };

  const updateMeta = (fields: Partial<Invoice>) => {
    onChange({
      ...invoice,
      ...fields
    });
  };

  // Add Item logic
  const handleAddItem = (desc: string, uom: string, qty: number, price: number, discount = 0, distype: 'flat' | 'percent' = 'flat') => {
    if (!desc.trim()) return;
    
    const newItem: InvoiceItem = {
      id: 'item_' + Date.now() + Math.random().toString(36).substr(2, 4),
      description: desc,
      uom: uom || 'KG',
      qty: Math.max(0.1, qty),
      unitPrice: Math.max(0, price),
      discount: Math.max(0, discount),
      discountType: distype
    };

    onChange({
      ...invoice,
      items: [...invoice.items, newItem]
    });
  };

  const handleCustomAddAndReset = (e: React.FormEvent) => {
    e.preventDefault();
    handleAddItem(newItemDesc, newItemUom, newItemQty, newItemPrice, newItemDisc, newItemDiscType);
    setNewItemDesc('');
    setNewItemQty(1);
    setNewItemPrice(0);
    setNewItemDisc(0);
  };

  // Quick preset click handler
  const handleQuickAddPreset = (preset: SavedPresetItem) => {
    handleAddItem(preset.description, preset.uom, 10, preset.unitPrice); // default 10 units for speed
  };

  // Delete item
  const handleDeleteItem = (id: string) => {
    onChange({
      ...invoice,
      items: invoice.items.filter(item => item.id !== id)
    });
  };

  // Update specific field inside item list
  const handleUpdateItemField = (id: string, field: keyof InvoiceItem, value: any) => {
    const updatedItems = invoice.items.map(item => {
      if (item.id === id) {
        return {
          ...item,
          [field]: value
        };
      }
      return item;
    });
    onChange({
      ...invoice,
      items: updatedItems
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC] text-slate-800 overflow-y-auto no-print" id="invoice-workspace-form">
      
      {/* Hero Section styled with Dark Emerald Brand Style */}
      <div className="p-5 bg-gradient-to-br from-[#024c38] to-slate-900 border-b border-emerald-950 shrink-0 text-white shadow-sm font-sans" id="form-brand-hero">
        <h1 className="text-sm font-bold tracking-tight flex items-center gap-2">
          <FileText className="text-emerald-400 shrink-0" size={18} />
          <span>Malaysia Invoice Data Workspace</span>
        </h1>
        <p className="text-[11px] text-emerald-100/80 mt-1 font-sans leading-relaxed">
          Issue billing invoices, compile print-ready receipts, or export formatted high-density Malaysia Excel spreadsheets.
        </p>
      </div>

      {/* Editor Panel content with high density containers */}
      <div className="p-4 space-y-4 flex-1 font-sans">

        {/* SECTION: SAVED INVOICES & HISTORY */}
        <div className="border border-slate-200 rounded-lg bg-white overflow-hidden shadow-sm hover:shadow-md transition">
          <button
            onClick={() => toggleSection('saved')}
            className="w-full px-4 py-3 bg-white hover:bg-slate-50 flex justify-between items-center transition"
            id="accordion-btn-saved"
          >
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
              <Archive size={14} className="text-emerald-600" />
              <span>{t.savedInvoices} ({savedInvoices.length})</span>
            </div>
            {openSection === 'saved' ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
          </button>

          {openSection === 'saved' && (
            <div className="p-3 bg-slate-50 border-t border-slate-200 space-y-2 max-h-[220px] overflow-y-auto">
              <div className="flex justify-between items-center gap-2 mb-2 font-sans">
                <p className="text-[10px] text-slate-500 font-medium">Preserve your current billing draft locally:</p>
                <button
                  onClick={onSaveCurrentInvoice}
                  className="px-2.5 py-1 text-[10px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded transition shadow-sm"
                  id="save-current-invoice-btn"
                >
                  {t.saveDraft}
                </button>
              </div>

              {savedInvoices.length === 0 ? (
                <div className="text-center py-4 bg-white rounded border border-dashed border-slate-300 text-slate-400 text-xs">
                  No saved invoices found. Save current draft to preserve history!
                </div>
              ) : (
                <div className="space-y-1">
                  {savedInvoices.map((inv) => (
                    <div 
                      key={inv.id} 
                      className="p-2.5 bg-white hover:bg-slate-50 rounded border border-slate-200 flex justify-between items-center text-xs gap-3 transition shadow-sm"
                    >
                      <div className="flex-1 min-w-0 cursor-pointer text-left" onClick={() => onLoadInvoice(inv)}>
                        <p className="font-bold text-slate-900 truncate">{inv.customer.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                          {inv.invoiceNo} &bull; {inv.date} &bull; RM {inv.items.reduce((sum, i) => sum + i.qty * i.unitPrice - (i.discountType === 'percent' ? (i.qty * i.unitPrice * i.discount) : i.discount), 0).toFixed(2)}
                        </p>
                      </div>
                      <button
                        onClick={() => onDeleteInvoice(inv.id)}
                        className="text-slate-400 hover:text-red-650 p-1 rounded hover:bg-slate-100 transition"
                        title="Delete invoice history"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* SECTION 1: INVOICE META & LABELS */}
        <div className="border border-slate-200 rounded-lg bg-white overflow-hidden shadow-sm hover:shadow-md transition">
          <button
            onClick={() => toggleSection('meta')}
            className="w-full px-4 py-3 bg-white hover:bg-slate-50 flex justify-between items-center transition"
            id="accordion-btn-meta"
          >
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
              <Calendar size={14} className="text-slate-500" />
              <span>1. {t.invoiceMeta}</span>
            </div>
            {openSection === 'meta' ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
          </button>

          {openSection === 'meta' && (
            <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3 font-sans">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">
                    Document Type
                  </label>
                  <select
                    className="w-full bg-white border border-slate-200 text-xs rounded p-2 text-slate-850 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-sans font-bold"
                    value={invoice.invoiceType}
                    onChange={(e: any) => updateMeta({ invoiceType: e.target.value })}
                  >
                    <option value="PURCHASE INVOICE">PURCHASE INVOICE</option>
                    <option value="SALES INVOICE">SALES INVOICE</option>
                    <option value="DELIVERY ORDER">DELIVERY ORDER</option>
                    <option value="CASH BILL">CASH BILL</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">
                    Invoice No.
                  </label>
                  <input
                    type="text"
                    className="w-full bg-white border border-slate-200 text-xs rounded p-2 text-slate-850 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono font-bold"
                    value={invoice.invoiceNo}
                    onChange={(e) => updateMeta({ invoiceNo: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">
                    Date
                  </label>
                  <input
                    type="text"
                    placeholder="01/06/2026"
                    className="w-full bg-white border border-slate-200 text-xs rounded p-2 text-slate-850 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono text-center font-bold"
                    value={invoice.date}
                    onChange={(e) => updateMeta({ date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">
                    Terms
                  </label>
                  <input
                    type="text"
                    placeholder="C.O.D."
                    className="w-full bg-white border border-slate-200 text-xs rounded p-2 text-slate-850 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-sans font-bold text-center"
                    value={invoice.terms}
                    onChange={(e) => updateMeta({ terms: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">
                    Our GRN No.
                  </label>
                  <input
                    type="text"
                    placeholder="Optional"
                    className="w-full bg-white border border-slate-200 text-xs rounded p-2 text-slate-850 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono text-center"
                    value={invoice.grnNo || ''}
                    onChange={(e) => updateMeta({ grnNo: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">
                    Pages
                  </label>
                  <input
                    type="text"
                    placeholder="1 of 1"
                    className="w-full bg-white border border-slate-200 text-xs rounded p-2 text-slate-850 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-sans font-bold text-center"
                    value={invoice.page}
                    onChange={(e) => updateMeta({ page: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">
                    Authorised Signature By
                  </label>
                  <input
                    type="text"
                    placeholder="Name e.g., 3776"
                    className="w-full bg-white border border-slate-200 text-xs rounded p-2 text-slate-850 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-sans font-semibold"
                    value={invoice.authorisedSignBy || ''}
                    onChange={(e) => updateMeta({ authorisedSignBy: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 2: BILL TO (RECIPIENT) DETAILS */}
        <div className="border border-slate-200 rounded-lg bg-white overflow-hidden shadow-sm hover:shadow-md transition">
          <button
            onClick={() => toggleSection('customer')}
            className="w-full px-4 py-3 bg-white hover:bg-slate-50 flex justify-between items-center transition"
            id="accordion-btn-customer"
          >
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
              <UserPlus size={14} className="text-slate-500" />
              <span>2. {t.clientDetails}</span>
            </div>
            {openSection === 'customer' ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
          </button>

          {openSection === 'customer' && (
            <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3 font-sans">
              {/* Client Presets */}
              <div className="mb-2">
                <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">
                  Load Saved Customer Preset
                </label>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {DEFAULT_CUSTOMERS.map((cust, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleCustomerPresetSelect(idx)}
                      type="button"
                      className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-[10px] font-semibold text-slate-700 rounded transition shadow-sm font-bold"
                    >
                      {cust.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">
                  Customer / Vendor Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., HAPPY FRUIT PLANTING"
                  className="w-full bg-white border border-slate-200 text-xs rounded p-2 text-slate-850 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-sans font-bold"
                  value={invoice.customer.name}
                  onChange={(e) => updateCustomer({ name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">
                  Customer Address (One line per row)
                </label>
                <textarea
                  rows={3}
                  placeholder={`LC 450, TAMAN SENTOSA,\nJALAN PAYAMAS, 84900 TANGKAK,\nJOHOR.`}
                  className="w-full bg-white border border-slate-200 text-xs rounded p-2 text-slate-850 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-sans leading-normal font-bold"
                  value={invoice.customer.addressLines.join('\n')}
                  onChange={(e) => updateCustomer({ addressLines: e.target.value.split('\n') })}
                ></textarea>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">
                    Tel No.
                  </label>
                  <input
                    type="text"
                    placeholder="01165282811"
                    className="w-full bg-white border border-slate-200 text-xs rounded p-2 text-slate-850 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono font-bold"
                    value={invoice.customer.tel}
                    onChange={(e) => updateCustomer({ tel: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">
                    Fax No.
                  </label>
                  <input
                    type="text"
                    placeholder="Optional"
                    className="w-full bg-white border border-slate-200 text-xs rounded p-2 text-slate-850 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
                    value={invoice.customer.fax}
                    onChange={(e) => updateCustomer({ fax: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">
                    Attn (Reference)
                  </label>
                  <input
                    type="text"
                    placeholder="3776"
                    className="w-full bg-white border border-slate-200 text-xs rounded p-2 text-emerald-805 font-bold outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono text-center font-bold"
                    value={invoice.customer.attn}
                    onChange={(e) => updateCustomer({ attn: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 3: MY COMPANY (ISSUER) PROFILE */}
        <div className="border border-slate-200 rounded-lg bg-white overflow-hidden shadow-sm hover:shadow-md transition">
          <button
            onClick={() => toggleSection('issuer')}
            className="w-full px-4 py-3 bg-white hover:bg-slate-50 flex justify-between items-center transition"
            id="accordion-btn-issuer"
          >
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
              <FileText size={14} className="text-slate-500" />
              <span>3. {t.issuerProfile}</span>
            </div>
            {openSection === 'issuer' ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
          </button>

          {openSection === 'issuer' && (
            <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3 font-sans">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    className="w-full bg-white border border-slate-200 text-xs rounded p-2 text-slate-850 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-sans font-bold"
                    value={invoice.issuer.name}
                    onChange={(e) => updateIssuer({ name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">
                    Registration No (Reg No)
                  </label>
                  <input
                    type="text"
                    placeholder="202203124085"
                    className="w-full bg-white border border-slate-200 text-xs rounded p-2 text-slate-850 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono font-bold"
                    value={invoice.issuer.regNo}
                    onChange={(e) => updateIssuer({ regNo: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">
                  Company Head Office Address
                </label>
                <textarea
                  rows={2}
                  className="w-full bg-white border border-slate-200 text-xs rounded p-2 text-slate-850 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-sans font-semibold"
                  value={invoice.issuer.addressLines.join('\n')}
                  onChange={(e) => updateIssuer({ addressLines: e.target.value.split('\n') })}
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">
                    Tel Phone
                  </label>
                  <input
                    type="text"
                    className="w-full bg-white border border-slate-200 text-xs rounded p-2 text-slate-850 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
                    value={invoice.issuer.tel}
                    onChange={(e) => updateIssuer({ tel: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">
                    Fax Line
                  </label>
                  <input
                    type="text"
                    placeholder="Optional"
                    className="w-full bg-white border border-slate-200 text-xs rounded p-2 text-slate-850 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
                    value={invoice.issuer.fax}
                    onChange={(e) => updateIssuer({ fax: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 4: ITEMS LIST (출单 CORE) */}
        <div className="border border-slate-200 rounded-lg bg-white overflow-hidden shadow-sm hover:shadow-md transition">
          <button
            onClick={() => toggleSection('items')}
            className="w-full px-4 py-3 bg-white hover:bg-slate-50 flex justify-between items-center transition"
            id="accordion-btn-items"
          >
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
              <Plus size={14} className="text-emerald-600" />
              <span>4. {t.editItems} ({invoice.items.length})</span>
            </div>
            {openSection === 'items' ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
          </button>

          {openSection === 'items' && (
            <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-4 font-sans">
              
              {/* FAST PRESET ADD CHIPS (SUPERB EFFICIENCY) */}
              <div>
                <p className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">
                  ⚡ Click to Quick-Add Malaysia Fruit Presets (inserts 10 KG)
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {DEFAULT_PRESET_ITEMS.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleQuickAddPreset(item)}
                      type="button"
                      className="px-2 py-1 text-[10px] bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-300 border border-emerald-200 text-emerald-800 rounded transition font-medium mt-1 inline-flex items-center gap-1 shadow-sm font-bold"
                    >
                      + {item.description} (RM {item.unitPrice.toFixed(0)})
                    </button>
                  ))}
                </div>
              </div>

              {/* ACTIVE ITEMS TABLE LIST */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-slate-600 text-xs font-bold">
                  <span>Current Billing Line Items:</span>
                  <span className="text-[10px] text-slate-400 italic">Formulas calculation is fully automatic</span>
                </div>

                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {invoice.items.map((item, index) => {
                    const rowRawTotal = item.qty * item.unitPrice;
                    const rowDiscount = item.discountType === 'percent' 
                      ? (rowRawTotal * item.discount) / 100 
                      : item.discount;
                    const netTotal = rowRawTotal - rowDiscount;

                    return (
                      <div 
                        key={item.id}
                        className="p-3 bg-white border border-slate-200 rounded-lg flex flex-col gap-2 relative group hover:border-emerald-400 shadow-sm transition"
                      >
                        {/* Row header with item index and delete button */}
                        <div className="flex justify-between items-center bg-slate-100 px-2 py-1 rounded">
                          <span className="text-[10px] font-mono font-bold text-slate-600">
                            ROW {index + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(item.id)}
                            className="text-slate-400 hover:text-red-650 p-0.5 rounded transition"
                            title="Remove this item row"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>

                        {/* Top row description */}
                        <div>
                          <input
                            type="text"
                            placeholder="e.g. MUSANG KING (AB)"
                            className="w-full bg-white border border-slate-200 text-xs rounded p-1.5 text-slate-850 font-bold outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-sans"
                            value={item.description}
                            onChange={(e) => handleUpdateItemField(item.id, 'description', e.target.value)}
                          />
                        </div>

                        {/* Grid numeric fields */}
                        <div className="grid grid-cols-12 gap-1.5 font-sans">
                          {/* UOM */}
                          <div className="col-span-2">
                            <label className="text-[9px] text-slate-500 font-bold block mb-0.5">UOM</label>
                            <input
                              type="text"
                              className="w-full bg-white border border-slate-200 text-xs text-center rounded p-1 text-slate-850 font-mono focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-bold"
                              value={item.uom}
                              onChange={(e) => handleUpdateItemField(item.id, 'uom', e.target.value)}
                            />
                          </div>
                          
                          {/* Qty */}
                          <div className="col-span-3">
                            <label className="text-[9px] text-slate-500 font-bold block mb-0.5">Qty</label>
                            <input
                              type="number"
                              step="any"
                              className="w-full bg-white border border-slate-200 text-xs text-right rounded p-1 text-slate-850 font-mono focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-bold"
                              value={item.qty}
                              onChange={(e) => handleUpdateItemField(item.id, 'qty', parseFloat(e.target.value) || 0)}
                            />
                          </div>

                          {/* Unit Price RM */}
                          <div className="col-span-3">
                            <label className="text-[9px] text-slate-500 font-bold block mb-0.5 font-sans">Price RM</label>
                            <input
                              type="number"
                              step="any"
                              className="w-full bg-white border border-slate-200 text-xs text-right rounded p-1 text-slate-850 font-mono focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-bold"
                              value={item.unitPrice}
                              onChange={(e) => handleUpdateItemField(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                            />
                          </div>

                          {/* Discount RM */}
                          <div className="col-span-2">
                            <label className="text-[9px] text-slate-500 font-bold block mb-0.5">Disc</label>
                            <input
                              type="number"
                              step="any"
                              className="w-full bg-white border border-slate-200 text-xs text-right rounded p-1 text-slate-850 font-mono focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-bold"
                              value={item.discount}
                              onChange={(e) => handleUpdateItemField(item.id, 'discount', parseFloat(e.target.value) || 0)}
                            />
                          </div>

                          {/* Discount Type */}
                          <div className="col-span-2">
                            <label className="text-[9px] text-slate-500 font-bold block mb-0.5 font-bold">Type</label>
                            <select
                              className="w-full bg-white border border-slate-200 text-[10px] rounded p-1 text-slate-850 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-bold"
                              value={item.discountType}
                              onChange={(e) => handleUpdateItemField(item.id, 'discountType', e.target.value)}
                            >
                              <option value="flat">RM</option>
                              <option value="percent">%</option>
                            </select>
                          </div>
                        </div>

                        {/* Computed Preview row */}
                        <div className="text-[10px] font-mono text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded border border-slate-100 flex justify-between items-center mt-0.5">
                          <span>
                            {item.qty} {item.uom} &times; RM {item.unitPrice.toFixed(2)} 
                            {rowDiscount > 0 ? ` (Less Disc RM ${rowDiscount.toFixed(2)})` : ''}
                          </span>
                          <span className="font-bold text-emerald-700">
                            = RM {netTotal.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* FORM: ADD CUSTOM NEW ITEM */}
              <form onSubmit={handleCustomAddAndReset} className="p-3.5 bg-emerald-50/20 border-2 border-dashed border-emerald-300 rounded-lg space-y-2.5 font-sans">
                <span className="text-[10px] font-bold text-emerald-850 uppercase tracking-widest block mb-1 font-bold">
                  + Add Custom Item Row
                </span>
                
                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-7">
                    <input
                      type="text"
                      placeholder="Product Description (e.g., MUSANG KING (A))"
                      className="w-full bg-white border border-slate-200 text-xs rounded p-1.5 text-slate-850 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-bold transition-all"
                      value={newItemDesc}
                      required
                      onChange={(e) => setNewItemDesc(e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="text"
                      placeholder="UOM"
                      className="w-full bg-white border border-slate-200 text-xs text-center rounded p-1.5 text-slate-850 font-mono focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-bold"
                      value={newItemUom}
                      onChange={(e) => setNewItemUom(e.target.value)}
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      step="any"
                      placeholder="Qty"
                      className="w-full bg-white border border-slate-200 text-xs text-right rounded p-1.5 text-slate-850 font-mono font-bold focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-bold font-semibold"
                      value={newItemQty === 0 ? '' : newItemQty}
                      required
                      onChange={(e) => setNewItemQty(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-2 items-center font-sans">
                  <div className="col-span-5 flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-500 font-bold shrink-0">Price RM:</span>
                    <input
                      type="number"
                      step="any"
                      placeholder="Unit Price"
                      className="w-full bg-white border border-slate-200 text-xs text-right rounded p-1.5 text-slate-850 font-mono font-bold focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                      value={newItemPrice === 0 ? '' : newItemPrice}
                      required
                      onChange={(e) => setNewItemPrice(parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  <div className="col-span-4 flex items-center gap-1">
                    <span className="text-[11px] text-slate-500 font-bold shrink-0 font-sans">Disc:</span>
                    <input
                      type="number"
                      step="any"
                      placeholder="0"
                      className="w-full bg-white border border-slate-200 text-xs text-right rounded p-1.5 text-slate-850 font-mono focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-bold"
                      value={newItemDisc === 0 ? '' : newItemDisc}
                      onChange={(e) => setNewItemDisc(parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  <div className="col-span-3 font-bold">
                    <select
                      className="w-full bg-white border border-slate-200 text-xs rounded p-1.5 text-slate-850 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-bold"
                      value={newItemDiscType}
                      onChange={(e: any) => setNewItemDiscType(e.target.value)}
                    >
                      <option value="flat">RM</option>
                      <option value="percent">% Off</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded transition flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg"
                >
                  <Plus size={14} /> Add Line Item to Invoice
                </button>
              </form>

            </div>
          )}
        </div>

        {/* SECTION 5: STAMP & SIGNATURE */}
        <div className="border border-slate-200 rounded-lg bg-white overflow-hidden shadow-sm hover:shadow-md transition">
          <button
            onClick={() => toggleSection('signature')}
            className="w-full px-4 py-3 bg-white hover:bg-slate-50 flex justify-between items-center transition"
            id="accordion-btn-signature"
          >
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
              <FileText size={14} className="text-indigo-600" />
              <span>5. Stamp & Authorised Signature</span>
            </div>
            {openSection === 'signature' ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
          </button>

          {openSection === 'signature' && (
            <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-4">
              <SignaturePad 
                invoice={invoice} 
                onChange={onChange} 
                t={t} 
              />
            </div>
          )}
        </div>

      </div>

      {/* Useful tips section styling inspired by High Density blue prompt boxes */}
      <div className="p-3.5 bg-blue-50 border-t border-blue-100 text-center text-[10px] text-blue-700 font-medium leading-normal no-print flex justify-center items-center gap-2">
        <HelpCircle size={14} className="text-blue-500 animate-pulse shrink-0" />
        <span>Press <kbd className="bg-white px-1.5 py-0.5 rounded text-blue-800 font-mono text-[9px] border border-blue-200 shadow-sm">Ctrl + P</kbd> to run browser print layouts instantly.</span>
      </div>
    </div>
  );
};
