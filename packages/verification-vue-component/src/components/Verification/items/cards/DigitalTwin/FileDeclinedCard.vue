<template>
    <BaseCard class="file-declined-card">
        <template #header>
            <div class="icon">
                <MDIcon :icon="mdiFileDocument" class="icon-verified"/>
            </div>
            <div class="title">
                <div class="filename">{{ fileName }}</div>
            </div>
        </template>
        <template #body>
            <h3>{{ _$t('verification.digitalTwin.fileDeclined.title') }}</h3>
            <p v-html="_$t('verification.digitalTwin.fileDeclined.copy')"/>
        </template>
    </BaseCard>
</template>

<script>
import BaseCard from '../BaseCard.vue'
import i18nWrapperMixin from '../../../../../mixins/i18n-wrapper'
import MDIcon from '../../../../MDIcon.vue'
import { mdiFileDocument } from '@mdi/js'

export default {
    name: 'FileDeclinedCard',
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
            mdiFileDocument
        }
    }
}
</script>
