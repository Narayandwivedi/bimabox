const axios = require('axios')
const pdfParse = require('pdf-parse')
const InsuranceCompany = require('../models/InsuranceCompany')

/**
 * IFFCO Tokio PDFs have a combined line like:
 *   "COMPANY NAMEPolicy #:1-8H9WT9SUP400 Policy #N7964694"
 * where the FIRST Policy # is the Tax Invoice / internal ref and
 * the SECOND Policy # is the actual policy number.
 * This helper detects that pattern and returns the correct policy number.
 */
const extractIffcoTokioPolicyNumber = (rawText) => {
  if (!rawText) return null

  // Pattern: one line containing two "Policy #" occurrences
  // e.g. "...Policy #:1-8H9WT9SUP400 Policy #N7964694"
  // The actual policy number follows the LAST "Policy #" on that line.
  const lines = rawText.split('\n')
  for (const line of lines) {
    // Count occurrences of "Policy #" (case-insensitive)
    const matches = [...line.matchAll(/Policy\s*#\s*:?\s*([^\s]+)/gi)]
    if (matches.length >= 2) {
      // The last match is the actual policy number
      const actualPolicyNo = matches[matches.length - 1][1].trim()
      if (actualPolicyNo) {
        console.log('[IFFCO-Tokio] Detected dual Policy# line. Overriding policy number to:', actualPolicyNo)
        return actualPolicyNo
      }
    }
  }
  return null
}

/**
 * Indian vehicle registration numbers follow the pattern:
 *   <2-letter state code><2-digit district><1-3 letter series><4-digit number>
 * Total length after stripping hyphens/spaces: 9 or 10 characters.
 * Examples: CG04NS0396, MH12AB1234, DL1CAB1234
 *
 * If the AI returns a vehicleNumber that is clearly wrong (too long, looks like
 * Engine No or Chassis No concatenation), this helper scans the raw PDF text
 * for a valid Indian registration number and returns it.
 */
const INDIAN_REG_NO_PATTERN = /\b([A-Z]{2}\d{2}[A-Z]{1,3}\d{4})\b/g

const isValidIndianVehicleNumber = (val) => {
  if (!val) return false
  const stripped = val.replace(/[\s-]/g, '').toUpperCase()
  return /^[A-Z]{2}\d{2}[A-Z]{1,3}\d{4}$/.test(stripped) // 9 or 10 chars
}

const extractValidIndianVehicleNumber = (rawText) => {
  if (!rawText) return null

  // 1. Try labeled matches: look for lines containing Registration keywords
  const labeledPattern = /(?:Registration\s*(?:Mark\s*&?\s*)?No\.?|Reg(?:istration)?\s*No\.?|Vehicle\s*No\.?)\s*[:\-]?\s*([A-Z]{2}[\s-]?\d{2}[\s-]?[A-Z]{1,3}[\s-]?\d{4})/gi
  const labeledMatch = rawText.match(labeledPattern)
  if (labeledMatch) {
    for (const m of labeledMatch) {
      const numMatch = m.match(/([A-Z]{2}[\s-]?\d{2}[\s-]?[A-Z]{1,3}[\s-]?\d{4})/i)
      if (numMatch) {
        const candidate = numMatch[1].replace(/[\s-]/g, '').toUpperCase()
        if (isValidIndianVehicleNumber(candidate)) {
          console.log('[VehicleNo] Extracted from label:', candidate)
          return candidate
        }
      }
    }
  }

  // 2. Fallback: scan all tokens in the text for Indian reg-no shaped strings
  //    Prefer shorter valid matches (9-10 chars) over concatenated junk
  const candidates = []
  let m
  const re = new RegExp(INDIAN_REG_NO_PATTERN.source, 'g')
  while ((m = re.exec(rawText.replace(/[\s-]/g, ' ').replace(/ /g, ''))) !== null) {
    // Run on original text lines to avoid cross-line concatenation
    candidates.push(m[1])
  }

  // Also scan line by line to catch values concatenated with year (e.g. "CG04NS03962022")
  const lines = rawText.split('\n')
  for (const line of lines) {
    const stripped = line.replace(/[\s-]/g, '').toUpperCase()
    // Match Indian reg no possibly followed by 4-digit year
    const lineMatch = stripped.match(/^([A-Z]{2}\d{2}[A-Z]{1,3}\d{4})(\d{4})?/)
    if (lineMatch && isValidIndianVehicleNumber(lineMatch[1])) {
      candidates.push(lineMatch[1])
    }
  }

  if (candidates.length > 0) {
    // Return the first valid unique candidate
    const unique = [...new Set(candidates)]
    console.log('[VehicleNo] Candidates found:', unique)
    return unique[0]
  }

  return null
}

const HIGH_VALUE_KEYWORDS = [
  'registration no', 'vehicle no', 'engine number', 'chassis', 'make', 'model',
  'policy no', 'policy number', 'valid from', 'valid till', 'period of insurance',
  'premium', 'total premium', 'insured', 'insured name', 'receipt', 'proposal',
  'certificate of insurance', 'policy schedule', 'fuel type', 'seating capacity',
  'mfg. year', 'manufacture year', 'date of registration', 'body type'
]

const extractRelevantPdfText = (fullText) => {
  let cleaned = fullText.replace(/[\u0900-\u097F]+/g, '').trim()

  const BOILERPLATE = [
    /Motor Vehicles? Act[^\n]{0,300}/gi,
    /Central Motor Vehicle[^\n]{0,250}/gi,
    /amended from time to time[^\n]{0,200}/gi,
    /Arbitration Clause[^\n]{0,200}/gi,
    /AVOIDANCE OF CERTAIN[^\n]{0,300}/gi,
    /RIGHT OF RECOVERY[^\n]{0,300}/gi,
    /Office of the Insurance Ombudsman[^\n]{0,400}/gi,
    /IN WITNESS WHEREOF[^\n]{0,400}/gi,
    /PersonsorClassofPersons[^\n]{0,400}/gi,
    /Usein connection[^\n]{0,400}/gi,
    /Thepolicydoesnot[^\n]{0,400}/gi,
    /IRDAI\/NL\/CIR[^\n]{0,300}/gi,
  ]
  for (const pattern of BOILERPLATE) cleaned = cleaned.replace(pattern, '')

  cleaned = cleaned.replace(/\n{3,}/g, '\n\n').replace(/[ \t]{2,}/g, ' ').trim()

  const segments = cleaned.split(/(?:Page\s*(?:no\.?|number)?\s*[:\-]?\s*\d+\s*(?:of\s*\d+)?)/i)
    .filter(s => s.trim().length > 50)

  if (segments.length <= 1) {
    return cleaned.slice(0, 6000)
  }

  const scored = segments.map((seg, i) => {
    const lower = seg.toLowerCase()
    const score = HIGH_VALUE_KEYWORDS.reduce((acc, kw) => acc + (lower.includes(kw) ? 1 : 0), 0)
    return { seg, score, i }
  })

  const topSegments = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .sort((a, b) => a.i - b.i)

  const result = topSegments.map(s => s.seg.trim()).join('\n\n---\n\n')

  return result.slice(0, 7000)
}

const callGroqAPI = async (imageBase64, textPrompt, isPdf = false, backImageBase64 = null) => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not configured')
  }

  if (isPdf) {
    const sanitizedText = imageBase64
      .replace(/ﬀ/g, 'ff').replace(/ﬁ/g, 'fi').replace(/ﬂ/g, 'fl')
      .replace(/ﬃ/g, 'ffi').replace(/ﬄ/g, 'ffl').replace(/ﬅ/g, 'st')
      .replace(/\u0000/g, ' ')
      .replace(/[^\x09\x0A\x0D\x20-\x7E\u00A0-\uFFFF]/g, ' ')
      .replace(/[ \t]{3,}/g, '  ')
      .trim()

    const messages = [
      {
        role: 'system',
        content: 'You are a precise insurance document data extractor. Extract ONLY values that literally appear in the document text. Never guess or invent values. Output valid JSON only.'
      },
      {
        role: 'user',
        content: `<DOCUMENT>\n${sanitizedText}\n</DOCUMENT>\n\n${textPrompt}`
      }
    ]

    const makeRequest = (withFormat) => {
      const body = {
        model: 'llama-3.3-70b-versatile',
        messages,
        temperature: 0,
        max_tokens: 512
      }
      if (withFormat) body.response_format = { type: 'json_object' }
      return axios.post('https://api.groq.com/openai/v1/chat/completions', body, {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
      })
    }

    try {
      return await makeRequest(true)
    } catch (firstErr) {
      const errCode = firstErr.response?.data?.error?.code
      if (errCode === 'json_validate_failed' || errCode === 'invalid_request_error') {
        console.warn('Groq json_object mode failed, retrying in free-text mode...')
        return await makeRequest(false)
      }
      throw firstErr
    }
  }

  const formattedImage = imageBase64.startsWith('data:image')
    ? imageBase64
    : `data:image/jpeg;base64,${imageBase64}`

  const contentArray = [
    { type: 'text', text: textPrompt },
    { type: 'image_url', image_url: { url: formattedImage } }
  ]

  if (backImageBase64) {
    const formattedBack = backImageBase64.startsWith('data:image')
      ? backImageBase64
      : `data:image/jpeg;base64,${backImageBase64}`
    contentArray.push({ type: 'image_url', image_url: { url: formattedBack } })
  }

  const makeVisionRequest = (withFormat) => {
    const body = {
      model: 'qwen/qwen3.6-27b',
      messages: [{ role: 'user', content: contentArray }],
      temperature: 0.1,
      max_completion_tokens: 2048,
      reasoning_format: 'hidden'
    }
    if (withFormat) body.response_format = { type: 'json_object' }
    return axios.post('https://api.groq.com/openai/v1/chat/completions', body, {
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
    })
  }

  try {
    return await makeVisionRequest(true)
  } catch (firstErr) {
    const errCode = firstErr.response?.data?.error?.code
    if (errCode === 'json_validate_failed' || errCode === 'invalid_request_error') {
      console.warn('Groq json_object mode failed for vision, retrying in free-text mode...')
      return await makeVisionRequest(false)
    }
    throw firstErr
  }
}

const processOcrRequest = async (req, res, promptText, jsonTemplate, postProcessor = null) => {
  try {
    const { imageBase64, backImageBase64 } = req.body

    if (!imageBase64) {
      return res.status(400).json({ success: false, message: 'Document base64 string is required' })
    }

    let isPdf = false
    let payload = imageBase64

    if (imageBase64.startsWith('data:application/pdf')) {
      isPdf = true
      const base64Data = imageBase64.replace(/^data:application\/pdf;base64,/, '')
      const buffer = Buffer.from(base64Data, 'base64')
      const pdfData = await pdfParse(buffer)
      const extractedText = extractRelevantPdfText(pdfData.text)

      if (extractedText.trim().length < 100) {
        console.warn('PDF appears to be scanned (image-only) — no text extracted. Pages:', pdfData.numpages)
        return res.status(422).json({
          success: false,
          message: 'This PDF appears to be a scanned image. Please convert it to a text-based PDF or upload a photo of the document instead.',
          isScannedPdf: true
        })
      }

      payload = extractedText
    }

    const fullPrompt = `${promptText}
Respond ONLY with a valid JSON object matching this structure exactly (use empty string "" if a field is not found):
${jsonTemplate}`

    const response = await callGroqAPI(payload, fullPrompt, isPdf, backImageBase64)
    let messageContent = response.data.choices?.[0]?.message?.content || ''

    messageContent = messageContent.replace(/<think>[\s\S]*?<\/think>/gi, '').trim()

    let jsonStr = messageContent
    const fencedMatch = messageContent.match(/```(?:json)?\n([\s\S]*?)\n```/)
    if (fencedMatch) {
      jsonStr = fencedMatch[1]
    } else {
      const objectMatch = messageContent.match(/\{[\s\S]*\}/)
      if (objectMatch) {
        jsonStr = objectMatch[0]
      }
    }

    let extractedData = {}
    try {
      extractedData = JSON.parse(jsonStr)
    } catch (_parseError) {
      console.error('Failed to parse Groq response to JSON:', jsonStr)
      return res.status(500).json({
        success: false,
        message: 'Failed to parse AI response into valid format',
        rawResponse: messageContent,
      })
    }

    if (typeof extractedData.vehicleNumber === 'string') {
      extractedData.vehicleNumber = extractedData.vehicleNumber.replace(/[\s-]/g, '')
    }
    if (typeof extractedData.registrationNumber === 'string') {
      extractedData.registrationNumber = extractedData.registrationNumber.replace(/[\s-]/g, '')
    }

    if (extractedData.insuranceCompany) {
      const companies = await InsuranceCompany.find().select('name').lean();
      const cleaned = extractedData.insuranceCompany.trim().replace(/[^a-zA-Z0-9\s]/g, '').toLowerCase();
      const match = companies.find(c => {
        const cCleaned = c.name.replace(/[^a-zA-Z0-9\s]/g, '').toLowerCase();
        return cleaned.includes(cCleaned) || cCleaned.includes(cleaned);
      });
      extractedData.insuranceCompany = match?.name || '';
    }

    // Run any caller-supplied post-processor (e.g. IFFCO Tokio policy# correction)
    if (typeof postProcessor === 'function') {
      extractedData = postProcessor(extractedData) || extractedData
    }

    return res.json({
      success: true,
      data: extractedData,
    })
  } catch (error) {
    console.error('OCR Error:', error.response?.data || error.message)
    return res.status(500).json({
      success: false,
      message: 'Failed to extract document data',
      error: error.response?.data || error.message,
    })
  }
}

const rcOcr = async (req, res) => {
  const prompt = 'Extract the details from this vehicle registration certificate (RC).'
  const template = `{
  "registrationNumber": "",
  "dateOfRegistration": "",
  "chassisNumber": "",
  "engineNumber": "",
  "ownerName": "",
  "sonWifeDaughterOf": "",
  "address": "",
  "makerName": "",
  "makerModel": "",
  "colour": "",
  "seatingCapacity": "",
  "vehicleType": "",
  "ladenWeight": "",
  "unladenWeight": "",
  "manufactureYear": "",
  "vehicleCategory": "",
  "numberOfCylinders": "",
  "cubicCapacity": "",
  "fuelType": "",
  "bodyType": "",
  "wheelBase": ""
}`
  return processOcrRequest(req, res, prompt, template)
}

const taxOcr = async (req, res) => {
  const prompt = 'Extract the details from this vehicle tax receipt/document. DO NOT extract or pick up the tax amount, fine, or total paid. Leave them blank.'
  const template = `{
  "vehicleNumber": "",
  "ownerName": "",
  "taxFrom": "",
  "taxTo": ""
}`
  return processOcrRequest(req, res, prompt, template)
}

const fitnessOcr = async (req, res) => {
  const prompt = 'Extract the details from this vehicle fitness certificate/document. DO NOT extract or pick up the tax amount, fine, or total paid. Leave them blank.'
  const template = `{
  "vehicleNumber": "",
  "ownerName": "",
  "validFrom": "",
  "validTo": ""
}`
  return processOcrRequest(req, res, prompt, template)
}

const pucOcr = async (req, res) => {
  const prompt = 'Extract the details from this vehicle PUC certificate/document. Extract vehicle number, owner name, valid from date, and valid to date only.'
  const template = `{
  "vehicleNumber": "",
  "ownerName": "",
  "validFrom": "",
  "validTo": ""
}`
  return processOcrRequest(req, res, prompt, template)
}

const gpsOcr = async (req, res) => {
  const prompt = 'Extract the details from this vehicle GPS or VLTD fitment certificate/document. Extract vehicle number, owner name, valid from date, and valid to date only. Map "VLTD Fitment Date" to "validFrom". Map "Valid Upto" or "Valid Up to" to "validTo". Preserve the actual date value even when it appears in formats like "03 Apr 2026" or "Mon Apr 03 06:09:38 UTC 2028". Do not invent dates.'
  const template = `{
  "vehicleNumber": "",
  "ownerName": "",
  "validFrom": "",
  "validTo": ""
}`
  return processOcrRequest(req, res, prompt, template)
}

const insuranceOcr = async (req, res) => {
  const prompt = `Extract fields from this vehicle insurance policy document.
- vehicleNumber: the vehicle registration number — EXACTLY 9 or 10 characters after removing hyphens/spaces (format: 2 state letters + 2 district digits + 1-3 series letters + 4 digits, e.g. CG04NS0396, MH12AB1234). Remove hyphens/spaces. Do NOT return engine numbers, chassis numbers, or any value longer than 10 characters.
- policyNumber: the OFFICIAL policy number issued by the insurer. IMPORTANT: Some documents (e.g. IFFCO Tokio) show TWO "Policy #" values on the same line — the first is an internal transaction/invoice reference (often starts with "1-" or looks like "1-XXXXXXXX"), and the SECOND is the actual policy number. Always use the LAST/SECOND "Policy #" value as the policyNumber. The "Tax Invoice No" field is NOT the policy number.
- policyHolderName: primary insured person/company name
- validFrom / validTo: the main policy period (Own Damage section if present, otherwise overall policy period). DD-MM-YYYY format.
- issueDate: the date the policy document was issued. Look for "Policy Issue Date", "Date of Issue", "Invoice Date", "Policy Date", "Issue Date". Format: DD-MM-YYYY.
- premium: numeric value of the net/total premium in rupees/INR. Return the exact decimal value including paise/cents if present (e.g., 1182.71). Do not omit the decimal or round. No currency symbols, commas, or GST/taxes if separated.
- insuranceCompany: full insurer name as it appears (e.g. "HDFC ERGO", "National Insurance Company Limited")
- insuranceClass: "Comprehensive" or "Third Party" (if not found, infer from policy type)
- product: type of insured vehicle/policy. Look for phrases like "Private Car", "Motor Cycle", "Two Wheeler", "Fire", "Marine", "Health" etc. in the document, and map to EXACTLY one of these values (return the value on the left, verbatim): "Pvt. Car" (private car / motor car), "Two Wheeler" (motorcycle/scooter/bike/two-wheeler), "GCV" (goods carrying vehicle/truck/commercial goods vehicle), "GCV-3W" (3-wheeler goods vehicle), "PCV" (passenger carrying vehicle/bus), "PCV-3W" (3-wheeler passenger/auto rickshaw), "Taxi", "Mis-D", "Health", "Life", "Fire", "Burglary", "WC" (workmen's compensation), "CPM", "Travel", "Marine", "GPA" (group personal accident), "GMC" (group mediclaim). If none match, return empty string.
- Use empty string "" for any absent field`;
  const template = `{"vehicleNumber":"","policyNumber":"","policyHolderName":"","validFrom":"","validTo":"","issueDate":"","premium":"","insuranceCompany":"","insuranceClass":"","product":""}`;

  // Store raw PDF text for post-processing override (IFFCO Tokio and similar)
  req._rawPdfText = null
  if (req.body.imageBase64?.startsWith('data:application/pdf')) {
    try {
      const base64Data = req.body.imageBase64.replace(/^data:application\/pdf;base64,/, '')
      const buffer = Buffer.from(base64Data, 'base64')
      const pdfParse = require('pdf-parse')
      const pdfData = await pdfParse(buffer)
      req._rawPdfText = pdfData.text
    } catch (_) { /* ignore, will fall back to AI result */ }
  }

  return processOcrRequest(req, res, prompt, template, (extractedData) => {
    if (req._rawPdfText) {
      // 1. Fix IFFCO Tokio dual-Policy# line — pick the actual (last) policy number
      const correctedPolicyNo = extractIffcoTokioPolicyNumber(req._rawPdfText)
      if (correctedPolicyNo) {
        extractedData.policyNumber = correctedPolicyNo
      }

      // 2. Fix vehicle number — Indian reg nos are 9-10 chars.
      //    If the AI returned something clearly wrong (too long or invalid pattern),
      //    scan the raw PDF text for the correct registration number.
      const currentVehicle = (extractedData.vehicleNumber || '').replace(/[\s-]/g, '')
      if (!isValidIndianVehicleNumber(currentVehicle)) {
        const correctedVehicleNo = extractValidIndianVehicleNumber(req._rawPdfText)
        if (correctedVehicleNo) {
          console.log('[VehicleNo] Overriding', currentVehicle, '->', correctedVehicleNo)
          extractedData.vehicleNumber = correctedVehicleNo
        }
      }
    }
    return extractedData
  })
}

module.exports = {
  rcOcr,
  taxOcr,
  fitnessOcr,
  pucOcr,
  gpsOcr,
  insuranceOcr,
}
