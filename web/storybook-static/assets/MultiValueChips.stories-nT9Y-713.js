import{j as o}from"./jsx-runtime-D_zvdyIk.js";import{M as n}from"./MultiValueChips-0ioRpyoN.js";import{r as u}from"./iframe-DP-2tj83.js";import"./index-BoGZsUNS.js";import"./x-mVRyscNr.js";import"./createLucideIcon-AY_gplK-.js";import"./preload-helper-Ct5FWWRu.js";const h={title:"App/Flags/MultiValueChips",component:n,tags:["autodocs"]},r={render:()=>{const[e,s]=u.useState([]);return o.jsx(n,{values:e,onChange:s})}},t={render:()=>{const[e,s]=u.useState(["US","CA","UK"]);return o.jsx(n,{values:e,onChange:s})}},a={render:()=>{const[e,s]=u.useState(["US"]);return o.jsx(n,{values:e,onChange:s,validValues:["US","CA","UK","DE","FR"]})}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [v, s] = useState<string[]>([]);
    return <MultiValueChips values={v} onChange={s} />;
  }
}`,...r.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [v, s] = useState<string[]>(["US", "CA", "UK"]);
    return <MultiValueChips values={v} onChange={s} />;
  }
}`,...t.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [v, s] = useState<string[]>(["US"]);
    return <MultiValueChips values={v} onChange={s} validValues={["US", "CA", "UK", "DE", "FR"]} />;
  }
}`,...a.parameters?.docs?.source}}};const C=["Empty","WithValues","WithValidValues"];export{r as Empty,a as WithValidValues,t as WithValues,C as __namedExportsOrder,h as default};
