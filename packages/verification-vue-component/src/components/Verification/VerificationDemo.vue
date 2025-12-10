<template>
    <div class="verification-demo">
        <div class="sample-docs">
            <h3>{{ _$t('verification.demo.title') }}</h3>
            <span class="click-to-verify">{{ _$t('verification.demo.clickToVerify') }}</span>
            <div class="docs">
                <div class="paperbox">
                    <div
                        v-tooltip.top="_$t('verification.demo.notFound.tooltip')"
                        class="paper paper-not-found"
                        draggable
                        @click="$emit('verify-demo', 'notFound')"
                        @dragstart="$emit('dragging-demo-doc', 'notFound')"
                        @dragend="$emit('dragging-demo-doc')">
                        <MDIcon :icon="mdiAlertCircle" />
                        <div class="lines">
                            <div v-for="n in 4" :key="n" :class="randomLineClass()"></div>
                        </div>
                    </div>
                    <div
                        v-tooltip.top="_$t('verification.demo.technicalProblem.tooltip')"
                        class="paper paper-technical-problem"
                        draggable
                        @click="$emit('verify-demo', 'technicalProblem')"
                        @dragstart="$emit('dragging-demo-doc', 'technicalProblem')"
                        @dragend="$emit('dragging-demo-doc')">
                        <MDIcon :icon="mdiAlertCircle" />
                        <div class="lines">
                            <div v-for="n in 4" :key="n" :class="randomLineClass()"></div>
                        </div>
                    </div>
                    <div
                        v-tooltip.top="_$t('verification.demo.verifiedProcessing.tooltip')"
                        class="paper paper-verified-processing"
                        draggable
                        @click="$emit('verify-demo', 'verifiedProcessing')"
                        @dragstart="$emit('dragging-demo-doc', 'verifiedProcessing')"
                        @dragend="$emit('dragging-demo-doc')">
                        <MDIcon :icon="mdiShield" />
                        <div class="lines">
                            <div v-for="n in 4" :key="n" :class="randomLineClass()"></div>
                        </div>
                    </div>
                    <div
                        v-tooltip.top="_$t('verification.demo.verified.tooltip')"
                        class="paper paper-verified"
                        draggable
                        @click="$emit('verify-demo', 'verified')"
                        @dragstart="$emit('dragging-demo-doc', 'verified')"
                        @dragend="$emit('dragging-demo-doc')">
                        <MDIcon :icon="mdiShieldCheck" />
                        <div class="lines">
                            <div v-for="n in 4" :key="n" :class="randomLineClass()"></div>
                        </div>
                    </div>
                    <div
                        v-tooltip.top="_$t('verification.demo.verifiedSelfDeclared.tooltip')"
                        class="paper paper-verified-self-declared"
                        draggable
                        @click="$emit('verify-demo', 'verifiedSelfDeclared')"
                        @dragstart="$emit('dragging-demo-doc', 'verifiedSelfDeclared')"
                        @dragend="$emit('dragging-demo-doc')">
                        <MDIcon :icon="mdiShieldCheck" />
                        <div class="lines">
                            <div v-for="n in 4" :key="n" :class="randomLineClass()"></div>
                        </div>
                    </div>
                    <div
                        v-tooltip.top="_$t('verification.demo.revokedVerified.tooltip')"
                        class="paper paper-revoked-verified"
                        draggable
                        @click="$emit('verify-demo', 'revokedVerified')"
                        @dragstart="$emit('dragging-demo-doc', 'revokedVerified')"
                        @dragend="$emit('dragging-demo-doc')">
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

<script lang="ts">
import { defineComponent } from 'vue'
import { mdiAlertCircle, mdiShield, mdiShieldCheck } from '@mdi/js'
import i18nWrapperMixin from '../../mixins/i18n-wrapper.ts'
import MDIcon from '../MDIcon.vue'

export default defineComponent({
    name: 'VerificationDemo',
    components: {
        MDIcon,
    },
    mixins: [i18nWrapperMixin],
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
})
</script>
