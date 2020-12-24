<template>
    <div class="pdf-zoom d-flex align-items-center">
        <input type="range" min="1" max="5" step="0.1" v-model="scaleFromSlider" class="slider" orient="vertical">
    </div>
</template>

<script>

export default {
    name: 'PDFZoom',
    props: {
        scale: {
            type: Number
        },
        increment: {
            type: Number,
            default: 0.25
        }
    },
    data() {
        return {
            scaleFromSlider: null
        }
    },
    watch: {
        scaleFromSlider: function(newValue) {
            this.updateScale(newValue)
        }
    },
    methods: {
        updateScale(scale) {
            this.$emit('change', { scale })
        }
    }
}
</script>
