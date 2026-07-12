import{c as e,i as t}from"./preload-helper-B45gAKPr.js";import{V as n}from"./iframe-CdpC400m.js";import{t as r}from"./jsx-runtime-BBQGix-2.js";import{r as i,t as a}from"./dist-DD-prG3u.js";import{n as o,t as s}from"./utils-4UQB1yx_.js";function c(e){return p.includes(e)}var l,u,d,f,p,m,h,g=t((()=>{l=e(n(),1),i(),u=r(),d=`Separator`,f=`horizontal`,p=[`horizontal`,`vertical`],m=l.forwardRef((e,t)=>{let{decorative:n,orientation:r=f,...i}=e,o=c(r)?r:f,s=n?{role:`none`}:{"aria-orientation":o===`vertical`?o:void 0,role:`separator`};return(0,u.jsx)(a.div,{"data-orientation":o,...s,...i,ref:t})}),m.displayName=d,h=m}));function _({className:e,orientation:t=`horizontal`,decorative:n=!0,...r}){return(0,v.jsx)(h,{"data-slot":`separator-root`,decorative:n,orientation:t,className:s(`bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px`,e),...r})}var v,y=t((()=>{n(),g(),o(),v=r(),_.__docgenInfo={description:``,methods:[],displayName:`Separator`,props:{orientation:{defaultValue:{value:`'horizontal'`,computed:!1},required:!1},decorative:{defaultValue:{value:`true`,computed:!1},required:!1}}}})),b,x,S,C,w,T;t((()=>{y(),b=r(),x={title:`UI/Separator`,component:_,tags:[`autodocs`]},S={render:()=>(0,b.jsxs)(`div`,{className:`space-y-4 max-w-sm`,children:[(0,b.jsx)(`div`,{className:`text-sm`,children:`Above the separator`}),(0,b.jsx)(_,{}),(0,b.jsx)(`div`,{className:`text-sm`,children:`Below the separator`})]})},C={render:()=>(0,b.jsxs)(`div`,{className:`flex h-10 items-center gap-4`,children:[(0,b.jsx)(`div`,{className:`text-sm`,children:`Left`}),(0,b.jsx)(_,{orientation:`vertical`}),(0,b.jsx)(`div`,{className:`text-sm`,children:`Right`})]})},w={render:()=>(0,b.jsxs)(`div`,{className:`space-y-4 max-w-sm`,children:[(0,b.jsx)(`div`,{className:`text-sm`,children:`Section 1`}),(0,b.jsx)(_,{className:`my-4`}),(0,b.jsx)(`div`,{className:`text-sm`,children:`Section 2`}),(0,b.jsx)(_,{className:`my-4`}),(0,b.jsx)(`div`,{className:`text-sm`,children:`Section 3`})]})},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: () => <div className="space-y-4 max-w-sm">\r
      <div className="text-sm">Above the separator</div>\r
      <Separator />\r
      <div className="text-sm">Below the separator</div>\r
    </div>
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex h-10 items-center gap-4">\r
      <div className="text-sm">Left</div>\r
      <Separator orientation="vertical" />\r
      <div className="text-sm">Right</div>\r
    </div>
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  render: () => <div className="space-y-4 max-w-sm">\r
      <div className="text-sm">Section 1</div>\r
      <Separator className="my-4" />\r
      <div className="text-sm">Section 2</div>\r
      <Separator className="my-4" />\r
      <div className="text-sm">Section 3</div>\r
    </div>
}`,...w.parameters?.docs?.source}}},T=[`Horizontal`,`Vertical`,`WithMargin`]}))();export{S as Horizontal,C as Vertical,w as WithMargin,T as __namedExportsOrder,x as default};