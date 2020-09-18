<template>
    <div class="verification-dropbox" :class="{dragover:draggingOver}"
         @dragover.prevent="draggingOver = true"
         @dragleave="draggingOver = false"
         @drop="handleDrop">
        <div class="dropbox">
            <div class="labels">
                <div class="label title">{{ _$t('verification.dropbox.title') }}</div>
                <div class="label subtitle">{{ _$t('verification.dropbox.subtitle') }}</div>
            </div>
            <input class="input-file"
                   type="file"
                   multiple
                   name="uploadField"
                   accept="application/pdf"
                   @change="filesDropped($event.target.name, $event.target.files)">
        </div>
    </div>
</template>

<script>
import i18nWrapperMixin from '../../mixins/i18n-wrapper'

export default {
    name: 'VerificationDropBox',
    mixins: [
        i18nWrapperMixin
    ],
    data() {
        return {
            draggingOver: false
        }
    },
    methods: {
        handleDrop() {
            this.draggingOver = false
            this.$emit('drop')
        },
        filesDropped(target, files) {
            this.$emit('filesDropped', files)
        }
    }
}
</script>
