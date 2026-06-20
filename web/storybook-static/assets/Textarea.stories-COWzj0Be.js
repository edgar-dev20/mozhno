import{T as p}from"./textarea-CQrmJJCd.js";import"./jsx-runtime-D_zvdyIk.js";import"./utils-CNg2SYlS.js";import"./clsx-B-dksMZM.js";const{userEvent:m,within:c,expect:i}=__STORYBOOK_MODULE_TEST__,g={title:"UI/Textarea",component:p,tags:["autodocs"]},a={args:{placeholder:"Write something..."}},n={args:{defaultValue:`This is a longer piece of text that spans multiple lines.
It demonstrates the textarea component.`},play:async({canvasElement:e})=>{const t=c(e);await i(t.getByRole("textbox")).toHaveValue(`This is a longer piece of text that spans multiple lines.
It demonstrates the textarea component.`)}},s={args:{placeholder:"Type multiline text..."},play:async({canvasElement:e})=>{const l=c(e).getByPlaceholderText("Type multiline text...");await m.type(l,"Line 1{enter}Line 2{enter}Line 3"),await i(l).toHaveValue(`Line 1
Line 2
Line 3`)}},r={args:{disabled:!0,defaultValue:"Cannot edit this content"},play:async({canvasElement:e})=>{const t=c(e);await i(t.getByRole("textbox")).toBeDisabled()}},o={args:{rows:8,placeholder:"Tall textarea..."}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    placeholder: "Write something..."
  }
}`,...a.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    defaultValue: "This is a longer piece of text that spans multiple lines.\\nIt demonstrates the textarea component."
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("textbox")).toHaveValue("This is a longer piece of text that spans multiple lines.\\nIt demonstrates the textarea component.");
  }
}`,...n.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    placeholder: "Type multiline text..."
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const ta = canvas.getByPlaceholderText("Type multiline text...");
    await userEvent.type(ta, "Line 1{enter}Line 2{enter}Line 3");
    await expect(ta).toHaveValue("Line 1\\nLine 2\\nLine 3");
  }
}`,...s.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true,
    defaultValue: "Cannot edit this content"
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("textbox")).toBeDisabled();
  }
}`,...r.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    rows: 8,
    placeholder: "Tall textarea..."
  }
}`,...o.parameters?.docs?.source}}};const y=["Default","WithValue","Typing","Disabled","WithRows"];export{a as Default,r as Disabled,s as Typing,o as WithRows,n as WithValue,y as __namedExportsOrder,g as default};
