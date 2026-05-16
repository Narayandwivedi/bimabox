const fs = require('fs');
const path = require('path');

const filePaths = [
  'c:/Users/Naray/OneDrive/Desktop/bimabox/frontend/src/pages/Gps/components/AddGpsModal.jsx',
  'c:/Users/Naray/OneDrive/Desktop/bimabox/frontend/src/pages/Gps/components/EditGpsModal.jsx',
  'c:/Users/Naray/OneDrive/Desktop/bimabox/frontend/src/pages/Gps/components/RenewGpsModal.jsx',
  'c:/Users/Naray/OneDrive/Desktop/bimabox/frontend/src/pages/Tax/components/AddTaxModal.jsx',
  'c:/Users/Naray/OneDrive/Desktop/bimabox/frontend/src/pages/Tax/components/EditTaxModal.jsx',
  'c:/Users/Naray/OneDrive/Desktop/bimabox/frontend/src/pages/Tax/components/RenewTaxModal.jsx',
];

filePaths.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // GPS Modals
    content = content.replace(/>Add New GPS Tracking<\/h2>/g, ">Add New GPS</h2>");
    content = content.replace(/>Add GPS tracking system record<\/p>/g, ">Add new GPS record</p>");

    content = content.replace(/[\s\n]*Edit GPS Certificate[\s\n]*<\/h2>/g, "Edit GPS</h2>");
    content = content.replace(/[\s\n]*Update GPS certificate details[\s\n]*<\/p>/g, "Update vehicle GPS record</p>");

    content = content.replace(/[\s\n]*Renew GPS Certificate[\s\n]*<\/h2>/g, "Renew GPS</h2>");
    content = content.replace(/[\s\n]*Update GPS renewal details[\s\n]*<\/p>/g, "Renew vehicle GPS record</p>");

    // Tax Modals
    content = content.replace(/[\s\n]*Add New Tax Payment[\s\n]*<\/h2>/g, "Add New Tax</h2>");
    content = content.replace(/[\s\n]*Add vehicle tax payment record[\s\n]*<\/p>/g, "Add new tax record</p>");

    content = content.replace(/>Edit Tax Record<\/h2>/g, ">Edit Tax</h2>");
    content = content.replace(/>Update vehicle tax payment record<\/p>/g, ">Update vehicle tax record</p>");

    content = content.replace(/[\s\n]*Renew Tax Record[\s\n]*<\/h2>/g, "Renew Tax</h2>");
    content = content.replace(/[\s\n]*Add new tax payment period[\s\n]*<\/p>/g, "Renew vehicle tax record</p>");

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Updated: ' + filePath);
    }
  }
});
