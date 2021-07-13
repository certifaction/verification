<template>
    <div class="data-panel" :class="{ collapsed: isBodyCollapsed, 'has-icon': hasIcon, 'has-body': hasBody }">
        <div v-if="hasHeaderContent" class="header" @click="onClickHeader">
            <slot name="header">
                <div v-if="hasIcon" class="icon">
                    <img v-if="iconSrc" :src="iconSrc" class="icon" alt="Icon"/>
                    <MDIcon v-if="mdIcon" :icon="mdIcon"/>
                </div>
                <div v-if="title" class="title" v-html="title"/>
            </slot>

            <div v-if="hasBody && bodyCollapsible" class="collapse-indicator">
                <MDIcon :icon="mdiChevronUp"/>
            </div>
        </div>
        <transition name="collapse"
                    @enter="onEnterTransition"
                    @after-enter="onAfterEnterTransition"
                    @leave="onLeaveTransition">
            <div v-if="hasBody && !isBodyCollapsed" class="body">
                <slot/>
            </div>
        </transition>
    </div>
</template>

<script>
import { mdiChevronUp } from '@mdi/js'
import MDIcon from '../../MDIcon.vue'

export default {
    name: 'DataPanel',
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
            type: String
        },
        bodyCollapsible: {
            type: Boolean,
            default: true
        }
    },
    data() {
        return {
            mdiChevronUp,
            bodyCollapsed: true
        }
    },
    computed: {
        hasIcon() {
            return !!(this.iconSrc || this.mdIcon)
        },
        hasHeaderContent() {
            return !!(this.hasIcon || this.title || this.$slots.header)
        },
        hasBody() {
            return !!this.$slots.default
        },
        isBodyCollapsed() {
            if (!this.bodyCollapsible || !this.hasHeaderContent) {
                return false
            }

            return this.bodyCollapsed
        }
    },
    methods: {
        onClickHeader() {
            if (this.hasBody && this.bodyCollapsible) {
                this.bodyCollapsed = !this.bodyCollapsed
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
