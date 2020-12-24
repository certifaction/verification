const pdfjs = require('pdfjs-dist')
pdfjs.GlobalWorkerOptions.workerSrc = require('pdfjs-dist/build/pdf.worker.entry.js')

export default function(src) {
    return pdfjs.getDocument('https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/examples/learning/helloworld.pdf')
}
