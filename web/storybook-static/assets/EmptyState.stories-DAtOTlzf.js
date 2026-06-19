import{j as r}from"./jsx-runtime-D_zvdyIk.js";import{E as s}from"./EmptyState-D6H92AVS.js";import{R as c}from"./rocket-CDwC8TfS.js";import"./GradientButton-CH27CBnR.js";import"./index-B8k91cqS.js";import"./clsx-B-dksMZM.js";import"./Card-p5k8IdW-.js";import"./iframe-DP-2tj83.js";import"./preload-helper-Ct5FWWRu.js";import"./proxy-P4gg3xAH.js";import"./plus-M3bQo8hz.js";import"./createLucideIcon-AY_gplK-.js";const{fn:i,userEvent:m,within:p,expect:l}=__STORYBOOK_MODULE_TEST__,A={title:"Shared/EmptyState",component:s,tags:["autodocs"],args:{icon:r.jsx(c,{size:24,className:"text-brand"}),title:"Nothing here",description:"There are no items to display."}},t={},e={args:{buttonLabel:"Create",onAction:i()},play:async({canvasElement:a,args:n})=>{const o=p(a).getByRole("button",{name:"Create"});await m.click(o),await l(n.onAction).toHaveBeenCalledTimes(1)}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  args: {
    buttonLabel: "Create",
    onAction: fn()
  },
  play: async ({
    canvasElement,
    args
  }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", {
      name: "Create"
    });
    await userEvent.click(button);
    await expect(args.onAction).toHaveBeenCalledTimes(1);
  }
}`,...e.parameters?.docs?.source}}};const C=["Default","WithAction"];export{t as Default,e as WithAction,C as __namedExportsOrder,A as default};
