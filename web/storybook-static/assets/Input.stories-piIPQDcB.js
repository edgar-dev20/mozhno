import{j as a}from"./jsx-runtime-D_zvdyIk.js";import{I as m}from"./input-DzfKWgl3.js";import{L as h}from"./label-C51f9lPH.js";import"./utils-CNg2SYlS.js";import"./clsx-B-dksMZM.js";import"./iframe-DP-2tj83.js";import"./preload-helper-Ct5FWWRu.js";import"./index-CG7t-1OX.js";import"./index-ZEUw8nZR.js";import"./index-BospHUp7.js";const{userEvent:y,within:p,expect:d}=__STORYBOOK_MODULE_TEST__,I={title:"UI/Input",component:m,tags:["autodocs"]},t={args:{placeholder:"Enter text..."},play:async({canvasElement:e})=>{const r=p(e);await d(r.getByPlaceholderText("Enter text...")).toBeInTheDocument()}},s={args:{defaultValue:"Hello world",placeholder:"Enter text..."},play:async({canvasElement:e})=>{const r=p(e);await d(r.getByDisplayValue("Hello world")).toBeInTheDocument()}},n={args:{placeholder:"Type here..."},play:async({canvasElement:e})=>{const u=p(e).getByPlaceholderText("Type here...");await y.type(u,"test"),await d(u).toHaveValue("test")}},o={args:{disabled:!0,placeholder:"Disabled input"},play:async({canvasElement:e})=>{const r=p(e);await d(r.getByPlaceholderText("Disabled input")).toBeDisabled()}},l={args:{type:"password",defaultValue:"secret",placeholder:"Password"}},c={render:()=>a.jsxs("div",{className:"grid gap-1.5 max-w-sm",children:[a.jsx(h,{htmlFor:"email",children:"Email"}),a.jsx(m,{id:"email",placeholder:"user@example.com",type:"email"})]})},i={render:()=>a.jsxs("div",{className:"grid gap-1.5 max-w-sm",children:[a.jsx(h,{htmlFor:"error-input",children:"Username"}),a.jsx(m,{id:"error-input",placeholder:"Enter username","aria-invalid":!0}),a.jsx("span",{className:"text-xs text-destructive",children:"Username is already taken"})]})};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    placeholder: "Enter text..."
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByPlaceholderText("Enter text...")).toBeInTheDocument();
  }
}`,...t.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    defaultValue: "Hello world",
    placeholder: "Enter text..."
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByDisplayValue("Hello world")).toBeInTheDocument();
  }
}`,...s.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    placeholder: "Type here..."
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText("Type here...");
    await userEvent.type(input, "test");
    await expect(input).toHaveValue("test");
  }
}`,...n.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true,
    placeholder: "Disabled input"
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByPlaceholderText("Disabled input")).toBeDisabled();
  }
}`,...o.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    type: "password",
    defaultValue: "secret",
    placeholder: "Password"
  }
}`,...l.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: () => <div className="grid gap-1.5 max-w-sm">\r
      <Label htmlFor="email">Email</Label>\r
      <Input id="email" placeholder="user@example.com" type="email" />\r
    </div>
}`,...c.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  render: () => <div className="grid gap-1.5 max-w-sm">\r
      <Label htmlFor="error-input">Username</Label>\r
      <Input id="error-input" placeholder="Enter username" aria-invalid />\r
      <span className="text-xs text-destructive">Username is already taken</span>\r
    </div>
}`,...i.parameters?.docs?.source}}};const P=["Default","WithValue","Typing","Disabled","TypePassword","WithLabel","WithError"];export{t as Default,o as Disabled,l as TypePassword,n as Typing,i as WithError,c as WithLabel,s as WithValue,P as __namedExportsOrder,I as default};
