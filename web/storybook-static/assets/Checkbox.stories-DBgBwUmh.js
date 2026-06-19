import{j as p}from"./jsx-runtime-D_zvdyIk.js";import{C as d}from"./checkbox-27L3ivu4.js";import{L as l}from"./label-C51f9lPH.js";import"./iframe-DP-2tj83.js";import"./preload-helper-Ct5FWWRu.js";import"./index-CG7t-1OX.js";import"./index-ZEUw8nZR.js";import"./index-BospHUp7.js";import"./index-DlGP-Ght.js";import"./index-Blarl-ku.js";import"./index-Dm9-QcB_.js";import"./index-DLmYvlQ2.js";import"./index-CAMMQXT4.js";import"./utils-CNg2SYlS.js";import"./clsx-B-dksMZM.js";import"./check-w802uh_q.js";import"./createLucideIcon-AY_gplK-.js";const{userEvent:h,within:i,expect:t}=__STORYBOOK_MODULE_TEST__,D={title:"UI/Checkbox",component:d,tags:["autodocs"]},c={play:async({canvasElement:e})=>{const a=i(e);await t(a.getByRole("checkbox")).not.toBeChecked()}},n={args:{defaultChecked:!0},play:async({canvasElement:e})=>{const a=i(e);await t(a.getByRole("checkbox")).toBeChecked()}},s={play:async({canvasElement:e})=>{const m=i(e).getByRole("checkbox");await t(m).not.toBeChecked(),await h.click(m),await t(m).toBeChecked()}},o={args:{disabled:!0},play:async({canvasElement:e})=>{const a=i(e);await t(a.getByRole("checkbox")).toBeDisabled()}},r={render:({...e})=>p.jsxs("div",{className:"flex items-center gap-2",children:[p.jsx(d,{id:"terms",...e}),p.jsx(l,{htmlFor:"terms",children:"Accept terms and conditions"})]})};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("checkbox")).not.toBeChecked();
  }
}`,...c.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    defaultChecked: true
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("checkbox")).toBeChecked();
  }
}`,...n.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const cb = canvas.getByRole("checkbox");
    await expect(cb).not.toBeChecked();
    await userEvent.click(cb);
    await expect(cb).toBeChecked();
  }
}`,...s.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("checkbox")).toBeDisabled();
  }
}`,...o.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  render: ({
    ...args
  }) => <div className="flex items-center gap-2">\r
      <Checkbox id="terms" {...args} />\r
      <Label htmlFor="terms">Accept terms and conditions</Label>\r
    </div>
}`,...r.parameters?.docs?.source}}};const O=["Unchecked","Checked","Toggle","Disabled","WithLabel"];export{n as Checked,o as Disabled,s as Toggle,c as Unchecked,r as WithLabel,O as __namedExportsOrder,D as default};
