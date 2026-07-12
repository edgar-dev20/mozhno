import{i as e}from"./preload-helper-B45gAKPr.js";import{t}from"./jsx-runtime-BBQGix-2.js";import{n,t as r}from"./label-B7np1VYM.js";import{n as i,t as a}from"./input-AmHFZmeF.js";var o,s,c,l,u,d,f,p,m,h,g,_,v;e((()=>{i(),n(),o=t(),{userEvent:s,within:c,expect:l}=__STORYBOOK_MODULE_TEST__,u={title:`UI/Input`,component:a,tags:[`autodocs`]},d={args:{placeholder:`Enter text...`},play:async({canvasElement:e})=>{await l(c(e).getByPlaceholderText(`Enter text...`)).toBeInTheDocument()}},f={args:{defaultValue:`Hello world`,placeholder:`Enter text...`},play:async({canvasElement:e})=>{await l(c(e).getByDisplayValue(`Hello world`)).toBeInTheDocument()}},p={args:{placeholder:`Type here...`},play:async({canvasElement:e})=>{let t=c(e).getByPlaceholderText(`Type here...`);await s.type(t,`test`),await l(t).toHaveValue(`test`)}},m={args:{disabled:!0,placeholder:`Disabled input`},play:async({canvasElement:e})=>{await l(c(e).getByPlaceholderText(`Disabled input`)).toBeDisabled()}},h={args:{type:`password`,defaultValue:`secret`,placeholder:`Password`}},g={render:()=>(0,o.jsxs)(`div`,{className:`grid gap-1.5 max-w-sm`,children:[(0,o.jsx)(r,{htmlFor:`email`,children:`Email`}),(0,o.jsx)(a,{id:`email`,placeholder:`user@example.com`,type:`email`})]})},_={render:()=>(0,o.jsxs)(`div`,{className:`grid gap-1.5 max-w-sm`,children:[(0,o.jsx)(r,{htmlFor:`error-input`,children:`Username`}),(0,o.jsx)(a,{id:`error-input`,placeholder:`Enter username`,"aria-invalid":!0}),(0,o.jsx)(`span`,{className:`text-xs text-destructive`,children:`Username is already taken`})]})},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    placeholder: 'Enter text...'
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByPlaceholderText('Enter text...')).toBeInTheDocument();
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    defaultValue: 'Hello world',
    placeholder: 'Enter text...'
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByDisplayValue('Hello world')).toBeInTheDocument();
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    placeholder: 'Type here...'
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText('Type here...');
    await userEvent.type(input, 'test');
    await expect(input).toHaveValue('test');
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true,
    placeholder: 'Disabled input'
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByPlaceholderText('Disabled input')).toBeDisabled();
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    type: 'password',
    defaultValue: 'secret',
    placeholder: 'Password'
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => <div className="grid gap-1.5 max-w-sm">\r
      <Label htmlFor="email">Email</Label>\r
      <Input id="email" placeholder="user@example.com" type="email" />\r
    </div>
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: () => <div className="grid gap-1.5 max-w-sm">\r
      <Label htmlFor="error-input">Username</Label>\r
      <Input id="error-input" placeholder="Enter username" aria-invalid />\r
      <span className="text-xs text-destructive">Username is already taken</span>\r
    </div>
}`,..._.parameters?.docs?.source}}},v=[`Default`,`WithValue`,`Typing`,`Disabled`,`TypePassword`,`WithLabel`,`WithError`]}))();export{d as Default,m as Disabled,h as TypePassword,p as Typing,_ as WithError,g as WithLabel,f as WithValue,v as __namedExportsOrder,u as default};