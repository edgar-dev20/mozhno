import{c as e,i as t}from"./preload-helper-B45gAKPr.js";import{V as n}from"./iframe-CdpC400m.js";import{t as r}from"./jsx-runtime-BBQGix-2.js";import{$n as i,pr as a,qn as o}from"./lucide-react-Dw50eDdj.js";import{t as s}from"./icons-BLhiJp-6.js";import{i as c,t as l}from"./i18n-CNx_J3e1.js";import{c as u,o as d}from"./webhookUtils-DiERwEmN.js";function f({formUrl:e,formHeaders:t,formBody:n}){let r=c(),[s,l]=(0,p.useState)(!1),u=d(e,t,n),f=(0,p.useCallback)(async()=>{await navigator.clipboard.writeText(u),l(!0),setTimeout(()=>l(!1),2e3)},[u]);return(0,m.jsxs)(`div`,{className:`border border-border rounded-xl overflow-hidden`,children:[(0,m.jsxs)(`div`,{className:`flex items-center justify-between gap-1.5 px-3 py-2 bg-secondary border-b border-border`,children:[(0,m.jsxs)(`div`,{className:`flex items-center gap-1.5`,children:[(0,m.jsx)(o,{size:14,className:`text-muted-foreground`}),(0,m.jsx)(`span`,{className:`text-caption font-medium text-muted-foreground`,children:r(`integrations.preview`)})]}),(0,m.jsxs)(`button`,{type:`button`,onClick:f,className:`flex items-center gap-1 px-2.5 py-1 text-caption font-medium text-muted-foreground hover:text-brand hover:bg-brand/10 rounded-lg transition-colors`,children:[s?(0,m.jsx)(a,{size:11}):(0,m.jsx)(i,{size:11}),r(s?`integrations.copied`:`integrations.copy`)]})]}),(0,m.jsx)(`pre`,{className:`p-3 bg-input-background text-caption text-foreground/80 font-mono whitespace-pre-wrap break-all m-0 overflow-x-auto`,children:u})]})}var p,m,h=t((()=>{p=e(n(),1),s(),l(),u(),m=r(),f.__docgenInfo={description:``,methods:[],displayName:`WebhookCurlPreview`,props:{formUrl:{required:!0,tsType:{name:`string`},description:``},formHeaders:{required:!0,tsType:{name:`Array`,elements:[{name:`HeaderRow`}],raw:`HeaderRow[]`},description:``},formBody:{required:!0,tsType:{name:`string`},description:``}}}})),g,_,v,y,b;t((()=>{h(),g={title:`App/Integrations/WebhookCurlPreview`,component:f,tags:[`autodocs`]},_={args:{formUrl:`https://api.example.com/webhooks`,formHeaders:[{id:1,key:`Content-Type`,value:`application/json`}],formBody:`{"event":"flag.updated"}`}},v={args:{formUrl:`https://api.example.com/webhooks`,formHeaders:[],formBody:``}},y={args:{formUrl:`https://api.example.com/webhooks`,formHeaders:[{id:1,key:`Content-Type`,value:`application/json`},{id:2,key:`Authorization`,value:`Bearer sk-abc123...`}],formBody:`{"event":"flag.updated","data":{"key":"checkout-v2"}}`}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    formUrl: 'https://api.example.com/webhooks',
    formHeaders: [{
      id: 1,
      key: 'Content-Type',
      value: 'application/json'
    }],
    formBody: '{"event":"flag.updated"}'
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    formUrl: 'https://api.example.com/webhooks',
    formHeaders: [],
    formBody: ''
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    formUrl: 'https://api.example.com/webhooks',
    formHeaders: [{
      id: 1,
      key: 'Content-Type',
      value: 'application/json'
    }, {
      id: 2,
      key: 'Authorization',
      value: 'Bearer sk-abc123...'
    }],
    formBody: '{"event":"flag.updated","data":{"key":"checkout-v2"}}'
  }
}`,...y.parameters?.docs?.source}}},b=[`Default`,`EmptyHeaders`,`WithAuthHeader`]}))();export{_ as Default,v as EmptyHeaders,y as WithAuthHeader,b as __namedExportsOrder,g as default};