import{i as e}from"./preload-helper-B45gAKPr.js";import{t}from"./jsx-runtime-BBQGix-2.js";import{a as n,r}from"./tooltip-BZCLYzA8.js";import{n as i,t as a}from"./TruncatedCopyTooltip-BhIpIBvM.js";var o,s,c,l,u,d,f,p,m,h;e((()=>{i(),n(),o=t(),{userEvent:s,within:c,expect:l}=__STORYBOOK_MODULE_TEST__,u={title:`Shared/TruncatedCopyTooltip`,component:a,tags:[`autodocs`],decorators:[e=>(0,o.jsx)(r,{children:(0,o.jsx)(e,{})})]},d={args:{value:`my-flag-name`}},f={args:{value:`very-long-feature-flag-name-that-should-be-truncated-in-the-ui-12345`}},p={args:{value:`550e8400-e29b-41d4-a716-446655440000`,className:`font-mono text-sm`}},m={args:{value:`production-api-key-2024`},play:async({canvasElement:e})=>{let t=c(e),n=t.getByText(`production-api-key-2024`);await s.hover(n),await l(t.getByText(`production-api-key-2024`)).toBeInTheDocument()}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    value: 'my-flag-name'
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    value: 'very-long-feature-flag-name-that-should-be-truncated-in-the-ui-12345'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    value: '550e8400-e29b-41d4-a716-446655440000',
    className: 'font-mono text-sm'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    value: 'production-api-key-2024'
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByText('production-api-key-2024');
    await userEvent.hover(trigger);
    await expect(canvas.getByText('production-api-key-2024')).toBeInTheDocument();
  }
}`,...m.parameters?.docs?.source}}},h=[`Short`,`Long`,`UUID`,`HoverAndCopy`]}))();export{m as HoverAndCopy,f as Long,d as Short,p as UUID,h as __namedExportsOrder,u as default};