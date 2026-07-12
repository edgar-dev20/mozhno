import{c as e,i as t}from"./preload-helper-B45gAKPr.js";import{V as n}from"./iframe-CdpC400m.js";import{t as r}from"./jsx-runtime-BBQGix-2.js";import{a as i}from"./lucide-react-Dw50eDdj.js";import{t as a}from"./icons-BLhiJp-6.js";import{n as o,t as s}from"./useIsMobile-Ccw89IXD.js";import{a as c,i as l,n as u,o as d,r as f,s as p,t as m,u as h}from"./dist-CAMrVNgy.js";import{n as g,t as _}from"./dist-B4Llf8sa.js";function v({title:e,description:t,children:n,footer:r,diffSlot:a,onDiffDismiss:o}){let s=!!a&&!!o;return(0,b.jsxs)(b.Fragment,{children:[(0,b.jsxs)(`div`,{className:`flex-shrink-0 px-4 sm:px-6 py-4 border-b border-border flex items-center justify-between`,children:[(0,b.jsxs)(`div`,{children:[(0,b.jsx)(p,{className:`text-h2 font-heading text-foreground tracking-tight`,children:e}),(0,b.jsx)(l,{className:t?`text-body-sm text-muted-foreground mt-1`:`sr-only`,children:t||e})]}),(0,b.jsx)(u,{asChild:!0,children:(0,b.jsx)(`button`,{className:`p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all`,children:(0,b.jsx)(i,{size:18})})})]}),s?(0,b.jsxs)(`div`,{className:`flex-1 relative overflow-hidden`,children:[(0,b.jsx)(`div`,{className:`absolute inset-0 overflow-y-auto p-4 sm:p-6`,children:n}),(0,b.jsx)(`div`,{onClick:o,className:`absolute inset-0 bg-overlay backdrop-blur-[2px] cursor-pointer z-10 flex items-start justify-center pt-8`,title:`Нажмите чтобы отменить`})]}):(0,b.jsx)(`div`,{className:`flex-1 overflow-y-auto p-4 sm:p-6`,children:n}),a,r&&(0,b.jsx)(`div`,{className:`flex-shrink-0 px-4 sm:px-6 py-5 border-t border-border bg-gradient-to-t from-secondary/50 to-transparent flex justify-end gap-3`,children:r})]})}function y({open:e,onOpenChange:t,title:n,description:r,children:i,footer:a,diffSlot:s,onDiffDismiss:l}){return o(640)?(0,b.jsx)(_.Root,{open:e,onOpenChange:t,direction:`bottom`,children:(0,b.jsxs)(_.Portal,{children:[(0,b.jsx)(_.Overlay,{className:`fixed inset-0 bg-overlay backdrop-blur-sm z-40`}),(0,b.jsxs)(_.Content,{className:`bg-card border-t border-border rounded-t-3xl z-50 fixed bottom-0 left-0 right-0 max-h-[90dvh] flex flex-col outline-none`,children:[(0,b.jsx)(`div`,{className:`mx-auto mt-3 h-1.5 w-10 rounded-full bg-muted-foreground/20 flex-shrink-0`}),(0,b.jsx)(v,{title:n,description:r,children:i,footer:a,diffSlot:s,onDiffDismiss:l})]})]})}):(0,b.jsx)(m,{open:e,onOpenChange:t,children:(0,b.jsxs)(d,{children:[(0,b.jsx)(c,{className:`fixed inset-0 bg-overlay backdrop-blur-sm z-40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-200`}),(0,b.jsx)(f,{className:`fixed right-4 top-4 bottom-4 w-full max-w-xl bg-card border border-border rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:[--tw-exit-translate-x:calc(100%+1rem)] data-[state=open]:slide-in-from-right-full duration-200`,children:(0,b.jsx)(v,{title:n,description:r,children:i,footer:a,diffSlot:s,onDiffDismiss:l})})]})})}var b,x=t((()=>{n(),h(),g(),a(),s(),b=r(),y.__docgenInfo={description:``,methods:[],displayName:`SidePanel`,props:{open:{required:!0,tsType:{name:`boolean`},description:``},onOpenChange:{required:!0,tsType:{name:`signature`,type:`function`,raw:`(open: boolean) => void`,signature:{arguments:[{type:{name:`boolean`},name:`open`}],return:{name:`void`}}},description:``},title:{required:!0,tsType:{name:`string`},description:``},description:{required:!1,tsType:{name:`string`},description:``},children:{required:!0,tsType:{name:`ReactReactNode`,raw:`React.ReactNode`},description:``},footer:{required:!1,tsType:{name:`ReactReactNode`,raw:`React.ReactNode`},description:``},diffSlot:{required:!1,tsType:{name:`ReactReactNode`,raw:`React.ReactNode`},description:``},onDiffDismiss:{required:!1,tsType:{name:`signature`,type:`function`,raw:`() => void`,signature:{arguments:[],return:{name:`void`}}},description:``}}}})),S,C,w,T,E,D,O;t((()=>{x(),S=e(n(),1),C=r(),w={title:`App/SidePanel`,component:y,tags:[`autodocs`]},T={render:function(){let[e,t]=(0,S.useState)(!0);return(0,C.jsx)(y,{open:e,onOpenChange:t,title:`Settings`,description:`Configure your flag settings`,children:(0,C.jsx)(`div`,{className:`p-4 text-sm text-muted-foreground`,children:`Panel content goes here`})})}},E={render:function(){let[e,t]=(0,S.useState)(!0);return(0,C.jsx)(y,{open:e,onOpenChange:t,title:`Create Flag`,description:`Fill in the details below`,footer:(0,C.jsxs)(`div`,{className:`flex justify-end gap-2`,children:[(0,C.jsx)(`button`,{className:`px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm`,children:`Cancel`}),(0,C.jsx)(`button`,{className:`px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm`,children:`Save`})]}),children:(0,C.jsxs)(`div`,{className:`p-4 space-y-4`,children:[(0,C.jsxs)(`div`,{className:`space-y-1`,children:[(0,C.jsx)(`label`,{className:`text-body-sm font-medium`,children:`Name`}),(0,C.jsx)(`input`,{className:`w-full rounded-lg border border-border bg-input-background px-3 py-2 text-body-sm`,placeholder:`Feature flag name`})]}),(0,C.jsxs)(`div`,{className:`space-y-1`,children:[(0,C.jsx)(`label`,{className:`text-body-sm font-medium`,children:`Key`}),(0,C.jsx)(`input`,{className:`w-full rounded-lg border border-border bg-input-background px-3 py-2 text-body-sm`,placeholder:`feature-flag-key`})]})]})})}},D={render:function(){let[e,t]=(0,S.useState)(!0);return(0,C.jsx)(y,{open:e,onOpenChange:t,title:`Documentation`,children:(0,C.jsx)(`div`,{className:`p-4 space-y-3 text-body-sm text-muted-foreground`,children:Array.from({length:15},(e,t)=>(0,C.jsxs)(`p`,{children:[`Section `,t+1,`: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`]},t))})})}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  render: function SidePanelRender() {
    const [open, setOpen] = useState(true);
    return <SidePanel open={open} onOpenChange={setOpen} title="Settings" description="Configure your flag settings">\r
        <div className="p-4 text-sm text-muted-foreground">Panel content goes here</div>\r
      </SidePanel>;
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  render: function FooterRender() {
    const [open, setOpen] = useState(true);
    return <SidePanel open={open} onOpenChange={setOpen} title="Create Flag" description="Fill in the details below" footer={<div className="flex justify-end gap-2">\r
            <button className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm">\r
              Cancel\r
            </button>\r
            <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm">\r
              Save\r
            </button>\r
          </div>}>\r
        <div className="p-4 space-y-4">\r
          <div className="space-y-1">\r
            <label className="text-body-sm font-medium">Name</label>\r
            <input className="w-full rounded-lg border border-border bg-input-background px-3 py-2 text-body-sm" placeholder="Feature flag name" />\r
          </div>\r
          <div className="space-y-1">\r
            <label className="text-body-sm font-medium">Key</label>\r
            <input className="w-full rounded-lg border border-border bg-input-background px-3 py-2 text-body-sm" placeholder="feature-flag-key" />\r
          </div>\r
        </div>\r
      </SidePanel>;
  }
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  render: function LongRender() {
    const [open, setOpen] = useState(true);
    return <SidePanel open={open} onOpenChange={setOpen} title="Documentation">\r
        <div className="p-4 space-y-3 text-body-sm text-muted-foreground">\r
          {Array.from({
          length: 15
        }, (_, i) => <p key={i}>\r
              Section {i + 1}: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do\r
              eiusmod tempor incididunt ut labore et dolore magna aliqua.\r
            </p>)}\r
        </div>\r
      </SidePanel>;
  }
}`,...D.parameters?.docs?.source}}},O=[`Default`,`WithFooter`,`LongContent`]}))();export{T as Default,D as LongContent,E as WithFooter,O as __namedExportsOrder,w as default};