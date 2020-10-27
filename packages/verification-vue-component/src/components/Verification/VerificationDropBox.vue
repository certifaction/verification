<template>
    <div class="verification-dropbox" :class="{dragover:draggingOver}"
         @dragover.prevent="draggingOver = true"
         @dragleave="draggingOver = false"
         @drop="handleDrop">
        <div class="dropbox">
            <div class="content">
                <img src="../../assets/img/dropbox_document.svg" alt="Certifaction"/>
                <div class="labels">
                    <div class="label title">{{ titleLabel }}</div>
                    <div class="label subtitle">{{ _$t('verification.dropbox.subtitle') }}</div>
                </div>
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
            draggingOver: false,
            firstVerification: true
        }
    },
    computed: {
        titleLabel() {
            return this.firstVerification ? this._$t('verification.dropbox.title.first') : this._$t('verification.dropbox.title.following')
        }
    },
    methods: {
        handleDrop() {
            this.draggingOver = false
            this.firstVerification = false
            this.$emit('drop')
        },
        filesDropped(target, files) {
            this.$emit('files-dropped', files)
        }
    }
}
</script>
