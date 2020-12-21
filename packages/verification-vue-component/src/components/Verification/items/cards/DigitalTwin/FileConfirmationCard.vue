<template>
    <BaseCard class="file-confirmation-card">
        <template #header>
            <div class="icon">
                <MDIcon :icon="mdiFileDocument" class="icon-verified"/>
            </div>
            <div class="title">
                <div class="filename">{{ fileName }}</div>
            </div>
        </template>
        <template #body>
            <div class="action-box confirmation mobile">
                <div class="text">
                    <h4>{{ _$t('verification.digitalTwin.actionBox.confirmation.title.mobile') }}</h4>
                    <p>{{ _$t('verification.digitalTwin.actionBox.confirmation.copy.mobile') }}</p>
                </div>

                <div class="actions">
                    <div class="confirmation-action" @click="approveOrDecline(true)">
                        <MDIcon :icon="mdiCheckCircle"/>
                    </div>
                    <div class="confirmation-action" @click="approveOrDecline(false)">
                        <MDIcon :icon="mdiCloseCircle"/>
                    </div>
                </div>
            </div>

            <div class="action-box confirmation">
                <div class="text">
                    <h4>{{ _$t('verification.digitalTwin.actionBox.confirmation.title.desktop') }}</h4>
                    <p>{{ _$t('verification.digitalTwin.actionBox.confirmation.copy.desktop') }}</p>
                </div>
                <div class="actions">
                    <button class="btn light" @click="approveOrDecline(false)">
                        <MDIcon :icon="mdiCloseCircle"/>
                        {{ _$t('verification.digitalTwin.actionBox.confirmation.btn.decline') }}
                    </button>
                    <button class="btn light" @click="approveOrDecline(true)">
                        <MDIcon :icon="mdiCheckCircle"/>
                        {{ _$t('verification.digitalTwin.actionBox.confirmation.btn.approve') }}
                    </button>
                </div>
            </div>
        </template>
    </BaseCard>
</template>

<script>
import BaseCard from '../BaseCard.vue'
import i18nWrapperMixin from '../../../../../mixins/i18n-wrapper'
import MDIcon from '../../../../MDIcon'
import { mdiCheckCircle, mdiCloseCircle, mdiFileDocument } from '@mdi/js'

export default {
    name: 'FileConfirmationCard',
    mixins: [i18nWrapperMixin],
    components: {
        MDIcon,
        BaseCard
    },
    props: {
        fileName: {
            type: String,
            required: true
        }
    },
    data() {
        return {
            mdiCheckCircle,
            mdiCloseCircle,
            mdiFileDocument
        }
    },
    methods: {
        approveOrDecline(approved) {
            this.$emit('approve-or-decline', approved)
        }
    }
}
</script>
