import{j as s}from"./jsx-runtime-D_zvdyIk.js";import{T as p}from"./TruncatedCopyTooltip-C6ZYFc_M.js";import{a as i}from"./tooltip-BkUNj6rz.js";import"./iframe-DP-2tj83.js";import"./preload-helper-Ct5FWWRu.js";import"./check-w802uh_q.js";import"./createLucideIcon-AY_gplK-.js";import"./copy-I_eZ0fxo.js";import"./index-Blarl-ku.js";import"./index-DlGP-Ght.js";import"./index-CG7t-1OX.js";import"./index-ZEUw8nZR.js";import"./index-BospHUp7.js";import"./index-DFfz4Q0N.js";import"./index-BPFNws8-.js";import"./index-DLmYvlQ2.js";import"./index-CAMMQXT4.js";import"./index-BGuRCeEQ.js";import"./utils-CNg2SYlS.js";import"./clsx-B-dksMZM.js";const{userEvent:m,within:u,expect:d}=__STORYBOOK_MODULE_TEST__,I={title:"Shared/TruncatedCopyTooltip",component:p,tags:["autodocs"],decorators:[o=>s.jsx(i,{children:s.jsx(o,{})})]},e={args:{value:"my-flag-name"}},r={args:{value:"very-long-feature-flag-name-that-should-be-truncated-in-the-ui-12345"}},t={args:{value:"550e8400-e29b-41d4-a716-446655440000",className:"font-mono text-sm"}},a={args:{value:"production-api-key-2024"},play:async({canvasElement:o})=>{const n=u(o),c=n.getByText("production-api-key-2024");await m.hover(c),await d(n.getByText("production-api-key-2024")).toBeInTheDocument()}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  args: {
    value: "my-flag-name"
  }
}`,...e.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    value: "very-long-feature-flag-name-that-should-be-truncated-in-the-ui-12345"
  }
}`,...r.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    value: "550e8400-e29b-41d4-a716-446655440000",
    className: "font-mono text-sm"
  }
}`,...t.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    value: "production-api-key-2024"
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByText("production-api-key-2024");
    await userEvent.hover(trigger);
    await expect(canvas.getByText("production-api-key-2024")).toBeInTheDocument();
  }
}`,...a.parameters?.docs?.source}}};const L=["Short","Long","UUID","HoverAndCopy"];export{a as HoverAndCopy,r as Long,e as Short,t as UUID,L as __namedExportsOrder,I as default};
