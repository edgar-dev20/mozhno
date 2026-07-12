import{i as e}from"./preload-helper-B45gAKPr.js";import{t}from"./jsx-runtime-BBQGix-2.js";import{n,r}from"./dist-Duc_6rAq.js";import{n as i,t as a}from"./sonner-CUtN3z0F.js";function o(){return(0,s.jsxs)(`div`,{className:`flex flex-wrap gap-3`,children:[(0,s.jsx)(`button`,{className:`px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium`,onClick:()=>r(`Default notification`),children:`Default`}),(0,s.jsx)(`button`,{className:`px-4 py-2 rounded-lg bg-success text-success-foreground text-sm font-medium`,onClick:()=>r.success(`Operation completed`),children:`Success`}),(0,s.jsx)(`button`,{className:`px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium`,onClick:()=>r.error(`Something went wrong`),children:`Error`}),(0,s.jsx)(`button`,{className:`px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium`,onClick:()=>r(`Event has been created`,{description:`Monday, January 3rd at 6:00 PM`,action:{label:`Undo`,onClick:()=>{}}}),children:`With Action`})]})}var s,c,l,u,d,f,p;e((()=>{n(),i(),s=t(),{userEvent:c,within:l,expect:u}=__STORYBOOK_MODULE_TEST__,d={title:`UI/Toast`,tags:[`autodocs`],decorators:[e=>(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(e,{}),(0,s.jsx)(a,{})]})]},f={render:()=>(0,s.jsx)(o,{}),play:async({canvasElement:e})=>{let t=l(e);await c.click(t.getByRole(`button`,{name:`Default`})),await u(t.getByText(`Default notification`)).toBeInTheDocument()}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: () => <ToastDemo />,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', {
      name: 'Default'
    }));
    await expect(canvas.getByText('Default notification')).toBeInTheDocument();
  }
}`,...f.parameters?.docs?.source}}},p=[`AllToasts`]}))();export{f as AllToasts,p as __namedExportsOrder,d as default};