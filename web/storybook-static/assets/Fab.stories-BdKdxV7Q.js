import{i as e}from"./preload-helper-B45gAKPr.js";import{n as t,t as n}from"./Fab-C7K_rfnA.js";var r,i,a,o,s,c,l,u,d;e((()=>{t(),{fn:r,userEvent:i,within:a,expect:o}=__STORYBOOK_MODULE_TEST__,s={title:`Shared/Fab`,component:n,tags:[`autodocs`],args:{label:`Create flag`,onClick:r()}},c={play:async({canvasElement:e,args:t})=>{let n=a(e).getByRole(`button`,{name:`Create flag`});await o(n).toBeInTheDocument(),await i.click(n),await o(t.onClick).toHaveBeenCalledTimes(1)}},l={args:{label:`Create new feature flag with advanced targeting`}},u={args:{label:`Add environment`,onClick:r()}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement,
    args
  }) => {
    const canvas = within(canvasElement);
    const btn = canvas.getByRole('button', {
      name: 'Create flag'
    });
    await expect(btn).toBeInTheDocument();
    await userEvent.click(btn);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Create new feature flag with advanced targeting'
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Add environment',
    onClick: fn()
  }
}`,...u.parameters?.docs?.source}}},d=[`Default`,`LongLabel`,`WithCustomAction`]}))();export{c as Default,l as LongLabel,u as WithCustomAction,d as __namedExportsOrder,s as default};