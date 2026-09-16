<script setup lang="ts">
import type { PropType } from 'vue'
import type { ThemeColors } from '#client/composables/defineTheme.ts'

defineProps({
    colors: {
        type: Object as PropType<ThemeColors>,
        required: true,
    },
})
</script>

<template>
    <svg
        viewBox="0 0 400 225"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
    >
        <rect
            width="400"
            height="225"
            :fill="colors.background"
        />
        <rect
            width="400"
            height="24"
            :fill="colors.card"
        />
        <rect
            y="23"
            width="400"
            height="1"
            :fill="colors.border"
        />
        <rect
            x="14"
            y="7"
            width="10"
            height="10"
            rx="2"
            :fill="colors.primary"
        />
        <text x="32" y="13" :fill="colors.foreground" font-size="6" font-weight="700">Acme Inc.</text>
        <text x="32" y="19" :fill="colors['muted-foreground']" font-size="4">Dashboard</text>
        <rect
            x="14"
            y="38"
            width="82"
            height="42"
            rx="4"
            :fill="colors.card"
            :stroke="colors.border"
        />
        <rect
            x="106"
            y="38"
            width="82"
            height="42"
            rx="4"
            :fill="colors.card"
            :stroke="colors.border"
        />
        <rect
            x="198"
            y="38"
            width="82"
            height="42"
            rx="4"
            :fill="colors.card"
            :stroke="colors.border"
        />
        <rect
            x="290"
            y="38"
            width="96"
            height="42"
            rx="4"
            :fill="colors.card"
            :stroke="colors.border"
        />
        <text x="23" y="51" :fill="colors['muted-foreground']" font-size="4">REVENUE</text>
        <text x="23" y="66" :fill="colors.foreground" font-size="9" font-weight="700">$45,231</text>
        <text x="115" y="51" :fill="colors['muted-foreground']" font-size="4">USERS</text>
        <text x="115" y="66" :fill="colors.foreground" font-size="9" font-weight="700">2,350</text>
        <text x="207" y="51" :fill="colors['muted-foreground']" font-size="4">SALES</text>
        <text x="207" y="66" :fill="colors.foreground" font-size="9" font-weight="700">12,234</text>
        <text x="299" y="51" :fill="colors['muted-foreground']" font-size="4">ACTIVE</text>
        <text x="299" y="66" :fill="colors.foreground" font-size="9" font-weight="700">573</text>
        <rect
            x="14"
            y="92"
            width="232"
            height="119"
            rx="5"
            :fill="colors.card"
            :stroke="colors.border"
        />
        <rect
            x="256"
            y="92"
            width="130"
            height="119"
            rx="5"
            :fill="colors.card"
            :stroke="colors.border"
        />
        <text x="24" y="108" :fill="colors.foreground" font-size="6" font-weight="700">Overview</text>
        <text x="24" y="115" :fill="colors['muted-foreground']" font-size="4">Monthly revenue</text>
        <path
            d="M28 190 C50 170 59 159 78 169 S106 148 126 161 S151 183 170 145 S199 135 228 121"
            fill="none"
            :stroke="colors.primary"
            stroke-width="3"
            stroke-linecap="round"
        />
        <text x="267" y="108" :fill="colors.foreground" font-size="6" font-weight="700">Recent sales</text>
        <circle
            cx="275"
            cy="130"
            r="7"
            :fill="colors.primary"
        />
        <text x="288" y="132" :fill="colors.foreground" font-size="5">Olivia Martin</text>
        <circle
            cx="275"
            cy="153"
            r="7"
            :fill="colors.accent"
        />
        <text x="288" y="155" :fill="colors.foreground" font-size="5">Jackson Lee</text>
        <circle
            cx="275"
            cy="176"
            r="7"
            :fill="colors.primary"
        />
        <text x="288" y="178" :fill="colors.foreground" font-size="5">Isabella Nguyen</text>
    </svg>
</template>
