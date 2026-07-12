import{i as e}from"./preload-helper-B45gAKPr.js";import{t}from"./jsx-runtime-BBQGix-2.js";import{n,t as r}from"./label-B7np1VYM.js";import{n as i,t as a}from"./switch-ARGuY-e-.js";var o,s,c,l,u,d,f,p,m,h,g;e((()=>{i(),n(),o=t(),{userEvent:s,within:c,expect:l}=__STORYBOOK_MODULE_TEST__,u={title:`UI/Switch`,component:a,tags:[`autodocs`]},d={play:async({canvasElement:e})=>{await l(c(e).getByRole(`switch`)).not.toBeChecked()}},f={args:{defaultChecked:!0},play:async({canvasElement:e})=>{await l(c(e).getByRole(`switch`)).toBeChecked()}},p={play:async({canvasElement:e})=>{let t=c(e).getByRole(`switch`);await l(t).not.toBeChecked(),await s.click(t),await l(t).toBeChecked()}},m={args:{disabled:!0},play:async({canvasElement:e})=>{await l(c(e).getByRole(`switch`)).toBeDisabled()}},h={render:({...e})=>(0,o.jsxs)(`div`,{className:`flex items-center gap-3`,children:[(0,o.jsx)(a,{id:`airplane-mode`,...e}),(0,o.jsx)(r,{htmlFor:`airplane-mode`,children:`Airplane Mode`})]})},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const sw = canvas.getByRole('switch');
    await expect(sw).not.toBeChecked();
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    defaultChecked: true
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('switch')).toBeChecked();
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const sw = canvas.getByRole('switch');
    await expect(sw).not.toBeChecked();
    await userEvent.click(sw);
    await expect(sw).toBeChecked();
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('switch')).toBeDisabled();
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: ({
    ...args
  }) => <div className="flex items-center gap-3">\r
      <Switch id="airplane-mode" {...args} />\r
      <Label htmlFor="airplane-mode">Airplane Mode</Label>\r
    </div>
}`,...h.parameters?.docs?.source}}},g=[`Unchecked`,`Checked`,`Toggle`,`Disabled`,`WithLabel`]}))();export{f as Checked,m as Disabled,p as Toggle,d as Unchecked,h as WithLabel,g as __namedExportsOrder,u as default};