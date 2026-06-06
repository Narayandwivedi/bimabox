import { useState } from 'react'
import axios from 'axios'
import { fmt, fmtD } from './helpers'
import PdfPreviewModal from './PdfPreviewModal'
import { useAuth } from '../../context/AuthContext'

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

const ResultBox = ({
  result,
  policyType, vehicleType, isElectric, cc, kwPower, idv, ncb, odDiscount,
  zone, vehicleAge, manufacturingYear, selectedCategory, gstEnabled, subtype,
}) => {
  const [showQuotationModal, setShowQuotationModal] = useState(false)
  const [pdfUrl, setPdfUrl] = useState('')
  const [pdfLoading, setPdfLoading] = useState(false)
  const [generatedQuoteId, setGeneratedQuoteId] = useState('')
  const { user } = useAuth()

  if (!result) return null

  const showOD = policyType !== 'tp'
  const showTP = policyType !== 'od'
  const isBundle = policyType === 'bundle'

  const odBase = showOD ? (parseFloat(idv) || 0) * (result.odRate / 100) : 0
  const ncbDiscount = showOD ? odBase * (ncb / 100) : 0
  const afterNcbOD = odBase - ncbDiscount
  const odDiscountAmt = showOD ? afterNcbOD * ((result.odDiscountVal || 0) / 100) : 0

  const shareQuotation = () => {
    const quoteId = `BBQ-${Math.floor(100000 + Math.random() * 900000)}`
    const dateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    const policyLabel = policyType === 'od' ? 'Own Damage Only' : policyType === 'tp' ? 'Third Party Only' : policyType === 'comprehensive' ? 'Comprehensive' : (vehicleType === 'two_wheeler' ? '1Yr OD + 5Yr TP Bundle' : '1Yr OD + 3Yr TP Bundle')
    const vehicleSpec = isElectric ? `${kwPower || 0} KW (Electric)` : `${cc || 0} CC`

    const netPremium = result.odPremium + result.tpPremium
    const exactTotal = netPremium + result.gst

    const tpL = isBundle ? (vehicleType === 'two_wheeler' ? '5Yr TP' : '3Yr TP') : '1Yr TP'
    const tpBefore = result.tpPremium + result.restrictedTPPDDiscount

    const odItems = showOD ? `
      <tr><td style='padding:4px 8px;color:#64748b'>Basic OD Premium (@ ${result.odRate}%)</td><td style='text-align:right;padding:4px 8px;font-weight:700'>₹${fmtD(odBase)}</td></tr>
      ${ncb > 0 ? `<tr><td style='padding:4px 8px;color:#64748b'>NCB Discount (${ncb}%)</td><td style='text-align:right;padding:4px 8px;font-weight:700;color:#16a34a'>- ₹${fmtD(ncbDiscount)}</td></tr>` : ''}
      ${result.odDiscountVal > 0 ? `<tr><td style='padding:4px 8px;color:#64748b'>OD Discount (${result.odDiscountVal}%)</td><td style='text-align:right;padding:4px 8px;font-weight:700;color:#dc2626'>- ₹${fmtD(odDiscountAmt)}</td></tr>` : ''}
      ${result.imt23Amount > 0 ? `<tr><td style='padding:4px 8px;color:#64748b'>IMT 23 (15% of OD)</td><td style='text-align:right;padding:4px 8px;font-weight:700'>₹${fmtD(result.imt23Amount)}</td></tr>` : ''}
      ${result.geoExtentAmount > 0 && vehicleType === 'gcv' ? `<tr><td style='padding:4px 8px;color:#64748b'>Geographical Extent</td><td style='text-align:right;padding:4px 8px;font-weight:700'>₹${fmtD(result.geoExtentAmount)}</td></tr>` : ''}
      <tr style='background:#f1f5f9'><td style='padding:6px 8px;font-weight:800'>Total OD Premium</td><td style='text-align:right;padding:6px 8px;font-weight:800;color:#2563eb'>₹${fmtD(result.odPremium)}</td></tr>
    ` : ''

    const tpItems = showTP ? `
      <tr><td style='padding:4px 8px;color:#64748b'>${tpL} Premium</td><td style='text-align:right;padding:4px 8px;font-weight:700'>₹${fmtD(tpBefore)}</td></tr>
      ${result.restrictedTPPDDiscount > 0 ? `<tr><td style='padding:4px 8px;color:#64748b'>Restricted TPPD Discount</td><td style='text-align:right;padding:4px 8px;font-weight:700;color:#16a34a'>- ₹${fmtD(result.restrictedTPPDDiscount)}</td></tr>` : ''}
      ${result.llPdAmount > 0 ? `<tr><td style='padding:4px 8px;color:#64748b'>LL to Paid Driver</td><td style='text-align:right;padding:4px 8px;font-weight:700'>₹${fmtD(result.llPdAmount)}</td></tr>` : ''}
      ${result.llEmployeeAmount > 0 ? `<tr><td style='padding:4px 8px;color:#64748b'>LL to Employee (other than Paid Driver)</td><td style='text-align:right;padding:4px 8px;font-weight:700'>₹${fmtD(result.llEmployeeAmount)}</td></tr>` : ''}
      ${result.paOdAmount > 0 ? `<tr><td style='padding:4px 8px;color:#64748b'>PA to Owner Driver</td><td style='text-align:right;padding:4px 8px;font-weight:700'>₹${fmtD(result.paOdAmount)}</td></tr>` : ''}
      ${result.paUnnamedAmount > 0 ? `<tr><td style='padding:4px 8px;color:#64748b'>PA to Unnamed Passenger</td><td style='text-align:right;padding:4px 8px;font-weight:700'>₹${fmtD(result.paUnnamedAmount)}</td></tr>` : ''}
    ` : ''

    const addonItems = `
      ${result.rsaAmount > 0 ? `<tr><td style='padding:4px 8px;color:#64748b'>Roadside Assistance</td><td style='text-align:right;padding:4px 8px;font-weight:700'>₹${fmtD(result.rsaAmount)}</td></tr>` : ''}
      ${result.otherAddonAmount > 0 ? `<tr><td style='padding:4px 8px;color:#64748b'>Other Addon Coverage</td><td style='text-align:right;padding:4px 8px;font-weight:700'>₹${fmtD(result.otherAddonAmount)}</td></tr>` : ''}
      ${result.geoExtentAmount > 0 && vehicleType !== 'gcv' ? `<tr><td style='padding:4px 8px;color:#64748b'>Geographical Extent</td><td style='text-align:right;padding:4px 8px;font-weight:700'>₹${fmtD(result.geoExtentAmount)}</td></tr>` : ''}
      ${result.zeroDepAmount > 0 ? `<tr><td style='padding:4px 8px;color:#64748b'>Zero Depreciation</td><td style='text-align:right;padding:4px 8px;font-weight:700'>₹${fmtD(result.zeroDepAmount)}</td></tr>` : ''}
    `

    const ageLabel = vehicleAge === 'upto_5' ? '0–5 Yrs' : vehicleAge === '5_to_7' ? '5–7 Yrs' : '>7 Yrs'

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Quotation ${quoteId} – BIMABOX</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Inter', system-ui, sans-serif; background: #f8fafc; padding: 20px; }
          .container { max-width: 680px; margin: 0 auto; background: #fff; border-radius: 24px; box-shadow: 0 20px 60px -20px rgba(0,0,0,0.15); overflow: hidden; }
          .header { background: linear-gradient(135deg, #2563eb, #4f46e5); padding: 24px 28px 20px; color: #fff; }
          .header h1 { font-size: 22px; font-weight: 900; letter-spacing: -0.5px; }
          .header p { font-size: 12px; opacity: 0.8; margin-top: 2px; }
          .header .badge { display: inline-block; background: rgba(255,255,255,0.15); border-radius: 20px; padding: 4px 12px; font-size: 10px; font-weight: 700; margin-top: 8px; }
          .section { padding: 16px 24px; }
          .section-title { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px; }
          .vehicle-details { display: flex; flex-wrap: wrap; gap: 12px; background: #f8fafc; border-radius: 14px; padding: 14px 18px; }
          .vehicle-details span { font-size: 13px; color: #334155; }
          .vehicle-details strong { color: #0f172a; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; }
          .total-row td { font-weight: 800; border-top: 2px solid #e2e8f0; padding-top: 8px; }
          .grand-total { background: linear-gradient(135deg, #2563eb, #4f46e5); color: #fff; }
          .grand-total td { padding: 12px 8px; font-size: 15px; font-weight: 900; }
          .footer { text-align: center; padding: 16px 24px; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
          @media print { body { background: #fff; padding: 0; } .container { box-shadow: none; border-radius: 0; } .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class='container'>
          <div class='header'>
            <h1>🏷️ Insurance Quotation</h1>
            <p>BIMABOX — Indian Motor Tariff Rates (WEF 1st June 2022)</p>
            <div class='badge'>${quoteId}  |  ${dateStr}</div>
          </div>
          <div class='section'>
            <div class='section-title'>Vehicle Details</div>
            <div class='vehicle-details'>
              <span>🚗 <strong>${selectedCategory ? selectedCategory.label : 'N/A'}</strong></span>
              <span>⚙️ <strong>${vehicleSpec}</strong></span>
              <span>📍 <strong>Zone ${zone}</strong></span>
              <span>📅 <strong>${ageLabel}</strong></span>
              ${manufacturingYear ? `<span>🏭 Mfg: <strong>${manufacturingYear}</strong></span>` : ''}
            </div>
          </div>
          <div class='section'>
            <div class='section-title'>Premium Breakup</div>
            <table>
              ${odItems}
              ${tpItems}
              ${addonItems}
              <tr><td style='padding:6px 8px;font-weight:700;color:#64748b'>Premium Before GST</td><td style='text-align:right;padding:6px 8px;font-weight:700'>₹${fmtD(netPremium)}</td></tr>
              ${result.gstTpRate === 5 ? `
                <tr><td style='padding:4px 8px;color:#64748b'>GST on TP @ 5%</td><td style='text-align:right;padding:4px 8px;font-weight:700'>₹${fmtD(result.gstTp)}</td></tr>
                <tr><td style='padding:4px 8px;color:#64748b'>GST on Other @ 18%</td><td style='text-align:right;padding:4px 8px;font-weight:700'>₹${fmtD(result.gstNonTp)}</td></tr>
              ` : `<tr><td style='padding:4px 8px;color:#64748b'>GST (${gstEnabled ? '18%' : '0%'})</td><td style='text-align:right;padding:4px 8px;font-weight:700'>₹${fmtD(result.gst)}</td></tr>`}
            </table>
            <table style='margin-top:12px'>
              <tr class='grand-total'><td>💰 Total Payable Premium</td><td style='text-align:right'>₹${fmtD(exactTotal)}</td></tr>
            </table>
          </div>
          <div class='footer'>
            <p>Indicative as per IMT. Premiums may vary based on insurer loading, add-ons & discounts.</p>
            <p style='margin-top:4px'>Ref: IRDAI website irdai.gov.in</p>
          </div>
        </div>
        <div class='no-print' style='text-align:center;margin-top:20px'>
          <button onclick='window.print()' style='background:#2563eb;color:#fff;border:none;border-radius:12px;padding:10px 24px;font-size:13px;font-weight:700;cursor:pointer'>🖨️ Print Quotation</button>
        </div>
        <script>
          window.onload = function() { setTimeout(function() { window.print(); }, 500); }
        <\/script>
      </body>
      </html>
    `

    const printWindow = window.open('', '_blank')
    printWindow.document.write(htmlContent)
    printWindow.document.close()
  }

  const generateQuotationPdf = async () => {
    setPdfLoading(true)
    setShowQuotationModal(true)
    setPdfUrl('')
    const quoteId = `BBQ-${Math.floor(100000 + Math.random() * 900000)}`
    setGeneratedQuoteId(quoteId)
    const dateStr = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })

    const vehicleSpec = isElectric
      ? `${kwPower || 0} KW (Electric)`
      : `${cc || 0} CC (Petrol/Diesel/CNG)`

    const policyLabel = policyType === 'od' ? 'Own Damage Only' :
                        policyType === 'tp' ? 'Third Party Only' :
                        policyType === 'comprehensive' ? 'Comprehensive Cover' :
                        (vehicleType === 'two_wheeler' ? '1-Year OD + 5-Year TP Bundle' : '1-Year OD + 3-Year TP Bundle')

    const tpLabel = isBundle
      ? (vehicleType === 'two_wheeler' ? '5-Year TP Premium' : '3-Year TP Premium')
      : '1-Year TP Premium'

    const odBaseVal = showOD ? (parseFloat(idv) || 0) * (result.odRate / 100) : 0
    const ncbDiscountVal = showOD ? odBaseVal * (ncb / 100) : 0
    const afterNcbODVal = odBaseVal - ncbDiscountVal
    const odDiscountAmtVal = showOD ? afterNcbODVal * ((result.odDiscountVal || 0) / 100) : 0

    const tableRows = []

    if (showOD) {
      tableRows.push({ desc: 'Basic Own Damage (OD) Premium', rate: `${result.odRate}%`, amount: odBaseVal })
      if (ncb > 0) tableRows.push({ desc: 'No Claim Bonus (NCB) Discount', rate: `-${ncb}%`, amount: -ncbDiscountVal, type: 'discount' })
      if (result.odDiscountVal > 0) tableRows.push({ desc: 'Insurer OD Discount', rate: `-${result.odDiscountVal}%`, amount: -odDiscountAmtVal, type: 'discount' })
      if (result.imt23Amount > 0) tableRows.push({ desc: 'IMT 23 Loading (15% of OD)', rate: '15%', amount: result.imt23Amount })
      if (result.geoExtentAmount > 0 && vehicleType === 'gcv') tableRows.push({ desc: 'Geographical Extent', rate: '-', amount: result.geoExtentAmount })
      tableRows.push({ desc: 'Final Own Damage (OD) Premium', rate: '-', amount: result.odPremium + result.imt23Amount + (vehicleType === 'gcv' ? result.geoExtentAmount : 0), type: 'total' })
    }

    if (showTP) {
      tableRows.push({ desc: `Third Party Liability (TP) Premium (${tpLabel})`, rate: '-', amount: result.tpPremium + result.restrictedTPPDDiscount })
      if (result.restrictedTPPDDiscount > 0) tableRows.push({ desc: 'Restricted TPPD Discount', rate: '-', amount: -result.restrictedTPPDDiscount, type: 'discount' })
      if (result.llPdAmount > 0) tableRows.push({ desc: 'Legal Liability to Paid Driver', rate: '-', amount: result.llPdAmount })
      if (result.paOdAmount > 0) tableRows.push({ desc: 'Personal Accident to Owner Driver', rate: '-', amount: result.paOdAmount })
      if (result.llEmployeeAmount > 0) tableRows.push({ desc: 'Legal Liability to Employee (other than Paid Driver)', rate: '-', amount: result.llEmployeeAmount })
      if (result.paUnnamedAmount > 0) tableRows.push({ desc: 'PA to Unnamed Passenger', rate: '-', amount: result.paUnnamedAmount })
    }

    if (result.rsaAmount > 0) tableRows.push({ desc: 'Roadside Assistance (RSA)', rate: '-', amount: result.rsaAmount })
    if (result.otherAddonAmount > 0) tableRows.push({ desc: 'Other Addon Coverage', rate: '-', amount: result.otherAddonAmount })
    if (result.geoExtentAmount > 0 && vehicleType !== 'gcv') tableRows.push({ desc: 'Geographical Extent', rate: '-', amount: result.geoExtentAmount })
    if (result.zeroDepAmount > 0) tableRows.push({ desc: 'Zero Depreciation', rate: '-', amount: result.zeroDepAmount })

    const netPremiumVal = result.odPremium + result.tpPremium + result.llPdAmount + result.paOdAmount + result.llEmployeeAmount + result.rsaAmount + result.otherAddonAmount + result.paUnnamedAmount + result.geoExtentAmount + result.imt23Amount + result.zeroDepAmount

    tableRows.push({ desc: 'Premium Before Taxes', rate: '-', amount: netPremiumVal, type: 'total' })

    if (result.gstTpRate === 5) {
      tableRows.push({ desc: 'GST on Third Party Premium @ 5%', rate: '5%', amount: result.gstTp, type: 'gst-header' })
      tableRows.push({ desc: 'GST on Other Components @ 18%', rate: '18%', amount: result.gstNonTp, type: 'gst-header' })
    } else {
      tableRows.push({ desc: `Goods and Services Tax (GST ${gstEnabled ? '18%' : '0%'})`, rate: gstEnabled ? '18%' : '0%', amount: result.gst, type: 'gst-header' })
    }

    const exactTotalVal = netPremiumVal + result.gst

    try {
      const response = await axios.post(`${API_URL}/api/calculator/generate-pdf`, {
        quoteId,
        date: dateStr,
        vehicleCategory: selectedCategory ? selectedCategory.label : 'N/A',
        vehicleSpec,
        vehicleSubtype: subtype ? undefined : undefined,
        zone: `Zone ${zone}`,
        vehicleAge: vehicleAge === 'upto_5' ? 'Upto 5 Yrs' : vehicleAge === '5_to_7' ? '5–7 Yrs' : '>7 Yrs',
        mfgYear: manufacturingYear || undefined,
        policyType: policyLabel,
        idv: parseFloat(idv) || 0,
        ncb,
        odDiscount: result.odDiscountVal,
        producerName: user?.name || 'Bimabox Agent',
        producerContact: user?.phone || user?.contact || 'N/A',
        producerEmail: user?.email || 'N/A',
        premiums: {
          odRate: result.odRate,
          odBase: odBaseVal,
          ncbDiscount: ncbDiscountVal,
          odDiscountAmt: odDiscountAmtVal,
          finalOd: result.odPremium,
          tp: result.tpPremium,
          llPd: result.llPdAmount,
          paOd: result.paOdAmount,
          llEmployee: result.llEmployeeAmount,
          paUnnamed: result.paUnnamedAmount,
          rsa: result.rsaAmount,
          otherAddon: result.otherAddonAmount,
          geoExtent: result.geoExtentAmount,
          imt23: result.imt23Amount,
          zeroDep: result.zeroDepAmount,
          restrictedTPPD: result.restrictedTPPDDiscount,
        },
        gst: {
          enabled: gstEnabled,
          hasSplitGst: result.gstTpRate === 5,
          tpRate: result.gstTpRate,
          gstTp: result.gstTp,
          gstNonTp: result.gstNonTp,
          totalGst: result.gst,
        },
        netPremium: netPremiumVal,
        totalPayable: exactTotalVal,
        tableRows,
      }, { withCredentials: true })

      if (response.data.success && response.data.url) {
        setPdfUrl(response.data.url)
        setPdfLoading(false)
      } else {
        setPdfLoading(false)
        alert('Failed to generate PDF. Please try again.')
      }
    } catch (error) {
      console.error('PDF generation error:', error)
      setPdfLoading(false)
      alert('Failed to generate PDF. Please try again.')
    }
  }

  const odBaseVal = (parseFloat(idv) || 0) * (result.odRate / 100)
  const ncbDiscountVal = odBaseVal * (ncb / 100)

  return (
    <div className='border-t border-slate-200 pt-5 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500'>
      <div className='space-y-3'>
        <h3 className='text-xs font-black text-slate-800 uppercase tracking-widest border-b border-slate-200 pb-2'>Premium Breakup</h3>

        {/* Own Damage */}
        {showOD && (
          <div className='rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50/50 border border-blue-100 p-3 space-y-2'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <svg className='h-3.5 w-3.5 text-blue-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' /></svg>
                <p className='text-[10px] sm:text-[11px] font-black text-slate-800 uppercase tracking-wider'>Own Damage (OD)</p>
              </div>
              <p className='text-[9px] sm:text-[10px] font-bold text-blue-600'>Rate: {result.odRate}%</p>
            </div>
            {[
              ['IDV Value', `₹${fmtD(parseFloat(idv) || 0)}`],
              ['Basic OD Premium', `₹${fmtD(odBase)}`],
              ...(ncb > 0 ? [[`NCB Discount (${ncb}%)`, `- ₹${fmtD(ncbDiscount)}`]] : []),
              ...((result.odDiscountVal || 0) > 0 ? [[`OD Discount (${result.odDiscountVal}%)`, `- ₹${fmtD(odDiscountAmt)}`]] : []),
              ...(result.imt23Amount > 0 ? [['IMT 23 Loading (15% of OD)', `₹${fmtD(result.imt23Amount)}`]] : []),
              ...(result.geoExtentAmount > 0 && vehicleType === 'gcv' ? [['Geographical Extent', `₹${fmtD(result.geoExtentAmount)}`]] : []),
              ['Total OD Premium', `₹${fmtD(result.odPremium)}`, 'font-black text-blue-700'],
            ].map(([label, value, cls], i) => {
              const isTotal = label === 'Total OD Premium'
              return (
                <div key={i} className={`flex items-center justify-between ${i === 0 ? '' : 'border-t border-blue-100/50 pt-1.5'} ${isTotal ? 'rounded-lg bg-blue-100/80 px-3 py-2 -mx-2 border-t border-blue-200/70 mt-1.5' : ''}`}>
                  <p className={`text-[10px] sm:text-[11px] ${isTotal ? 'font-black text-blue-900' : 'font-bold text-slate-500'}`}>{label}</p>
                  <p className={`${isTotal ? 'text-sm sm:text-base font-black text-blue-700' : 'text-[10px] sm:text-[11px] font-bold text-slate-800'}`}>{value}</p>
                </div>
              )
            })}
          </div>
        )}

        {/* Liability / Third Party */}
        {showTP && (
          <div className='rounded-xl bg-gradient-to-r from-rose-50 to-pink-50/50 border border-rose-100 p-3 space-y-2'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <svg className='h-3.5 w-3.5 text-rose-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z' /></svg>
                <p className='text-[10px] sm:text-[11px] font-black text-slate-800 uppercase tracking-wider'>Third Party & Liability</p>
              </div>
            </div>
            {[
              ...(isBundle ? [[vehicleType === 'two_wheeler' ? '5-Year TP Premium' : '3-Year TP Premium', `₹${fmtD(result.tpPremium + result.restrictedTPPDDiscount)}`]] : [['1-Year TP Premium', `₹${fmtD(result.tpPremium + result.restrictedTPPDDiscount)}`]]),
              ...(result.restrictedTPPDDiscount > 0 ? [['Restricted TPPD Discount', `- ₹${fmtD(result.restrictedTPPDDiscount)}`]] : []),
              ...(result.llPdAmount > 0 ? [['LL to Paid Driver', `₹${fmtD(result.llPdAmount)}`]] : []),
              ...(result.paOdAmount > 0 ? [['PA to Owner Driver', `₹${fmtD(result.paOdAmount)}`]] : []),
              ...(result.llEmployeeAmount > 0 ? [['LL to Employee (other than Paid Driver)', `₹${fmtD(result.llEmployeeAmount)}`]] : []),
              ...(result.paUnnamedAmount > 0 ? [['PA to Unnamed Passenger', `₹${fmtD(result.paUnnamedAmount)}`]] : []),
            ].map(([label, value], i) => (
              <div key={i} className='flex items-center justify-between'>
                <p className='text-[9px] sm:text-[10px] font-bold text-slate-500'>{label}</p>
                <p className='text-[10px] sm:text-[11px] font-bold text-slate-800'>{value}</p>
              </div>
            ))}
            <div className='flex items-center justify-between rounded-lg bg-rose-100/80 px-3 py-2 -mx-2 border-t border-rose-200/70 mt-1.5'>
              <p className='text-[10px] sm:text-[11px] font-black text-rose-900'>Total TP & Liability Premium</p>
              <p className='text-sm sm:text-base font-black text-rose-700'>₹{fmtD(result.tpPremium + result.llPdAmount + result.paOdAmount + result.llEmployeeAmount + result.paUnnamedAmount)}</p>
            </div>
          </div>
        )}

        {/* Add-on Coverages */}
        {(result.rsaAmount > 0 || result.otherAddonAmount > 0 || result.geoExtentAmount > 0 || result.zeroDepAmount > 0) && (
          <div className='rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50/50 border border-amber-100 p-3 space-y-2'>
            <div className='flex items-center gap-2'>
              <svg className='h-3.5 w-3.5 text-amber-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M11.42 15.17l-5.25 3.04 1-5.5L3 8.75l5.5-.83L11.42 3l2.92 4.92 5.5.83-4.17 3.96 1 5.5z' /></svg>
              <p className='text-[10px] sm:text-[11px] font-black text-slate-800 uppercase tracking-wider'>Add-on Coverages</p>
            </div>
            {[
              ...(result.rsaAmount > 0 ? [['Roadside Assistance (RSA)', `₹${fmtD(result.rsaAmount)}`]] : []),
              ...(result.otherAddonAmount > 0 ? [['Other Addon Coverage', `₹${fmtD(result.otherAddonAmount)}`]] : []),
              ...(result.geoExtentAmount > 0 && vehicleType !== 'gcv' ? [['Geographical Extent', `₹${fmtD(result.geoExtentAmount)}`]] : []),
              ...(result.zeroDepAmount > 0 ? [['Zero Depreciation', `₹${fmtD(result.zeroDepAmount)}`]] : []),
            ].map(([label, value], i) => (
              <div key={i} className='flex items-center justify-between'>
                <p className='text-[9px] sm:text-[10px] font-bold text-slate-500'>{label}</p>
                <p className='text-[10px] sm:text-[11px] font-bold text-slate-800'>{value}</p>
              </div>
            ))}
            <div className='flex items-center justify-between rounded-lg bg-amber-100/80 px-3 py-2 -mx-2 border-t border-amber-200/70 mt-1.5'>
              <p className='text-[10px] sm:text-[11px] font-black text-amber-900'>Total Add-on Premium</p>
              <p className='text-sm sm:text-base font-black text-amber-700'>₹{fmtD(result.rsaAmount + result.otherAddonAmount + (vehicleType !== 'gcv' ? result.geoExtentAmount : 0) + result.zeroDepAmount)}</p>
            </div>
          </div>
        )}

        {/* Totals */}
        <div className='rounded-xl bg-slate-50 border border-slate-200 p-3 space-y-2'>
          <div className='flex items-center justify-between text-xs'>
            <p className='font-bold text-slate-500'>Total before GST</p>
            <p className='font-black text-slate-800'>₹{fmtD(result.odPremium + result.tpPremium + result.llPdAmount + result.paOdAmount + result.llEmployeeAmount + result.rsaAmount + result.otherAddonAmount + result.paUnnamedAmount + result.geoExtentAmount + result.imt23Amount + result.zeroDepAmount)}</p>
          </div>
          {result.gstTpRate === 5 ? (
            <>
              <div className='flex items-center justify-between text-xs'>
                <p className='font-bold text-slate-500'>GST on TP @ 5%</p>
                <p className='font-black text-slate-800'>₹{fmtD(result.gstTp)}</p>
              </div>
              <div className='flex items-center justify-between text-xs'>
                <p className='font-bold text-slate-500'>GST on Other @ 18%</p>
                <p className='font-black text-slate-800'>₹{fmtD(result.gstNonTp)}</p>
              </div>
            </>
          ) : (
            <div className='flex items-center justify-between text-xs'>
              <p className='font-bold text-slate-500'>GST {gstEnabled ? '(18%)' : '(0%)'}</p>
              <p className='font-black text-slate-800'>₹{fmtD(result.gst)}</p>
            </div>
          )}
        </div>
      </div>

      <div className='flex items-center justify-between rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-4 sm:p-5 text-white shadow-xl shadow-indigo-200'>
        <div className='space-y-1'>
          <p className='text-[9px] sm:text-[10px] font-bold uppercase tracking-widest opacity-80'>Final Payable Premium</p>
          <p className='text-2xl sm:text-3xl font-black tracking-tight drop-shadow-sm'>₹{fmtD(result.totalPremium)}</p>
          <p className='text-[8px] opacity-60'>
            {gstEnabled ? (result.gstTpRate === 5 ? 'incl. 5% + 18% GST' : 'incl. 18% GST') : 'excl. GST'} • {
              policyType === 'od' ? 'Own Damage' :
              policyType === 'tp' ? 'Third Party' :
              policyType === 'comprehensive' ? 'Comprehensive' : 'Bundle'
            }
          </p>
        </div>
        <div className='flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm'>
          <svg className='h-6 w-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
          </svg>
        </div>
      </div>

      <div className='rounded-xl bg-slate-50/80 border border-slate-200 p-3 sm:p-4'>
        <button
          onClick={generateQuotationPdf}
          className='w-full flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 py-4 text-white font-black text-sm uppercase tracking-widest hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] transition-all shadow-lg shadow-indigo-200'
        >
          <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z' />
          </svg>
          Preview Quotation
        </button>
      </div>

      {/* Quotation Loading Modal */}
      {showQuotationModal && pdfLoading && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4'>
          <div className='relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl'>
            <div className='flex flex-col items-center justify-center py-10 gap-4'>
              <div className='h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600' />
              <p className='text-sm font-bold text-slate-500'>Generating Quotation…</p>
            </div>
          </div>
        </div>
      )}

      {/* Quotation Preview Modal */}
      <PdfPreviewModal
        isOpen={showQuotationModal && !pdfLoading && !!pdfUrl}
        onClose={() => {
          setShowQuotationModal(false)
          setPdfUrl('')
        }}
        pdfUrl={pdfUrl}
        quoteId={generatedQuoteId}
        API_URL={API_URL}
      />
    </div>
  )
}

export default ResultBox
