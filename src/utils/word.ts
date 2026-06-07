import { Invoice } from '../types';
import { amountToMalaysianWords } from '../utils';

export function downloadInvoiceWord(invoice: Invoice) {
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

  // Generate clean inline-styled HTML structure that Word parses beautifully as a Document
  const htmlContent = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <title>${invoice.invoiceType} - ${invoice.invoiceNo}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          font-size: 11pt;
          line-height: 1.4;
          color: #000000;
          margin: 1in;
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
        }
        .title {
          font-size: 16pt;
          font-weight: bold;
          text-transform: uppercase;
          margin: 0;
        }
        .subtitle {
          font-size: 10pt;
          color: #555555;
          margin: 2px 0 0 0;
        }
        .address-lines {
          font-size: 9.5pt;
          margin: 5px 0 0 0;
        }
        .meta-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
          margin-bottom: 15px;
        }
        .meta-left {
          width: 55%;
          border: 1px solid #000000;
          padding: 10px;
          vertical-align: top;
        }
        .meta-right {
          width: 45%;
          padding: 10px;
          vertical-align: top;
          text-align: right;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
          margin-bottom: 15px;
        }
        .items-table th {
          border-top: 1px solid #000500;
          border-bottom: 1.5px solid #000000;
          border-left: 1px solid #000000;
          border-right: 1px solid #000000;
          padding: 6px;
          font-weight: bold;
          font-size: 10pt;
          background-color: #f5f5f5;
          text-align: left;
        }
        .items-table td {
          border: 1px solid #000000;
          padding: 6px;
          font-size: 9.5pt;
        }
        .total-container {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
          margin-bottom: 10px;
        }
        .total-box {
          border-top: 1px solid #000000;
          border-bottom: 1px solid #000000;
          border-left: 1px solid #000000;
          border-right: 1px solid #000000;
          width: 100%;
        }
        .total-words {
          padding: 8px;
          font-size: 9pt;
          vertical-align: middle;
          border-right: 1px solid #000000;
        }
        .total-amount-label {
          padding: 8px;
          font-size: 10pt;
          font-weight: bold;
          text-align: right;
          border-right: 1px solid #000000;
          width: 15%;
        }
        .total-amount-value {
          padding: 8px;
          font-size: 11pt;
          font-weight: bold;
          text-align: right;
          width: 25%;
        }
        .signature-section {
          margin-top: 50px;
          width: 100%;
        }
        .sig-line {
          width: 200px;
          border-bottom: 1px solid #000000;
          height: 50px;
        }
        .sig-text {
          font-size: 9.5pt;
          font-weight: bold;
          margin-top: 5px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="title">${invoice.issuer.name || 'HAPPY FRUITS TANGKAK 果果乐'}</div>
        ${invoice.issuer.regNo ? `<div class="subtitle">(${invoice.issuer.regNo})</div>` : ''}
        <div class="address-lines">
          ${invoice.issuer.addressLines.map(line => `<div>${line}</div>`).join('')}
          <div style="margin-top: 4px;">Tel: ${invoice.issuer.tel} ${invoice.issuer.fax ? `| Fax: ${invoice.issuer.fax}` : ''}</div>
        </div>
      </div>

      <hr style="border: none; border-top: 1.5pt solid #000000; margin: 15px 0;" />

      <table style="width: 100%; margin-bottom: 10px;">
        <tr>
          <td style="font-size: 13pt; font-weight: bold; text-decoration: underline;">${invoice.invoiceType}</td>
          <td style="font-size: 10pt; text-align: right; font-weight: bold;">No. : ${invoice.invoiceNo || 'Draft'}</td>
        </tr>
      </table>

      <!-- Addresses and Meta -->
      <table class="meta-table">
        <tr>
          <td class="meta-left">
            <div style="font-weight: bold; font-size: 11pt; margin-bottom: 3px;">${invoice.customer.name || '-'}</div>
            <div style="font-size: 9.5pt;">
              ${invoice.customer.addressLines.map(line => `<div>${line}</div>`).join('')}
            </div>
            <div style="margin-top: 8px; border-top: 1px dashed #cccccc; padding-top: 4px; font-size: 9pt;">
              <div><strong>TEL:</strong> ${invoice.customer.tel || '-'}</div>
              ${invoice.customer.fax ? `<div><strong>FAX:</strong> ${invoice.customer.fax}</div>` : ''}
              <div><strong>Attn:</strong> <span style="text-decoration: underline;">${invoice.customer.attn || '3776'}</span></div>
            </div>
          </td>
          <td class="meta-right">
            <table style="width: 100%; font-size: 9.5pt;" align="right">
              <tr>
                <td style="text-align: left; padding: 2px;"><strong>Our GRN No.</strong></td>
                <td style="text-align: right; padding: 2px;">: ${invoice.grnNo || '-'}</td>
              </tr>
              <tr>
                <td style="text-align: left; padding: 2px;"><strong>Terms</strong></td>
                <td style="text-align: right; padding: 2px;">: ${invoice.terms || '-'}</td>
              </tr>
              <tr>
                <td style="text-align: left; padding: 2px;"><strong>Date</strong></td>
                <td style="text-align: right; padding: 2px;">: ${invoice.date || '-'}</td>
              </tr>
              <tr>
                <td style="text-align: left; padding: 2px;"><strong>Page</strong></td>
                <td style="text-align: right; padding: 2px;">: ${invoice.page || '1 of 1'}</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <!-- Document Items -->
      <table class="items-table">
        <thead>
          <tr>
            <th style="width: 8%; text-align: center;">Item</th>
            <th style="width: 47%;">Description</th>
            <th style="width: 9%; text-align: center;">UOM</th>
            <th style="width: 9%; text-align: right;">Qty</th>
            <th style="width: 13%; text-align: right;">U/Price RM</th>
            <th style="width: 14%; text-align: right;">Total RM</th>
          </tr>
        </thead>
        <tbody>
          ${invoice.items.map((item, idx) => {
            let discVal = item.discountType === 'percent' ? (item.qty * item.unitPrice * item.discount) / 100 : item.discount;
            let rowTotal = item.qty * item.unitPrice - discVal;
            return `
              <tr>
                <td style="text-align: center;">${idx + 1}</td>
                <td><strong>${item.description || '-'}</strong></td>
                <td style="text-align: center;">${item.uom}</td>
                <td style="text-align: right;">${item.qty}</td>
                <td style="text-align: right;">${item.unitPrice.toFixed(2)}</td>
                <td style="text-align: right;"><strong>${rowTotal.toFixed(2)}</strong></td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>

      <!-- Totals Panel -->
      <table class="total-container">
        <tr class="total-box">
          <td class="total-words" style="width: 55%;">
            <div style="font-size: 8pt; font-weight: bold; color: #555555;">RINGGIT MALAYSIA (IN WORDS):</div>
            <div style="font-style: italic; font-weight: bold; font-size: 9.5pt; text-transform: uppercase;">${amountInWords}</div>
          </td>
          <td class="total-amount-label" style="width: 15%; border-left: 1px solid #000000; text-align: right; font-weight: bold;">
            Total
          </td>
          <td class="total-amount-value" style="width: 30%; font-size: 11pt; text-align: right; font-weight: bold;">
            RM ${totalAmount.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </td>
        </tr>
      </table>

      <!-- E & O.E -->
      <div style="text-align: right; font-weight: bold; font-style: italic; font-size: 8.5pt; margin-top: 15px; margin-right: 10px;">
        E & O.E
      </div>

      <!-- Signature -->
      <table class="signature-section">
        <tr>
          <td style="width: 50%;">
            <div class="sig-line"></div>
            <div class="sig-text">Authorised Signature</div>
            ${invoice.authorisedSignBy ? `<div style="font-size: 8.5pt; color: #555555;">(${invoice.authorisedSignBy})</div>` : ''}
          </td>
          <td style="width: 50%;">
            <!-- Explicitly blank block to maintain picture 2 formatting style -->
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  // Create document blob and initiate download
  const blob = new Blob(['\ufeff' + htmlContent], {
    type: 'application/msword;charset=utf-8'
  });
  const url = URL.createObjectURL(blob);
  const element = document.createElement('a');
  element.href = url;
  element.download = `${invoice.invoiceType.replace(/\s+/g, '_')}_${invoice.invoiceNo || 'Draft'}.doc`;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
  URL.revokeObjectURL(url);
}
