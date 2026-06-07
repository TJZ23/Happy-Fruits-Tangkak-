/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Invoice } from './types';
import { DEFAULT_COMPANY, DEFAULT_CUSTOMERS } from './presets';
import { InvoiceForm } from './components/InvoiceForm';
import { InvoicePreview } from './components/InvoicePreview';
import { encodeInvoiceToUrl, decodeInvoiceFromUrl, amountToMalaysianWords } from './utils';
import { Sparkles, CheckCircle2, RotateCcw, AlertTriangle, CloudRain } from 'lucide-react';
import { Language, translations } from './translations';

const LOCAL_STORAGE_KEY = 'my_malaysia_saved_invoices';

// Core initialized empty invoice
const INITIAL_DEMO_INVOICE: Invoice = {
  id: 'invoice_init_1',
  invoiceType: 'PURCHASE INVOICE',
  invoiceNo: '',
  grnNo: '',
  terms: '',
  date: '',
  page: '1 of 1',
  issuer: {
    name: 'Happy Fruits Tangkak 果果乐',
    regNo: '',
    addressLines: [],
    tel: '',
    fax: ''
  },
  customer: {
    name: '',
    addressLines: [],
    tel: '',
    fax: '',
    attn: ''
  },
  items: [
    { id: 'item_1', description: '', uom: 'KG', qty: 0, unitPrice: 0, discount: 0, discountType: 'flat' },
  ],
  authorisedSignBy: '',
  createdAt: new Date().toISOString()
};

export default function App() {
  const [activeInvoice, setActiveInvoice] = useState<Invoice>(INITIAL_DEMO_INVOICE);
  const [savedInvoices, setSavedInvoices] = useState<Invoice[]>([]);
  const [isUrlShared, setIsUrlShared] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>('zh');
  const t = translations[language];

  // 1. Load data from URL sharing or LocalStorage on mount
  useEffect(() => {
    // Check URL parameters first for decentralized link sharing
    const params = new URLSearchParams(window.location.search);
    const sharedData = params.get('data');
    if (sharedData) {
      const decoded = decodeInvoiceFromUrl(sharedData);
      if (decoded) {
        setActiveInvoice(decoded);
        setIsUrlShared(true);
        showToast("Successfully loaded shared invoice from URL!");
      }
    }

    // Load saved historical invoices from local storage
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        setSavedInvoices(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load local storage dynamic list", e);
    }
  }, []);

  // Sync state to local storage helper
  const saveSavedInvoicesToStorage = (list: Invoice[]) => {
    setSavedInvoices(list);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error("Failed to persist to local storage", e);
    }
  };

  // Toast Helper
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // 2. Action Handlers for Save / Delete Invoices
  const handleSaveCurrentInvoice = () => {
    // Generate new ID if saving demo or custom template for the first time
    const updatedInvoice = {
      ...activeInvoice,
      id: activeInvoice.id === 'invoice_sw_demo_2026' ? 'inv_' + Date.now() : activeInvoice.id,
      createdAt: new Date().toISOString()
    };

    const existsIdx = savedInvoices.findIndex(inv => inv.id === updatedInvoice.id || inv.invoiceNo === updatedInvoice.invoiceNo);
    let updatedList = [...savedInvoices];
    if (existsIdx >= 0) {
      updatedList[existsIdx] = updatedInvoice;
      showToast(`Updated existing invoice No. ${updatedInvoice.invoiceNo}`);
    } else {
      updatedList.push(updatedInvoice);
      showToast(`Saved new invoice No. ${updatedInvoice.invoiceNo}`);
    }
    
    // Set active invoice so we carry over the newly generated ID
    setActiveInvoice(updatedInvoice);
    saveSavedInvoicesToStorage(updatedList);
  };

  const handleDeleteInvoice = (idToDelete: string) => {
    const filtered = savedInvoices.filter(inv => inv.id !== idToDelete);
    saveSavedInvoicesToStorage(filtered);
    showToast("Invoice deleted from local computer storage.");
  };

  const handleResetToDemo = () => {
    setActiveInvoice({
      ...INITIAL_DEMO_INVOICE,
      id: 'invoice_init_' + Date.now()
    });
    setIsUrlShared(false);
    showToast("Reset workspace to initial empty invoice.");
  };

  // 3. Share URL Generator (Base64 URL Compressed Payload)
  const handleGenerateShareableLink = () => {
    const encodedPayload = encodeInvoiceToUrl(activeInvoice);
    const origin = window.location.origin + window.location.pathname;
    const fullShareUrl = `${origin}?data=${encodedPayload}`;
    
    navigator.clipboard.writeText(fullShareUrl)
      .then(() => {
        showToast("Shareable URL copied to Clipboard! Anyone opening this link can view this receipt.");
      })
      .catch(() => {
        showToast("Error writing sharing link to clipboard.");
      });
  };

  // 4. WhatsApp Message Formatter (Enables easy dispatching / "发单")
  const handleSendViaWhatsApp = () => {
    const totalAmount = activeInvoice.items.reduce((sum, item) => {
      const disc = item.discountType === 'percent' ? (item.qty * item.unitPrice * item.discount) / 100 : item.discount;
      return sum + (item.qty * item.unitPrice) - disc;
    }, 0);
    const wordText = amountToMalaysianWords(totalAmount);

    const encodedPayload = encodeInvoiceToUrl(activeInvoice);
    const origin = window.location.origin + window.location.pathname;
    const shareLink = `${origin}?data=${encodedPayload}`;

    // WhatsApp text formatting with standard emojis and crisp lines
    let text = `*${activeInvoice.invoiceType} from ${activeInvoice.issuer.name}*\n`;
    text += `===============================\n`;
    text += `*No.* : _${activeInvoice.invoiceNo}_\n`;
    text += `*Date* : ${activeInvoice.date}\n`;
    text += `*Terms* : ${activeInvoice.terms}\n`;
    text += `*Bill To* : *${activeInvoice.customer.name}*\n`;
    text += `===============================\n\n`;
    text += `*Billing Items*:\n`;
    
    activeInvoice.items.forEach((item, idx) => {
      const lineTotal = item.qty * item.unitPrice - (item.discountType === 'percent' ? (item.qty * item.unitPrice * item.discount) / 100 : item.discount);
      text += `${idx + 1}. *${item.description}*\n`;
      text += `    ${item.qty} ${item.uom} @ RM${item.unitPrice.toFixed(2)} = *RM ${lineTotal.toFixed(2)}*\n`;
    });
    
    text += `\n-------------------------------\n`;
    text += `*GRAND TOTAL: RM ${totalAmount.toFixed(2)}*\n`;
    text += `*Words*:\n${wordText}\n`;
    text += `-------------------------------\n\n`;
    text += `*View, Print or Download Excel here*:\n${shareLink}\n`;
    text += `\nThank you for your business! 🙏`;

    // Open WhatsApp Web/Mobile sharing link
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="w-full h-screen flex flex-col bg-[#F3F4F6] font-sans text-slate-800 overflow-hidden antialiased">
      {/* Dynamic Toast Message Banner */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-white border-2 border-emerald-500 text-slate-800 rounded-md shadow-2xl px-5 py-3 flex items-center gap-3 animate-bounce" id="app-toast-alert">
          <CheckCircle2 className="text-emerald-500 shrink-0" size={18} />
          <span className="text-xs font-bold leading-tight">{toastMessage}</span>
        </div>
      )}

      {/* Global Top Banner for Shared URL States */}
      {isUrlShared && (
        <div className="bg-amber-50 text-amber-800 text-xs px-6 py-2 border-b border-amber-200 flex justify-between items-center no-print" id="shared-url-banner">
          <span className="flex items-center gap-1.5 font-semibold">
            <Sparkles size={14} className="text-amber-500 animate-pulse" />
            <span>You are viewing a shared invoice from a custom link. You can edit it freely.</span>
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setIsUrlShared(false);
                showToast("Now editing your shared invoice locally!");
              }}
              className="px-2 py-0.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded text-[10px]"
              id="unlock-editor-btn"
            >
              Unlock Editor
            </button>
            <button
              onClick={handleResetToDemo}
              className="px-2 py-0.5 bg-slate-600 hover:bg-slate-700 text-white font-bold rounded text-[10px] flex items-center gap-1"
              id="reset-demo-banner-btn"
            >
              <RotateCcw size={10} />
              <span>Back to Demo</span>
            </button>
          </div>
        </div>
      )}

      {/* Top Navigation Bar from Design Theme */}
      <nav className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 no-print" id="high-density-navbar">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-600 rounded flex items-center justify-center text-white font-bold text-sm tracking-tight text-center leading-tight">
            果
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-bold tracking-tight text-slate-900 leading-none">
              {t.appTitle}
            </h1>
            <span className="text-[10px] text-slate-400 mt-0.5 leading-none font-mono">{t.appSubtitle}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md border border-slate-200 mr-2">
             <button onClick={() => setLanguage('en')} className={`px-2 py-1 text-[10px] font-bold rounded ${language === 'en' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>EN</button>
             <button onClick={() => setLanguage('zh')} className={`px-2 py-1 text-[10px] font-bold rounded ${language === 'zh' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>中文</button>
             <button onClick={() => setLanguage('ms')} className={`px-2 py-1 text-[10px] font-bold rounded ${language === 'ms' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>BM</button>
          </div>
          <button
            onClick={handleResetToDemo}
            className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-slate-200 rounded-md transition-colors flex items-center gap-1.5"
            id="reset-demo-nav-btn"
          >
            <RotateCcw size={12} />
            <span>{t.resetBtn}</span>
          </button>
        </div>
      </nav>

      {/* Workspace Split Layout: Forms + Previews */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        
        {/* Left Hand: Invoice Editor Form (Grid span 5) */}
        <div className="lg:col-span-5 h-full overflow-y-auto bg-white border-r border-slate-200 flex flex-col">
          <InvoiceForm
            invoice={activeInvoice}
            onChange={setActiveInvoice}
            onLoadInvoice={(loadedInvoice) => {
              setActiveInvoice(loadedInvoice);
              setIsUrlShared(false);
              showToast(`Loaded invoice No. ${loadedInvoice.invoiceNo}`);
            }}
            savedInvoices={savedInvoices}
            onSaveCurrentInvoice={handleSaveCurrentInvoice}
            onDeleteInvoice={handleDeleteInvoice}
            t={t}
          />
        </div>

        {/* Right Hand: High Fidelity Malaysia Receipt Preview (Grid span 7) */}
        <div className="lg:col-span-7 h-full flex flex-col bg-slate-100 overflow-hidden">
          <InvoicePreview
            invoice={activeInvoice}
            onShare={handleGenerateShareableLink}
            onSendWhatsApp={handleSendViaWhatsApp}
            t={t}
          />
        </div>

      </div>

      {/* Status Bar / Footer from Design Theme */}
      <footer className="h-8 bg-slate-900 text-slate-300 flex items-center px-6 justify-between shrink-0 text-[10px] font-mono select-none no-print" id="high-density-footer">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            System Status: <span className="font-semibold text-emerald-400">{t.online}</span>
          </span>
          <div className="w-[1px] h-3 bg-slate-700"></div>
          <span>{t.engineParams}</span>
        </div>
        <div className="text-slate-400 text-[9px]">
          {t.poweredBy}
        </div>
      </footer>
    </div>
  );
}
