const PDFDocument = require('pdfkit')
const path = require('path')
const fs = require('fs')

const QUOTATIONS_DIR = path.join(__dirname, '..', 'uploads', 'quotations')

if (!fs.existsSync(QUOTATIONS_DIR)) {
  fs.mkdirSync(QUOTATIONS_DIR, { recursive: true })
}

function fmt(n) {
  if (n == null || isNaN(n)) return 'Rs. 0.00'
  return 'Rs. ' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const generatePdf = async (req, res) => {
  try {
    const data = req.body

    const quoteId = data.quoteId || `BBQ-${Math.floor(100000 + Math.random() * 900000)}`
    const dateStr = data.date || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
    const producerName = data.producerName || 'Bimabox Agent'
    const producerContact = data.producerContact || 'N/A'
    const producerEmail = data.producerEmail || 'N/A'

    // Compute policy dates
    const startDate = new Date()
    const endDate = new Date()
    endDate.setFullYear(startDate.getFullYear() + 1)
    endDate.setDate(endDate.getDate() - 1)
    const periodStr = `${startDate.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })} to ${endDate.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}`

    const doc = new PDFDocument({ size: 'A4', margin: 40 })
    const filename = `${quoteId.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`
    const filePath = path.join(QUOTATIONS_DIR, filename)

    const stream = fs.createWriteStream(filePath)
    doc.pipe(stream)

    const pageWidth = doc.page.width - 80 // 515 pt printable area width
    let y = 40

    // ── Header Block ────────────────────────────────────────────────────────
    const logoPath = path.join(__dirname, '..', '..', 'frontend', 'public', 'bimalogo.png')

    // Light header with a blue bottom accent line
    doc.rect(40, y, pageWidth, 70).fillColor('#ffffff').fill()
    doc.rect(40, y, pageWidth, 70).strokeColor('#e2e8f0').lineWidth(1).stroke()
    doc.rect(40, y + 68, pageWidth, 3).fillColor('#003afd').fill()

    // Logo image (left side)
    const logoSize = 48
    if (require('fs').existsSync(logoPath)) {
      doc.image(logoPath, 52, y + 11, { height: logoSize, fit: [logoSize, logoSize] })
    }

    // Brand Name: "Bima" (dark/black) + "Box" (blue #003afd)
    doc.fontSize(24).font('Helvetica-Bold').fillColor('#0f172a').text('Bima', 112, y + 14, { continued: true })
    doc.fillColor('#003afd').text('Box', { continued: false })

    // Tagline
    doc.fontSize(8.5).font('Helvetica').fillColor('#64748b').text('All your policies. One smart place.', 112, y + 40)

    // Quote ID & Date on Right Side (dark text on light bg)
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#1e293b').text(`Quote ID: ${quoteId}`, 360, y + 18, { align: 'right', width: 145 })
    doc.fontSize(8).font('Helvetica').fillColor('#64748b').text(`Date: ${dateStr}`, 360, y + 34, { align: 'right', width: 145 })

    y += 82

    // Quote Subtitle
    const categoryUpper = (data.vehicleCategory || 'MOTOR').toUpperCase()
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#1e293b').text(`${categoryUpper} INSURANCE QUOTATION`, 40, y)
    doc.fontSize(9).font('Helvetica').fillColor('#64748b').text(`Period of Insurance : ${periodStr}`, 40, y + 16)
    
    y += 35

    // ── Coverages Paragraphs ─────────────────────────────────────────────────
    // Build addon & other lists
    const premiums = data.premiums || {}
    const addonsList = []
    if (premiums.zeroDep > 0) addonsList.push(`Zero Depreciation (${fmt(premiums.zeroDep)})`)
    if (premiums.rsa > 0) addonsList.push(`Roadside Assistance (${fmt(premiums.rsa)})`)
    if (premiums.otherAddon > 0) addonsList.push(`Other Addon (${fmt(premiums.otherAddon)})`)
    
    const otherList = []
    if (premiums.paOd > 0) otherList.push(`PA to Owner Driver (${fmt(premiums.paOd)})`)
    if (premiums.llPd > 0) otherList.push(`LL to Paid Driver (${fmt(premiums.llPd)})`)
    if (premiums.llEmployee > 0) otherList.push(`LL to Employee (${fmt(premiums.llEmployee)})`)
    if (premiums.paUnnamed > 0) otherList.push(`PA to Unnamed Passenger (${fmt(premiums.paUnnamed)})`)

    doc.rect(40, y, pageWidth, 42).fillColor('#f8fafc').fill()
    doc.rect(40, y, pageWidth, 42).strokeColor('#e2e8f0').lineWidth(1).stroke()
    
    doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#475569').text('Addon Coverage:', 50, y + 8)
    doc.font('Helvetica').fillColor('#0f172a').text(addonsList.join(', ') || 'None Selected', 135, y + 8, { width: pageWidth - 150 })
    
    doc.font('Helvetica-Bold').fillColor('#475569').text('Other Coverage:', 50, y + 24)
    doc.font('Helvetica').fillColor('#0f172a').text(otherList.join(', ') || 'None Selected', 135, y + 24, { width: pageWidth - 150 })

    y += 52

    // ── Vehicle Details Grid ───────────────────────────────────────────────
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#1e293b').text('Vehicle & Quotation Details', 40, y)
    y += 15

    const gridH = 52
    const colW = pageWidth / 4 // 128.75 pt

    doc.rect(40, y, pageWidth, gridH).fillColor('#f8fafc').fill()
    doc.rect(40, y, pageWidth, gridH).strokeColor('#cbd5e1').lineWidth(1).stroke()

    // Vertical lines
    doc.moveTo(40 + colW, y).lineTo(40 + colW, y + gridH).strokeColor('#cbd5e1').stroke()
    doc.moveTo(40 + colW * 2, y).lineTo(40 + colW * 2, y + gridH).strokeColor('#cbd5e1').stroke()
    doc.moveTo(40 + colW * 3, y).lineTo(40 + colW * 3, y + gridH).strokeColor('#cbd5e1').stroke()
    // Horizontal center line
    doc.moveTo(40, y + 26).lineTo(40 + pageWidth, y + 26).strokeColor('#cbd5e1').stroke()

    const drawGridCell = (colIdx, rowIdx, label, val) => {
      const cx = 40 + colIdx * colW
      const cy = y + rowIdx * 26
      doc.fontSize(7).font('Helvetica').fillColor('#64748b').text(label, cx + 8, cy + 5)
      doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#0f172a').text(val, cx + 8, cy + 13, { width: colW - 16, height: 11, ellipsis: true })
    }

    drawGridCell(0, 0, 'VEHICLE MAKE/MODEL', data.vehicleCategory || 'N/A')
    drawGridCell(1, 0, 'ZONE', data.zone || 'N/A')
    drawGridCell(2, 0, 'YEAR OF MANUFACTURE', data.mfgYear || 'N/A')
    drawGridCell(3, 0, 'VEHICLE TYPE', data.policyType || 'N/A')

    drawGridCell(0, 1, 'REGISTRATION NO / SPEC', data.vehicleSpec || 'N/A')
    drawGridCell(1, 1, 'VEHICLE AGE', data.vehicleAge || 'N/A')
    drawGridCell(2, 1, 'IDV OF THE VEHICLE', fmt(data.idv))
    drawGridCell(3, 1, 'NCB / OD DISCOUNT', `${data.ncb || 0}% / ${data.odDiscount || 0}%`)

    y += gridH + 20

    // ── Two-Column Premium Breakup Table ──────────────────────────────────
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#1e293b').text('Premium Calculation Breakup', 40, y)
    y += 15

    const colWidth = (pageWidth - 15) / 2 // 250 pt per column
    const tableY = y

    // Build side-by-side items
    const odRows = []
    if (premiums.odBase > 0) {
      odRows.push(['Vehicle Basic Rate', `${premiums.odRate}%`])
      odRows.push(['Basic OD Premium', fmt(premiums.odBase)])
      if (premiums.odDiscountAmt > 0) {
        odRows.push(['Discount on OD Premium', `-${fmt(premiums.odDiscountAmt)}`])
      }
      // Always show NCB even if 0
      odRows.push(['No Claim Bonus (NCB)', premiums.ncbDiscount > 0 ? `-${fmt(premiums.ncbDiscount)}` : fmt(0)])
      if (premiums.imt23 > 0) {
        odRows.push(['IMT 23 Loading', fmt(premiums.imt23)])
      }
      if (premiums.geoExtent > 0 && categoryUpper === 'GCV') {
        odRows.push(['Geographical Extent', fmt(premiums.geoExtent)])
      }
      if (premiums.gcvExtraUnits > 0) {
        odRows.push([`Extra Weight > 12000 Premium`, fmt(premiums.gcvExtraPremium)])
      }
    }
    const finalOD = premiums.finalOd || 0

    const addonRows = [
      ['Zero Depreciation', fmt(premiums.zeroDep || 0)],
      ['Roadside Assistance (RSA)', fmt(premiums.rsa || 0)],
      ['Other Addon Coverage', fmt(premiums.otherAddon || 0)]
    ]
    const finalAddon = (premiums.zeroDep || 0) + (premiums.rsa || 0) + (premiums.otherAddon || 0)

    const tpRows = []
    if (premiums.tp > 0) {
      tpRows.push(['Liability Premium (TP)', fmt(premiums.tp + premiums.restrictedTPPD)])
      if (premiums.restrictedTPPD > 0) {
        tpRows.push(['Restricted TPPD Discount', `-${fmt(premiums.restrictedTPPD)}`])
      }
      tpRows.push(['PA to Owner Driver', fmt(premiums.paOd || 0)])
      if (premiums.llPd > 0) tpRows.push(['LL to Paid Driver', fmt(premiums.llPd)])
      if (premiums.llEmployee > 0) tpRows.push(['LL to Employee', fmt(premiums.llEmployee)])
      if (premiums.paUnnamed > 0) tpRows.push(['PA to Unnamed Passenger', fmt(premiums.paUnnamed)])
    }
    const finalTP = (premiums.tp || 0) + (premiums.llPd || 0) + (premiums.paOd || 0) + (premiums.llEmployee || 0) + (premiums.paUnnamed || 0)

    const drawBreakupColumn = (x, startY, title, rows, minRows = 5) => {
      let cy = startY
      
      // Column Header
      doc.rect(x, cy, colWidth, 18).fillColor('#f1f5f9').fill()
      doc.rect(x, cy, colWidth, 18).strokeColor('#cbd5e1').stroke()
      doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#1e3a8a').text(title, x + 8, cy + 5)
      
      cy += 18
      const rowH = 16

      // Empty states or padded table rows
      const totalRowsToDraw = Math.max(rows.length, minRows)
      for (let i = 0; i < totalRowsToDraw; i++) {
        doc.rect(x, cy, colWidth, rowH).strokeColor('#f1f5f9').stroke()
        if (rows[i]) {
          const [lbl, val] = rows[i]
          doc.fontSize(8).font('Helvetica').fillColor('#334155').text(lbl, x + 8, cy + 4)
          doc.font('Helvetica-Bold').fillColor('#0f172a').text(val, x + colWidth - 85, cy + 4, { align: 'right', width: 77 })
        }
        cy += rowH
      }

      return cy
    }

    const drawSubtotalBox = (x, yCoord, label, totalVal) => {
      doc.rect(x, yCoord, colWidth, 20).fillColor('#eff6ff').fill()
      doc.rect(x, yCoord, colWidth, 20).strokeColor('#bfdbfe').stroke()
      doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#1e40af').text(label, x + 8, yCoord + 6)
      doc.text(fmt(totalVal), x + colWidth - 85, yCoord + 6, { align: 'right', width: 77 })
    }

    const odRowsEndY = drawBreakupColumn(40, tableY, 'Own Damage Premium (A) Rupees', odRows, 11)
    
    // Addon column
    const addonRowsEndY = drawBreakupColumn(40 + colWidth + 15, tableY, 'Addon Coverage (B) Rupees', addonRows, 3)
    drawSubtotalBox(40 + colWidth + 15, addonRowsEndY, 'Total Addon Premium (B)', finalAddon)
    const addonSubtotalEndY = addonRowsEndY + 20

    // Liability column
    const tpRowsEndY = drawBreakupColumn(40 + colWidth + 15, addonSubtotalEndY + 12, 'Liability Premium (C) Rupees', tpRows, 4)

    // Align OD and TP subtotals on the same line
    const finalSubtotalY = Math.max(odRowsEndY, tpRowsEndY)
    drawSubtotalBox(40, finalSubtotalY, 'Net Own Damage Premium (A)', finalOD)
    drawSubtotalBox(40 + colWidth + 15, finalSubtotalY, 'Total Liability Premium (C)', finalTP)

    y = finalSubtotalY + 20 + 18

    // ── Totals Section ─────────────────────────────────────────────────────
    doc.rect(40, y, pageWidth, 56).fillColor('#f8fafc').fill()
    doc.rect(40, y, pageWidth, 56).strokeColor('#cbd5e1').stroke()

    const drawTotalRow = (label, value, isBold = false, offset = 4) => {
      doc.fontSize(isBold ? 9.5 : 8.5).font(isBold ? 'Helvetica-Bold' : 'Helvetica').fillColor(isBold ? '#1e3a8a' : '#334155')
      doc.text(label, 50, y + offset)
      doc.text(value, 360, y + offset, { align: 'right', width: 145 })
    }

    const netPrem = data.netPremium || (finalOD + finalAddon + finalTP)
    const gstData = data.gst || {}
    let gstLabel = `GST (${gstData.enabled ? '18%' : '0%'})`
    if (gstData.hasSplitGst) {
      gstLabel = `GST (TP @ 5% + Other @ 18%)`
    }

    drawTotalRow('Premium before GST (A+B+C)', fmt(netPrem), false, 6)
    drawTotalRow(gstLabel, fmt(gstData.totalGst || 0), false, 22)
    
    // Horizontal divider
    doc.moveTo(50, y + 36).lineTo(40 + pageWidth - 10, y + 36).strokeColor('#cbd5e1').stroke()
    
    drawTotalRow('Final Premium (Payable)', fmt(data.totalPayable), true, 41)

    y += 72

    // ── Instructions & Documents ──────────────────────────────────────────
    const bottomW = (pageWidth - 15) / 2

    // Left Column: Payment & Docs
    doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#475569').text('Kindly pay cheque/DD in favor of BIMABOX.', 40, y)
    doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#1e3a8a').text('Documents Required:-', 40, y + 15)
    doc.fontSize(8).font('Helvetica').fillColor('#475569').text('1. Previous Policy Copy\n2. RC Copy', 40, y + 28)

    // Right Column: Notes & Validity
    doc.fontSize(7.5).font('Helvetica').fillColor('#dc2626')
      .text('Note : In case of any claim, NCB will be revised and hence Quotation is Subject to Change.', 40 + bottomW + 15, y, { width: bottomW })
    doc.fontSize(8).font('Helvetica-Bold').fillColor('#475569')
      .text(`Quote Validity: This Quote is valid for 7 days from date of generation.`, 40 + bottomW + 15, y + 26, { width: bottomW })

    y += 55

    // ── Producer Info Box ─────────────────────────────────────────────────
    doc.rect(40, y, pageWidth, 42).fillColor('#f1f5f9').fill()
    doc.rect(40, y, pageWidth, 42).strokeColor('#cbd5e1').stroke()

    const drawProducerCol = (colIdx, label, val) => {
      const cx = 40 + colIdx * (pageWidth / 3)
      doc.fontSize(8).font('Helvetica-Bold').fillColor('#475569').text(label, cx + 8, y + 8)
      doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#0f172a').text(val, cx + 8, y + 22, { width: (pageWidth / 3) - 16, ellipsis: true })
    }

    drawProducerCol(0, 'Producer Name', producerName)
    drawProducerCol(1, 'Producer Contact', producerContact)
    drawProducerCol(2, 'Producer Email', producerEmail)

    // Footer signature
    doc.fontSize(7).font('Helvetica').fillColor('#94a3b8').text('Insurance is subject matter of the solicitation.', 40, y + 50, { align: 'center', width: pageWidth })

    // ── Finalize ───────────────────────────────────────────────────────────
    doc.end()

    stream.on('finish', () => {
      const pdfUrl = `/uploads/quotations/${filename}`
      res.json({ success: true, url: pdfUrl, filename })
    })

    stream.on('error', (err) => {
      console.error('PDF stream error:', err)
      res.status(500).json({ success: false, message: 'Failed to generate PDF' })
    })

  } catch (error) {
    console.error('PDF generation error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

module.exports = { generatePdf }
