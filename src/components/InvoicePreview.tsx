/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { Invoice } from '../types';
import { amountToMalaysianWords } from '../utils';
import { Printer, Download, Share2, MessageCircle } from 'lucide-react';
import { downloadInvoiceExcel } from '../utils/excel';

interface InvoicePreviewProps {
  invoice: Invoice;
  onShare: () => void;
  onSendWhatsApp: () => void;
  t: any;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({
  invoice,
  onShare,
  onSendWhatsApp,
  t
}) => {
  const printAreaRef = useRef<HTMLDivElement>(null);

  // Calculate totals
  const totalAmount = invoice.items.reduce((sum, item) => {
    let discVal = 0;
    if (item.discountType === 'percent') {
      discVal = (item.qty * item.unitPrice * item.discount) / 100;
    } else {
      discVal = item.discount;
    }
    return sum + (item.qty * item.unitPrice) - discVal;
  }, 0);

  const amountInWords = amountToMalaysianWords(totalAmount);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadExcel = () => {
    downloadInvoiceExcel(invoice);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-l border-slate-800">
      {/* Action Toolbar */}
      <div className="p-4 bg-slate-900 border-b border-slate-800 flex flex-wrap gap-2 justify-between items-center no-print">
        <h3 className="text-sm font-semibold tracking-wide uppercase text-slate-400">
          Document Preview
        </h3>
        <div className="flex flex-wrap gap-2">
          {/* Export Excel */}
          <button
            id="btn-export-excel"
            onClick={handleDownloadExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded transition"
            title="Download Excel Sheet with Formulas"
          >
            <Download size={14} />
            <span>Generate Excel</span>
          </button>

          {/* Print PDF */}
          <button
            id="btn-print-pdf"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded transition"
            title="Print invoice or save as PDF"
          >
            <Printer size={14} />
            <span>Print / PDF</span>
          </button>

          {/* WhatsApp Share */}
          <button
            id="btn-whatsapp-share"
            onClick={onSendWhatsApp}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-green-600 hover:bg-green-500 text-white rounded transition"
            title="Send Invoice to client via WhatsApp"
          >
            <MessageCircle size={14} />
            <span>WhatsApp</span>
          </button>

          {/* Copy Universal Link */}
          <button
            id="btn-share-link"
            onClick={onShare}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-white rounded transition"
            title="Copy URL-encoded sharing link"
          >
            <Share2 size={14} />
            <span>Share Link</span>
          </button>
        </div>
      </div>

      {/* Visual Invoice Paper Receipt Frame */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-950 flex justify-center">
        {/* Printable Paper A4 Replica */}
        <div 
          id="invoice-print-container"
          ref={printAreaRef}
          className="w-full max-w-[800px] bg-white text-black font-sans p-6 md:p-10 shadow-2xl rounded border border-gray-200 self-start print:shadow-none print:border-none print:p-0 print:m-0"
        >
          {/* 1. Header (My Company Info) */}
          <div className="text-center mb-6">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-gray-900 uppercase">
              {invoice.issuer.name}
            </h1>
            {invoice.issuer.regNo && (
              <p className="text-xs text-gray-600 mt-0.5">
                ({invoice.issuer.regNo})
              </p>
            )}
            <div className="text-xs text-gray-700 mt-2 space-y-0.5 leading-relaxed">
              {invoice.issuer.addressLines.map((line, idx) => (
                <p key={idx}>{line}</p>
              ))}
              <p className="mt-1">
                Tel: {invoice.issuer.tel} {invoice.issuer.fax && `| Fax: ${invoice.issuer.fax}`}
              </p>
            </div>
          </div>

          <hr className="border-gray-350 border-t-2 my-4" />

          {/* Document Title / Sub-Header */}
          <div className="flex justify-between items-baseline mb-4">
            <h2 className="text-base font-bold tracking-wider underline decoration-double">
              {invoice.invoiceType}
            </h2>
            <div className="text-xs text-right space-y-1">
              <p>
                <span className="font-semibold">No. :</span> {invoice.invoiceNo}
              </p>
            </div>
          </div>

          {/* 2. Addresses & Document Metadata side-by-side */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6 text-xs leading-normal">
            {/* Beneficiary Name / Address Box */}
            <div className="md:col-span-7 border border-black p-3 rounded-none relative">
              <span className="absolute -top-2 left-3 bg-white px-1 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                {t.clientDetails}
              </span>
              <p className="font-bold text-gray-900 text-sm mb-1">
                {invoice.customer.name}
              </p>
              <div className="text-gray-800 space-y-0.5">
                {invoice.customer.addressLines.map((line, idx) => (
                  <p key={idx}>{line}</p>
                ))}
              </div>
              <div className="mt-3 space-y-0.5 pt-2 border-t border-dotted border-gray-300">
                <p><span className="font-semibold">{t.telNo} :</span> {invoice.customer.tel || '-'}</p>
                {invoice.customer.fax && <p><span className="font-semibold">{t.faxNo} :</span> {invoice.customer.fax}</p>}
                <p><span className="font-semibold">{t.attn} :</span> <span className="underline">{invoice.customer.attn || '3776'}</span></p>
              </div>
            </div>

            {/* Invoice Meta Table */}
            <div className="md:col-span-5 bg-stone-50 border border-gray-300 p-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 font-semibold">{t.grnNo} :</span>
                  <span className="font-mono text-gray-800">{invoice.grnNo || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-semibold">{t.terms} :</span>
                  <span className="font-mono text-gray-800">{invoice.terms}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-semibold">{t.date} :</span>
                  <span className="font-mono text-gray-800">{invoice.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-semibold">{t.pages} :</span>
                  <span className="font-mono text-gray-800">{invoice.page}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Items Table */}
          <div className="border border-black overflow-hidden mb-6">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-gray-100 border-b border-black text-[11px] font-bold">
                  <th className="px-3 py-2 w-12 border-r border-black text-center">Item</th>
                  <th className="px-3 py-2 border-r border-black">Description</th>
                  <th className="px-3 py-2 w-14 border-r border-black text-center animate-pulse-once">UOM</th>
                  <th className="px-3 py-2 w-14 border-r border-black text-right">Qty</th>
                  <th className="px-3 py-2 w-24 border-r border-black text-right">U/Price RM</th>
                  <th className="px-3 py-2 w-16 border-r border-black text-right">Disc. RM</th>
                  <th className="px-3 py-2 w-24 text-right">Total RM</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-300">
                {invoice.items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-400 italic">
                      No items added yet. Click &ldquo;Add New Item&rdquo; on the left to start.
                    </td>
                  </tr>
                ) : (
                  invoice.items.map((item, idx) => {
                    let discVal = 0;
                    if (item.discountType === 'percent') {
                      discVal = (item.qty * item.unitPrice * item.discount) / 100;
                    } else {
                      discVal = item.discount;
                    }
                    const rowTotal = item.qty * item.unitPrice - discVal;
                    return (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-3 py-2 border-r border-black text-center">{idx + 1}</td>
                        <td className="px-3 py-2 border-r border-black font-semibold text-gray-900">{item.description}</td>
                        <td className="px-3 py-2 border-r border-black text-center font-mono">{item.uom}</td>
                        <td className="px-3 py-2 border-r border-black text-right font-mono">{item.qty}</td>
                        <td className="px-3 py-2 border-r border-black text-right font-mono">
                          {item.unitPrice.toFixed(2)}
                        </td>
                        <td className="px-3 py-2 border-r border-black text-right font-mono text-gray-500">
                          {discVal > 0 ? discVal.toFixed(2) : '-'}
                        </td>
                        <td className="px-3 py-2 text-right font-semibold font-mono">
                          {rowTotal.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* 4. Total and Word Amount Feet */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start mb-10">
            {/* Word Representation Box */}
            <div className="md:col-span-8 border border-black p-3 min-h-[50px] leading-relaxed text-xs">
              <span className="font-semibold block text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">
                Ringgit Malaysia (In Words):
              </span>
              <span className="font-bold text-gray-950 text-[11px] leading-normal uppercase">
                {amountInWords}
              </span>
            </div>

            {/* Sum Total Block */}
            <div className="md:col-span-4 border-2 border-double border-black p-3 bg-gray-50 flex justify-between items-center">
              <span className="text-xs font-bold text-gray-800 uppercase">{t.totalAmount}:</span>
              <span className="font-mono font-bold text-base text-gray-950">
                RM {totalAmount.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Errors & Omissions Excepted */}
          <p className="text-[10px] font-bold text-black italic text-right mb-12">
            E & O.E
          </p>

          {/* 5. Authorisation and Signature */}
          <div className="grid grid-cols-2 gap-8 text-center text-xs mt-8">
            <div className="flex flex-col items-center">
              <div className="w-48 border-b border-black mb-1 h-14 flex items-end justify-center text-gray-400 italic">
                {/* Visual signature overlay */}
                <span className="text-[10px] text-gray-300 font-mono tracking-wider no-print">Optional Stamp / Signature</span>
              </div>
              <p className="font-semibold text-gray-900 border-t border-dotted border-gray-300 pt-1 w-full max-w-xs">
                {t.signatureBy}
              </p>
              {invoice.authorisedSignBy && (
                <p className="text-[10px] text-gray-500 mt-0.5">
                  ({invoice.authorisedSignBy})
                </p>
              )}
            </div>

            <div className="flex flex-col items-center">
              <div className="w-48 border-b border-black mb-1 h-14"></div>
              <p className="font-semibold text-gray-900 border-t border-dotted border-gray-300 pt-1 w-full max-w-xs">
                Customer Signature & Chop
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
