/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { Invoice } from '../types';
import { amountToMalaysianWords } from '../utils';
import { Printer, Download, Share2, MessageCircle, FileText } from 'lucide-react';
import { downloadInvoiceExcel } from '../utils/excel';
import { downloadInvoiceWord } from '../utils/word';

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
    <div className="flex flex-col h-full bg-slate-900 border-l border-slate-800 print:bg-white print:border-none">
      {/* Action Toolbar */}
      <div className="p-4 bg-slate-900 border-b border-slate-800 flex flex-wrap gap-2 justify-between items-center no-print">
        <h3 className="text-sm font-semibold tracking-wide uppercase text-slate-400 font-mono">
          Document Output
        </h3>
        <div className="flex flex-wrap gap-2">
          {/* Export Word */}
          <button
            id="btn-export-word"
            onClick={() => downloadInvoiceWord(invoice)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded transition shadow-sm cursor-pointer"
            title="Download formatted Word Document (.doc)"
          >
            <FileText size={14} />
            <span>{t.exportWord}</span>
          </button>

          {/* Export Excel */}
          <button
            id="btn-export-excel"
            onClick={handleDownloadExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded transition shadow-sm cursor-pointer"
            title="Download Excel Sheet with Formulas"
          >
            <Download size={14} />
            <span>Generate Excel</span>
          </button>

          {/* Print PDF */}
          <button
            id="btn-print-pdf"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded transition shadow-sm cursor-pointer"
            title="Print invoice or save as PDF"
          >
            <Printer size={14} />
            <span>Print / PDF</span>
          </button>

          {/* WhatsApp Share */}
          <button
            id="btn-whatsapp-share"
            onClick={onSendWhatsApp}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-green-600 hover:bg-green-500 text-white rounded transition shadow-sm cursor-pointer"
            title="Send Invoice to client via WhatsApp"
          >
            <MessageCircle size={14} />
            <span>WhatsApp</span>
          </button>

          {/* Copy Universal Link */}
          <button
            id="btn-share-link"
            onClick={onShare}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-white rounded transition shadow-sm cursor-pointer"
            title="Copy URL-encoded sharing link"
          >
            <Share2 size={14} />
            <span>Share Link</span>
          </button>
        </div>
      </div>

      {/* Visual Invoice Paper Receipt Frame */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-950 flex justify-center print:bg-white print:p-0 print:overflow-visible">
        {/* Printable Paper A4 Replica */}
        <div 
          id="invoice-print-container"
          ref={printAreaRef}
          className="w-full max-w-[800px] bg-white text-black font-sans p-6 md:p-10 shadow-2xl rounded border border-gray-200 self-start print:shadow-none print:border-none print:bg-white print:text-black"
        >
          {/* 1. Header (My Company Info) */}
          <div className="text-center mb-4">
            <h1 className="text-lg md:text-xl font-bold tracking-tight text-gray-905 uppercase">
              {invoice.issuer.name} {invoice.issuer.regNo && `(${invoice.issuer.regNo})`}
            </h1>
            <div className="text-xs text-gray-700 mt-1 space-y-0.5 leading-relaxed">
              {invoice.issuer.addressLines.map((line, idx) => (
                <p key={idx}>{line}</p>
              ))}
              <p className="mt-1">
                Tel: {invoice.issuer.tel} {invoice.issuer.fax && `| Fax: ${invoice.issuer.fax}`}
              </p>
            </div>
          </div>

          <hr className="border-black border-t-2 my-4 print:border-t" />

          {/* Document Title / Sub-Header */}
          <div className="flex justify-between items-baseline mb-4">
            <h2 className="text-base font-bold tracking-wider underline leading-none uppercase">
              {invoice.invoiceType}
            </h2>
            <div className="text-xs text-right font-bold space-y-1">
              <p>
                No. : {invoice.invoiceNo || 'Draft'}
              </p>
            </div>
          </div>

          {/* 2. Addresses & Document Metadata side-by-side */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-5 text-xs leading-normal">
            {/* Beneficiary Name / Address Box */}
            <div className="md:col-span-7 border border-black p-3.5 rounded-none relative">
              <p className="font-bold text-gray-900 text-sm mb-1">
                {invoice.customer.name || '-'}
              </p>
              <div className="text-gray-800 space-y-0.5 font-medium">
                {invoice.customer.addressLines.map((line, idx) => (
                  <p key={idx}>{line}</p>
                ))}
              </div>
              <div className="mt-3 space-y-0.5 pt-2 border-t border-dotted border-gray-400">
                <p><span className="font-bold">TEL :</span> {invoice.customer.tel || '-'}</p>
                {invoice.customer.fax && <p><span className="font-bold">FAX :</span> {invoice.customer.fax}</p>}
                <p><span className="font-bold">Attn :</span> <span className="underline">{invoice.customer.attn || '3776'}</span></p>
              </div>
            </div>

            {/* Invoice Meta Table - Clean Borderless Text Listing exactly like Picture 2 */}
            <div className="md:col-span-1"></div>
            <div className="md:col-span-4 py-2 flex flex-col justify-start">
              <table className="w-full text-xs border-collapse font-semibold">
                <tbody>
                  <tr>
                    <td className="py-1 text-gray-750 font-bold w-1/3">Our GRN No.</td>
                    <td className="py-1 w-[10px]">:</td>
                    <td className="py-1 text-gray-800 font-mono text-right font-medium">{invoice.grnNo || '-'}</td>
                  </tr>
                  <tr>
                    <td className="py-1 text-gray-750 font-bold">Terms</td>
                    <td className="py-1">:</td>
                    <td className="py-1 text-gray-800 font-mono text-right font-medium">{invoice.terms || '-'}</td>
                  </tr>
                  <tr>
                    <td className="py-1 text-gray-750 font-bold">Date</td>
                    <td className="py-1">:</td>
                    <td className="py-1 text-gray-800 font-mono text-right font-medium">{invoice.date || '-'}</td>
                  </tr>
                  <tr>
                    <td className="py-1 text-gray-750 font-bold">Page</td>
                    <td className="py-1">:</td>
                    <td className="py-1 text-gray-800 font-mono text-right font-medium">{invoice.page || '1 of 1'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 3. Items Table */}
          <div className="border border-black overflow-hidden mb-5">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-gray-100 border-b border-black text-[11px] font-bold print:bg-white print:border-b-2">
                  <th className="px-3 py-2.5 w-12 border-r border-black text-center">Item</th>
                  <th className="px-3 py-2.5 border-r border-black">Description</th>
                  <th className="px-3 py-2.5 w-14 border-r border-black text-center">UOM</th>
                  <th className="px-3 py-2.5 w-14 border-r border-black text-right">Qty</th>
                  <th className="px-3 py-2.5 w-24 border-r border-black text-right">U/Price RM</th>
                  <th className="px-3 py-2.5 w-16 border-r border-black text-right">Disc. RM</th>
                  <th className="px-3 py-2.5 w-24 text-right">Total RM</th>
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
                      <tr key={item.id} className="border-b border-gray-300">
                        <td className="px-3 py-2 border-r border-black text-center">{idx + 1}</td>
                        <td className="px-3 py-2 border-r border-black font-bold text-gray-900">{item.description || '-'}</td>
                        <td className="px-3 py-2 border-r border-black text-center font-mono">{item.uom}</td>
                        <td className="px-3 py-2 border-r border-black text-right font-mono">{item.qty}</td>
                        <td className="px-3 py-2 border-r border-black text-right font-mono">
                          {item.unitPrice.toFixed(2)}
                        </td>
                        <td className="px-3 py-2 border-r border-black text-right font-mono text-gray-500">
                          {discVal > 0 ? discVal.toFixed(2) : '-'}
                        </td>
                        <td className="px-3 py-2 text-right font-bold font-mono text-gray-900">
                          {rowTotal.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* 4. Total and Word Amount Footer Row - Picture 2 Layout */}
          <div className="border border-black overflow-hidden mb-4 text-xs font-semibold grid grid-cols-12 divide-x divide-black bg-white">
            <div className="col-span-8 p-3 flex flex-col justify-center min-h-[44px]">
              <span className="text-[9px] text-gray-500 uppercase font-bold tracking-tight mb-0.5">
                Ringgit Malaysia (In Words):
              </span>
              <span className="font-bold text-gray-950 text-[10.5px] uppercase leading-snug">
                {amountInWords}
              </span>
            </div>
            <div className="col-span-4 grid grid-cols-12 divide-x divide-black h-full items-center">
              <div className="col-span-4 px-2 text-right h-full flex items-center justify-end font-bold text-[11px] uppercase tracking-wider bg-gray-50 print:bg-white">
                Total
              </div>
              <div className="col-span-8 px-3 text-right h-full flex items-center justify-end font-mono font-bold text-sm bg-white text-gray-900">
                RM {totalAmount.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          <div className="text-right font-bold text-black italic text-xs mt-2 mb-10">
            E & O.E
          </div>

          {/* 5. Authorisation and Signature */}
          <div className="mt-12 text-xs flex justify-between items-end">
            <div className="flex flex-col items-center text-center">
              <div className="w-56 border-b border-black mb-1 h-20 flex items-center justify-center relative select-none">
                {/* Default prompt if no signature of any type is selected */}
                {(!invoice.signatureType || invoice.signatureType === 'none') && (
                  <span className="text-[10px] text-gray-300 font-mono tracking-wider no-print self-end mb-1 font-bold">
                    Optional Stamp / Signature
                  </span>
                )}

                {/* Draw Signature or Custom Uploaded Transparent Seal representation */}
                {(invoice.signatureType === 'draw' || invoice.signatureType === 'upload') && invoice.signatureImage && (
                  <img 
                    src={invoice.signatureImage} 
                    alt="Signature Stamp Seal"
                    className="max-h-full max-w-full object-contain pointer-events-none select-none relative z-10"
                    referrerPolicy="no-referrer"
                  />
                )}

                {/* Dynamic Stylized Vector Rubber Stamp representation */}
                {invoice.signatureType === 'text' && invoice.signatureImage && (
                  <div 
                    className="absolute inset-0 flex items-center justify-center rotate-[-3deg] pointer-events-none select-none transition-transform"
                    style={{ color: invoice.signatureColor === 'blue' ? '#1e40af' : invoice.signatureColor === 'purple' ? '#6d28d9' : invoice.signatureColor === 'black' ? '#111827' : '#dc2626' }}
                  >
                    <div 
                      className="border-4 rounded shadow-sm border-double px-2.5 py-1 text-center uppercase tracking-wider font-bold leading-tight scale-90"
                      style={{ 
                        borderColor: 'currentColor',
                        borderStyle: 'double',
                        borderWidth: '4px'
                      }}
                    >
                      <div className="text-[6.5px] tracking-widest border-b pb-0.5 mb-1" style={{ borderColor: 'currentColor' }}>
                        ★ RECEIVED & APPROVED ★
                      </div>
                      <div className="text-[10.5px] font-sans font-black whitespace-nowrap px-1">
                        {invoice.signatureImage}
                      </div>
                      <div className="text-[6.5px] tracking-widest border-t pt-0.5 mt-1 font-mono" style={{ borderColor: 'currentColor' }}>
                        DATE: {invoice.date || '01/06/2026'}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <p className="font-bold text-gray-900 pt-1 w-full max-w-xs">
                Authorised Signature
              </p>
              {invoice.authorisedSignBy && (
                <p className="text-[10px] text-gray-500 mt-0.5 font-mono">
                  ({invoice.authorisedSignBy})
                </p>
              )}
            </div>
            
            {/* Kept empty on the right side to match Picture 2 perfectly */}
            <div className="w-56"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
