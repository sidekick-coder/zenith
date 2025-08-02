<script setup lang="ts">
import Card from '#app/components/ui/card/Card.vue'
import CardDescription from '#app/components/ui/card/CardDescription.vue'
import CardHeader from '#app/components/ui/card/CardHeader.vue'
import CardTitle from '#app/components/ui/card/CardTitle.vue'

</script>

<template>
    <div class="h-dvh w-dvw flex items-center justify-center">
        <Card class="w-full max-w-md">
            <CardHeader>
                <CardTitle>
                    {{ $t('Setup') }}
                </CardTitle>
                <CardDescription>
                    {{ $t('Let\'s get started with the setup process.') }}
                </CardDescription>
            </CardHeader>
        </Card>
    </div>
</template>