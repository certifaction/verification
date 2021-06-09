<template>
    <div class="data-entry" :class="{ collapsed: hasDetails && collapsed, 'no-details': !hasDetails }">
        <div class="header" @click="onClickHeader">
            <div v-if="iconSrc || mdIcon" class="icon">
                <img v-if="iconSrc" :src="iconSrc" class="icon" alt="Icon"/>
                <MDIcon v-if="mdIcon" :icon="mdIcon"/>
            </div>
            <div class="title" v-html="title"/>
            <div v-if="hasDetails" class="collapse-indicator">
                <MDIcon :icon="mdiChevronUp"/>
            </div>
        </div>
        <transition name="collapse"
                    @enter="onEnterTransition"
                    @after-enter="onAfterEnterTransition"
                    @leave="onLeaveTransition">
            <div v-if="hasDetails && !collapsed" class="details">
                <slot/>
            </div>
        </transition>
    </div>
</template>

<script>
import { mdiChevronUp } from '@mdi/js'
import MDIcon from '../../MDIcon.vue'

export default {
    name: 'DataEntry',
    components: {
        MDIcon
    },
    props: {
        iconSrc: {
            type: String
        },
        mdIcon: {
            type: String
        },
        title: {
            type: String,
            required: true
        }
    },
    data() {
        return {
            mdiChevronUp,
            collapsed: true
        }
    },
    computed: {
        hasDetails() {
            return !!this.$slots.default
        }
    },
    methods: {
        onClickHeader() {
            if (this.hasDetails) {
                this.collapsed = !this.collapsed
            }
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
