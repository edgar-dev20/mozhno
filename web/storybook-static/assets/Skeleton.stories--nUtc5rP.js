import{j as e}from"./jsx-runtime-D_zvdyIk.js";import{c as d}from"./utils-CNg2SYlS.js";import"./clsx-B-dksMZM.js";function s({className:a,...t}){return e.jsx("div",{"data-slot":"skeleton",className:d("bg-accent animate-pulse rounded-md",a),...t})}s.__docgenInfo={description:"",methods:[],displayName:"Skeleton"};const{within:m,expect:i}=__STORYBOOK_MODULE_TEST__,N={title:"UI/Skeleton",component:s,tags:["autodocs"]},r={args:{className:"h-4 w-64"},play:async({canvasElement:a})=>{const o=m(a).getByText("",{selector:".animate-pulse"});await i(o).toHaveClass("animate-pulse")}},n={render:()=>e.jsxs("div",{className:"space-y-4 p-6 w-80",children:[e.jsx(s,{className:"h-40 w-full rounded-xl"}),e.jsx(s,{className:"h-4 w-3/4"}),e.jsx(s,{className:"h-4 w-1/2"})]})},c={render:()=>e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx(s,{className:"size-10 rounded-full"}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(s,{className:"h-3 w-32"}),e.jsx(s,{className:"h-3 w-24"})]})]})},l={render:()=>e.jsx("div",{className:"space-y-3 max-w-sm",children:[1,2,3,4,5].map(a=>e.jsxs("div",{className:"flex items-center gap-3 p-3 rounded-xl bg-card border border-border",children:[e.jsx(s,{className:"size-8 rounded-full shrink-0"}),e.jsxs("div",{className:"flex-1 space-y-1.5",children:[e.jsx(s,{className:"h-3 w-2/3"}),e.jsx(s,{className:"h-2.5 w-1/2"})]})]},a))})};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    className: "h-4 w-64"
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const el = canvas.getByText("", {
      selector: ".animate-pulse"
    });
    await expect(el).toHaveClass("animate-pulse");
  }
}`,...r.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  render: () => <div className="space-y-4 p-6 w-80">\r
      <Skeleton className="h-40 w-full rounded-xl" />\r
      <Skeleton className="h-4 w-3/4" />\r
      <Skeleton className="h-4 w-1/2" />\r
    </div>
}`,...n.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex items-center gap-3">\r
      <Skeleton className="size-10 rounded-full" />\r
      <div className="space-y-2">\r
        <Skeleton className="h-3 w-32" />\r
        <Skeleton className="h-3 w-24" />\r
      </div>\r
    </div>
}`,...c.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: () => <div className="space-y-3 max-w-sm">\r
      {[1, 2, 3, 4, 5].map(i => <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">\r
          <Skeleton className="size-8 rounded-full shrink-0" />\r
          <div className="flex-1 space-y-1.5">\r
            <Skeleton className="h-3 w-2/3" />\r
            <Skeleton className="h-2.5 w-1/2" />\r
          </div>\r
        </div>)}\r
    </div>
}`,...l.parameters?.docs?.source}}};const v=["TextLine","Card","Avatar","List"];export{c as Avatar,n as Card,l as List,r as TextLine,v as __namedExportsOrder,N as default};
