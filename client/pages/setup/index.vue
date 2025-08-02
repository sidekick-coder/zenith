<script setup lang="ts">
import Button from '#app/components/Button.vue'
import Logo from '#app/components/Logo.vue'
import LogoIcon from '#app/components/LogoIcon.vue'
import Card from '#app/components/ui/card/Card.vue'
import CardDescription from '#app/components/ui/card/CardDescription.vue'
import CardFooter from '#app/components/ui/card/CardFooter.vue'
import CardHeader from '#app/components/ui/card/CardHeader.vue'
import CardTitle from '#app/components/ui/card/CardTitle.vue'

</script>

<template>
    <div class="h-dvh w-dvw flex items-center justify-center">
        <Card class="w-full max-w-md">
            <CardHeader class="text-center">
                <div class="flex aspect-square size-20 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground mx-auto mb-5">
                    <LogoIcon class="size-10 fill-current text-white dark:text-black" />
                </div>
                <CardTitle>
                    {{ $t('Setup') }}
                </CardTitle>
                <CardDescription>
                    {{ $t('Let\'s get started with the setup process.') }}
                </CardDescription>
            </CardHeader>
            <CardFooter class="flex justify-center">
                <Button
                    to="/admin/setup/database"
                >
                    {{ $t('Start Setup') }}
                </Button>
            </CardFooter>
        </Card>
    </div>
</template>