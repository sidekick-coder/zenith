<script setup lang="ts">
// import InputError from '@/components/InputError.vue'
// import TextLink from '@/components/TextLink.vue'
import AuthLayout from '#app/layouts/Auth.vue'
import { Button } from '#app/components/ui/button'
import { Checkbox } from '#app/components/ui/checkbox'
import { Input } from '#app/components/ui/input'
import { Label } from '#app/components/ui/label'
import { LoaderCircle } from 'lucide-vue-next'

defineProps<{
    status?: string;
    canResetPassword: boolean;
}>()

// const form = useForm({
//     email: '',
//     password: '',
//     remember: false,
// })

const submit = () => {
    // form.post(route('login'), {
    //     onFinish: () => form.reset('password'),
    // })
}
</script>

<template>
    <AuthLayout
        title="Log in to your account"
        description="Enter your email and password below to log in"
    >
        <!-- <Head title="Log in" /> -->

        <div
            v-if="status"
            class="mb-4 text-center text-sm font-medium text-green-600"
        >
            {{ status }}
        </div>

        <form
            class="flex flex-col gap-6"
            @submit.prevent="submit"
        >
            <div class="grid gap-6">
                <div class="grid gap-2">
                    <Label for="email">Email address</Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        autofocus
                        :tabindex="1"
                        autocomplete="email"
                        placeholder="email@example.com"
                    />
                </div>

                <div class="grid gap-2">
                    <div class="flex items-center justify-between">
                        <Label for="password">Password</Label>
                        <RouterLink
                            v-if="canResetPassword"
                            to="/auth/reset-password"
                            class="text-sm"
                            :tabindex="5"
                        >
                            Forgot password?
                        </RouterLink>
                    </div>
                    <Input
                        id="password"
                        type="password"
                        required
                        :tabindex="2"
                        autocomplete="current-password"
                        placeholder="Password"
                    />
                </div>

                <Button
                    type="submit"
                    class="mt-4 w-full"
                    :tabindex="4"
                >
                    Log in
                </Button>
            </div>
        </form>
    </AuthLayout>
</template>