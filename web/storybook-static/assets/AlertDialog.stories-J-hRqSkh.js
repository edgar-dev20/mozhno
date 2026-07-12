import{c as e,i as t}from"./preload-helper-B45gAKPr.js";import{V as n}from"./iframe-CdpC400m.js";import{t as r}from"./jsx-runtime-BBQGix-2.js";import{a as i,c as a,i as o,l as s,n as c,o as l,r as u,s as d,t as f,u as p}from"./alert-dialog-DoeJNRE4.js";function m({title:e=`Are you sure?`,description:t=`This action cannot be undone.`}){let[n,r]=(0,h.useState)(!1);return(0,g.jsxs)(f,{open:n,onOpenChange:r,children:[(0,g.jsx)(s,{children:`Delete Item`}),(0,g.jsxs)(o,{children:[(0,g.jsxs)(d,{children:[(0,g.jsx)(a,{children:e}),(0,g.jsx)(i,{children:t})]}),(0,g.jsxs)(l,{children:[(0,g.jsx)(u,{children:`Cancel`}),(0,g.jsx)(c,{onClick:_(),children:`Continue`})]})]})]})}var h,g,_,v,y,b,x,S,C,w,T,E;t((()=>{h=e(n(),1),p(),g=r(),{fn:_,userEvent:v,within:y,expect:b,screen:x}=__STORYBOOK_MODULE_TEST__,S={title:`UI/AlertDialog`,component:f,tags:[`autodocs`]},C={render:()=>(0,g.jsx)(m,{}),play:async({canvasElement:e})=>{let t=y(e);await v.click(t.getByRole(`button`,{name:`Delete Item`})),await b(x.getByText(`Are you sure?`)).toBeVisible()}},w={render:()=>(0,g.jsx)(m,{title:`Save changes`,description:`Do you want to save your changes?`})},T={render:()=>(0,g.jsx)(m,{})},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: () => <AlertDialogDemo />,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', {
      name: 'Delete Item'
    }));
    await expect(screen.getByText('Are you sure?')).toBeVisible();
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  render: () => <AlertDialogDemo title="Save changes" description="Do you want to save your changes?" />
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  render: () => <AlertDialogDemo />
}`,...T.parameters?.docs?.source}}},E=[`Destructive`,`Default`,`CloseOnCancel`]}))();export{T as CloseOnCancel,w as Default,C as Destructive,E as __namedExportsOrder,S as default};