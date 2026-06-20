import{j as p}from"./jsx-runtime-D_zvdyIk.js";import{S as m}from"./switch-CJTTjVZ-.js";import{L as d}from"./label-C51f9lPH.js";import"./iframe-DP-2tj83.js";import"./preload-helper-Ct5FWWRu.js";import"./index-Blarl-ku.js";import"./index-DlGP-Ght.js";import"./index-CG7t-1OX.js";import"./index-ZEUw8nZR.js";import"./index-BospHUp7.js";import"./index-Dm9-QcB_.js";import"./index-DLmYvlQ2.js";import"./utils-CNg2SYlS.js";import"./clsx-B-dksMZM.js";const{userEvent:h,within:l,expect:s}=__STORYBOOK_MODULE_TEST__,_={title:"UI/Switch",component:m,tags:["autodocs"]},n={play:async({canvasElement:e})=>{const t=l(e).getByRole("switch");await s(t).not.toBeChecked()}},c={args:{defaultChecked:!0},play:async({canvasElement:e})=>{const a=l(e);await s(a.getByRole("switch")).toBeChecked()}},r={play:async({canvasElement:e})=>{const t=l(e).getByRole("switch");await s(t).not.toBeChecked(),await h.click(t),await s(t).toBeChecked()}},o={args:{disabled:!0},play:async({canvasElement:e})=>{const a=l(e);await s(a.getByRole("switch")).toBeDisabled()}},i={render:({...e})=>p.jsxs("div",{className:"flex items-center gap-3",children:[p.jsx(m,{id:"airplane-mode",...e}),p.jsx(d,{htmlFor:"airplane-mode",children:"Airplane Mode"})]})};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const sw = canvas.getByRole("switch");
    await expect(sw).not.toBeChecked();
  }
}`,...n.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    defaultChecked: true
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("switch")).toBeChecked();
  }
}`,...c.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const sw = canvas.getByRole("switch");
    await expect(sw).not.toBeChecked();
    await userEvent.click(sw);
    await expect(sw).toBeChecked();
  }
}`,...r.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("switch")).toBeDisabled();
  }
}`,...o.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  render: ({
    ...args
  }) => <div className="flex items-center gap-3">\r
      <Switch id="airplane-mode" {...args} />\r
      <Label htmlFor="airplane-mode">Airplane Mode</Label>\r
    </div>
}`,...i.parameters?.docs?.source}}};const L=["Unchecked","Checked","Toggle","Disabled","WithLabel"];export{c as Checked,o as Disabled,r as Toggle,n as Unchecked,i as WithLabel,L as __namedExportsOrder,_ as default};
