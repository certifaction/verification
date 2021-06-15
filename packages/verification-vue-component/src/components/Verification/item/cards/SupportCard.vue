<template>
    <BaseCard class="help-card">
        <template #header>
            <div class="title">
                <span class="help-card-title">{{ _$t('verification.card.faq.title') }}</span>
            </div>
        </template>
        <template #body>
            <div class="faq-items accordion">
                <div class="item" v-for="(item, index) in _$t('verification.card.faq.items', { returnObjects: true })" :key="index" :class="{ open: isItemOpen(index) }">
                    <div class="item-title" @click="toggleItem(index)">
                        <span>{{ item.title }}</span>
                        <MDIcon :icon="mdiChevronDown" class="chevron"/>
                    </div>
                    <transition name="collapse"
                                @enter="onEnterTransition"
                                @after-enter="onAfterEnterTransition"
                                @leave="onLeaveTransition">
                        <div v-if="isItemOpen(index)" class="content">
                            <div class="inside" v-html="item.content"></div>
                        </div>
                    </transition>
                </div>
            </div>
        </template>
        <template #footer>
            <div class="left">
                <button class="btn btn-secondary" @click="toggleHelp('support')">
                    <span>{{ _$t('verification.card.btn.back') }}</span>
                </button>
            </div>
            <div class="right">
                <button class="btn btn-primary" @click="toggleHelp('contact')">
                    <span>{{ _$t('verification.card.btn.contact') }}</span>
                </button>
            </div>
        </template>
    </BaseCard>
</template>

<script>
import BaseCard from './BaseCard.vue'
import i18nWrapperMixin from '../../../../mixins/i18n-wrapper'
import { mdiChevronDown } from '@mdi/js'
import MDIcon from '../../../MDIcon.vue'

export default {
    name: 'SupportCard',
    mixins: [i18nWrapperMixin],
    components: {
        BaseCard,
        MDIcon
    },
    data() {
        return {
            mdiChevronDown,
            openItems: []
        }
    },
    methods: {
        toggleHelp(type) {
            this.$emit('toggle-help', type)
        },
        toggleItem(index) {
            if (!this.isItemOpen(index)) {
                this.openItems.push(index)
            } else {
                this.openItems = this.openItems.filter(item => item !== index)
            }
        },
        isItemOpen(index) {
            return (this.openItems.indexOf(index) >= 0)
        },
        onEnterTransition(el) {
            el.style.height = 'auto'
            const height = window.getComputedStyle(el).height
            el.style.height = 0
            window.getComputedStyle(el)
            window.setTimeout(() => {
                el.style.height = height
            })
        },
        onAfterEnterTransition(el) {
            el.style.height = 'auto'
        },
        onLeaveTransition(el) {
            el.style.height = window.getComputedStyle(el).height
            window.getComputedStyle(el)
            window.setTimeout(() => {
                el.style.height = 0
            })
        }
    }
}
</script>
