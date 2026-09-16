<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouteQuery } from '@vueuse/router'
import { useHead } from '@unhead/vue'
import {
    Avatar,
    AvatarFallback,
    Badge,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Icon,
    Input,
    Progress,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
    ZButton as Button,
} from '@sidekick-coder/zenith-kit/components'

import { useFonts } from '#client/composables/useFonts.ts'
import { useRadii } from '#client/composables/useRadii.ts'
import { themeToCss } from '#client/composables/defineTheme.ts'
import { useThemes } from '#client/composables/useThemes.ts'

const themes = useThemes()
const fonts = useFonts()
const radii = useRadii()

const themeId = useRouteQuery('theme', 'default')
const fontId = useRouteQuery('font', 'inter')
const radiusId = useRouteQuery('radius', 'md')
const activeTab = ref('overview')

const selectedTheme = computed(() => themes.find(theme => theme.id === themeId.value) || themes[0])
const selectedFont = computed(() => fonts.find(font => font.id === fontId.value) || fonts.find(font => font.id === 'inter')!)
const selectedRadius = computed(() => radii.find(radius => radius.id === radiusId.value) || radii.find(radius => radius.id === 'md')!)

const metrics = [
    { label: 'Total Revenue', value: '$45,231.89', change: '+20.1% from last month', icon: 'DollarSign' },
    { label: 'Subscriptions', value: '+2,350', change: '+180.1% from last month', icon: 'Users' },
    { label: 'Sales', value: '+12,234', change: '+19% from last month', icon: 'CreditCard' },
    { label: 'Active Now', value: '+573', change: '+201 since last hour', icon: 'Activity' },
]

const orders = [
    { customer: 'Olivia Martin', email: 'olivia@example.com', amount: '+$1,999.00', initials: 'OM' },
    { customer: 'Jackson Lee', email: 'jackson@example.com', amount: '+$39.00', initials: 'JL' },
    { customer: 'Isabella Nguyen', email: 'isabella@example.com', amount: '+$299.00', initials: 'IN' },
    { customer: 'William Kim', email: 'william@example.com', amount: '+$99.00', initials: 'WK' },
    { customer: 'Sofia Davis', email: 'sofia@example.com', amount: '+$39.00', initials: 'SD' },
]

const bars = [42, 68, 51, 82, 57, 91, 73, 96, 66, 88, 59, 78]

useHead(() => ({
    link: [{
        id: 'components-preview-font',
        rel: 'stylesheet',
        href: selectedFont.value.url,
    }],
    style: [{
        id: 'components-preview-theme',
        innerHTML: `${themeToCss(selectedTheme.value)}\n:root { --radius: ${selectedRadius.value.value}; --font-sans: ${selectedFont.value.family}; }`,
    }],
}))
</script>

<template>
    <main class="min-h-screen bg-background p-4 text-foreground md:p-8">
        <div class="mx-auto max-w-7xl">
            <header class="mb-8 flex flex-col gap-4 border-b pb-6 lg:flex-row lg:items-center lg:justify-between">
                <div class="flex items-center gap-3">
                    <div class="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <Icon name="PanelsTopLeft" class="size-5" />
                    </div>
                    <div>
                        <p class="text-sm font-medium">{{ $t('Acme Inc.') }}</p>
                        <p class="text-sm text-muted-foreground">{{ $t('Component showcase') }}</p>
                    </div>
                </div>

                <Badge variant="outline">{{ $t('URL preview') }}</Badge>
            </header>

            <section class="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                    <h1 class="text-3xl font-bold tracking-tight">{{ $t('Dashboard') }}</h1>
                    <p class="mt-1 text-muted-foreground">{{ $t('A collection of application interface components.') }}</p>
                </div>
                <div class="flex gap-2">
                    <Button variant="outline">
                        <Icon name="Download" class="mr-2 size-4" />
                        {{ $t('Download') }}
                    </Button>
                    <Button>
                        <Icon name="Plus" class="mr-2 size-4" />
                        {{ $t('Create report') }}
                    </Button>
                </div>
            </section>

            <Tabs v-model="activeTab" class="space-y-6">
                <TabsList>
                    <TabsTrigger value="overview">{{ $t('Overview') }}</TabsTrigger>
                    <TabsTrigger value="analytics">{{ $t('Analytics') }}</TabsTrigger>
                    <TabsTrigger value="reports">{{ $t('Reports') }}</TabsTrigger>
                    <TabsTrigger value="notifications">{{ $t('Notifications') }}</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" class="space-y-6">
                    <section class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card v-for="metric in metrics" :key="metric.label">
                            <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle class="text-sm font-medium">{{ $t(metric.label) }}</CardTitle>
                                <Icon :name="metric.icon" class="size-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div class="text-2xl font-bold">{{ metric.value }}</div>
                                <p class="text-xs text-muted-foreground">{{ $t(metric.change) }}</p>
                            </CardContent>
                        </Card>
                    </section>

                    <section class="grid gap-6 lg:grid-cols-7">
                        <Card class="lg:col-span-4">
                            <CardHeader>
                                <CardTitle>{{ $t('Overview') }}</CardTitle>
                                <CardDescription>{{ $t('Monthly revenue performance') }}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div class="h-72">
                                    <svg
                                        viewBox="0 0 800 280"
                                        class="size-full overflow-visible"
                                        preserveAspectRatio="none"
                                        role="img"
                                        :aria-label="$t('Revenue line chart')"
                                    >
                                        <line
                                            v-for="position in [40, 100, 160, 220]"
                                            :key="position"
                                            x1="0"
                                            x2="800"
                                            :y1="position"
                                            :y2="position"
                                            stroke="var(--border)"
                                            stroke-dasharray="4 4"
                                        />
                                        <path
                                            d="M0 215 C50 200 60 170 110 180 S165 125 220 145 S285 190 330 130 S395 90 440 110 S500 60 550 95 S625 145 670 80 S735 25 800 45"
                                            fill="none"
                                            stroke="var(--primary)"
                                            stroke-linecap="round"
                                            stroke-width="5"
                                        />
                                    </svg>
                                </div>
                                <div class="mt-2 flex justify-between text-xs text-muted-foreground">
                                    <span>{{ $t('Jan') }}</span><span>{{ $t('Feb') }}</span><span>{{ $t('Mar') }}</span><span>{{ $t('Apr') }}</span><span>{{ $t('May') }}</span><span>{{ $t('Jun') }}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card class="lg:col-span-3">
                            <CardHeader>
                                <CardTitle>{{ $t('Recent sales') }}</CardTitle>
                                <CardDescription>{{ $t('You made 265 sales this month.') }}</CardDescription>
                            </CardHeader>
                            <CardContent class="space-y-6">
                                <div v-for="order in orders" :key="order.email" class="flex items-center">
                                    <Avatar class="size-9">
                                        <AvatarFallback>{{ order.initials }}</AvatarFallback>
                                    </Avatar>
                                    <div class="ml-4 space-y-1">
                                        <p class="text-sm font-medium leading-none">{{ order.customer }}</p>
                                        <p class="text-sm text-muted-foreground">{{ order.email }}</p>
                                    </div>
                                    <div class="ml-auto font-medium">{{ order.amount }}</div>
                                </div>
                            </CardContent>
                        </Card>
                    </section>

                    <section class="grid gap-6 lg:grid-cols-3">
                        <Card class="lg:col-span-2">
                            <CardHeader class="flex flex-row items-center">
                                <div class="grid gap-1">
                                    <CardTitle>{{ $t('Project activity') }}</CardTitle>
                                    <CardDescription>{{ $t('Your team completed 24 tasks this week.') }}</CardDescription>
                                </div>
                                <Button variant="outline" size="sm" class="ml-auto">{{ $t('View all') }}</Button>
                            </CardHeader>
                            <CardContent class="space-y-5">
                                <div>
                                    <div class="mb-2 flex justify-between text-sm">
                                        <span>{{ $t('Design system refresh') }}</span>
                                        <span class="text-muted-foreground">{{ $t('78%') }}</span>
                                    </div>
                                    <Progress :model-value="78" />
                                </div>
                                <div>
                                    <div class="mb-2 flex justify-between text-sm">
                                        <span>{{ $t('Customer portal') }}</span>
                                        <span class="text-muted-foreground">{{ $t('54%') }}</span>
                                    </div>
                                    <Progress :model-value="54" />
                                </div>
                                <div>
                                    <div class="mb-2 flex justify-between text-sm">
                                        <span>{{ $t('Mobile application') }}</span>
                                        <span class="text-muted-foreground">{{ $t('31%') }}</span>
                                    </div>
                                    <Progress :model-value="31" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>{{ $t('Quick actions') }}</CardTitle>
                                <CardDescription>{{ $t('Common controls and feedback.') }}</CardDescription>
                            </CardHeader>
                            <CardContent class="space-y-3">
                                <Input :placeholder="$t('Search anything...')" />
                                <div class="flex gap-2">
                                    <Button class="flex-1">{{ $t('Save') }}</Button>
                                    <Button variant="secondary" class="flex-1">{{ $t('Cancel') }}</Button>
                                </div>
                                <div class="flex flex-wrap gap-2 pt-2">
                                    <Badge>{{ $t('Default') }}</Badge>
                                    <Badge variant="secondary">{{ $t('Secondary') }}</Badge>
                                    <Badge variant="outline">{{ $t('Outline') }}</Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </section>
                </TabsContent>

                <TabsContent value="analytics">
                    <Card>
                        <CardHeader>
                            <CardTitle>{{ $t('Monthly activity') }}</CardTitle>
                            <CardDescription>{{ $t('A bar chart mockup using the active component theme.') }}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div class="flex h-80 items-end gap-3 border-b px-4 pt-6">
                                <div v-for="(height, index) in bars" :key="index" class="flex flex-1 items-end">
                                    <div
                                        class="w-full rounded-t-sm bg-primary transition-all"
                                        :style="{ height: `${height}%` }"
                                    />
                                </div>
                            </div>
                            <div class="mt-3 grid grid-cols-12 text-center text-xs text-muted-foreground">
                                <span v-for="month in ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']" :key="month">{{ $t(month) }}</span>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="reports">
                    <Card>
                        <CardHeader>
                            <CardTitle>{{ $t('Recent reports') }}</CardTitle>
                            <CardDescription>{{ $t('A table layout with avatars, data, and action states.') }}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{{ $t('Customer') }}</TableHead>
                                        <TableHead>{{ $t('Status') }}</TableHead>
                                        <TableHead>{{ $t('Amount') }}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow v-for="order in orders" :key="order.email">
                                        <TableCell>
                                            <div class="font-medium">{{ order.customer }}</div>
                                            <div class="text-sm text-muted-foreground">{{ order.email }}</div>
                                        </TableCell>
                                        <TableCell><Badge variant="secondary">{{ $t('Complete') }}</Badge></TableCell>
                                        <TableCell class="font-medium">{{ order.amount }}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="notifications">
                    <Card>
                        <CardHeader>
                            <CardTitle>{{ $t('Notifications') }}</CardTitle>
                            <CardDescription>{{ $t('You are all caught up.') }}</CardDescription>
                        </CardHeader>
                        <CardContent class="text-sm text-muted-foreground">
                            {{ $t('No new notifications are available.') }}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    </main>
</template>