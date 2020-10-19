<template>
    <div class="base-card">
        <div class="card-header">
            <slot name="header"></slot>
        </div>
        <div class="card-body">
            <slot name="body"></slot>
        </div>
        <div class="card-footer">
            <slot name="footer"></slot>
        </div>
    </div>
</template>

<script>

export default {
    name: 'BaseItem',
    components: {},
    props: {
        expanded: {
            type: Boolean,
            default: false
        }
    },
    computed: {}
}
</script>
