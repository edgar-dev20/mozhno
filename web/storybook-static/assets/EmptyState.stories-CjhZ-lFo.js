import{i as e}from"./preload-helper-B45gAKPr.js";import{t}from"./jsx-runtime-BBQGix-2.js";import{ht as n}from"./lucide-react-Dw50eDdj.js";import{t as r}from"./icons-BLhiJp-6.js";import{n as i,t as a}from"./EmptyState-B_jXZKBE.js";var o,s,c,l,u,d,f,p,m;e((()=>{i(),r(),o=t(),{fn:s,userEvent:c,within:l,expect:u}=__STORYBOOK_MODULE_TEST__,d={title:`Shared/EmptyState`,component:a,tags:[`autodocs`],args:{icon:(0,o.jsx)(n,{size:24,className:`text-brand`}),title:`Nothing here`,description:`There are no items to display.`}},f={},p={args:{buttonLabel:`Create`,onAction:s()},play:async({canvasElement:e,args:t})=>{let n=l(e).getByRole(`button`,{name:`Create`});await c.click(n),await u(t.onAction).toHaveBeenCalledTimes(1)}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    buttonLabel: 'Create',
    onAction: fn()
  },
  play: async ({
    canvasElement,
    args
  }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', {
      name: 'Create'
    });
    await userEvent.click(button);
    await expect(args.onAction).toHaveBeenCalledTimes(1);
  }
}`,...p.parameters?.docs?.source}}},m=[`Default`,`WithAction`]}))();export{f as Default,p as WithAction,m as __namedExportsOrder,d as default};