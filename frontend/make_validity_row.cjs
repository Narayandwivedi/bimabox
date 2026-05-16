const fs = require('fs');
const path = require('path');

const directory = 'c:/Users/Naray/OneDrive/Desktop/bimabox/frontend/src/pages';

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? 
            walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

walkDir(directory, function(filePath) {
    if (filePath.endsWith('.jsx')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let original = content;

        // 1. Make Valid/Tax From and Valid/Tax To appear on the same row on mobile
        content = content.replace(/(<div className='grid grid-cols-1 md:grid-cols-2[^>]*>)([\s\S]{0,300}?Valid From)/g, "<div className='grid grid-cols-2 gap-3 md:gap-4'>$2");
        content = content.replace(/(<div className='grid grid-cols-1 md:grid-cols-2[^>]*>)([\s\S]{0,300}?Tax From)/g, "<div className='grid grid-cols-2 gap-3 md:gap-4'>$2");

        // 2. Remove the hint text
        // "Type 2-digit year (24) to auto-expand to 2024"
        content = content.replace(/[ \t]*<p className='text-xs text-gray-500 mt-1'>Type 2-digit year \(24\) to auto-expand to 2024<\/p>\n/g, '');
        
        // "Auto-calculated: 1 year from Valid From date minus 1 day" (or 6 months, etc)
        content = content.replace(/[ \t]*<p className='text-xs text-gray-500 mt-1'>Auto-calculated:[^<]*<\/p>\n/g, '');

        if (content !== original) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log('Updated: ' + filePath);
        }
    }
});
