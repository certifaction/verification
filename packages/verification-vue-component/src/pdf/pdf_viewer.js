import './pdf.init'
import pdfjsViewer from '@certifaction/verification-vue-component/dist/pdf/pdf_viewer.js'

delete window['pdfjs-dist/build/pdf']

export default pdfjsViewer
