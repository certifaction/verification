<template>
    <div class="result-detail">
        <div class="detail-header">
            <div class="header-icon">
                <MDIcon :icon="mdiShieldCheck" class="icon-verified"/>
            </div>
            <div class="header-label"></div>
            <div class="header-action">
                <button type="button"
                        class="btn-link advanced-toggler">
                    <MDIcon :icon="mdiChevronUp" class="toggler"/>
                </button>
            </div>
        </div>
        <div class="detail-body"></div>
    </div>
</template>

<script>

import { mdiShieldCheck, mdiChevronUp } from '@mdi/js'
import MDIcon from '../../../MDIcon'

export default {
    name: 'ResultDetail',
    components: {
        MDIcon
    },
    props: {
        expanded: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            mdiShieldCheck,
            mdiChevronUp
        }
    },
    computed: {}
}
</script>
