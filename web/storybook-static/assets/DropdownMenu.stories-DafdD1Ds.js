import{i as e}from"./preload-helper-B45gAKPr.js";import{t}from"./jsx-runtime-BBQGix-2.js";import{Vt as n,_t as r,d as i,tt as a}from"./lucide-react-Dw50eDdj.js";import{t as o}from"./icons-BLhiJp-6.js";import{c as s,i as c,l,n as u,r as d,s as f,t as p}from"./dropdown-menu-CAOofAg6.js";function m(){return(0,h.jsxs)(p,{children:[(0,h.jsx)(s,{className:`inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium`,children:`Open Menu`}),(0,h.jsxs)(u,{className:`w-56`,children:[(0,h.jsx)(c,{children:`My Account`}),(0,h.jsx)(f,{}),(0,h.jsxs)(d,{children:[(0,h.jsx)(i,{size:14}),` Profile`]}),(0,h.jsxs)(d,{children:[(0,h.jsx)(a,{size:14}),` Settings`]}),(0,h.jsxs)(d,{children:[(0,h.jsx)(r,{size:14}),` New Project`]}),(0,h.jsx)(f,{}),(0,h.jsxs)(d,{className:`text-destructive`,children:[(0,h.jsx)(n,{size:14}),` Logout`]})]})]})}var h,g,_,v,y,b,x,S,C;e((()=>{l(),o(),h=t(),{userEvent:g,within:_,expect:v,screen:y}=__STORYBOOK_MODULE_TEST__,b={title:`UI/DropdownMenu`,component:p,tags:[`autodocs`]},x={render:()=>(0,h.jsx)(m,{}),play:async({canvasElement:e})=>{let t=_(e);await g.click(t.getByRole(`button`,{name:`Open Menu`})),await v(y.getByText(`My Account`)).toBeVisible()}},S={render:()=>(0,h.jsx)(m,{})},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => <DropdownDemo />,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', {
      name: 'Open Menu'
    }));
    await expect(screen.getByText('My Account')).toBeVisible();
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: () => <DropdownDemo />
}`,...S.parameters?.docs?.source}}},C=[`Default`,`KeyboardNavigation`]}))();export{x as Default,S as KeyboardNavigation,C as __namedExportsOrder,b as default};