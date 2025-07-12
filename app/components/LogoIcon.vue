<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

defineOptions({
    inheritAttrs: false,
});

interface Props {
    className?: HTMLAttributes['class'];
}

defineProps<Props>();
</script>

<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 40 42"
        :class="className"
        v-bind="$attrs"
    >
        <path
            d="M32 8
                                  L14 8
                                  Q8 8 8 14
                                  L8 28
                                  Q8 34 14 34
                                  L32 34"
            stroke="currentColor"
            stroke-width="5"
            fill="none"
            stroke-linecap="round"
            stroke-linejoin="round"
        />
    </svg>
</template>
