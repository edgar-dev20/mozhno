import{j as e}from"./jsx-runtime-D_zvdyIk.js";import{S as i,a as p,b as m,c as d,d as u}from"./select-Dp64wE9a.js";import"./iframe-DP-2tj83.js";import"./preload-helper-Ct5FWWRu.js";import"./index-ZEUw8nZR.js";import"./index-BospHUp7.js";import"./index-BdQq_4o_.js";import"./index-Blarl-ku.js";import"./index-DlGP-Ght.js";import"./index-BEX5tJZv.js";import"./index-CG7t-1OX.js";import"./index-DFfz4Q0N.js";import"./index-bFwMlmfo.js";import"./index-BPFNws8-.js";import"./index-DLmYvlQ2.js";import"./index-Dm9-QcB_.js";import"./index-BGuRCeEQ.js";import"./utils-CNg2SYlS.js";import"./clsx-B-dksMZM.js";import"./chevron-down-BvNauRpD.js";import"./createLucideIcon-AY_gplK-.js";import"./check-w802uh_q.js";import"./chevron-up-CboIev3u.js";const{userEvent:x,within:O,expect:g,screen:j}=__STORYBOOK_MODULE_TEST__,M={title:"UI/Select",component:i,tags:["autodocs"]},S=["Option A","Option B","Option C","Option D"];function l({placeholder:t="Select...",disabled:c=!1}){return e.jsxs(i,{disabled:c,children:[e.jsx(p,{className:"w-[200px]",children:e.jsx(m,{placeholder:t})}),e.jsx(d,{children:S.map(n=>e.jsx(u,{value:n,children:n},n))})]})}const r={render:()=>e.jsx(l,{})},a={render:()=>e.jsx(l,{disabled:!0})},o={render:()=>e.jsxs(i,{defaultValue:"Option B",children:[e.jsx(p,{className:"w-[200px]",children:e.jsx(m,{})}),e.jsx(d,{children:S.map(t=>e.jsx(u,{value:t,children:t},t))})]})},s={render:()=>e.jsx(l,{placeholder:"Open me"}),play:async({canvasElement:t})=>{const c=O(t);await x.click(c.getByRole("combobox")),await g(j.getByText("Option A")).toBeVisible()}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  render: () => <SelectDemo />
}`,...r.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  render: () => <SelectDemo disabled />
}`,...a.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: () => <Select defaultValue="Option B">\r
      <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>\r
      <SelectContent>{OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>\r
    </Select>
}`,...o.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  render: () => <SelectDemo placeholder="Open me" />,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("combobox"));
    await expect(screen.getByText("Option A")).toBeVisible();
  }
}`,...s.parameters?.docs?.source}}};const Y=["Default","Disabled","WithDefaultValue","OpenSelect"];export{r as Default,a as Disabled,s as OpenSelect,o as WithDefaultValue,Y as __namedExportsOrder,M as default};
