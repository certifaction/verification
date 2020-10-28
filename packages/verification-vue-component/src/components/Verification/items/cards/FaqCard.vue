<template>
    <BaseCard :card-class="'faq-card'">
        <template #header>
            <div class="title">
                <span class="help-card-title">{{ _$t('verification.card.faq.title') }}</span>
            </div>
        </template>
        <template #body>
            <div class="faq-items">
                <div class="item"
                     v-for="(item, index) in _$t('verification.card.faq.items', { returnObjects: true })"
                     :key="index">
                    <input type="checkbox" :id="'chck' + index">
                    <label class="item-label" :for="'chck' + index">{{ item.title }}</label>
                    <div class="item-content">
                        {{ item.content }}
                    </div>
                </div>
            </div>
        </template>
        <template #footer>
            <div class="left">
                <button class="btn secondary" @click="toggleHelp('faq')">
                    <span>{{ _$t('verification.card.btn.back') }}</span>
                </button>
            </div>
            <div class="right">
                <button class="btn primary">
                    <span>{{ _$t('verification.card.btn.support') }}</span>
                </button>
            </div>
        </template>
    </BaseCard>
</template>

<script>
import BaseCard from './BaseCard.vue'
import i18nWrapperMixin from '../../../../mixins/i18n-wrapper'

export default {
    name: 'FaqCard',
    mixins: [i18nWrapperMixin],
    components: {
        BaseCard
    },
    methods: {
        toggleHelp(type) {
            this.$emit('toggle-help', type)
        }
    }
}
</script>
