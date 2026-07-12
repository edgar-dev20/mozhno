import{i as e}from"./preload-helper-B45gAKPr.js";import{t}from"./jsx-runtime-BBQGix-2.js";import{n,t as r}from"./utils-4UQB1yx_.js";function i({className:e,...t}){return(0,a.jsx)(`div`,{"data-slot":`skeleton`,className:r(`bg-accent animate-pulse rounded-md`,e),...t})}var a,o=e((()=>{n(),a=t(),i.__docgenInfo={description:``,methods:[],displayName:`Skeleton`}})),s,c,l,u,d,f,p,m,h;e((()=>{o(),s=t(),{within:c,expect:l}=__STORYBOOK_MODULE_TEST__,u={title:`UI/Skeleton`,component:i,tags:[`autodocs`]},d={args:{className:`h-4 w-64`},play:async({canvasElement:e})=>{await l(c(e).getByText(``,{selector:`.animate-pulse`})).toHaveClass(`animate-pulse`)}},f={render:()=>(0,s.jsxs)(`div`,{className:`space-y-4 p-6 w-80`,children:[(0,s.jsx)(i,{className:`h-40 w-full rounded-xl`}),(0,s.jsx)(i,{className:`h-4 w-3/4`}),(0,s.jsx)(i,{className:`h-4 w-1/2`})]})},p={render:()=>(0,s.jsxs)(`div`,{className:`flex items-center gap-3`,children:[(0,s.jsx)(i,{className:`size-10 rounded-full`}),(0,s.jsxs)(`div`,{className:`space-y-2`,children:[(0,s.jsx)(i,{className:`h-3 w-32`}),(0,s.jsx)(i,{className:`h-3 w-24`})]})]})},m={render:()=>(0,s.jsx)(`div`,{className:`space-y-3 max-w-sm`,children:[1,2,3,4,5].map(e=>(0,s.jsxs)(`div`,{className:`flex items-center gap-3 p-3 rounded-xl bg-card border border-border`,children:[(0,s.jsx)(i,{className:`size-8 rounded-full shrink-0`}),(0,s.jsxs)(`div`,{className:`flex-1 space-y-1.5`,children:[(0,s.jsx)(i,{className:`h-3 w-2/3`}),(0,s.jsx)(i,{className:`h-2.5 w-1/2`})]})]},e))})},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    className: 'h-4 w-64'
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const el = canvas.getByText('', {
      selector: '.animate-pulse'
    });
    await expect(el).toHaveClass('animate-pulse');
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: () => <div className="space-y-4 p-6 w-80">\r
      <Skeleton className="h-40 w-full rounded-xl" />\r
      <Skeleton className="h-4 w-3/4" />\r
      <Skeleton className="h-4 w-1/2" />\r
    </div>
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex items-center gap-3">\r
      <Skeleton className="size-10 rounded-full" />\r
      <div className="space-y-2">\r
        <Skeleton className="h-3 w-32" />\r
        <Skeleton className="h-3 w-24" />\r
      </div>\r
    </div>
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <div className="space-y-3 max-w-sm">\r
      {[1, 2, 3, 4, 5].map(i => <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">\r
          <Skeleton className="size-8 rounded-full shrink-0" />\r
          <div className="flex-1 space-y-1.5">\r
            <Skeleton className="h-3 w-2/3" />\r
            <Skeleton className="h-2.5 w-1/2" />\r
          </div>\r
        </div>)}\r
    </div>
}`,...m.parameters?.docs?.source}}},h=[`TextLine`,`Card`,`Avatar`,`List`]}))();export{p as Avatar,f as Card,m as List,d as TextLine,h as __namedExportsOrder,u as default};