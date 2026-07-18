// Canonical definition of the 4 subscription plans. Used both by the manual
// seed script (scripts/seedPlans.js) and by the startup auto-seed
// (utils/seedPlans.js) so the two never drift apart.
const DEFAULT_PLANS = [
  {
    name: 'Free',
    price: 0,
    durationDays: 0, // never expires — only the monthly usage limit resets
    sortOrder: 1,
    features: {
      aiDocuments: 10,
      manualDocuments: 10,
      desktopAccess: true,
      mobileAppAccess: true,
      excelDownload: false,
      clientLimit: 20,
      appNotificationRenewal: true,
      whatsappRenewal: false,
      customizedPolicyDownload: false,
      processingSpeed: 'Standard',
      support: 'Standard',
    },
  },
  {
    name: 'Go',
    price: 99,
    durationDays: 90,
    sortOrder: 2,
    features: {
      aiDocuments: 100,
      manualDocuments: 0,
      desktopAccess: true,
      mobileAppAccess: true,
      excelDownload: true,
      clientLimit: 50,
      appNotificationRenewal: true,
      whatsappRenewal: false,
      customizedPolicyDownload: false,
      processingSpeed: 'Fast',
      support: 'Standard',
    },
  },
  {
    name: 'Plus',
    price: 199,
    durationDays: 30,
    sortOrder: 3,
    features: {
      aiDocuments: 500,
      manualDocuments: 0,
      desktopAccess: true,
      mobileAppAccess: true,
      excelDownload: true,
      clientLimit: 200,
      appNotificationRenewal: true,
      whatsappRenewal: true,
      customizedPolicyDownload: true,
      processingSpeed: 'Accelerated',
      support: 'Priority',
    },
  },
  {
    name: 'Pro',
    price: 499,
    durationDays: 30,
    sortOrder: 4,
    features: {
      aiDocuments: 1000,
      manualDocuments: 0,
      desktopAccess: true,
      mobileAppAccess: true,
      excelDownload: true,
      clientLimit: 0,
      appNotificationRenewal: true,
      whatsappRenewal: true,
      customizedPolicyDownload: true,
      processingSpeed: 'Highest',
      support: 'Priority',
    },
  },
]

module.exports = { DEFAULT_PLANS }
