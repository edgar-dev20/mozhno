import{i as e}from"./preload-helper-B45gAKPr.js";import{n as t,t as n}from"./textarea-D3k8Qfep.js";var r,i,a,o,s,c,l,u,d,f;e((()=>{t(),{userEvent:r,within:i,expect:a}=__STORYBOOK_MODULE_TEST__,o={title:`UI/Textarea`,component:n,tags:[`autodocs`]},s={args:{placeholder:`Write something...`}},c={args:{defaultValue:`This is a longer piece of text that spans multiple lines.
It demonstrates the textarea component.`},play:async({canvasElement:e})=>{await a(i(e).getByRole(`textbox`)).toHaveValue(`This is a longer piece of text that spans multiple lines.
It demonstrates the textarea component.`)}},l={args:{placeholder:`Type multiline text...`},play:async({canvasElement:e})=>{let t=i(e).getByPlaceholderText(`Type multiline text...`);await r.type(t,`Line 1{enter}Line 2{enter}Line 3`),await a(t).toHaveValue(`Line 1
Line 2
Line 3`)}},u={args:{disabled:!0,defaultValue:`Cannot edit this content`},play:async({canvasElement:e})=>{await a(i(e).getByRole(`textbox`)).toBeDisabled()}},d={args:{rows:8,placeholder:`Tall textarea...`}},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    placeholder: 'Write something...'
  }
}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    defaultValue: 'This is a longer piece of text that spans multiple lines.\\nIt demonstrates the textarea component.'
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('textbox')).toHaveValue('This is a longer piece of text that spans multiple lines.\\nIt demonstrates the textarea component.');
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    placeholder: 'Type multiline text...'
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const ta = canvas.getByPlaceholderText('Type multiline text...');
    await userEvent.type(ta, 'Line 1{enter}Line 2{enter}Line 3');
    await expect(ta).toHaveValue('Line 1\\nLine 2\\nLine 3');
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true,
    defaultValue: 'Cannot edit this content'
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('textbox')).toBeDisabled();
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    rows: 8,
    placeholder: 'Tall textarea...'
  }
}`,...d.parameters?.docs?.source}}},f=[`Default`,`WithValue`,`Typing`,`Disabled`,`WithRows`]}))();export{s as Default,u as Disabled,l as Typing,d as WithRows,c as WithValue,f as __namedExportsOrder,o as default};