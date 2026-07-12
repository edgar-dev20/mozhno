import{c as e,i as t}from"./preload-helper-B45gAKPr.js";import{V as n}from"./iframe-CdpC400m.js";import{t as r}from"./jsx-runtime-BBQGix-2.js";import{i,n as a,r as o,t as s}from"./dist-B2kUg2Vn.js";import{r as c,t as l}from"./dist-DD-prG3u.js";import{n as u,t as d}from"./utils-4UQB1yx_.js";import{n as f,t as p}from"./dist-6F8Le1-Y.js";var m,h,g,_,v,y=t((()=>{m=e(n(),1),i(),s(),c(),h=r(),g=`Toggle`,_=m.forwardRef((e,t)=>{let{pressed:n,defaultPressed:r,onPressedChange:i,...s}=e,[c,u]=a({prop:n,onChange:i,defaultProp:r??!1,caller:g});return(0,h.jsx)(l.button,{type:`button`,"aria-pressed":c,"data-state":c?`on`:`off`,"data-disabled":e.disabled?``:void 0,...s,ref:t,onClick:o(e.onClick,()=>{e.disabled||u(!c)})})}),_.displayName=g,v=_})),b,x=t((()=>{f(),b=p(`inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium hover:bg-muted hover:text-muted-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none transition-[color,box-shadow] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive whitespace-nowrap`,{variants:{variant:{default:`bg-transparent`,outline:`border border-input bg-transparent hover:bg-accent hover:text-accent-foreground`},size:{default:`h-9 px-2 min-w-9`,sm:`h-8 px-1.5 min-w-8`,lg:`h-10 px-2.5 min-w-10`}},defaultVariants:{variant:`default`,size:`default`}})}));function S({className:e,variant:t,size:n,...r}){return(0,C.jsx)(v,{"data-slot":`toggle`,className:d(b({variant:t,size:n,className:e})),...r})}var C,w=t((()=>{n(),y(),u(),x(),C=r(),S.__docgenInfo={description:``,methods:[],displayName:`Toggle`}})),T,E,D,O,k,A,j,M,N,P;t((()=>{w(),{userEvent:T,within:E,expect:D}=__STORYBOOK_MODULE_TEST__,O={title:`UI/Toggle`,component:S,tags:[`autodocs`]},k={play:async({canvasElement:e})=>{await D(E(e).getByRole(`button`)).toHaveAttribute(`data-state`,`off`)}},A={args:{defaultPressed:!0},play:async({canvasElement:e})=>{await D(E(e).getByRole(`button`)).toHaveAttribute(`data-state`,`on`)}},j={play:async({canvasElement:e})=>{let t=E(e).getByRole(`button`);await D(t).toHaveAttribute(`data-state`,`off`),await T.click(t),await D(t).toHaveAttribute(`data-state`,`on`),await T.click(t),await D(t).toHaveAttribute(`data-state`,`off`)}},M={args:{disabled:!0},play:async({canvasElement:e})=>{await D(E(e).getByRole(`button`)).toBeDisabled()}},N={args:{variant:`outline`}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button')).toHaveAttribute('data-state', 'off');
  }
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    defaultPressed: true
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button')).toHaveAttribute('data-state', 'on');
  }
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const btn = canvas.getByRole('button');
    await expect(btn).toHaveAttribute('data-state', 'off');
    await userEvent.click(btn);
    await expect(btn).toHaveAttribute('data-state', 'on');
    await userEvent.click(btn);
    await expect(btn).toHaveAttribute('data-state', 'off');
  }
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button')).toBeDisabled();
  }
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  args: {
    variant: 'outline'
  }
}`,...N.parameters?.docs?.source}}},P=[`Off`,`On`,`Press`,`Disabled`,`Outline`]}))();export{M as Disabled,k as Off,A as On,N as Outline,j as Press,P as __namedExportsOrder,O as default};