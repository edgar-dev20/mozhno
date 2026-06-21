<template>
  <ClientOnly>
    <div style="display:none" data-mermaid-init />
  </ClientOnly>
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(async () => {
  const { default: mermaid } = await import('mermaid')
  mermaid.initialize({
    startOnLoad: true,
    theme: 'default',
    securityLevel: 'loose',
    fontFamily: 'Onest, Inter, ui-sans-serif, system-ui, sans-serif',
  })
  await mermaid.run()
})
</script>
