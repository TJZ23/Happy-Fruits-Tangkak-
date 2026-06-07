/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as XLSX from 'xlsx';
import { Invoice } from '../types';
import { amountToMalaysianWords } from '../utils';

export function downloadInvoiceExcel(invoice: Invoice) {
  // Create a new workbook
  const wb = XLSX.utils.book_new();
  
  // Prepare data rows
  const data: any[][] = [];
  
  // 1. Issuer Header
  data.push([invoice.issuer.name + (invoice.issuer.regNo ? ` (${invoice.issuer.regNo})` : '')]);
  invoice.issuer.addressLines.forEach(line => {
    data.push([line]);
  });
  data.push([`Tel: ${invoice.issuer.tel}   Fax: ${invoice.issuer.fax || '-'}`]);
  data.push([]); // blank row
  
  // 2. Title & Document Meta Columns
  const startMetaRow = data.length; // Index of the Metadata rows
  
  // We'll write the title and Recipient on the left, and Meta info on the right
  // To do this easily with XLSX.utils.aoa_to_sheet, we can build rows with padded columns.
  // Col A-C for left content, Col E-F for right content.
  
  const customerLines = [
    invoice.customer.name,
    ...invoice.customer.addressLines,
    `TEL : ${invoice.customer.tel || '-'}   FAX : ${invoice.customer.fax || '-'}`,
    `Attn : ${invoice.customer.attn || '-'}`
  ];
  
  const metaLines = [
    `No. : ${invoice.invoiceNo}`,
    `Our GRN No. : ${invoice.grnNo || '-'}`,
    `Terms : ${invoice.terms}`,
    `Date : ${invoice.date}`,
    `Page : ${invoice.page}`
  ];
  
  // Add title first
  data.push([invoice.invoiceType.toUpperCase(), "", "", "", metaLines[0]]);
  
  const maxHeaderLines = Math.max(customerLines.length, metaLines.length - 1);
  for (let i = 0; i < maxHeaderLines; i++) {
    const cust = customerLines[i] || "";
    const meta = metaLines[i + 1] || "";
    data.push([cust, "", "", "", meta]);
  }
  
  data.push([]); // blank row before table
  
  // 3. Table Headers
  // Let's mark the starting row of table
  const tableHeaderIndex = data.length;
  data.push(["Item", "Description", "UOM", "Qty", "U/Price (RM)", "Disc. (RM)", "Total (RM)"]);
  
  // Add item rows
  const itemStartRow = tableHeaderIndex + 2; // XLSX row indices are 1-based, tableHeaderIndex is 0-indexed in data array.
  // We'll calculate the actual Excel row numbers for formula construction.
  
  invoice.items.forEach((item, index) => {
    const excelRow = itemStartRow + index; // e.g. Row 15, 16...
    
    // Total calculation: Qty * U/Price - Disc.
    // If Disc. is 0 or empty, we write 0.
    const qtyCell = item.qty;
    const priceCell = item.unitPrice;
    
    // Resolve discount flat amount
    let discVal = 0;
    if (item.discountType === 'percent') {
      discVal = (item.qty * item.unitPrice * item.discount) / 100;
    } else {
      discVal = item.discount;
    }
    
    // We'll represent the Total RM as an active formula!
    // Row index in Excel is excelRow (1-indexed)
    // Formula: =D{row} * E{row} - F{row}
    const totalFormula = `D${excelRow}*E${excelRow}-F${excelRow}`;
    
    // Push raw values first, we'll assign the formula to the cell object later
    data.push([
      index + 1,
      item.description,
      item.uom,
      qtyCell,
      priceCell,
      discVal,
      { f: totalFormula } as any // Temporary place helper for formulas
    ]);
  });
  
  const itemEndRow = itemStartRow + invoice.items.length - 1;
  const totalRowIndex = itemEndRow + 1; // Excel row for total sum
  
  // Add Grand Total row
  // Formula: =SUM(G{start}:G{end})
  const grandTotalFormula = `SUM(G${itemStartRow}:G${itemEndRow})`;
  
  data.push([]); // separator row
  data.push([
    "Total In Words:", 
    amountToMalaysianWords(invoice.items.reduce((acc, curr) => {
      const disc = curr.discountType === 'percent' ? (curr.qty * curr.unitPrice * curr.discount) / 100 : curr.discount;
      return acc + (curr.qty * curr.unitPrice - disc);
    }, 0)), 
    "", "", 
    "Total", 
    "", 
    { f: grandTotalFormula } as any
  ]);
  
  data.push([]); // blank row
  data.push([`E & O.E`]);
  data.push([]);
  data.push([]);
  data.push(["___________________________", "", "", "", "", "___________________________"]);
  data.push(["Authorised Signature", "", "", "", "", "Customer Signature / Chop"]);
  
  // Convert Array of Arrays to Worksheet
  const ws = XLSX.utils.aoa_to_sheet(data);
  
  // Set up formula styling / cells correctly
  // We need to loop through the worksheet to assign formulas correctly because XLSX.utils.aoa_to_sheet might treat { f: '...' } in a specific way OR we can write them explicitly.
  // Let's iterate and correct cell properties.
  for (const key in ws) {
    if (ws.hasOwnProperty(key)) {
      const cell = ws[key];
      if (cell && typeof cell === 'object') {
        // If it was written as our formula helper placeholder
        if (cell.v && typeof cell.v === 'object' && cell.v.f) {
          cell.f = cell.v.f;
          delete cell.v;
          cell.t = 'n'; // numeric type
        }
      }
    }
  }
  
  // Column Widths (Aesthetic spacing!)
  ws['!cols'] = [
    { wch: 8 },  // Item No
    { wch: 35 }, // Description
    { wch: 8 },  // UOM
    { wch: 10 }, // Qty
    { wch: 12 }, // U/Price
    { wch: 10 }, // Disc
    { wch: 15 }, // Total
  ];
  
  // Merge cells for headers nicely
  ws['!merges'] = [
    // Issuer headers (merge Cols A to E)
    { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 4 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 4 } },
    { s: { r: 3, c: 0 }, e: { r: 3, c: 4 } },
    // Bill to headers
  ];
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, "Invoice");
  
  // Write and Save
  const fileName = `${invoice.invoiceNo.replace(/[\/\\?%*:|"<>]/g, '_')}_Invoice.xlsx`;
  XLSX.writeFile(wb, fileName);
}
