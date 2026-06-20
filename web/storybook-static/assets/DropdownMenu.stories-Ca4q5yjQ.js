import{j as e}from"./jsx-runtime-D_zvdyIk.js";import{D as s,a as m,b as p,c as d,d as n,e as r}from"./dropdown-menu-DXcIHXgc.js";import{U as u}from"./user-BmLmKehU.js";import{S as l}from"./settings-0Gj3fZ64.js";import{P as x}from"./plus-M3bQo8hz.js";import{L as g}from"./log-out-CjRHivA-.js";import"./iframe-DP-2tj83.js";import"./preload-helper-Ct5FWWRu.js";import"./index-Blarl-ku.js";import"./index-DlGP-Ght.js";import"./index-CG7t-1OX.js";import"./index-ZEUw8nZR.js";import"./index-BospHUp7.js";import"./index-BEX5tJZv.js";import"./index-DFfz4Q0N.js";import"./index-bFwMlmfo.js";import"./index-BPFNws8-.js";import"./index-DLmYvlQ2.js";import"./index-CAMMQXT4.js";import"./utils-CNg2SYlS.js";import"./clsx-B-dksMZM.js";import"./circle-CZnpOI8P.js";import"./createLucideIcon-AY_gplK-.js";const{userEvent:j,within:w,expect:D,screen:y}=__STORYBOOK_MODULE_TEST__;function a(){return e.jsxs(s,{children:[e.jsx(m,{className:"inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium",children:"Open Menu"}),e.jsxs(p,{className:"w-56",children:[e.jsx(d,{children:"My Account"}),e.jsx(n,{}),e.jsxs(r,{children:[e.jsx(u,{size:14})," Profile"]}),e.jsxs(r,{children:[e.jsx(l,{size:14})," Settings"]}),e.jsxs(r,{children:[e.jsx(x,{size:14})," New Project"]}),e.jsx(n,{}),e.jsxs(r,{className:"text-destructive",children:[e.jsx(g,{size:14})," Logout"]})]})]})}const Y={title:"UI/DropdownMenu",component:s,tags:["autodocs"]},o={render:()=>e.jsx(a,{}),play:async({canvasElement:i})=>{const c=w(i);await j.click(c.getByRole("button",{name:"Open Menu"})),await D(y.getByText("My Account")).toBeVisible()}},t={render:()=>e.jsx(a,{})};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: () => <DropdownDemo />,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", {
      name: "Open Menu"
    }));
    await expect(screen.getByText("My Account")).toBeVisible();
  }
}`,...o.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  render: () => <DropdownDemo />
}`,...t.parameters?.docs?.source}}};const q=["Default","KeyboardNavigation"];export{o as Default,t as KeyboardNavigation,q as __namedExportsOrder,Y as default};
