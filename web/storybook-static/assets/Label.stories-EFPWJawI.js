import{i as e}from"./preload-helper-B45gAKPr.js";import{t}from"./jsx-runtime-BBQGix-2.js";import{n,t as r}from"./checkbox-Dtf8b1rN.js";import{n as i,t as a}from"./label-B7np1VYM.js";import{n as o,t as s}from"./input-AmHFZmeF.js";var c,l,u,d,f,p,m,h,g;e((()=>{i(),o(),n(),c=t(),{within:l,expect:u}=__STORYBOOK_MODULE_TEST__,d={title:`UI/Label`,component:a,tags:[`autodocs`]},f={args:{children:`Email address`},play:async({canvasElement:e})=>{await u(l(e).getByText(`Email address`)).toBeInTheDocument()}},p={render:()=>(0,c.jsxs)(`div`,{className:`grid gap-1.5 max-w-sm`,children:[(0,c.jsx)(a,{htmlFor:`name`,children:`Full Name`}),(0,c.jsx)(s,{id:`name`,placeholder:`Enter your name`})]})},m={render:()=>(0,c.jsxs)(`div`,{className:`grid gap-1.5 max-w-sm`,children:[(0,c.jsx)(a,{htmlFor:`email`,className:`after:content-['*'] after:ml-0.5 after:text-destructive`,children:`Email`}),(0,c.jsx)(s,{id:`email`,type:`email`,placeholder:`user@example.com`,required:!0})]})},h={render:()=>(0,c.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,c.jsx)(r,{id:`agree`}),(0,c.jsx)(a,{htmlFor:`agree`,children:`I agree to the terms and conditions`})]})},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    children: 'Email address'
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Email address')).toBeInTheDocument();
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => <div className="grid gap-1.5 max-w-sm">\r
      <Label htmlFor="name">Full Name</Label>\r
      <Input id="name" placeholder="Enter your name" />\r
    </div>
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <div className="grid gap-1.5 max-w-sm">\r
      <Label htmlFor="email" className="after:content-['*'] after:ml-0.5 after:text-destructive">\r
        Email\r
      </Label>\r
      <Input id="email" type="email" placeholder="user@example.com" required />\r
    </div>
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex items-center gap-2">\r
      <Checkbox id="agree" />\r
      <Label htmlFor="agree">I agree to the terms and conditions</Label>\r
    </div>
}`,...h.parameters?.docs?.source}}},g=[`Default`,`WithInput`,`Required`,`WithCheckbox`]}))();export{f as Default,m as Required,h as WithCheckbox,p as WithInput,g as __namedExportsOrder,d as default};