<template>
    <div class="verification-demo">
        <div class="sample-docs">
            <h3>{{ _$t('verification.demo.title') }}</h3>
            <span class="click-to-verify">{{ _$t('verification.demo.clickToVerify') }}</span>
            <div class="docs">
                <div class="paperbox">
                    <div class="paper paper-not-found"
                         @click="$emit('verifyDemo', 'notFound')"
                         @dragstart="$emit('draggingDemoDoc', 'notFound')"
                         @dragend="$emit('draggingDemoDoc')"
                         draggable
                         v-tooltip.top="_$t('verification.demo.notFound.tooltip')">
                        <MDIcon :icon="mdiAlertCircle"/>
                        <div class="lines">
                            <div v-for="n in 4" :key="n" :class="randomLineClass()"></div>
                        </div>
                    </div>
                    <div class="paper paper-technical-problem"
                         @click="$emit('verifyDemo', 'technicalProblem')"
                         @dragstart="$emit('draggingDemoDoc', 'technicalProblem')"
                         @dragend="$emit('draggingDemoDoc')"
                         draggable
                         v-tooltip.top="_$t('verification.demo.technicalProblem.tooltip')">
                        <MDIcon :icon="mdiAlertCircle"/>
                        <div class="lines">
                            <div v-for="n in 4" :key="n" :class="randomLineClass()"></div>
                        </div>
                    </div>
                    <div class="paper paper-verified-processing"
                         @click="$emit('verifyDemo', 'verifiedProcessing')"
                         @dragstart="$emit('draggingDemoDoc', 'verifiedProcessing')"
                         @dragend="$emit('draggingDemoDoc')"
                         draggable
                         v-tooltip.top="_$t('verification.demo.verifiedProcessing.tooltip')">
                        <MDIcon :icon="mdiShield"/>
                        <div class="lines">
                            <div v-for="n in 4" :key="n" :class="randomLineClass()"></div>
                        </div>
                    </div>
                    <div class="paper paper-verified"
                         @click="$emit('verifyDemo', 'verified')"
                         @dragstart="$emit('draggingDemoDoc', 'verified')"
                         @dragend="$emit('draggingDemoDoc')"
                         draggable
                         v-tooltip.top="_$t('verification.demo.verified.tooltip')">
                        <MDIcon :icon="mdiShieldCheck"/>
                        <div class="lines">
                            <div v-for="n in 4" :key="n" :class="randomLineClass()"></div>
                        </div>
                    </div>
                    <div class="paper paper-verified-self-declared"
                         @click="$emit('verifyDemo', 'verifiedSelfDeclared')"
                         @dragstart="$emit('draggingDemoDoc', 'verifiedSelfDeclared')"
                         @dragend="$emit('draggingDemoDoc')"
                         draggable
                         v-tooltip.top="_$t('verification.demo.verifiedSelfDeclared.tooltip')">
                        <MDIcon :icon="mdiShieldCheck"/>
                        <div class="lines">
                            <div v-for="n in 4" :key="n" :class="randomLineClass()"></div>
                        </div>
                    </div>
                    <div class="paper paper-revoked-verified"
                         @click="$emit('verifyDemo', 'revokedVerified')"
                         @dragstart="$emit('draggingDemoDoc', 'revokedVerified')"
                         @dragend="$emit('draggingDemoDoc')"
                         draggable
                         v-tooltip.top="_$t('verification.demo.revokedVerified.tooltip')">
                        <MDIcon :icon="mdiShieldCheck"/>
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
    mixins: [
        i18nWrapperMixin
    ],
    components: {
        MDIcon
    },
    data() {
        return {
            mdiAlertCircle,
            mdiShield,
            mdiShieldCheck
        }
    },
    methods: {
        randomLineClass() {
            return (Math.random() > 0.5) ? 'line-long' : 'line-short'
        }
    }
}
</script>
