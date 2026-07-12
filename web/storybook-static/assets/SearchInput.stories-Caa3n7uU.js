import{i as e}from"./preload-helper-B45gAKPr.js";import{n as t,t as n}from"./SearchInput-ChALQoUu.js";var r,i,a,o,s,c,l,u,d;e((()=>{t(),{fn:r,userEvent:i,within:a,expect:o}=__STORYBOOK_MODULE_TEST__,s={title:`Shared/SearchInput`,component:n,tags:[`autodocs`],args:{value:``,placeholder:`Search...`,onChange:r()}},c={play:async({canvasElement:e})=>{await o(a(e).getByPlaceholderText(`Search...`)).toHaveValue(``)}},l={args:{value:`test query`},play:async({canvasElement:e})=>{await o(a(e).getByPlaceholderText(`Search...`)).toHaveValue(`test query`)}},u={args:{value:``},play:async({canvasElement:e,args:t})=>{let n=a(e).getByPlaceholderText(`Search...`);await i.type(n,`hello`),await o(t.onChange).toHaveBeenCalled()}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText('Search...');
    await expect(input).toHaveValue('');
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    value: 'test query'
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText('Search...');
    await expect(input).toHaveValue('test query');
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    value: ''
  },
  play: async ({
    canvasElement,
    args
  }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText('Search...');
    await userEvent.type(input, 'hello');
    await expect(args.onChange).toHaveBeenCalled();
  }
}`,...u.parameters?.docs?.source}}},d=[`Empty`,`WithValue`,`Typing`]}))();export{c as Empty,u as Typing,l as WithValue,d as __namedExportsOrder,s as default};