import{i as e}from"./preload-helper-B45gAKPr.js";import{V as t}from"./iframe-CdpC400m.js";import{t as n}from"./jsx-runtime-BBQGix-2.js";import{T as r,Zt as i,pr as a,rr as o}from"./lucide-react-Dw50eDdj.js";import{t as s}from"./icons-BLhiJp-6.js";import{n as c,t as l}from"./utils-4UQB1yx_.js";import{n as u,t as d}from"./dist-6F8Le1-Y.js";function f({className:e,variant:t,...n}){return(0,h.jsx)(`div`,{"data-slot":`alert`,role:`alert`,className:l(g({variant:t}),e),...n})}function p({className:e,...t}){return(0,h.jsx)(`div`,{"data-slot":`alert-title`,className:l(`col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight`,e),...t})}function m({className:e,...t}){return(0,h.jsx)(`div`,{"data-slot":`alert-description`,className:l(`text-muted-foreground col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed`,e),...t})}var h,g,_=e((()=>{t(),u(),c(),h=n(),g=d(`relative w-full rounded-lg border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current`,{variants:{variant:{default:`bg-card text-card-foreground`,destructive:`text-destructive bg-card [&>svg]:text-current *:data-[slot=alert-description]:text-destructive/90`}},defaultVariants:{variant:`default`}}),f.__docgenInfo={description:``,methods:[],displayName:`Alert`},p.__docgenInfo={description:``,methods:[],displayName:`AlertTitle`},m.__docgenInfo={description:``,methods:[],displayName:`AlertDescription`}})),v,y,b,x,S,C,w,T,E,D;e((()=>{_(),s(),v=n(),{within:y,expect:b}=__STORYBOOK_MODULE_TEST__,x={title:`UI/Alert`,component:f,tags:[`autodocs`]},S={render:()=>(0,v.jsxs)(f,{children:[(0,v.jsx)(i,{size:16}),(0,v.jsx)(p,{children:`Heads up!`}),(0,v.jsx)(m,{children:`You can add components and dependencies to your app.`})]}),play:async({canvasElement:e})=>{await b(y(e).getByRole(`alert`)).toBeInTheDocument()}},C={render:()=>(0,v.jsxs)(f,{variant:`destructive`,children:[(0,v.jsx)(o,{size:16}),(0,v.jsx)(p,{children:`Error`}),(0,v.jsx)(m,{children:`Your session has expired. Please log in again.`})]})},w={render:()=>(0,v.jsxs)(f,{className:`text-success [&>svg]:text-success`,variant:`default`,children:[(0,v.jsx)(a,{size:16}),(0,v.jsx)(p,{children:`Success!`}),(0,v.jsx)(m,{children:`Your changes have been saved successfully.`})]})},T={render:()=>(0,v.jsxs)(f,{className:`text-warning [&>svg]:text-warning`,variant:`default`,children:[(0,v.jsx)(r,{size:16}),(0,v.jsx)(p,{children:`Warning`}),(0,v.jsx)(m,{children:`This action will affect all environments.`})]})},E={render:()=>(0,v.jsxs)(f,{children:[(0,v.jsx)(i,{size:16}),(0,v.jsx)(m,{children:`A simple alert with just a description and no title.`})]})},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: () => <Alert>\r
      <Info size={16} />\r
      <AlertTitle>Heads up!</AlertTitle>\r
      <AlertDescription>You can add components and dependencies to your app.</AlertDescription>\r
    </Alert>,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('alert')).toBeInTheDocument();
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: () => <Alert variant="destructive">\r
      <AlertCircle size={16} />\r
      <AlertTitle>Error</AlertTitle>\r
      <AlertDescription>Your session has expired. Please log in again.</AlertDescription>\r
    </Alert>
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  render: () => <Alert className="text-success [&>svg]:text-success" variant="default">\r
      <Check size={16} />\r
      <AlertTitle>Success!</AlertTitle>\r
      <AlertDescription>Your changes have been saved successfully.</AlertDescription>\r
    </Alert>
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  render: () => <Alert className="text-warning [&>svg]:text-warning" variant="default">\r
      <AlertTriangle size={16} />\r
      <AlertTitle>Warning</AlertTitle>\r
      <AlertDescription>This action will affect all environments.</AlertDescription>\r
    </Alert>
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  render: () => <Alert>\r
      <Info size={16} />\r
      <AlertDescription>A simple alert with just a description and no title.</AlertDescription>\r
    </Alert>
}`,...E.parameters?.docs?.source}}},D=[`Default`,`Destructive`,`Success`,`Warning`,`WithoutTitle`]}))();export{S as Default,C as Destructive,w as Success,T as Warning,E as WithoutTitle,D as __namedExportsOrder,x as default};