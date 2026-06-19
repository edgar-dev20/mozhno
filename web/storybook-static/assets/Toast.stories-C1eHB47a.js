import{j as t}from"./jsx-runtime-D_zvdyIk.js";import{t as e}from"./index-D0NYsomR.js";import{T as s}from"./sonner-DFeUH7hR.js";import"./iframe-DP-2tj83.js";import"./preload-helper-Ct5FWWRu.js";import"./index-ZEUw8nZR.js";import"./index-BospHUp7.js";import"./index-KlvYwNWS.js";const{userEvent:r,within:c,expect:i}=__STORYBOOK_MODULE_TEST__;function m(){return t.jsxs("div",{className:"flex flex-wrap gap-3",children:[t.jsx("button",{className:"px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium",onClick:()=>e("Default notification"),children:"Default"}),t.jsx("button",{className:"px-4 py-2 rounded-lg bg-success text-success-foreground text-sm font-medium",onClick:()=>e.success("Operation completed"),children:"Success"}),t.jsx("button",{className:"px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium",onClick:()=>e.error("Something went wrong"),children:"Error"}),t.jsx("button",{className:"px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium",onClick:()=>e("Event has been created",{description:"Monday, January 3rd at 6:00 PM",action:{label:"Undo",onClick:()=>{}}}),children:"With Action"})]})}const T={title:"UI/Toast",tags:["autodocs"],decorators:[o=>t.jsxs(t.Fragment,{children:[t.jsx(o,{}),t.jsx(s,{})]})]},n={render:()=>t.jsx(m,{}),play:async({canvasElement:o})=>{const a=c(o);await r.click(a.getByRole("button",{name:"Default"})),await i(a.getByText("Default notification")).toBeInTheDocument()}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  render: () => <ToastDemo />,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", {
      name: "Default"
    }));
    await expect(canvas.getByText("Default notification")).toBeInTheDocument();
  }
}`,...n.parameters?.docs?.source}}};const h=["AllToasts"];export{n as AllToasts,h as __namedExportsOrder,T as default};
