import{i as e}from"./preload-helper-B45gAKPr.js";import{t}from"./jsx-runtime-BBQGix-2.js";import{n,t as r}from"./FormField-Q1Dqvg-k.js";import{n as i,t as a}from"./input-AmHFZmeF.js";import{a as o,i as s,n as c,o as l,r as u,t as d}from"./select-BPA4gds6.js";import{n as f,t as p}from"./textarea-D3k8Qfep.js";var m,h,g,_,v,y,b,x,S;e((()=>{n(),i(),l(),f(),m=t(),h={title:`Shared/FormField`,component:r,tags:[`autodocs`]},g={args:{label:`Username`,children:(0,m.jsx)(a,{placeholder:`Enter username`})}},_={args:{label:`Password`,hint:`Must be at least 8 characters with a number and special character`,children:(0,m.jsx)(a,{type:`password`,placeholder:`Enter password`})}},v={args:{label:`Email`,error:`Please enter a valid email address`,children:(0,m.jsx)(a,{placeholder:`user@example.com`,type:`email`,"aria-invalid":!0})}},y={args:{label:`Environment`,children:(0,m.jsxs)(d,{defaultValue:`production`,children:[(0,m.jsx)(s,{children:(0,m.jsx)(o,{})}),(0,m.jsxs)(c,{children:[(0,m.jsx)(u,{value:`production`,children:`Production`}),(0,m.jsx)(u,{value:`staging`,children:`Staging`}),(0,m.jsx)(u,{value:`development`,children:`Development`})]})]})}},b={args:{label:`Description`,hint:`Brief description of this flag`,children:(0,m.jsx)(p,{rows:3,placeholder:`Describe this flag...`})}},x={args:{label:`Name`,maxLength:50,value:`Hello`,children:(0,m.jsx)(a,{defaultValue:`Hello`,placeholder:`Enter name`})}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Username',
    children: <Input placeholder="Enter username" />
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Password',
    hint: 'Must be at least 8 characters with a number and special character',
    children: <Input type="password" placeholder="Enter password" />
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Email',
    error: 'Please enter a valid email address',
    children: <Input placeholder="user@example.com" type="email" aria-invalid />
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Environment',
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
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Description',
    hint: 'Brief description of this flag',
    children: <Textarea rows={3} placeholder="Describe this flag..." />
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Name',
    maxLength: 50,
    value: 'Hello',
    children: <Input defaultValue="Hello" placeholder="Enter name" />
  }
}`,...x.parameters?.docs?.source}}},S=[`WithInput`,`WithHint`,`WithError`,`WithSelect`,`WithTextarea`,`WithMaxLength`]}))();export{v as WithError,_ as WithHint,g as WithInput,x as WithMaxLength,y as WithSelect,b as WithTextarea,S as __namedExportsOrder,h as default};