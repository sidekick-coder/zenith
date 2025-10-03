---
applyTo: '**/*.vue'
---

## Code style
- use 4 spaces for indentation

## General
- use vue setup syntax
- use tailwindcss for styling 
- use shadcn/ui for components
- component alias is #client/components
- use tag script tag with `lang="ts"`
- tag order: `<script>`, `<template>`, `<style>`

  Ex: `{{ $t('Log in') }}` 


## Forms
- use vee-validate for form validation
- use FormTextField from #client/components/FormTextField.vue for text inputs
- use FormSelect from #client/components/FormSelect.vue for select inputs
- use FormTextarea from #client/components/FormTextarea.vue for textarea inputs
- use valibot for validation schemas
- import valibot this way `import * as v from 'valibot'`
- use toTypedSchema from '@vee-validate/valibot' to convert valibot schemas to vee-validate schemas
- use `useForm` from vee-validate for form handling
- use $fetch from '#client/utils/fetcher.ts' for API calls

## Display texts
- always use $t function from `#shared/lang.ts` to texts that are displayed to the user
- use $t('Text') for static texts
- use $t('Text :0', [value]) for dynamic texts
- use $t('Text :0 :1', [value1,value2]) for dynamic texts

## Props
- use defineProps to define props
- dont use withDefaults, use optional props instead
- always declare type props

Ex: 
```ts
const props = defineProps({
    description: {
        type: String,
        required: false
    }
})
```