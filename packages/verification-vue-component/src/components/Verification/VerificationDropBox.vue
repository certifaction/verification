<template>
    <div class="verification-dropbox">
        <div class="dropbox">
            <div class="content">
                <div class="labels">
                    <div class="label title">{{ titleLabel }}</div>
                    <div class="label subtitle">{{ _$t('verification.fileSelection.subtitle.dropbox') }}</div>
                </div>
                <img src="../../assets/img/dropbox_document.svg" alt="Certifaction"/>
            </div>
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
    props: {
        firstVerification: {
            type: Boolean,
            default: true
        }
    },
    computed: {
        titleLabel() {
            return this.firstVerification ? this._$t('verification.fileSelection.title.first') : this._$t('verification.fileSelection.title.following')
        }
    }
}
</script>
