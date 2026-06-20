import{j as e}from"./jsx-runtime-D_zvdyIk.js";import{P as t,a as i,b as m}from"./popover-jhuUCevL.js";import{L as c}from"./label-C51f9lPH.js";import{I as p}from"./input-DzfKWgl3.js";import"./iframe-DP-2tj83.js";import"./preload-helper-Ct5FWWRu.js";import"./index-Blarl-ku.js";import"./index-DlGP-Ght.js";import"./index-CG7t-1OX.js";import"./index-ZEUw8nZR.js";import"./index-BospHUp7.js";import"./index-DFfz4Q0N.js";import"./index-bFwMlmfo.js";import"./index-BPFNws8-.js";import"./index-DLmYvlQ2.js";import"./index-CAMMQXT4.js";import"./utils-CNg2SYlS.js";import"./clsx-B-dksMZM.js";const{userEvent:l,within:d,expect:u,screen:x}=__STORYBOOK_MODULE_TEST__;function s(){return e.jsxs(t,{children:[e.jsx(i,{className:"inline-flex items-center px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium",children:"Open Popover"}),e.jsx(m,{className:"w-80",children:e.jsxs("div",{className:"grid gap-4",children:[e.jsx("h4",{className:"font-medium leading-none",children:"Dimensions"}),e.jsx("p",{className:"text-xs text-muted-foreground",children:"Set the dimensions for the layer."}),e.jsxs("div",{className:"grid grid-cols-3 items-center gap-4",children:[e.jsx(c,{htmlFor:"width",children:"Width"}),e.jsx(p,{id:"width",defaultValue:"100%",className:"col-span-2 h-8"})]})]})})]})}const C={title:"UI/Popover",component:t,tags:["autodocs"]},r={render:()=>e.jsx(s,{}),play:async({canvasElement:n})=>{const a=d(n);await l.click(a.getByRole("button",{name:"Open Popover"})),await u(x.getByText("Dimensions")).toBeVisible()}},o={render:()=>e.jsx(s,{})};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  render: () => <PopoverDemo />,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", {
      name: "Open Popover"
    }));
    await expect(screen.getByText("Dimensions")).toBeVisible();
  }
}`,...r.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: () => <PopoverDemo />
}`,...o.parameters?.docs?.source}}};const I=["Default","CloseOnEscape"];export{o as CloseOnEscape,r as Default,I as __namedExportsOrder,C as default};
