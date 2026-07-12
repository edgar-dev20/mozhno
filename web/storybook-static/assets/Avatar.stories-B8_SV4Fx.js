import{i as e}from"./preload-helper-B45gAKPr.js";import{t}from"./jsx-runtime-BBQGix-2.js";import{i as n,n as r,r as i,t as a}from"./avatar-DSQcs3uK.js";var o,s,c,l,u,d,f,p;e((()=>{n(),o=t(),{within:s,expect:c}=__STORYBOOK_MODULE_TEST__,l={title:`UI/Avatar`,component:a,tags:[`autodocs`]},u={render:()=>(0,o.jsx)(a,{children:(0,o.jsx)(r,{children:`JD`})}),play:async({canvasElement:e})=>{await c(s(e).getByText(`JD`)).toBeInTheDocument()}},d={render:()=>(0,o.jsxs)(a,{children:[(0,o.jsx)(i,{src:`https://github.com/shadcn.png`,alt:`@shadcn`}),(0,o.jsx)(r,{children:`CN`})]})},f={render:()=>(0,o.jsxs)(`div`,{className:`flex items-end gap-6`,children:[(0,o.jsx)(a,{className:`size-8`,children:(0,o.jsx)(r,{children:`S`})}),(0,o.jsx)(a,{className:`size-10`,children:(0,o.jsx)(r,{children:`M`})}),(0,o.jsx)(a,{className:`size-12`,children:(0,o.jsx)(r,{children:`L`})}),(0,o.jsx)(a,{className:`size-16`,children:(0,o.jsx)(r,{children:`XL`})})]})},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: () => <Avatar>\r
      <AvatarFallback>JD</AvatarFallback>\r
    </Avatar>,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('JD')).toBeInTheDocument();
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <Avatar>\r
      <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />\r
      <AvatarFallback>CN</AvatarFallback>\r
    </Avatar>
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex items-end gap-6">\r
      <Avatar className="size-8">\r
        <AvatarFallback>S</AvatarFallback>\r
      </Avatar>\r
      <Avatar className="size-10">\r
        <AvatarFallback>M</AvatarFallback>\r
      </Avatar>\r
      <Avatar className="size-12">\r
        <AvatarFallback>L</AvatarFallback>\r
      </Avatar>\r
      <Avatar className="size-16">\r
        <AvatarFallback>XL</AvatarFallback>\r
      </Avatar>\r
    </div>
}`,...f.parameters?.docs?.source}}},p=[`WithFallback`,`WithImage`,`Sizes`]}))();export{f as Sizes,u as WithFallback,d as WithImage,p as __namedExportsOrder,l as default};