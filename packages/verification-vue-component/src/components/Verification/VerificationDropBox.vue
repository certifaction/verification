<template>
    <div class="verification-dropbox" :class="{dragover:draggingOver}"
         @dragover.prevent="dragOver"
         @dragleave="dragLeave"
         @drop="handleDrop">
        <div class="dropbox">
            <div class="content">
                <img src="../../assets/img/dropbox_document.svg" alt="Certifaction"/>
                <div class="labels">
                    <div class="label title">{{ titleLabel }}</div>
                    <div class="label subtitle">{{ subtitleLabel }}</div>
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
            firstVerification: true,
            dragLeaveLocked: false
        }
    },
    created: function() {
        window.addEventListener('dragover', this.dragOver)
        window.addEventListener('dragleave', this.dragLeave)
        window.addEventListener('drop', this.dragLeave)
    },

    destroyed: function() {
        window.removeEventListener('dragover', this.dragOver)
        window.removeEventListener('dragleave', this.dragLeave)
        window.removeEventListener('drop', this.handleDrop)
    },
    computed: {
        titleLabel() {
            return this.firstVerification ? this._$t('verification.dropbox.title.first') : this._$t('verification.dropbox.title.following')
        },
        subtitleLabel() {
            return this.draggingOver ? this._$t('verification.dropbox.subtitle.dragging') : this._$t('verification.dropbox.subtitle.default')
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
        },
        dragOver() {
            if (!this.draggingOver) {
                this.draggingOver = true
                this.dragLeaveLocked = true

                setTimeout(() => {
                    this.dragLeaveLocked = false
                }, 100)
            }
        },
        dragLeave() {
            if (!this.dragLeaveLocked) {
                this.draggingOver = false
            }
        }
    }
}
</script>
