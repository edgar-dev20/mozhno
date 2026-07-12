import{i as e}from"./preload-helper-B45gAKPr.js";import{t}from"./jsx-runtime-BBQGix-2.js";import{n,t as r}from"./checkbox-Dtf8b1rN.js";import{n as i,t as a}from"./label-B7np1VYM.js";var o,s,c,l,u,d,f,p,m,h,g;e((()=>{n(),i(),o=t(),{userEvent:s,within:c,expect:l}=__STORYBOOK_MODULE_TEST__,u={title:`UI/Checkbox`,component:r,tags:[`autodocs`]},d={play:async({canvasElement:e})=>{await l(c(e).getByRole(`checkbox`)).not.toBeChecked()}},f={args:{defaultChecked:!0},play:async({canvasElement:e})=>{await l(c(e).getByRole(`checkbox`)).toBeChecked()}},p={play:async({canvasElement:e})=>{let t=c(e).getByRole(`checkbox`);await l(t).not.toBeChecked(),await s.click(t),await l(t).toBeChecked()}},m={args:{disabled:!0},play:async({canvasElement:e})=>{await l(c(e).getByRole(`checkbox`)).toBeDisabled()}},h={render:({...e})=>(0,o.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,o.jsx)(r,{id:`terms`,...e}),(0,o.jsx)(a,{htmlFor:`terms`,children:`Accept terms and conditions`})]})},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('checkbox')).not.toBeChecked();
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    defaultChecked: true
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('checkbox')).toBeChecked();
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const cb = canvas.getByRole('checkbox');
    await expect(cb).not.toBeChecked();
    await userEvent.click(cb);
    await expect(cb).toBeChecked();
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('checkbox')).toBeDisabled();
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: ({
    ...args
  }) => <div className="flex items-center gap-2">\r
      <Checkbox id="terms" {...args} />\r
      <Label htmlFor="terms">Accept terms and conditions</Label>\r
    </div>
}`,...h.parameters?.docs?.source}}},g=[`Unchecked`,`Checked`,`Toggle`,`Disabled`,`WithLabel`]}))();export{f as Checked,m as Disabled,p as Toggle,d as Unchecked,h as WithLabel,g as __namedExportsOrder,u as default};