<template>
  <Layout>
    <template #nav-bar-title-before>
      <a class="brand-wrap" href="https://mozhno.dev" title="можно.dev">
        <span class="brand-name">можно</span><span class="brand-dot">.</span>
      </a>
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
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const behavior = reduceMotion ? 'instant' as ScrollBehavior : 'smooth' as ScrollBehavior
  if (hash) {
    nextTick(() => {
      const el = document.querySelector(hash)
      if (el) el.scrollIntoView({ behavior, block: 'start' })
    })
  } else {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }
}

function getMermaidConfig() {
  const dark = document.documentElement.classList.contains('dark')
  return dark ? {
    startOnLoad: false,
    securityLevel: 'loose',
    theme: 'base',
    themeVariables: {
      borderRadius: 10,
      primaryColor: '#2d9484',
      primaryBorderColor: '#3db8a5',
      primaryTextColor: '#ffffff',
      lineColor: '#d4834a',
      secondaryColor: '#1d302c',
      tertiaryColor: '#263834',
      textColor: '#d0dbd8',
      mainBkg: '#222a28',
      nodeBorder: '#1a6b60',
      clusterBkg: '#1a2523',
      clusterBorder: '#1a6b60',
      titleColor: '#3db8a5',
      edgeLabelBackground: '#1d302c',
      nodeTextColor: '#ffffff',
    },
  } : {
    startOnLoad: false,
    securityLevel: 'loose',
    theme: 'base',
    themeVariables: {
      borderRadius: 10,
      primaryColor: '#2d9484',
      primaryBorderColor: '#1a6b60',
      primaryTextColor: '#0a1a16',
      lineColor: '#CD7F32',
      secondaryColor: '#e8f5f3',
      tertiaryColor: '#f0f8f6',
      textColor: '#0a1a16',
      mainBkg: '#fafffe',
      nodeBorder: '#1a6b60',
      clusterBkg: '#f0f8f6',
      clusterBorder: '#2d9484',
      titleColor: '#0a1a16',
      edgeLabelBackground: '#e8f5f3',
      nodeTextColor: '#0a1a16',
    },
  }
}

async function runMermaid() {
  const { default: m } = await import('mermaid')
  document.querySelectorAll('pre.mermaid').forEach(el => {
    if (!(el as HTMLElement).dataset.mermaidCode) {
      (el as HTMLElement).dataset.mermaidCode = el.textContent || ''
    }
  })
  m.initialize(getMermaidConfig())
  await m.run({ querySelector: 'pre.mermaid' })
  document.querySelectorAll('pre.mermaid').forEach(el => ((el as HTMLElement).style.opacity = '1'))
}

async function renderDiagrams() {
  if (typeof window === 'undefined') return
  await nextTick()
  await new Promise(r => setTimeout(r, 200))
  try { await runMermaid() } catch {}
}

async function reRenderDiagrams() {
  if (typeof window === 'undefined') return
  const blocks = document.querySelectorAll<HTMLElement>('pre.mermaid')
  if (!blocks.length) return
  blocks.forEach(el => {
    const code = el.dataset.mermaidCode
    if (code) { el.innerHTML = code; el.removeAttribute('data-processed') }
  })
  try { await runMermaid() } catch {}
}

onMounted(() => {
  smoothScroll()
  renderDiagrams()
  const observer = new MutationObserver(() => reRenderDiagrams())
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
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
  text-decoration: none;
  color: inherit;
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
  color: var(--vp-c-copper-1);
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