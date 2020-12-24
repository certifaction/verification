<script>
import * as pdfjsLib from 'pdfjs-dist'

const BUFFER_LENGTH = 10

function getDocument(url) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = '//cdnjs.cloudflare.com/ajax/libs/pdf.js/2.5.207/pdf.worker.js'
    const loadingTask = pdfjsLib.getDocument(url)
    return loadingTask.promise.then(function(pdf) {
        return pdf
    })
}

function range(start, end) {
    return Array.from({ length: end }, (_, i) => i + start)
}

function getPages(pdf, first, last) {
    console.log(first, last)
    const allPages = range(first, last).map(number => pdf.getPage(number))

    return Promise.all(allPages)
}

function getDefaults() {
    return {
        pages: [],
        cursor: 0
    }
}

export default {
    name: 'PDFData',
    props: {
        url: {
            type: String,
            required: true
        }
    },
    data() {
        return Object.assign(getDefaults(), {
            pdf: undefined
        })
    },
    watch: {
        url: {
            handler(url) {
                getDocument(url).then(pdf => (this.pdf = pdf)).catch(response => {
                    this.$emit('document-errored', { text: 'Failed to retrieve PDF', response })
                    console.log('Failed to retrieve PDF', response)
                })
            },
            immediate: true
        },
        pdf(pdf, oldPdf) {
            if (!pdf) return
            if (oldPdf) Object.assign(this, getDefaults())

            this.$emit('page-count', this.pageCount)
            this.fetchPages()
        }
    },
    computed: {
        pageCount() {
            return this.pdf ? this.pdf.numPages : 0
        }
    },
    methods: {
        fetchPages(currentPage = 0) {
            if (!this.pdf) return
            if (this.pageCount > 0 && this.pages.length === this.pageCount) return

            const startIndex = this.pages.length
            if (this.cursor > startIndex) return

            const startPage = startIndex + 1
            const endPage = Math.min(Math.max(currentPage, startIndex + BUFFER_LENGTH), this.pageCount)
            this.cursor = endPage

            console.log(`Fetching pages ${startPage} to ${endPage}`)
            getPages(this.pdf, startPage, endPage).then((pages) => {
                const deleteCount = 0
                this.pages.splice(startIndex, deleteCount, ...pages)
                return this.pages
            }).catch((response) => {
                this.$emit('document-errored', { text: 'Failed to retrieve pages', response })
                console.log('Failed to retrieve pages', response)
            })
        },
        onPageRendered({ text, page }) {
            console.log(text, page)
        },
        onPageErrored({ text, response, page }) {
            console.log('Error!', text, response, page)
        }
    },
    created() {
        this.$on('page-rendered', this.onPageRendered)
        this.$on('page-errored', this.onPageErrored)
        this.$on('pages-fetch', this.fetchPages)
    },
    render(h) {
        return h('div', [
            this.$scopedSlots.document({
                pages: this.pages
            })
        ])
    }
}
</script>
