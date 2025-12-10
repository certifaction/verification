<template>
    <svg class="md-icon" viewBox="0 0 24 24">
        <path fill="currentColor" :d="icon" />
    </svg>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
    name: 'MDIcon',
    props: {
        icon: {
            type: String,
            required: true,
        },
    },
})
</script>
