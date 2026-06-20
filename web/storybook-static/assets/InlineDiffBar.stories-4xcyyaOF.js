import{j as e}from"./jsx-runtime-D_zvdyIk.js";import{r as o}from"./iframe-DP-2tj83.js";import{D as l}from"./DiffView-BrKXYSM-.js";import{a as d}from"./index-BoGZsUNS.js";import{A as p}from"./index-ZoMgrOc5.js";import{m as f}from"./proxy-P4gg3xAH.js";import"./preload-helper-Ct5FWWRu.js";function i({changes:r}){const m=d(),n=o.useRef(null);return o.useEffect(()=>{n.current&&r.length>0&&n.current.scrollIntoView({behavior:"smooth",block:"nearest"})},[r.length]),e.jsx(p,{mode:"wait",children:r.length>0&&e.jsx(f.div,{ref:n,initial:{scaleY:0},animate:{scaleY:1},exit:{scaleY:0},transition:{duration:.25,ease:[.16,1,.3,1]},style:{transformOrigin:"top"},className:"will-change-transform",children:e.jsxs("div",{className:"border-t border-border bg-secondary/30 dark:bg-secondary/10",children:[e.jsxs("div",{className:"px-6 pt-4 pb-1 flex items-center gap-2",children:[e.jsx("span",{className:"text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider",children:m("common.reviewChanges")}),e.jsx("span",{className:"text-[11px] font-medium text-muted-foreground/50 tabular-nums",children:r.length})]}),e.jsx("div",{className:"px-6 pb-4",children:e.jsx(l,{changes:r})})]})},"diff-bar")})}i.__docgenInfo={description:"",methods:[],displayName:"InlineDiffBar",props:{changes:{required:!0,tsType:{name:"Array",elements:[{name:"DiffChange"}],raw:"DiffChange[]"},description:""}}};const c=[{field:"name",label:"Name",before:"old-flag",after:"new-flag",group:"General"},{field:"desc",label:"Description",before:"Old text",after:"Updated description",group:"General"},{field:"pct",label:"Percentage",before:"50%",after:"75%",group:"Strategy"}],j={title:"Components/InlineDiffBar",component:i,tags:["autodocs"]},a={args:{changes:c}},s={args:{changes:[c[0]]}},t={args:{changes:[]}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    changes: CHANGES
  }
}`,...a.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    changes: [CHANGES[0]]
  }
}`,...s.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    changes: []
  }
}`,...t.parameters?.docs?.source}}};const y=["WithChanges","SingleChange","Empty"];export{t as Empty,s as SingleChange,a as WithChanges,y as __namedExportsOrder,j as default};
