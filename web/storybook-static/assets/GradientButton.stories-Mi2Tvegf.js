import{G as y}from"./GradientButton-CH27CBnR.js";import"./jsx-runtime-D_zvdyIk.js";import"./index-B8k91cqS.js";import"./clsx-B-dksMZM.js";const{fn:h,userEvent:v,within:g,expect:p}=__STORYBOOK_MODULE_TEST__,D={title:"Shared/GradientButton",component:y,tags:["autodocs"],args:{children:"Button",onClick:h()}},r={args:{variant:"primary",children:"Primary"},play:async({canvasElement:a,args:n})=>{const e=g(a);await v.click(e.getByRole("button")),await p(n.onClick).toHaveBeenCalled()}},s={args:{variant:"default",children:"Default"}},t={args:{variant:"danger",children:"Delete"},play:async({canvasElement:a,args:n})=>{const e=g(a);await v.click(e.getByRole("button")),await p(n.onClick).toHaveBeenCalled()}},c={args:{variant:"secondary",children:"Secondary"}},o={args:{variant:"outline",children:"Outline"}},i={args:{variant:"ghost",children:"Ghost"}},l={args:{loading:!0,children:"Saving..."},play:async({canvasElement:a})=>{const e=g(a).getByRole("button");await p(e).toBeDisabled()}},d={args:{size:"sm",children:"Small"}},m={args:{size:"lg",children:"Large"}},u={args:{disabled:!0,children:"Disabled"},play:async({canvasElement:a})=>{const e=g(a).getByRole("button");await p(e).toBeDisabled()}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "primary",
    children: "Primary"
  },
  play: async ({
    canvasElement,
    args
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button"));
    await expect(args.onClick).toHaveBeenCalled();
  }
}`,...r.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "default",
    children: "Default"
  }
}`,...s.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "danger",
    children: "Delete"
  },
  play: async ({
    canvasElement,
    args
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button"));
    await expect(args.onClick).toHaveBeenCalled();
  }
}`,...t.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "secondary",
    children: "Secondary"
  }
}`,...c.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "outline",
    children: "Outline"
  }
}`,...o.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "ghost",
    children: "Ghost"
  }
}`,...i.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    loading: true,
    children: "Saving..."
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button");
    await expect(button).toBeDisabled();
  }
}`,...l.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    size: "sm",
    children: "Small"
  }
}`,...d.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    size: "lg",
    children: "Large"
  }
}`,...m.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true,
    children: "Disabled"
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button");
    await expect(button).toBeDisabled();
  }
}`,...u.parameters?.docs?.source}}};const E=["Primary","Default","Danger","Secondary","Outline","Ghost","Loading","Small","Large","Disabled"];export{t as Danger,s as Default,u as Disabled,i as Ghost,m as Large,l as Loading,o as Outline,r as Primary,c as Secondary,d as Small,E as __namedExportsOrder,D as default};
