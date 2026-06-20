import{j as e}from"./jsx-runtime-D_zvdyIk.js";import{L as m}from"./label-C51f9lPH.js";import{I as o}from"./input-DzfKWgl3.js";import{C as c}from"./checkbox-27L3ivu4.js";import"./iframe-DP-2tj83.js";import"./preload-helper-Ct5FWWRu.js";import"./index-CG7t-1OX.js";import"./index-ZEUw8nZR.js";import"./index-BospHUp7.js";import"./utils-CNg2SYlS.js";import"./clsx-B-dksMZM.js";import"./index-DlGP-Ght.js";import"./index-Blarl-ku.js";import"./index-Dm9-QcB_.js";import"./index-DLmYvlQ2.js";import"./index-CAMMQXT4.js";import"./check-w802uh_q.js";import"./createLucideIcon-AY_gplK-.js";const{within:l,expect:d}=__STORYBOOK_MODULE_TEST__,S={title:"UI/Label",component:m,tags:["autodocs"]},r={args:{children:"Email address"},play:async({canvasElement:n})=>{const i=l(n);await d(i.getByText("Email address")).toBeInTheDocument()}},a={render:()=>e.jsxs("div",{className:"grid gap-1.5 max-w-sm",children:[e.jsx(m,{htmlFor:"name",children:"Full Name"}),e.jsx(o,{id:"name",placeholder:"Enter your name"})]})},t={render:()=>e.jsxs("div",{className:"grid gap-1.5 max-w-sm",children:[e.jsx(m,{htmlFor:"email",className:"after:content-['*'] after:ml-0.5 after:text-destructive",children:"Email"}),e.jsx(o,{id:"email",type:"email",placeholder:"user@example.com",required:!0})]})},s={render:()=>e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(c,{id:"agree"}),e.jsx(m,{htmlFor:"agree",children:"I agree to the terms and conditions"})]})};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    children: "Email address"
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Email address")).toBeInTheDocument();
  }
}`,...r.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  render: () => <div className="grid gap-1.5 max-w-sm">\r
      <Label htmlFor="name">Full Name</Label>\r
      <Input id="name" placeholder="Enter your name" />\r
    </div>
}`,...a.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  render: () => <div className="grid gap-1.5 max-w-sm">\r
      <Label htmlFor="email" className="after:content-['*'] after:ml-0.5 after:text-destructive">\r
        Email\r
      </Label>\r
      <Input id="email" type="email" placeholder="user@example.com" required />\r
    </div>
}`,...t.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex items-center gap-2">\r
      <Checkbox id="agree" />\r
      <Label htmlFor="agree">I agree to the terms and conditions</Label>\r
    </div>
}`,...s.parameters?.docs?.source}}};const B=["Default","WithInput","Required","WithCheckbox"];export{r as Default,t as Required,s as WithCheckbox,a as WithInput,B as __namedExportsOrder,S as default};
