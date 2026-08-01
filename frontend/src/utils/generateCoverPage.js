import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

const resolveUrl = (url) => {
  if (!url) return null
  if (url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://')) return url
  return `${API_URL}${url}`
}

// Safely fetch image bytes (CORS may block some URLs)
const fetchImageBytes = async (url) => {
  try {
    const res = await fetch(resolveUrl(url))
    const blob = await res.blob()
    return new Uint8Array(await blob.arrayBuffer())
  } catch {
    return null
  }
}

// Clean text to ensure complete compatibility with standard PDF fonts (WinAnsiEncoding)
const clean = (text) => {
  if (!text) return ''
  return String(text)
    .replace(/₹/g, 'Rs. ')
    .replace(/[^\x20-\x7E]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// Clamp text to a max width by truncating with ellipsis
const clampText = (text, font, size, maxWidth) => {
  if (!text) return ''
  let t = clean(text)
  while (t.length > 0 && font.widthOfTextAtSize(t + '...', size) > maxWidth) {
    t = t.slice(0, -1)
  }
  if (font.widthOfTextAtSize(clean(text), size) > maxWidth) return t + '...'
  return t
}

const fmt = (v) => (v ? clean(v) : 'N/A')

/**
 * Generates a personalized PDF cover page and prepends it to existingPdfBytes.
 * Matches the reference image exact design, layout, dark theme background, and typography.
 * 
 * @param {Uint8Array} existingPdfBytes  - the original policy document bytes
 * @param {object} user                  - AuthContext user (name, email, mobile, businessName, picture, modeOfBusiness)
 * @param {object} record                - the insurance record from the API
 * @returns {Uint8Array}                 - merged PDF bytes
 */
export async function prependCoverPage(existingPdfBytes, user, record) {
  // ── Dimensions (A4 in pts @ 72dpi) ───────────────────────────────────────
  const W = 595.28
  const H = 841.89

  // ── Create cover PDF document ────────────────────────────────────────────
  const coverDoc = await PDFDocument.create()
  const page = coverDoc.addPage([W, H])

  const fontRegular = await coverDoc.embedFont(StandardFonts.Helvetica)
  const fontBold    = await coverDoc.embedFont(StandardFonts.HelveticaBold)

  // ── Colors (exact match to reference design image) ───────────────────────
  const darkBg    = rgb(0.149, 0.149, 0.149)   // #262626 Dark gray page background
  const darkRow   = rgb(0.149, 0.149, 0.149)   // #262626 Dark row background
  const lightTeal = rgb(0.898, 0.969, 0.965)   // #E5F7F5 Light teal/cyan row & box bg
  const teal      = rgb(0.0, 0.659, 0.588)     // #00A896 Bright teal accent
  const white     = rgb(1, 1, 1)               // #FFFFFF
  const textDark  = rgb(0.067, 0.094, 0.153)   // #111827 Dark text for light rows
  const textLight = rgb(0.949, 0.953, 0.961)   // #F3F4F6 Light text for dark rows
  const textMuted = rgb(0.82, 0.835, 0.855)    // #D1D5DB Muted text
  const lineGrey  = rgb(0.35, 0.37, 0.40)      // #595E66 Horizontal divider line

  // ── Draw full page dark background ───────────────────────────────────────
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: darkBg })

  // ── Helper Draw Functions ────────────────────────────────────────────────
  const draw = (text, x, y, { font = fontRegular, size = 10, color = textLight } = {}) => {
    const txt = clampText(text, font, size, W - x - 24)
    if (!txt) return
    page.drawText(txt, { x, y, size, font, color })
  }

  const drawRight = (text, rightX, y, { font = fontRegular, size = 10, color = textLight } = {}) => {
    const txt = clean(text)
    if (!txt) return
    const w = font.widthOfTextAtSize(txt, size)
    page.drawText(txt, { x: rightX - w, y, size, font, color })
  }

  const hLine = (y, opts = {}) => page.drawLine({
    start: { x: opts.x1 ?? 24, y },
    end:   { x: opts.x2 ?? (W - 24), y },
    thickness: opts.thickness ?? 0.6,
    color: opts.color ?? lineGrey,
  })

  // ── TOP HEADER SECTION ───────────────────────────────────────────────────
  const marginX = 24
  const logoSize = 46
  const logoX = marginX
  const logoY = H - 64

  // Draw Logo (or fallback initial box)
  let logoLoaded = false
  if (user?.picture) {
    try {
      const imgBytes = await fetchImageBytes(user.picture)
      if (imgBytes) {
        let img
        try { img = await coverDoc.embedJpg(imgBytes) } catch { img = await coverDoc.embedPng(imgBytes) }
        page.drawImage(img, { x: logoX, y: logoY, width: logoSize, height: logoSize })
        logoLoaded = true
      }
    } catch {
      logoLoaded = false
    }
  }

  if (!logoLoaded) {
    // White logo container box with circular logo background inside
    page.drawRectangle({ x: logoX, y: logoY, width: logoSize, height: logoSize, color: white })
    page.drawCircle({ x: logoX + logoSize / 2, y: logoY + logoSize / 2, size: logoSize / 2 - 3, color: teal })
    const initial = clean(user?.businessName || user?.name || 'A').charAt(0).toUpperCase() || 'A'
    const initW = fontBold.widthOfTextAtSize(initial, 18)
    page.drawText(initial, {
      x: logoX + (logoSize - initW) / 2,
      y: logoY + 14,
      size: 18, font: fontBold, color: white,
    })
  }

  // Business Name next to logo
  const bizTitle = clean(user?.businessName || user?.name || 'nkd insurance')
  draw(bizTitle, logoX + logoSize + 12, logoY + 16, { font: fontBold, size: 14, color: textLight })

  // Advisor info block (top right aligned)
  const rightX = W - marginX
  drawRight(`Advisor Name : ${fmt(user?.name)}`, rightX, H - 32, { font: fontBold, size: 9, color: textMuted })
  drawRight(`Mobile no : ${fmt(user?.mobile)}`, rightX, H - 46, { font: fontBold, size: 9, color: textMuted })
  drawRight(`Email id : ${fmt(user?.email)}`, rightX, H - 60, { font: fontBold, size: 9, color: textMuted })

  // Full-width teal line below header
  hLine(H - 74, { color: teal, thickness: 1.5 })

  // ── POLICY SUMMARY MAIN TITLE ────────────────────────────────────────────
  const mainTitle = 'POLICY SUMMARY'
  const titleW = fontBold.widthOfTextAtSize(mainTitle, 18)
  const titleX = (W - titleW) / 2
  const titleY = H - 110
  page.drawText(mainTitle, { x: titleX, y: titleY, size: 18, font: fontBold, color: white })
  // White underline under main title
  hLine(titleY - 6, { x1: titleX - 4, x2: titleX + titleW + 4, color: white, thickness: 1.2 })

  // ── GREETING & THANK YOU PARAGRAPH ───────────────────────────────────────
  const clientName = clean(record?.policyHolderName || record?.ownerName || record?.vehicleOwner || 'Valued Customer').toUpperCase()
  draw(`Dear ${clientName}`, marginX, H - 142, { font: fontBold, size: 11, color: teal })

  const displayBizName = clean(user?.businessName || user?.name || 'NKD Insurance')
  draw(`Thank you for choosing ${displayBizName}.`, marginX, H - 162, { font: fontRegular, size: 10, color: textLight })

  const paraText1 = 'We sincerely appreciate the opportunity to serve you. Your trust is valuable to us, and we remain committed to providing prompt assistance throughout your policy period--from policy issuance to renewals and claim support.'
  const paraText2 = 'Please keep this document safely for your records. If you require any assistance regarding your insurance policy or claim, our team is always happy to help.'

  // Format paragraphs cleanly across lines
  let curY = H - 184
  const wrapAndDraw = (text, startY, lineGap = 14) => {
    const words = text.split(' ')
    let line = ''
    let y = startY
    const maxW = W - marginX * 2
    words.forEach((w) => {
      const test = line ? `${line} ${w}` : w
      if (fontRegular.widthOfTextAtSize(clean(test), 9.5) > maxW) {
        draw(line, marginX, y, { font: fontRegular, size: 9.5, color: textLight })
        line = w
        y -= lineGap
      } else {
        line = test
      }
    })
    if (line) {
      draw(line, marginX, y, { font: fontRegular, size: 9.5, color: textLight })
      y -= lineGap
    }
    return y
  }

  curY = wrapAndDraw(paraText1, curY)
  curY -= 4
  curY = wrapAndDraw(paraText2, curY)

  // Separator line below paragraphs
  curY -= 10
  hLine(curY, { color: lineGrey, thickness: 0.6 })

  // ── POLICY SUMMARY TABLE ────────────────────────────────────────────────
  curY -= 22
  const secTitle1 = 'Policy Summary'
  draw(secTitle1, marginX, curY, { font: fontBold, size: 11, color: white })
  const st1W = fontBold.widthOfTextAtSize(secTitle1, 11)
  hLine(curY - 4, { x1: marginX, x2: marginX + st1W + 4, color: white, thickness: 0.8 })

  const parseOrFmtDate = (d) => {
    if (!d) return 'N/A'
    const str = clean(d)
    if (!str) return 'N/A'
    if (/^\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}$/.test(str)) return str
    try {
      const dt = new Date(d)
      if (isNaN(dt.getTime())) return str
      return dt.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    } catch {
      return str
    }
  }

  const startDateStr = parseOrFmtDate(record?.issueDate || record?.validFrom)
  const endDateStr = parseOrFmtDate(record?.validTo)

  const summaryRows = [
    ['Policyholder',        record?.policyHolderName || record?.vehicleOwner || 'N/A'],
    ['Policy Number',       record?.policyNumber || 'N/A'],
    ['Policy Type',         record?.product || record?.insuranceType || 'Two Wheeler'],
    ['Vehicle Number',      record?.vehicleNumber || 'N/A'],
    ['Annual Premium',      record?.premium ? `Rs. ${Number(record.premium).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : 'N/A'],
    ['Policy Start Date',   startDateStr],
    ['Maturity / End Date', endDateStr],
    ['Insurance Company',   record?.insuranceCompany || 'N/A'],
  ]

  curY -= 18
  const rowH = 22
  const col1 = marginX
  const col2 = 210

  summaryRows.forEach((row, i) => {
    const isLightRow = i % 2 === 1
    const bg = isLightRow ? lightTeal : darkRow
    const labelColor = isLightRow ? textDark : textLight
    const valColor = isLightRow ? textDark : textLight
    const valFont = (row[0] === 'Vehicle Number' || row[0] === 'Policy Number') ? fontBold : fontRegular

    page.drawRectangle({ x: col1, y: curY - 4, width: W - marginX * 2, height: rowH, color: bg })
    draw(row[0], col1 + 8, curY + 3, { font: fontBold, size: 9.5, color: labelColor })
    draw(`: ${row[1]}`, col2, curY + 3, { font: valFont, size: 9.5, color: valColor })
    curY -= rowH
  })

  // ── SERVICES WE OFFER SECTION ───────────────────────────────────────────
  curY -= 14
  const secTitle2 = 'Services We Offer'
  draw(secTitle2, marginX, curY, { font: fontBold, size: 11, color: white })
  const st2W = fontBold.widthOfTextAtSize(secTitle2, 11)
  hLine(curY - 4, { x1: marginX, x2: marginX + st2W + 4, color: white, thickness: 0.8 })

  curY -= 20
  // Use user's modeOfBusiness services or default to ['Motor', 'Health']
  const serviceLabels = (user?.modeOfBusiness && user.modeOfBusiness.length > 0)
    ? user.modeOfBusiness.map((s) => clean(s))
    : ['Motor', 'Health']

  const colsPerRow = 4
  const gapBetweenX = 10
  const gapBetweenY = 8
  const boxH = 24
  const boxW = (W - marginX * 2 - gapBetweenX * (colsPerRow - 1)) / colsPerRow

  serviceLabels.forEach((label, idx) => {
    const rowIdx = Math.floor(idx / colsPerRow)
    const colIdx = idx % colsPerRow

    const bx = marginX + colIdx * (boxW + gapBetweenX)
    const by = curY - rowIdx * (boxH + gapBetweenY) - 18

    page.drawRectangle({ x: bx, y: by, width: boxW, height: boxH, color: lightTeal, borderColor: teal, borderWidth: 1 })

    const textToDraw = clampText(label, fontBold, 9.5, boxW - 6)
    const lw = fontBold.widthOfTextAtSize(textToDraw, 9.5)
    page.drawText(textToDraw, {
      x: bx + (boxW - lw) / 2,
      y: by + 7,
      size: 9.5,
      font: fontBold,
      color: teal,
    })
  })

  // Update curY dynamically based on number of service rows rendered
  const totalServiceRows = Math.ceil(serviceLabels.length / colsPerRow)
  curY -= (totalServiceRows * boxH + (totalServiceRows - 1) * gapBetweenY) + 24

  // ── REACH YOUR ADVISOR ANYTIME ───────────────────────────────────────────
  const secTitle3 = 'Reach Your Advisor Anytime'
  draw(secTitle3, marginX, curY, { font: fontBold, size: 11, color: white })
  const st3W = fontBold.widthOfTextAtSize(secTitle3, 11)
  hLine(curY - 4, { x1: marginX, x2: marginX + st3W + 4, color: white, thickness: 0.8 })

  curY -= 22
  const contactLines = [
    ['N', `Name : ${fmt(user?.name)}`],
    ['M', `Mobile : ${fmt(user?.mobile)}`],
    ['E', `Email : ${fmt(user?.email)}`],
  ]
  contactLines.forEach(([badgeLetter, text]) => {
    page.drawCircle({ x: marginX + 8, y: curY + 3, size: 8, color: teal })
    page.drawText(badgeLetter, { x: marginX + 5.5, y: curY, size: 8, font: fontBold, color: white })
    draw(text, marginX + 22, curY, { font: fontRegular, size: 9.5, color: textLight })
    curY -= 20
  })

  // ── MERGE COVER PAGE WITH ORIGINAL DOCUMENT ──────────────────────────────
  const coverBytes = await coverDoc.save()
  const mergedDoc = await PDFDocument.create()

  // Copy cover page
  const coverSrc = await PDFDocument.load(coverBytes)
  const [coverPg] = await mergedDoc.copyPages(coverSrc, [0])
  mergedDoc.addPage(coverPg)

  // Copy original document pages (PDF or embedded Image)
  try {
    const origSrc = await PDFDocument.load(existingPdfBytes, { ignoreEncryption: true })
    const origPageCount = origSrc.getPageCount()
    const origPages = await mergedDoc.copyPages(origSrc, [...Array(origPageCount).keys()])
    origPages.forEach((p) => mergedDoc.addPage(p))
  } catch (pdfErr) {
    try {
      let embeddedImg
      try {
        embeddedImg = await mergedDoc.embedJpg(existingPdfBytes)
      } catch {
        embeddedImg = await mergedDoc.embedPng(existingPdfBytes)
      }
      if (embeddedImg) {
        const imgDims = embeddedImg.scale(1)
        const imgPage = mergedDoc.addPage([W, H])
        const scale = Math.min(W / imgDims.width, H / imgDims.height)
        const imgWidth = imgDims.width * scale
        const imgHeight = imgDims.height * scale
        const x = (W - imgWidth) / 2
        const y = (H - imgHeight) / 2
        imgPage.drawImage(embeddedImg, { x, y, width: imgWidth, height: imgHeight })
      }
    } catch (imgErr) {
      console.error('Failed to embed document image into PDF:', imgErr)
    }
  }

  return await mergedDoc.save()
}

