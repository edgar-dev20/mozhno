import{j as e}from"./jsx-runtime-D_zvdyIk.js";import{F as c}from"./FormField-5ubgD184.js";import{I as l}from"./input-DzfKWgl3.js";import{S as m,a as p,b as d,c as u,d as i}from"./select-Dp64wE9a.js";import{T as h}from"./textarea-CQrmJJCd.js";import"./iframe-DP-2tj83.js";import"./preload-helper-Ct5FWWRu.js";import"./utils-CNg2SYlS.js";import"./clsx-B-dksMZM.js";import"./index-ZEUw8nZR.js";import"./index-BospHUp7.js";import"./index-BdQq_4o_.js";import"./index-Blarl-ku.js";import"./index-DlGP-Ght.js";import"./index-BEX5tJZv.js";import"./index-CG7t-1OX.js";import"./index-DFfz4Q0N.js";import"./index-bFwMlmfo.js";import"./index-BPFNws8-.js";import"./index-DLmYvlQ2.js";import"./index-Dm9-QcB_.js";import"./index-BGuRCeEQ.js";import"./chevron-down-BvNauRpD.js";import"./createLucideIcon-AY_gplK-.js";import"./check-w802uh_q.js";import"./chevron-up-CboIev3u.js";const R={title:"Shared/FormField",component:c,tags:["autodocs"]},r={args:{label:"Username",children:e.jsx(l,{placeholder:"Enter username"})}},a={args:{label:"Password",hint:"Must be at least 8 characters with a number and special character",children:e.jsx(l,{type:"password",placeholder:"Enter password"})}},t={args:{label:"Email",error:"Please enter a valid email address",children:e.jsx(l,{placeholder:"user@example.com",type:"email","aria-invalid":!0})}},s={args:{label:"Environment",children:e.jsxs(m,{defaultValue:"production",children:[e.jsx(p,{children:e.jsx(d,{})}),e.jsxs(u,{children:[e.jsx(i,{value:"production",children:"Production"}),e.jsx(i,{value:"staging",children:"Staging"}),e.jsx(i,{value:"development",children:"Development"})]})]})}},n={args:{label:"Description",hint:"Brief description of this flag",children:e.jsx(h,{rows:3,placeholder:"Describe this flag..."})}},o={args:{label:"Name",maxLength:50,value:"Hello",children:e.jsx(l,{defaultValue:"Hello",placeholder:"Enter name"})}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    label: "Username",
    children: <Input placeholder="Enter username" />
  }
}`,...r.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    label: "Password",
    hint: "Must be at least 8 characters with a number and special character",
    children: <Input type="password" placeholder="Enter password" />
  }
}`,...a.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    label: "Email",
    error: "Please enter a valid email address",
    children: <Input placeholder="user@example.com" type="email" aria-invalid />
  }
}`,...t.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    label: "Environment",
    children: <Select defaultValue="production">\r
        <SelectTrigger>\r
          <SelectValue />\r
        </SelectTrigger>\r
        <SelectContent>\r
          <SelectItem value="production">Production</SelectItem>\r
          <SelectItem value="staging">Staging</SelectItem>\r
          <SelectItem value="development">Development</SelectItem>\r
        </SelectContent>\r
      </Select>
  }
}`,...s.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    label: "Description",
    hint: "Brief description of this flag",
    children: <Textarea rows={3} placeholder="Describe this flag..." />
  }
}`,...n.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    label: "Name",
    maxLength: 50,
    value: "Hello",
    children: <Input defaultValue="Hello" placeholder="Enter name" />
  }
}`,...o.parameters?.docs?.source}}};const k=["WithInput","WithHint","WithError","WithSelect","WithTextarea","WithMaxLength"];export{t as WithError,a as WithHint,r as WithInput,o as WithMaxLength,s as WithSelect,n as WithTextarea,k as __namedExportsOrder,R as default};
