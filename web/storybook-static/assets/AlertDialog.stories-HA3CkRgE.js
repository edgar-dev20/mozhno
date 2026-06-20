import{j as e}from"./jsx-runtime-D_zvdyIk.js";import{r as m}from"./iframe-DP-2tj83.js";import{A as i,a as p,b as u,c as d,d as g,e as D,f as x,g as A,h}from"./alert-dialog-B3N--2WG.js";import"./preload-helper-Ct5FWWRu.js";import"./index-DlGP-Ght.js";import"./index-CG7t-1OX.js";import"./index-ZEUw8nZR.js";import"./index-BospHUp7.js";import"./index-C8-qdA5B.js";import"./index-Blarl-ku.js";import"./index-DFfz4Q0N.js";import"./index-bFwMlmfo.js";import"./index-CAMMQXT4.js";import"./utils-CNg2SYlS.js";import"./clsx-B-dksMZM.js";const{fn:y,userEvent:j,within:v,expect:f,screen:C}=__STORYBOOK_MODULE_TEST__;function n({title:a="Are you sure?",description:s="This action cannot be undone."}){const[c,l]=m.useState(!1);return e.jsxs(i,{open:c,onOpenChange:l,children:[e.jsx(p,{children:"Delete Item"}),e.jsxs(u,{children:[e.jsxs(d,{children:[e.jsx(g,{children:a}),e.jsx(D,{children:s})]}),e.jsxs(x,{children:[e.jsx(A,{children:"Cancel"}),e.jsx(h,{onClick:y(),children:"Continue"})]})]})]})}const K={title:"UI/AlertDialog",component:i,tags:["autodocs"]},t={render:()=>e.jsx(n,{}),play:async({canvasElement:a})=>{const s=v(a);await j.click(s.getByRole("button",{name:"Delete Item"})),await f(C.getByText("Are you sure?")).toBeVisible()}},r={render:()=>e.jsx(n,{title:"Save changes",description:"Do you want to save your changes?"})},o={render:()=>e.jsx(n,{})};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  render: () => <AlertDialogDemo />,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", {
      name: "Delete Item"
    }));
    await expect(screen.getByText("Are you sure?")).toBeVisible();
  }
}`,...t.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  render: () => <AlertDialogDemo title="Save changes" description="Do you want to save your changes?" />
}`,...r.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: () => <AlertDialogDemo />
}`,...o.parameters?.docs?.source}}};const L=["Destructive","Default","CloseOnCancel"];export{o as CloseOnCancel,r as Default,t as Destructive,L as __namedExportsOrder,K as default};
