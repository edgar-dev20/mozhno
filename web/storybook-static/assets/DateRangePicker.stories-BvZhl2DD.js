import{j as e}from"./jsx-runtime-D_zvdyIk.js";import{r as n}from"./iframe-DP-2tj83.js";import{DateRangePicker as l}from"./DateRangePicker-BjuGUhGC.js";import"./preload-helper-Ct5FWWRu.js";import"./popover-jhuUCevL.js";import"./index-Blarl-ku.js";import"./index-DlGP-Ght.js";import"./index-CG7t-1OX.js";import"./index-ZEUw8nZR.js";import"./index-BospHUp7.js";import"./index-DFfz4Q0N.js";import"./index-bFwMlmfo.js";import"./index-BPFNws8-.js";import"./index-DLmYvlQ2.js";import"./index-CAMMQXT4.js";import"./utils-CNg2SYlS.js";import"./clsx-B-dksMZM.js";import"./calendar-_LRDj-JW.js";import"./index-BoGZsUNS.js";import"./chevron-left-m3ZujCZM.js";import"./createLucideIcon-AY_gplK-.js";import"./chevron-right-BszEaZmS.js";import"./calendar-DJxXczvZ.js";import"./x-mVRyscNr.js";import"./ru-CA6g3apw.js";function d(s){const[a,m]=n.useState(null),[p,c]=n.useState(null);return e.jsx(l,{from:a,to:p,onChange:(i,u)=>{m(i??null),c(u??null)},placeholder:"Select date range",...s})}const G={title:"Shared/DateRangePicker",component:l,tags:["autodocs"]},t={render:()=>e.jsx(d,{})},r={render:()=>e.jsx(d,{presets:!0})},o={render:()=>{function s(){const[a,m]=n.useState(new Date(2026,5,1)),[p,c]=n.useState(new Date(2026,5,15));return e.jsx(l,{from:a,to:p,onChange:(i,u)=>{m(i??null),c(u??null)},placeholder:"Select date range"})}return e.jsx(s,{})}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  render: () => <Demo />
}`,...t.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  render: () => <Demo presets />
}`,...r.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: () => {
    function D() {
      const [f, sf] = useState<Date | null>(new Date(2026, 5, 1));
      const [t, st] = useState<Date | null>(new Date(2026, 5, 15));
      return <DateRangePicker from={f} to={t} onChange={(ff, tt) => {
        sf(ff ?? null);
        st(tt ?? null);
      }} placeholder="Select date range" />;
    }
    return <D />;
  }
}`,...o.parameters?.docs?.source}}};const H=["Default","WithPresets","WithRange"];export{t as Default,r as WithPresets,o as WithRange,H as __namedExportsOrder,G as default};
