<script setup lang="ts">
import { computed } from 'vue'

import Button from '#client/components/Button.vue'
import Icon from '#client/components/Icon.vue'
import auth from '#client/facades/auth.facade.ts'
import acl from '#client/facades/acl.facade.ts'

const isLoggedIn = computed(() => auth.user)
const canAccessDashboard = computed(() => acl.can('read', 'AdminDashboard'))

async function handleLogout() {
    await auth.logout({ redirect: '/admin/auth/login' })
}
</script>

<template>
    <div class="dark min-h-screen bg-background flex items-center justify-center overflow-hidden relative">
        <!-- Parallax Stars Background -->
        <div class="absolute inset-0 overflow-hidden pointer-events-none">
            <div class="stars-layer-1" />
            <div class="stars-layer-2" />
            <div class="stars-layer-3" />
        </div>

        <div class="max-w-2xl w-full mx-auto text-center space-y-8 px-4 relative z-10">
            <!-- Header with fade-in animation -->
            <div class="space-y-6 animate-in fade-in slide-in-from-top-4 duration-700">
                <!-- Icon decoration -->
                <div class="flex justify-center">
                    <div class="p-4 rounded-full bg-primary/10 backdrop-blur-sm animate-[wiggle_3s_ease-in-out_infinite]">
                        <Icon
                            class="text-6xl text-primary"
                            name="hand-heart"
                        />
                    </div>
                </div>
                
                <div class="inline-block">
                    <h1 class="text-6xl md:text-7xl font-bold text-foreground bg-clip-text text-transparent bg-gradient-to-r from-foreground via-primary to-foreground animate-in fade-in zoom-in duration-500">
                        {{ $t('Welcome!') }}
                    </h1>
                    <div class="h-1 w-0 bg-gradient-to-r from-primary via-accent to-primary rounded-full animate-[expand_1s_ease-out_0.5s_forwards]" />
                </div>
                
                <p class="text-xl text-muted-foreground animate-in fade-in slide-in-from-top-2 duration-700 delay-300 max-w-lg mx-auto">
                    {{ $t('Your journey starts here. Explore, manage, and achieve more.') }}
                </p>
            </div>

            <!-- Decorative dots -->
            <div class="flex justify-center gap-2 animate-in fade-in zoom-in duration-500 delay-500">
                <div class="w-3 h-3 rounded-full bg-primary animate-bounce" />
                <div
                    class="w-3 h-3 rounded-full bg-primary animate-bounce"
                    style="animation-delay: 0.1s;"
                />
                <div
                    class="w-3 h-3 rounded-full bg-primary animate-bounce"
                    style="animation-delay: 0.2s;"
                />
            </div>

            <!-- Buttons with staggered animation -->
            <div class="flex flex-wrap gap-3 justify-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-700">
                <div class="group transform transition-all duration-300 hover:scale-105 hover:-translate-y-1">
                    <Button
                        v-if="isLoggedIn"
                        class="shadow-lg hover:shadow-xl transition-all duration-300"
                        variant="destructive"
                        @click="handleLogout"
                    >
                        <Icon
                            class="mr-2"
                            name="log-out"
                        />
                        {{ $t('Logout') }}
                    </Button>
                </div>
                
                <div class="group transform transition-all duration-300 hover:scale-105 hover:-translate-y-1">
                    <Button
                        v-if="!isLoggedIn"
                        class="shadow-lg hover:shadow-xl transition-all duration-300"
                        to="/admin/auth/login"
                    >
                        <Icon
                            class="mr-2"
                            name="log-in"
                        />
                        {{ $t('Login') }}
                    </Button>
                </div>
    
                <div
                    v-if="canAccessDashboard"
                    class="group transform transition-all duration-300 hover:scale-105 hover:-translate-y-1"
                >
                    <Button
                        class="shadow-lg hover:shadow-xl transition-all duration-300"
                        to="/admin"
                    >
                        <Icon
                            class="mr-2"
                            name="layout-dashboard"
                        />
                        {{ $t('Dashboard') }}
                    </Button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.stars-layer-1,
.stars-layer-2,
.stars-layer-3 {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
}

.stars-layer-1 {
    background-image:
        radial-gradient(1px 1px at 20px 30px, var(--primary), transparent),
        radial-gradient(1px 1px at 60px 70px, var(--primary), transparent),
        radial-gradient(1px 1px at 50px 160px, var(--primary), transparent),
        radial-gradient(1px 1px at 130px 80px, var(--primary), transparent),
        radial-gradient(1px 1px at 140px 150px, var(--primary), transparent),
        radial-gradient(1px 1px at 200px 50px, var(--primary), transparent),
        radial-gradient(1px 1px at 230px 140px, var(--primary), transparent),
        radial-gradient(1px 1px at 300px 100px, var(--primary), transparent),
        radial-gradient(1px 1px at 350px 30px, var(--primary), transparent);
    background-size: 400px 200px;
    animation: parallax-stars-1 60s linear infinite;
    opacity: 0.4;
}

.stars-layer-2 {
    background-image:
        radial-gradient(1.5px 1.5px at 100px 50px, var(--accent), transparent),
        radial-gradient(1.5px 1.5px at 150px 120px, var(--accent), transparent),
        radial-gradient(1.5px 1.5px at 250px 80px, var(--accent), transparent),
        radial-gradient(1.5px 1.5px at 320px 140px, var(--accent), transparent),
        radial-gradient(1.5px 1.5px at 180px 170px, var(--accent), transparent);
    background-size: 450px 250px;
    animation: parallax-stars-2 45s linear infinite;
    opacity: 0.5;
}

.stars-layer-3 {
    background-image:
        radial-gradient(2px 2px at 80px 100px, var(--muted-foreground), transparent),
        radial-gradient(2px 2px at 200px 150px, var(--muted-foreground), transparent),
        radial-gradient(2px 2px at 300px 60px, var(--muted-foreground), transparent),
        radial-gradient(2px 2px at 370px 130px, var(--muted-foreground), transparent);
    background-size: 500px 300px;
    animation: parallax-stars-3 30s linear infinite;
    opacity: 0.3;
}

@keyframes parallax-stars-1 {
    from {
        transform: translateY(0);
    }
    to {
        transform: translateY(-200px);
    }
}

@keyframes parallax-stars-2 {
    from {
        transform: translateY(0);
    }
    to {
        transform: translateY(-250px);
    }
}

@keyframes parallax-stars-3 {
    from {
        transform: translateY(0);
    }
    to {
        transform: translateY(-300px);
    }
}

@keyframes expand {
    from {
        width: 0;
    }
    to {
        width: 100%;
    }
}

@keyframes wiggle {
    0%, 100% {
        transform: rotate(0deg);
    }
    25% {
        transform: rotate(-10deg);
    }
    75% {
        transform: rotate(10deg);
    }
}
</style>