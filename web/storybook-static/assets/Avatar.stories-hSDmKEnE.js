import{j as a}from"./jsx-runtime-D_zvdyIk.js";import{A as r,a as e,b as i}from"./avatar-DxtMkGIo.js";import"./iframe-DP-2tj83.js";import"./preload-helper-Ct5FWWRu.js";import"./index-DlGP-Ght.js";import"./index-CG7t-1OX.js";import"./index-ZEUw8nZR.js";import"./index-BospHUp7.js";import"./utils-CNg2SYlS.js";import"./clsx-B-dksMZM.js";const{within:o,expect:m}=__STORYBOOK_MODULE_TEST__,k={title:"UI/Avatar",component:r,tags:["autodocs"]},s={render:()=>a.jsx(r,{children:a.jsx(e,{children:"JD"})}),play:async({canvasElement:c})=>{const l=o(c);await m(l.getByText("JD")).toBeInTheDocument()}},t={render:()=>a.jsxs(r,{children:[a.jsx(i,{src:"https://github.com/shadcn.png",alt:"@shadcn"}),a.jsx(e,{children:"CN"})]})},n={render:()=>a.jsxs("div",{className:"flex items-end gap-6",children:[a.jsx(r,{className:"size-8",children:a.jsx(e,{children:"S"})}),a.jsx(r,{className:"size-10",children:a.jsx(e,{children:"M"})}),a.jsx(r,{className:"size-12",children:a.jsx(e,{children:"L"})}),a.jsx(r,{className:"size-16",children:a.jsx(e,{children:"XL"})})]})};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  render: () => <Avatar>\r
      <AvatarFallback>JD</AvatarFallback>\r
    </Avatar>,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("JD")).toBeInTheDocument();
  }
}`,...s.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  render: () => <Avatar>\r
      <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />\r
      <AvatarFallback>CN</AvatarFallback>\r
    </Avatar>
}`,...t.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
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
}`,...n.parameters?.docs?.source}}};const F=["WithFallback","WithImage","Sizes"];export{n as Sizes,s as WithFallback,t as WithImage,F as __namedExportsOrder,k as default};
