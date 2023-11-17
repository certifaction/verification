<template>
    <div class="verification-demo">
        <div class="sample-docs">
            <h3>{{ _$t('verification.demo.title') }}</h3>
            <span class="click-to-verify">{{ _$t('verification.demo.clickToVerify') }}</span>
            <div class="docs">
                <div class="paperbox">
                    <div
                        class="paper paper-not-found"
                        @click="$emit('verify-demo', 'notFound')"
                        @dragstart="$emit('dragging-demo-doc', 'notFound')"
                        @dragend="$emit('dragging-demo-doc')"
                        draggable
                        v-tooltip.top="_$t('verification.demo.notFound.tooltip')">
                        <MDIcon :icon="mdiAlertCircle" />
                        <div class="lines">
                            <div v-for="n in 4" :key="n" :class="randomLineClass()"></div>
                        </div>
                    </div>
                    <div
                        class="paper paper-technical-problem"
                        @click="$emit('verify-demo', 'technicalProblem')"
                        @dragstart="$emit('dragging-demo-doc', 'technicalProblem')"
                        @dragend="$emit('dragging-demo-doc')"
                        draggable
                        v-tooltip.top="_$t('verification.demo.technicalProblem.tooltip')">
                        <MDIcon :icon="mdiAlertCircle" />
                        <div class="lines">
                            <div v-for="n in 4" :key="n" :class="randomLineClass()"></div>
                        </div>
                    </div>
                    <div
                        class="paper paper-verified-processing"
                        @click="$emit('verify-demo', 'verifiedProcessing')"
                        @dragstart="$emit('dragging-demo-doc', 'verifiedProcessing')"
                        @dragend="$emit('dragging-demo-doc')"
                        draggable
                        v-tooltip.top="_$t('verification.demo.verifiedProcessing.tooltip')">
                        <MDIcon :icon="mdiShield" />
                        <div class="lines">
                            <div v-for="n in 4" :key="n" :class="randomLineClass()"></div>
                        </div>
                    </div>
                    <div
                        class="paper paper-verified"
                        @click="$emit('verify-demo', 'verified')"
                        @dragstart="$emit('dragging-demo-doc', 'verified')"
                        @dragend="$emit('dragging-demo-doc')"
                        draggable
                        v-tooltip.top="_$t('verification.demo.verified.tooltip')">
                        <MDIcon :icon="mdiShieldCheck" />
                        <div class="lines">
                            <div v-for="n in 4" :key="n" :class="randomLineClass()"></div>
                        </div>
                    </div>
                    <div
                        class="paper paper-verified-self-declared"
                        @click="$emit('verify-demo', 'verifiedSelfDeclared')"
                        @dragstart="$emit('dragging-demo-doc', 'verifiedSelfDeclared')"
                        @dragend="$emit('dragging-demo-doc')"
                        draggable
                        v-tooltip.top="_$t('verification.demo.verifiedSelfDeclared.tooltip')">
                        <MDIcon :icon="mdiShieldCheck" />
                        <div class="lines">
                            <div v-for="n in 4" :key="n" :class="randomLineClass()"></div>
                        </div>
                    </div>
                    <div
                        class="paper paper-revoked-verified"
                        @click="$emit('verify-demo', 'revokedVerified')"
                        @dragstart="$emit('dragging-demo-doc', 'revokedVerified')"
                        @dragend="$emit('dragging-demo-doc')"
                        draggable
                        v-tooltip.top="_$t('verification.demo.revokedVerified.tooltip')">
                        <MDIcon :icon="mdiShieldCheck" />
                        <div class="lines">
                            <div v-for="n in 4" :key="n" :class="randomLineClass()"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { mdiAlertCircle, mdiShield, mdiShieldCheck } from '@mdi/js'
import i18nWrapperMixin from '../../mixins/i18n-wrapper'
import MDIcon from '../MDIcon.vue'

export default {
    name: 'VerificationDemo',
    mixins: [i18nWrapperMixin],
    components: {
        MDIcon,
    },
    data() {
        return {
            mdiAlertCircle,
            mdiShield,
            mdiShieldCheck,
        }
    },
    methods: {
        randomLineClass() {
            return Math.random() > 0.5 ? 'line-long' : 'line-short'
        },
    },
}
</script>
