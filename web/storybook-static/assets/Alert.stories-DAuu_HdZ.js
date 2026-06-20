import{j as e}from"./jsx-runtime-D_zvdyIk.js";import{c as g}from"./index-B8k91cqS.js";import{c as p}from"./utils-CNg2SYlS.js";import{I as u}from"./info-CJ0-4IMJ.js";import{C as x}from"./circle-alert-DivrImM0.js";import{C as v}from"./check-w802uh_q.js";import{T as A}from"./triangle-alert-DeGeZbCT.js";import"./clsx-B-dksMZM.js";import"./createLucideIcon-AY_gplK-.js";import"./iframe-DP-2tj83.js";import"./preload-helper-Ct5FWWRu.js";const f=g("relative w-full rounded-lg border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",{variants:{variant:{default:"bg-card text-card-foreground",destructive:"text-destructive bg-card [&>svg]:text-current *:data-[slot=alert-description]:text-destructive/90"}},defaultVariants:{variant:"default"}});function s({className:r,variant:t,...m}){return e.jsx("div",{"data-slot":"alert",role:"alert",className:p(f({variant:t}),r),...m})}function n({className:r,...t}){return e.jsx("div",{"data-slot":"alert-title",className:p("col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight",r),...t})}function a({className:r,...t}){return e.jsx("div",{"data-slot":"alert-description",className:p("text-muted-foreground col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed",r),...t})}s.__docgenInfo={description:"",methods:[],displayName:"Alert"};n.__docgenInfo={description:"",methods:[],displayName:"AlertTitle"};a.__docgenInfo={description:"",methods:[],displayName:"AlertDescription"};const{within:h,expect:j}=__STORYBOOK_MODULE_TEST__,C={title:"UI/Alert",component:s,tags:["autodocs"]},i={render:()=>e.jsxs(s,{children:[e.jsx(u,{size:16}),e.jsx(n,{children:"Heads up!"}),e.jsx(a,{children:"You can add components and dependencies to your app."})]}),play:async({canvasElement:r})=>{const t=h(r);await j(t.getByRole("alert")).toBeInTheDocument()}},c={render:()=>e.jsxs(s,{variant:"destructive",children:[e.jsx(x,{size:16}),e.jsx(n,{children:"Error"}),e.jsx(a,{children:"Your session has expired. Please log in again."})]})},o={render:()=>e.jsxs(s,{className:"text-success [&>svg]:text-success",variant:"default",children:[e.jsx(v,{size:16}),e.jsx(n,{children:"Success!"}),e.jsx(a,{children:"Your changes have been saved successfully."})]})},l={render:()=>e.jsxs(s,{className:"text-warning [&>svg]:text-warning",variant:"default",children:[e.jsx(A,{size:16}),e.jsx(n,{children:"Warning"}),e.jsx(a,{children:"This action will affect all environments."})]})},d={render:()=>e.jsxs(s,{children:[e.jsx(u,{size:16}),e.jsx(a,{children:"A simple alert with just a description and no title."})]})};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  render: () => <Alert>\r
      <Info size={16} />\r
      <AlertTitle>Heads up!</AlertTitle>\r
      <AlertDescription>You can add components and dependencies to your app.</AlertDescription>\r
    </Alert>,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("alert")).toBeInTheDocument();
  }
}`,...i.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: () => <Alert variant="destructive">\r
      <AlertCircle size={16} />\r
      <AlertTitle>Error</AlertTitle>\r
      <AlertDescription>Your session has expired. Please log in again.</AlertDescription>\r
    </Alert>
}`,...c.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: () => <Alert className="text-success [&>svg]:text-success" variant="default">\r
      <Check size={16} />\r
      <AlertTitle>Success!</AlertTitle>\r
      <AlertDescription>Your changes have been saved successfully.</AlertDescription>\r
    </Alert>
}`,...o.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: () => <Alert className="text-warning [&>svg]:text-warning" variant="default">\r
      <AlertTriangle size={16} />\r
      <AlertTitle>Warning</AlertTitle>\r
      <AlertDescription>This action will affect all environments.</AlertDescription>\r
    </Alert>
}`,...l.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <Alert>\r
      <Info size={16} />\r
      <AlertDescription>A simple alert with just a description and no title.</AlertDescription>\r
    </Alert>
}`,...d.parameters?.docs?.source}}};const W=["Default","Destructive","Success","Warning","WithoutTitle"];export{i as Default,c as Destructive,o as Success,l as Warning,d as WithoutTitle,W as __namedExportsOrder,C as default};
