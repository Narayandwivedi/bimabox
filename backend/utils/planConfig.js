// Static backend plan definitions used ONLY for server-side enforcement and
// payment. Plan details (pricing, features, limits) are managed in the
// frontend config (frontend/src/config/plansConfig.js). This map must be kept
// in sync with that config for enforcement/expiry/price validation.
const BACKEND_PLANS = {
  free: {
    name: 'Free',
    price: 0,
    durationDays: 365,
    features: {
      aiDocuments: 20,
      manualDocuments: 20,
      desktopAccess: true,
      mobileAppAccess: true,
      excelDownload: false,
      clientLimit: 20,
      appNotificationRenewal: true,
      whatsappRenewal: false,
      customizedPolicyDownload: false,
      personalisedQuotation: false,
      processingSpeed: 'Standard',
      support: 'Standard',
    },
  },
  go: {
    name: 'Go',
    price: 99,
    durationDays: 90,
    features: {
      aiDocuments: 50,
      manualDocuments: 50,
      desktopAccess: true,
      mobileAppAccess: true,
      excelDownload: true,
      clientLimit: 50,
      appNotificationRenewal: true,
      whatsappRenewal: false,
      customizedPolicyDownload: false,
      personalisedQuotation: false,
      processingSpeed: 'Fast',
      support: 'Standard',
    },
  },
  plus: {
    name: 'Plus',
    price: 199,
    durationDays: 90,
    features: {
      aiDocuments: 200,
      manualDocuments: 200,
      desktopAccess: true,
      mobileAppAccess: true,
      excelDownload: true,
      clientLimit: 200,
      appNotificationRenewal: true,
      whatsappRenewal: true,
      customizedPolicyDownload: true,
      personalisedQuotation: true,
      processingSpeed: 'Accelerated',
      support: 'Priority',
    },
  },
  pro: {
    name: 'Pro',
    price: 499,
    durationDays: 90,
    features: {
      aiDocuments: 500,
      manualDocuments: 500,
      desktopAccess: true,
      mobileAppAccess: true,
      excelDownload: true,
      clientLimit: 0,
      appNotificationRenewal: true,
      whatsappRenewal: true,
      customizedPolicyDownload: true,
      personalisedQuotation: true,
      processingSpeed: 'Highest',
      support: 'Priority',
    },
  },
}

const getPlan = (planKey) => (planKey && BACKEND_PLANS[planKey]) || null

module.exports = { BACKEND_PLANS, getPlan }
