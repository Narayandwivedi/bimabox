const PDFDocument = require('pdfkit')
const path = require('path')
const fs = require('fs')

const QUOTATIONS_DIR = path.join(__dirname, '..', 'uploads', 'quotations')

if (!fs.existsSync(QUOTATIONS_DIR)) {
  fs.mkdirSync(QUOTATIONS_DIR, { recursive: true })
}

function fmt(n) {
  if (n == null || isNaN(n)) return '₹0.00'
  return '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const generatePdf = async (req, res) => {
  try {
    const data = req.body

    const quoteId = data.quoteId || `BBQ-${Math.floor(100000 + Math.random() * 900000)}`
    const dateStr = data.date || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })

    const doc = new PDFDocument({ size: 'A4', margin: 50 })
    const filename = `${quoteId.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`
    const filePath = path.join(QUOTATIONS_DIR, filename)

    const stream = fs.createWriteStream(filePath)
    doc.pipe(stream)

    const pageWidth = doc.page.width - 100
    let y = 50

    // ── Header ──────────────────────────────────────────────────────────────
    doc.fontSize(28).font('Helvetica-Bold').fillColor('#4f46e5').text('BIMABOX', 50, y)
    doc.fontSize(10).font('Helvetica').fillColor('#64748b')
      .text(`ID: ${quoteId}  •  ${dateStr}`, 50, y + 32, { align: 'right' })

    doc.moveTo(50, y + 52).lineTo(50 + pageWidth, y + 52).strokeColor('#6366f1').lineWidth(2).stroke()

    y = y + 70

    // ── Title ───────────────────────────────────────────────────────────────
    doc.fontSize(16).font('Helvetica-Bold').fillColor('#1e1b4b').text('INSURANCE QUOTATION', 50, y)
    y += 30

    // ── Details Grid ────────────────────────────────────────────────────────
    const boxW = (pageWidth - 20) / 2

    const drawDetailBox = (x, yy, title, rows) => {
      const boxH = rows.length * 20 + 50
      doc.roundedRect(x, yy, boxW, boxH, 8).fillColor('#f8fafc').fill()
      doc.roundedRect(x, yy, boxW, boxH, 8).strokeColor('#e2e8f0').lineWidth(1).stroke()
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#4f46e5').text(title, x + 12, yy + 12)
      doc.moveTo(x + 12, yy + 28).lineTo(x + boxW - 12, yy + 28).strokeColor('#cbd5e1').lineWidth(1).stroke()

      let ry = yy + 36
      rows.forEach(([label, value]) => {
        doc.fontSize(9).font('Helvetica').fillColor('#64748b').text(label, x + 12, ry)
        doc.fontSize(9).font('Helvetica-Bold').fillColor('#0f172a').text(value, x + boxW - 12, ry, { align: 'right' })
        ry += 18
      })
      return yy + boxH + 15
    }

    const vehicleRows = [
      ['Vehicle Category', data.vehicleCategory || 'N/A'],
      ['Specification', data.vehicleSpec || 'N/A'],
      ['RTO Zone', data.zone || 'N/A'],
      ['Vehicle Age', data.vehicleAge || 'N/A'],
    ]
    if (data.mfgYear) vehicleRows.push(['Mfg Year', data.mfgYear])
    if (data.vehicleSubtype) vehicleRows.push(['Sub-Type', data.vehicleSubtype])

    const quoteRows = [
      ['Policy Type', data.policyType || 'N/A'],
      ['IDV', fmt(data.idv)],
      ['NCB', `${data.ncb || 0}%`],
      ['OD Discount', `${data.odDiscount || 0}%`],
    ]

    const maxRows = Math.max(vehicleRows.length, quoteRows.length)
    const boxH = maxRows * 20 + 50

    // Draw vehicle box
    doc.roundedRect(50, y, boxW, boxH, 8).fillColor('#f8fafc').fill()
    doc.roundedRect(50, y, boxW, boxH, 8).strokeColor('#e2e8f0').lineWidth(1).stroke()
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#4f46e5').text('Vehicle Details', 62, y + 12)
    doc.moveTo(62, y + 28).lineTo(50 + boxW - 12, y + 28).strokeColor('#cbd5e1').lineWidth(1).stroke()
    let ry = y + 36
    vehicleRows.forEach(([label, value]) => {
      doc.fontSize(9).font('Helvetica').fillColor('#64748b').text(label, 62, ry)
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#0f172a').text(value, 50 + boxW - 12, ry, { align: 'right' })
      ry += 18
    })

    // Draw quote box
    const qx = 50 + boxW + 20
    doc.roundedRect(qx, y, boxW, boxH, 8).fillColor('#f8fafc').fill()
    doc.roundedRect(qx, y, boxW, boxH, 8).strokeColor('#e2e8f0').lineWidth(1).stroke()
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#4f46e5').text('Quotation Details', qx + 12, y + 12)
    doc.moveTo(qx + 12, y + 28).lineTo(qx + boxW - 12, y + 28).strokeColor('#cbd5e1').lineWidth(1).stroke()
    ry = y + 36
    quoteRows.forEach(([label, value]) => {
      doc.fontSize(9).font('Helvetica').fillColor('#64748b').text(label, qx + 12, ry)
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#0f172a').text(value, qx + boxW - 12, ry, { align: 'right' })
      ry += 18
    })

    y = y + boxH + 25

    // ── Premium Table ──────────────────────────────────────────────────────
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#1e293b').text('Premium Calculation Breakup', 50, y)
    y += 22

    const col1 = 50
    const col2 = pageWidth * 0.65 + 50
    const col3 = pageWidth + 50
    const tableTop = y

    const drawTableHeader = (yy) => {
      doc.rect(50, yy, pageWidth, 24).fillColor('#f1f5f9').fill()
      doc.rect(50, yy, pageWidth, 24).strokeColor('#cbd5e1').lineWidth(1).stroke()
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#475569')
      doc.text('Description', col1 + 8, yy + 6)
      doc.text('Rate', col2 + 8, yy + 6)
      doc.text('Amount (INR)', col3 - 8, yy + 6, { align: 'right' })
      return yy + 24
    }

    const drawRow = (yy, desc, rate, amount, opts = {}) => {
      if (opts.fill) {
        doc.rect(50, yy, pageWidth, 22).fillColor(opts.fill).fill()
      }
      doc.rect(50, yy, pageWidth, 22).strokeColor('#e2e8f0').lineWidth(0.5).stroke()
      if (opts.bold) {
        doc.font('Helvetica-Bold')
      } else {
        doc.font('Helvetica')
      }
      const color = opts.color || '#1e293b'
      doc.fontSize(9).fillColor(color)
      doc.text(desc, col1 + 8, yy + 4)
      doc.text(rate, col2 + 8, yy + 4)
      doc.text(fmt(amount), col3 - 8, yy + 4, { align: 'right' })
      return yy + 22
    }

    let ty = drawTableHeader(tableTop)

    const premiums = data.premiums || {}
    const rows = data.tableRows || []

    rows.forEach(row => {
      if (ty > doc.page.height - 100) {
        doc.addPage()
        ty = 50
        ty = drawTableHeader(ty)
      }
      if (row.type === 'total') {
        ty = drawRow(ty, row.desc, row.rate, row.amount, { bold: true, fill: '#e0e7ff', color: '#312e81' })
      } else if (row.type === 'discount') {
        ty = drawRow(ty, row.desc, row.rate, row.amount, { color: '#16a34a' })
      } else if (row.type === 'gst-header') {
        ty = drawRow(ty, row.desc, row.rate, row.amount, { bold: true, fill: '#f8fafc' })
      } else {
        ty = drawRow(ty, row.desc, row.rate, row.amount)
      }
    })

    // Add total row
    if (ty > doc.page.height - 80) {
      doc.addPage()
      ty = 50
    }
    doc.rect(50, ty, pageWidth, 30).fillColor('#e0e7ff').fill()
    doc.rect(50, ty, pageWidth, 30).strokeColor('#4f46e5').lineWidth(2).stroke()
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#312e81')
    doc.text('Total Payable Premium', col1 + 8, ty + 6)
    doc.text(fmt(data.totalPayable), col3 - 8, ty + 6, { align: 'right' })
    ty += 45

    // ── Disclaimer ─────────────────────────────────────────────────────────
    if (ty > doc.page.height - 60) {
      doc.addPage()
      ty = 50
    }
    doc.moveTo(50, ty).lineTo(50 + pageWidth, ty).strokeColor('#e2e8f0').lineWidth(1).stroke()
    ty += 10
    doc.fontSize(8).font('Helvetica').fillColor('#94a3b8')
    doc.text(
      'This is an indicative system-generated insurance quotation prepared under the Indian Motor Tariff guidelines. The final premium is subject to actual verification of vehicle registration details, previous policy claim history, and underwriting guidelines of the respective insurance company.',
      50, ty,
      { align: 'center', width: pageWidth }
    )

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
