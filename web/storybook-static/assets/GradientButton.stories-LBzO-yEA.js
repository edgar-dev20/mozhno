import{i as e}from"./preload-helper-B45gAKPr.js";import{n as t,t as n}from"./GradientButton-BKXQUskM.js";var r,i,a,o,s,c,l,u,d,f,p,m,h,g,_,v,y;e((()=>{t(),{fn:r,userEvent:i,within:a,expect:o}=__STORYBOOK_MODULE_TEST__,s={title:`Shared/GradientButton`,component:n,tags:[`autodocs`],args:{children:`Button`,onClick:r()}},c={args:{variant:`primary`,children:`Primary`},play:async({canvasElement:e,args:t})=>{let n=a(e);await i.click(n.getByRole(`button`)),await o(t.onClick).toHaveBeenCalled()}},l={args:{variant:`default`,children:`Default`}},u={args:{variant:`danger`,children:`Delete`},play:async({canvasElement:e,args:t})=>{let n=a(e);await i.click(n.getByRole(`button`)),await o(t.onClick).toHaveBeenCalled()}},d={args:{variant:`warning`,children:`Warning`}},f={args:{variant:`secondary`,children:`Secondary`}},p={args:{variant:`outline`,children:`Outline`}},m={args:{variant:`ghost`,children:`Ghost`}},h={args:{loading:!0,children:`Saving...`},play:async({canvasElement:e})=>{await o(a(e).getByRole(`button`)).toBeDisabled()}},g={args:{size:`sm`,children:`Small`}},_={args:{size:`lg`,children:`Large`}},v={args:{disabled:!0,children:`Disabled`},play:async({canvasElement:e})=>{await o(a(e).getByRole(`button`)).toBeDisabled()}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    variant: 'primary',
    children: 'Primary'
  },
  play: async ({
    canvasElement,
    args
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button'));
    await expect(args.onClick).toHaveBeenCalled();
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    variant: 'default',
    children: 'Default'
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    variant: 'danger',
    children: 'Delete'
  },
  play: async ({
    canvasElement,
    args
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button'));
    await expect(args.onClick).toHaveBeenCalled();
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    variant: 'warning',
    children: 'Warning'
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    variant: 'secondary',
    children: 'Secondary'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    variant: 'outline',
    children: 'Outline'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    variant: 'ghost',
    children: 'Ghost'
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    loading: true,
    children: 'Saving...'
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    await expect(button).toBeDisabled();
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'sm',
    children: 'Small'
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'lg',
    children: 'Large'
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true,
    children: 'Disabled'
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    await expect(button).toBeDisabled();
  }
}`,...v.parameters?.docs?.source}}},y=[`Primary`,`Default`,`Danger`,`Warning`,`Secondary`,`Outline`,`Ghost`,`Loading`,`Small`,`Large`,`Disabled`]}))();export{u as Danger,l as Default,v as Disabled,m as Ghost,_ as Large,h as Loading,p as Outline,c as Primary,f as Secondary,g as Small,d as Warning,y as __namedExportsOrder,s as default};