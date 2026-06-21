<template>
  <Layout>
    <template #nav-bar-title-before>
      <span class="brand-wrap">
        <span class="brand-name">можно</span><span class="brand-dot">.</span>
      </span>
      <span class="brand-badge">docs</span>
    </template>
  </Layout>
</template>

<script setup lang="ts">
import { onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vitepress'
import DefaultTheme from 'vitepress/theme'

const { Layout } = DefaultTheme
const route = useRoute()

function animateContent() {
  if (typeof window === 'undefined') return
  nextTick(() => {
    const el = document.querySelector('.VPDoc .content-container') as HTMLElement | null
    if (!el) return
    el.classList.remove('page-transition')
    void el.offsetWidth // force reflow
    el.classList.add('page-transition')
  })
}

function smoothScroll() {
  if (typeof window === 'undefined') return
  const hash = route.hash
  if (hash) {
    nextTick(() => {
      const el = document.querySelector(hash)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  } else {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }
}

async function fixHeroDot() {
  if (typeof window === 'undefined') return
  for (let i = 0; i < 5; i++) {
    await new Promise(r => setTimeout(r, 100))
    const el = document.querySelector('.VPHomeHero .name')
    if (el && !(el as HTMLElement).dataset.dotFixed) {
      ;(el as HTMLElement).dataset.dotFixed = '1'
      const text = el.textContent || ''
      const dotIdx = text.lastIndexOf('.')
      if (dotIdx === -1) return
      el.innerHTML = ''
      ;(el as HTMLElement).style.display = 'inline-flex'
      ;(el as HTMLElement).style.alignItems = 'baseline'
      const s1 = document.createElement('span')
      s1.textContent = text.slice(0, dotIdx)
      s1.style.cssText = 'font-weight:750;background:linear-gradient(135deg,oklch(0.48 0.17 175),oklch(0.36 0.13 170));-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent'
      const s2 = document.createElement('span')
      s2.textContent = '.'
      s2.style.cssText = 'font-family:"JetBrains Mono","Fira Code","Consolas",monospace;font-weight:600;font-size:0.5em;color:#b86840;margin-left:-0.1em'
      el.appendChild(s1)
      el.appendChild(s2)
      return
    }
  }
}

async function renderDiagrams() {
  if (typeof window === 'undefined') return
  await nextTick()
  await fixHeroDot()
  await new Promise(r => setTimeout(r, 200))
  try {
    const { default: m } = await import('mermaid')
    m.initialize({ startOnLoad: false, securityLevel: 'loose' })
    await m.run({ querySelector: 'pre.mermaid' })
  } catch {}
}

onMounted(() => {
  smoothScroll()
  renderDiagrams()
})
watch(() => route.path, () => {
  animateContent()
  smoothScroll()
  renderDiagrams()
})
</script>

<style>
.brand-wrap {
  display: inline-flex;
  align-items: baseline;
}
.brand-name {
  font-weight: 700;
  font-size: 1.5rem;
  letter-spacing: 0.02em;
  background: linear-gradient(135deg, oklch(0.48 0.17 175), oklch(0.36 0.13 170));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
:root.dark .brand-name {
  background: linear-gradient(135deg, oklch(0.58 0.18 175), oklch(0.56 0.15 170));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
.brand-dot {
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  font-weight: 600;
  font-size: 0.6em;
  color: #b86840;
  margin-left: -0.15em;
}
.brand-badge {
  display: inline-block;
  font-size: 0.6875rem;
  font-weight: 500;
  line-height: 1;
  padding: 2px 6px;
  margin-left: 8px;
  border-radius: 4px;
  background: oklch(0.36 0.13 170);
  color: oklch(0.98 0.001 200);
  letter-spacing: 0;
}
:root.dark .brand-badge {
  background: oklch(0.56 0.15 170);
  color: oklch(0.12 0.003 80);
}
</style>
