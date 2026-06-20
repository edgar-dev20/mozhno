import{S as p}from"./SearchInput-DBiqj737.js";import"./jsx-runtime-D_zvdyIk.js";import"./index-BoGZsUNS.js";import"./iframe-DP-2tj83.js";import"./preload-helper-Ct5FWWRu.js";import"./search-CbAQyNKi.js";import"./createLucideIcon-AY_gplK-.js";const{fn:i,userEvent:u,within:r,expect:o}=__STORYBOOK_MODULE_TEST__,E={title:"Shared/SearchInput",component:p,tags:["autodocs"],args:{value:"",placeholder:"Search...",onChange:i()}},n={play:async({canvasElement:a})=>{const e=r(a).getByPlaceholderText("Search...");await o(e).toHaveValue("")}},t={args:{value:"test query"},play:async({canvasElement:a})=>{const e=r(a).getByPlaceholderText("Search...");await o(e).toHaveValue("test query")}},s={args:{value:""},play:async({canvasElement:a,args:c})=>{const l=r(a).getByPlaceholderText("Search...");await u.type(l,"hello"),await o(c.onChange).toHaveBeenCalled()}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText("Search...");
    await expect(input).toHaveValue("");
  }
}`,...n.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    value: "test query"
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText("Search...");
    await expect(input).toHaveValue("test query");
  }
}`,...t.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    value: ""
  },
  play: async ({
    canvasElement,
    args
  }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText("Search...");
    await userEvent.type(input, "hello");
    await expect(args.onChange).toHaveBeenCalled();
  }
}`,...s.parameters?.docs?.source}}};const w=["Empty","WithValue","Typing"];export{n as Empty,s as Typing,t as WithValue,w as __namedExportsOrder,E as default};
