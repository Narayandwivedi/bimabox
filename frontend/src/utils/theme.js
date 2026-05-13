export const themes = {
  theme1: {
    navbar: 'bg-white/80 backdrop-blur-md border-b border-slate-200',
    addButton: 'bg-gradient-to-r from-blue-600 to-indigo-700',
    tableHeader: 'bg-slate-900',
  },
  theme2: {
    navbar: 'bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-900',
    addButton: 'bg-gradient-to-r from-blue-500 to-indigo-600',
    tableHeader: 'bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-700',
  },

  theme3: {
    navbar: 'bg-gradient-to-r from-slate-800 via-blue-900 to-cyan-900',
    addButton: 'bg-gradient-to-r from-slate-700 to-gray-800',
    tableHeader: 'bg-gradient-to-r from-slate-600 via-blue-600 to-cyan-600',
  },


  theme4: {
    navbar: 'bg-gradient-to-r from-teal-800 via-cyan-800 to-sky-800',
    addButton: 'bg-gradient-to-r from-teal-600 to-sky-600',
    tableHeader: 'bg-gradient-to-r from-teal-600 via-cyan-600 to-sky-600',
  },
 


  theme5: {
    navbar: 'bg-gradient-to-r from-purple-950 via-indigo-950 to-blue-950',
    addButton: 'bg-gradient-to-r from-purple-900 to-indigo-900',
    tableHeader: 'bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900',
  },


  theme6: {
    navbar: 'bg-gradient-to-r from-emerald-950 via-teal-950 to-cyan-950',
    addButton: 'bg-gradient-to-r from-emerald-800 to-teal-800',
    tableHeader: 'bg-gradient-to-r from-emerald-900 via-teal-900 to-cyan-900',
  },
};

// Vehicle Number Design Styles
export const vehicleNumberDesigns = {
  design1: {
    name: 'Classic',
    description: 'Yellow highlight on last 4 digits',
    container: 'flex items-center gap-0.5',
    stateCode: 'text-sm font-inter font-bold text-gray-700',
    districtCode: 'text-sm font-inter font-bold text-gray-700',
    series: 'text-sm font-inter font-bold text-gray-700',
    last4Digits: 'text-sm font-inter font-bold text-gray-900 px-1.5 py-0.5 rounded',
  },
  design2: {
    name: 'Classic Highlight',
    description: 'Yellow highlight on last 4 digits',
    container: 'flex items-center gap-0.5',
    stateCode: 'text-sm font-inter font-bold text-gray-700',
    districtCode: 'text-sm font-inter font-bold text-gray-700',
    series: 'text-sm font-inter font-bold text-gray-700',
    last4Digits: 'text-sm font-inter font-bold text-indigo-600 bg-yellow-100 px-1.5 py-0.5 rounded',
  },


  design3: {
    name: 'Dark Mode',
    description: 'Dark background with light text',
    container: 'flex items-center gap-0.5',
    stateCode: 'text-sm font-inter font-bold text-gray-700',
    districtCode: 'text-sm font-inter font-bold text-gray-700',
    series: 'text-sm font-inter font-bold text-gray-700',
    last4Digits: 'text-sm font-inter font-bold text-white bg-gray-600 px-2 py-0.5 rounded',
  },


  design4: {
    name: 'Minimal Clean',
    description: 'Simple and clean design',
    container: 'flex items-center gap-1',
    stateCode: 'text-sm font-inter font-semibold text-gray-600',
    districtCode: 'text-sm font-inter font-semibold text-gray-600',
    series: 'text-sm font-inter font-semibold text-gray-600',
    last4Digits: 'text-sm font-inter font-bold text-gray-900 underline decoration-2 decoration-indigo-500',
  },

  design5: {
    name: 'Premium Gold',
    description: 'Luxury gold accent',
    container: 'flex items-center gap-0.5',
    stateCode: 'text-sm font-inter font-bold text-gray-700',
    districtCode: 'text-sm font-inter font-bold text-gray-700',
    series: 'text-sm font-inter font-bold text-gray-700',
    last4Digits: 'text-sm font-inter font-bold text-amber-900 bg-gradient-to-r from-amber-200 to-yellow-300 px-2 py-0.5 rounded border border-amber-400',
  },

  design6: {
    name: 'Sleek Blue',
    description: 'Simple blue accent',
    container: 'flex items-center gap-0',
    stateCode: 'text-sm font-inter font-semibold text-gray-800',
    districtCode: 'text-sm font-inter font-semibold text-gray-800',
    series: 'text-sm font-inter font-semibold text-gray-800',
    last4Digits: 'text-sm font-inter font-bold text-blue-600 ml-0.5',
  },


  design7: {
    name: 'Sharp Teal',
    description: 'Bold teal emphasis',
    container: 'flex items-center gap-0',
    stateCode: 'text-sm font-inter font-semibold text-gray-700',
    districtCode: 'text-sm font-inter font-semibold text-gray-700',
    series: 'text-sm font-inter font-semibold text-gray-700',
    last4Digits: 'text-sm font-inter font-bold text-teal-700 bg-teal-100 px-1 py-0.5 ml-0.5',
  },
  

  design8: {
    name: 'Steel Gray',
    description: 'Professional gray',
    container: 'flex items-center gap-0',
    stateCode: 'text-sm font-inter font-medium text-gray-600',
    districtCode: 'text-sm font-inter font-medium text-gray-600',
    series: 'text-sm font-inter font-medium text-gray-600',
    last4Digits: 'text-sm font-inter font-bold text-gray-900 bg-gray-200 px-1 py-0.5 rounded ml-0.5',
  },


  design9: {
    name: 'Dash Classic',
    description: 'Classic with dashes',
    container: 'flex items-center gap-0',
    stateCode: 'text-sm font-inter font-semibold text-gray-700 after:content-["-"] after:mx-0.5 after:text-gray-400',
    districtCode: 'text-sm font-inter font-semibold text-gray-700 after:content-["-"] after:mx-0.5 after:text-gray-400',
    series: 'text-sm font-inter font-semibold text-gray-700 after:content-["-"] after:mx-0.5 after:text-gray-400',
    last4Digits: 'text-sm font-inter font-bold text-indigo-600',
  },

  design15: {
    name: 'Dash Blue',
    description: 'Blue with dashes',
    container: 'flex items-center gap-0',
    stateCode: 'text-sm font-inter font-semibold text-blue-700 after:content-["-"] after:mx-0.5 after:text-blue-300',
    districtCode: 'text-sm font-inter font-semibold text-blue-700 after:content-["-"] after:mx-0.5 after:text-blue-300',
    series: 'text-sm font-inter font-semibold text-blue-700 after:content-["-"] after:mx-0.5 after:text-blue-300',
    last4Digits: 'text-sm font-inter font-bold text-blue-900 bg-blue-50 px-1 py-0.5 rounded',
  },


  
  design18: {
    name: 'Dash Purple',
    description: 'Purple with dashes',
    container: 'flex items-center gap-0',
    stateCode: 'text-sm font-inter font-semibold text-purple-700 after:content-["-"] after:mx-0.5 after:text-purple-300',
    districtCode: 'text-sm font-inter font-semibold text-purple-700 after:content-["-"] after:mx-0.5 after:text-purple-300',
    series: 'text-sm font-inter font-semibold text-purple-700 after:content-["-"] after:mx-0.5 after:text-purple-300',
    last4Digits: 'text-sm font-inter font-bold text-purple-900 bg-purple-50 px-1 py-0.5 rounded',
  },

  design30: {
    name: 'Dash Bold',
    description: 'Bold with thick dashes',
    container: 'flex items-center gap-0',
    stateCode: 'text-sm font-inter font-bold text-gray-800 after:content-["-"] after:mx-1 after:text-gray-600 after:font-extrabold',
    districtCode: 'text-sm font-inter font-bold text-gray-800 after:content-["-"] after:mx-1 after:text-gray-600 after:font-extrabold',
    series: 'text-sm font-inter font-bold text-gray-800 after:content-["-"] after:mx-1 after:text-gray-600 after:font-extrabold',
    last4Digits: 'text-sm font-inter font-extrabold text-gray-900 bg-yellow-100 px-1.5 py-0.5 rounded',
  },
};
