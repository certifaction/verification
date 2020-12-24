<template>
    <div class="pdf-viewer">
        <PDFData
            class="pdf-viewer__main"
            id="the-pdf"
            :url="url"
            @page-count="updatePageCount"
            @page-focus="updateCurrentPage"
            @document-rendered="onDocumentRendered"
            @document-errored="onDocumentErrored">

            <template v-slot:document="{pages}">
                <PDFDocument
                    class="pdf-viewer__document"
                    v-bind="{pages, scale, optimalScale, fit, currentPage, pageCount}"
                    @scale-change="updateScale"/>
            </template>
        </PDFData>
        <PDFZoom
            :scale="scale"
            @change="updateScale"
            @fit="updateFit"
            class="header-item"/>
    </div>
</template>

<script>

import PDFDocument from './PDFDocument.vue'
import PDFData from './PDFData.vue'
import PDFZoom from './PDFZoom.vue'

function floor(value, precision) {
    const multiplier = Math.pow(10, precision || 0)
    return Math.floor(value * multiplier) / multiplier
}

export default {
    name: 'PDFViewer',
    components: {
        PDFDocument,
        PDFData,
        PDFZoom
    },
    props: {
        url: String
    },
    data() {
        return {
            scale: 1,
            optimalScale: 3,
            fit: undefined,
            currentPage: 1,
            pageCount: undefined
        }
    },
    methods: {
        onDocumentRendered() {
            this.$emit('document-errored', this.url)
        },
        onDocumentErrored(e) {
            this.$emit('document-errored', e)
        },
        updateScale({ scale, isOptimal = false }) {
            const roundedScale = floor(scale, 2)
            if (isOptimal) this.optimalScale = roundedScale
            this.scale = roundedScale
        },
        updateFit(fit) {
            this.fit = fit
        },
        updatePageCount(pageCount) {
            this.pageCount = pageCount
        },
        updateCurrentPage(pageNumber) {
            this.currentPage = pageNumber
        }
    },
    watch: {
        url() {
            this.currentPage = undefined
        }
    }
}
</script>
