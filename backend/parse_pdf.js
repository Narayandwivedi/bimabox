const fs = require('fs');
const pdf = require('pdf-parse');

let dataBuffer = fs.readFileSync('../frontend/public/Motor TP Rates.pdf');

pdf(dataBuffer).then(function(data) {
    console.log(data.text);
}).catch(err => {
    console.error(err);
});
