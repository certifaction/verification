<template>
    <div class="verification-file-selector">
        <div class="file-selector">
            <div class="content">
                <img src="../../assets/img/dropbox_document.svg" alt="Certifaction" />
                <div class="labels">
                    <div class="label title">{{ titleLabel }}</div>
                    <div class="label subtitle">{{ _$t('verification.fileSelection.subtitle.selector') }}</div>
                </div>
            </div>
            <input
                class="input-file"
                type="file"
                multiple
                name="uploadField"
                accept="application/pdf"
                @change="filesSelected($event.target.name, $event.target.files)" />
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import i18nWrapperMixin from '../../mixins/i18n-wrapper.ts'

export default defineComponent({
    name: 'VerificationFileSelector',
    mixins: [i18nWrapperMixin],
    props: {
        firstVerification: {
            type: Boolean,
            default: true,
        },
    },
    computed: {
        titleLabel() {
            return this.firstVerification
                ? this._$t('verification.fileSelection.title.first')
                : this._$t('verification.fileSelection.title.following')
        },
    },
    methods: {
        filesSelected(target, files) {
            this.$emit('files-selected', files)
        },
    },
})
</script>
