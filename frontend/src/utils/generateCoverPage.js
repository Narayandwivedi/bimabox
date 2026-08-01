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
 * @param {Uint8Array} existingPdfBytes  - the original policy document bytes
 * @param {object} user                  - AuthContext user (name, email, mobile, businessName, picture)
 * @param {object} record                - the insurance record from the API
 * @returns {Uint8Array}                 - merged PDF bytes
 */
export async function prependCoverPage(existingPdfBytes, user, record) {
  // ── Dimensions (A4 in pts @ 72dpi) ───────────────────────────────────────
  const W = 595.28
  const H = 841.89

  // ── Create the cover PDF ─────────────────────────────────────────────────
  const coverDoc = await PDFDocument.create()
  const page = coverDoc.addPage([W, H])

  const fontRegular = await coverDoc.embedFont(StandardFonts.Helvetica)
  const fontBold    = await coverDoc.embedFont(StandardFonts.HelveticaBold)

  // ── Colors ───────────────────────────────────────────────────────────────
  const teal      = rgb(0.047, 0.573, 0.573)   // #0c9292
  const tealLight = rgb(0.898, 0.976, 0.976)   // #e5f9f9
  const dark      = rgb(0.118, 0.169, 0.239)   // #1e2b3d
  const grey      = rgb(0.38, 0.44, 0.54)      // #616f89
  const black     = rgb(0, 0, 0)
  const white     = rgb(1, 1, 1)
  const lineGrey  = rgb(0.85, 0.87, 0.89)

  // ── Helpers ──────────────────────────────────────────────────────────────
  const draw = (text, x, y, { font = fontRegular, size = 10, color = black } = {}) => {
    const txt = clampText(text, font, size, W - x - 30)
    if (!txt) return
    page.drawText(txt, { x, y, size, font, color })
  }

  const drawRight = (text, rightX, y, { font = fontRegular, size = 10, color = black } = {}) => {
    const txt = clean(text)
    if (!txt) return
    const w = font.widthOfTextAtSize(txt, size)
    page.drawText(txt, { x: rightX - w, y, size, font, color })
  }

  const hLine = (y, opts = {}) => page.drawLine({
    start: { x: opts.x1 ?? 30, y },
    end:   { x: opts.x2 ?? (W - 30), y },
    thickness: opts.thickness ?? 0.5,
    color: opts.color ?? lineGrey,
  })

  // ── Top header bar ───────────────────────────────────────────────────────
  page.drawRectangle({ x: 0, y: H - 80, width: W, height: 80, color: white })

  // Logo circle (left side)
  const logoSize = 54
  const logoX = 30
  const logoY = H - 70
  page.drawCircle({ x: logoX + logoSize / 2, y: logoY + logoSize / 2, size: logoSize / 2, color: teal })

  // Try to embed logo image if picture exists
  if (user?.picture) {
    try {
      const imgBytes = await fetchImageBytes(user.picture)
      if (imgBytes) {
        let img
        try { img = await coverDoc.embedJpg(imgBytes) } catch { img = await coverDoc.embedPng(imgBytes) }
        page.drawImage(img, { x: logoX, y: logoY, width: logoSize, height: logoSize, opacity: 1 })
      } else throw new Error('no bytes')
    } catch {
      // fallback: initial letter
      const initial = clean(user?.businessName || user?.name || 'A').charAt(0).toUpperCase() || 'A'
      page.drawText(initial, {
        x: logoX + logoSize / 2 - fontBold.widthOfTextAtSize(initial, 22) / 2,
        y: logoY + logoSize / 2 - 8,
        size: 22, font: fontBold, color: white,
      })
    }
  } else {
    const initial = clean(user?.businessName || user?.name || 'A').charAt(0).toUpperCase() || 'A'
    page.drawText(initial, {
      x: logoX + logoSize / 2 - fontBold.widthOfTextAtSize(initial, 22) / 2,
      y: logoY + logoSize / 2 - 8,
      size: 22, font: fontBold, color: white,
    })
  }

  // Business name right of logo
  if (user?.businessName) {
    draw(user.businessName, logoX + logoSize + 12, H - 38, { font: fontBold, size: 13, color: dark })
  }

  // Advisor contact block (top right)
  const advisorLines = [
    `Advisor Name : ${fmt(user?.name)}`,
    `Mobile no : ${fmt(user?.mobile)}`,
    `Email id : ${fmt(user?.email)}`,
  ]
  advisorLines.forEach((line, i) => {
    drawRight(line, W - 30, H - 26 - i * 16, { font: fontRegular, size: 9, color: grey })
  })

  // Horizontal separator
  hLine(H - 82, { color: teal, thickness: 1.5 })

  // ── POLICY SUMMARY title ─────────────────────────────────────────────────
  const title = 'POLICY SUMMARY'
  const titleW = fontBold.widthOfTextAtSize(title, 18)
  page.drawText(title, { x: (W - titleW) / 2, y: H - 118, size: 18, font: fontBold, color: dark })

  // Underline
  hLine(H - 123, { x1: (W - titleW) / 2 - 4, x2: (W - titleW) / 2 + titleW + 4, color: dark, thickness: 1 })

  // ── Dear … greeting ──────────────────────────────────────────────────────
  const clientName = clean(record?.policyHolderName || record?.ownerName || record?.vehicleOwner || 'Valued Customer').toUpperCase()
  draw(`Dear ${clientName}`, 36, H - 150, { font: fontBold, size: 11, color: teal })

  // ── Thank you paragraph ──────────────────────────────────────────────────
  const bizName = clean(user?.businessName || user?.name || 'our team')
  draw(`Thank you for choosing ${bizName}.`, 36, H - 172, { font: fontBold, size: 10, color: dark })
  const paraLines = [
    'We sincerely appreciate the opportunity to serve you. Your trust is valuable to us, and we remain committed',
    'to providing prompt assistance throughout your policy period -- from policy issuance to renewals and claim',
    'support. Please keep this document safely for your records.',
  ]
  paraLines.forEach((line, i) => draw(line, 36, H - 188 - i * 14, { size: 9, color: grey }))

  // ── Advisor name row ─────────────────────────────────────────────────────
  hLine(H - 240)
  draw(`Advisor Name : ${fmt(user?.name)}`, 36, H - 255, { font: fontBold, size: 10, color: dark })
  drawRight('Your Trusted Advisor', W - 36, H - 255, { font: fontBold, size: 10, color: dark })
  draw(fmt(user?.name), W - 36 - fontRegular.widthOfTextAtSize(fmt(user?.name), 10), H - 269, { size: 10, color: grey })
  hLine(H - 278)

  // ── Policy Summary section ───────────────────────────────────────────────
  draw('Policy Summary', 36, H - 300, { font: fontBold, size: 12, color: dark })
  hLine(H - 305, { x1: 36, x2: 36 + fontBold.widthOfTextAtSize('Policy Summary', 12) + 4, color: dark, thickness: 1 })

  const fmtDate = (d) => {
    if (!d) return 'N/A'
    try { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }) }
    catch { return clean(d) }
  }

  const summaryRows = [
    ['Policyholder',        record?.policyHolderName || record?.vehicleOwner || 'N/A'],
    ['Policy Number',       record?.policyNumber || 'N/A'],
    ['Policy Type',         record?.product || record?.insuranceType || 'MOTOR'],
    ['Vehicle Number',      record?.vehicleNumber || 'N/A'],
    ['Annual Premium',      record?.premium ? `Rs. ${Number(record.premium).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : 'N/A'],
    ['Policy Start Date',   record?.issueDate ? clean(record.issueDate) : fmtDate(record?.validFrom)],
    ['Maturity / End Date', record?.validTo ? clean(record.validTo) : 'N/A'],
    ['Insurance Company',   record?.insuranceCompany || 'N/A'],
  ]

  let rowY = H - 320
  const rowH = 22
  const col1 = 36
  const col2 = 230

  summaryRows.forEach((row, i) => {
    const bg = i % 2 === 0 ? white : tealLight
    page.drawRectangle({ x: col1, y: rowY - 5, width: W - col1 * 2, height: rowH, color: bg })
    draw(row[0], col1 + 6, rowY + 4, { font: fontBold, size: 9.5, color: dark })
    draw(`: ${row[1]}`, col2, rowY + 4, { size: 9.5, color: dark })
    rowY -= rowH
  })

  // ── Services We Offer section ────────────────────────────────────────────
  rowY -= 14
  draw('Services We Offer', col1, rowY, { font: fontBold, size: 11, color: dark })
  hLine(rowY - 4, { x1: col1, x2: col1 + fontBold.widthOfTextAtSize('Services We Offer', 11) + 4, color: dark, thickness: 0.8 })

  // Sub-heading: Explore More Protection for Your Family
  rowY -= 18
  draw('Explore More Protection for Your Family', col1, rowY, { font: fontBold, size: 9.5, color: teal })

  rowY -= 18
  // Use user's saved modeOfBusiness services; fall back to defaults if none saved
  const serviceLabels = (user?.modeOfBusiness && user.modeOfBusiness.length > 0)
    ? user.modeOfBusiness.map((s) => clean(s))
    : ['Motor', 'Health']
  const numServices = serviceLabels.length
  const gapBetween = 8
  const totalGap = gapBetween * (numServices - 1)
  const boxW = Math.min(140, (W - col1 * 2 - totalGap) / numServices)
  serviceLabels.forEach((label, i) => {
    const bx = col1 + i * (boxW + gapBetween)
    page.drawRectangle({ x: bx, y: rowY - 18, width: boxW, height: 26, color: tealLight, borderColor: teal, borderWidth: 0.8 })
    const lw = fontBold.widthOfTextAtSize(label, 10)
    page.drawText(label, { x: bx + (boxW - lw) / 2, y: rowY - 8, size: 10, font: fontBold, color: teal })
  })

  // ── Reach Your Advisor Anytime ───────────────────────────────────────────
  rowY -= 44
  draw('Reach Your Advisor Anytime', col1, rowY, { font: fontBold, size: 11, color: dark })
  hLine(rowY - 4, { x1: col1, x2: col1 + fontBold.widthOfTextAtSize('Reach Your Advisor Anytime', 11) + 4, color: dark, thickness: 0.8 })

  rowY -= 22
  const contactLines = [
    ['N', `Name : ${fmt(user?.name)}`],
    ['M', `Mobile : ${fmt(user?.mobile)}`],
    ['E', `Email : ${fmt(user?.email)}`],
  ]
  contactLines.forEach(([badgeLetter, text]) => {
    // Draw icon circle with ASCII badge letter inside
    page.drawCircle({ x: col1 + 8, y: rowY + 3, size: 8, color: teal })
    page.drawText(badgeLetter, { x: col1 + 5.5, y: rowY, size: 8, font: fontBold, color: white })
    draw(text, col1 + 22, rowY, { size: 9.5, color: dark })
    rowY -= 20
  })

  // ── Footer bar ───────────────────────────────────────────────────────────
  page.drawRectangle({ x: 0, y: 0, width: W, height: 30, color: teal })
  const footerText = user?.businessName || user?.name || 'BimaBox'
  const ftw = fontRegular.widthOfTextAtSize(footerText, 9)
  page.drawText(footerText, { x: (W - ftw) / 2, y: 10, size: 9, font: fontRegular, color: white })

  // ── Merge: cover page first, then original pages or image page ───────────
  const coverBytes = await coverDoc.save()
  const mergedDoc = await PDFDocument.create()

  // Copy cover page
  const coverSrc = await PDFDocument.load(coverBytes)
  const [coverPg] = await mergedDoc.copyPages(coverSrc, [0])
  mergedDoc.addPage(coverPg)

  // Try to load as PDF first (ignoring encryption if present)
  try {
    const origSrc = await PDFDocument.load(existingPdfBytes, { ignoreEncryption: true })
    const origPageCount = origSrc.getPageCount()
    const origPages = await mergedDoc.copyPages(origSrc, [...Array(origPageCount).keys()])
    origPages.forEach((p) => mergedDoc.addPage(p))
  } catch (pdfErr) {
    // If not a valid PDF (e.g. image document like PNG/JPG/WebP), embed image onto page 2
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
      console.error('Failed to embed attached document image into PDF:', imgErr)
    }
  }

  return await mergedDoc.save()
}
