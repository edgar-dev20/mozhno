import{j as e}from"./jsx-runtime-D_zvdyIk.js";import{B as a}from"./Badge-DHKv_eig.js";import"./index-B8k91cqS.js";import"./clsx-B-dksMZM.js";const d={title:"Shared/Badge",component:a,tags:["autodocs"],args:{children:"Label"},argTypes:{variant:{options:["default","primary","secondary","success","warning","destructive","info"],control:{type:"select"}},style:{options:["solid","outline","subtle"],control:{type:"select"}},shape:{options:["rounded","pill"],control:{type:"select"}},size:{options:["sm","md"],control:{type:"select"}}}},s={render:()=>e.jsxs("div",{className:"space-y-6 p-4",children:[e.jsxs("div",{children:[e.jsx("h3",{className:"text-xs font-semibold uppercase tracking-widest text-muted-foreground/40 mb-3",children:"Solid"}),e.jsxs("div",{className:"flex flex-wrap gap-2",children:[e.jsx(a,{variant:"default",style:"solid",children:"Default"}),e.jsx(a,{variant:"primary",style:"solid",children:"Primary"}),e.jsx(a,{variant:"success",style:"solid",children:"Success"}),e.jsx(a,{variant:"warning",style:"solid",children:"Warning"}),e.jsx(a,{variant:"destructive",style:"solid",children:"Destructive"}),e.jsx(a,{variant:"info",style:"solid",children:"Info"})]})]}),e.jsxs("div",{children:[e.jsx("h3",{className:"text-xs font-semibold uppercase tracking-widest text-muted-foreground/40 mb-3",children:"Outline"}),e.jsxs("div",{className:"flex flex-wrap gap-2",children:[e.jsx(a,{variant:"default",style:"outline",children:"Default"}),e.jsx(a,{variant:"primary",style:"outline",children:"Primary"}),e.jsx(a,{variant:"success",style:"outline",children:"Success"}),e.jsx(a,{variant:"warning",style:"outline",children:"Warning"}),e.jsx(a,{variant:"destructive",style:"outline",children:"Destructive"}),e.jsx(a,{variant:"info",style:"outline",children:"Info"})]})]}),e.jsxs("div",{children:[e.jsx("h3",{className:"text-xs font-semibold uppercase tracking-widest text-muted-foreground/40 mb-3",children:"Subtle"}),e.jsxs("div",{className:"flex flex-wrap gap-2",children:[e.jsx(a,{variant:"default",style:"subtle",children:"Default"}),e.jsx(a,{variant:"primary",style:"subtle",children:"Primary"}),e.jsx(a,{variant:"success",style:"subtle",children:"Success"}),e.jsx(a,{variant:"warning",style:"subtle",children:"Warning"}),e.jsx(a,{variant:"destructive",style:"subtle",children:"Destructive"}),e.jsx(a,{variant:"info",style:"subtle",children:"Info"})]})]}),e.jsxs("div",{children:[e.jsx("h3",{className:"text-xs font-semibold uppercase tracking-widest text-muted-foreground/40 mb-3",children:"Shapes & Sizes"}),e.jsxs("div",{className:"flex flex-wrap items-center gap-3",children:[e.jsx(a,{variant:"primary",shape:"rounded",size:"sm",children:"Rounded SM"}),e.jsx(a,{variant:"primary",shape:"rounded",size:"md",children:"Rounded MD"}),e.jsx(a,{variant:"primary",shape:"pill",size:"sm",children:"Pill SM"}),e.jsx(a,{variant:"primary",shape:"pill",size:"md",children:"Pill MD"})]})]}),e.jsxs("div",{children:[e.jsx("h3",{className:"text-xs font-semibold uppercase tracking-widest text-muted-foreground/40 mb-3",children:"With Icons"}),e.jsxs("div",{className:"flex flex-wrap gap-2",children:[e.jsx(a,{variant:"success",icon:e.jsx("span",{className:"w-1.5 h-1.5 rounded-full bg-current"}),children:"Active"}),e.jsx(a,{variant:"destructive",icon:e.jsx("span",{className:"w-1.5 h-1.5 rounded-full bg-current"}),children:"Failed"}),e.jsx(a,{variant:"info",uppercase:!0,children:"UPPERCASE"})]})]})]})};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  render: () => <div className="space-y-6 p-4">\r
      <div>\r
        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/40 mb-3">Solid</h3>\r
        <div className="flex flex-wrap gap-2">\r
          <Badge variant="default" style="solid">Default</Badge>\r
          <Badge variant="primary" style="solid">Primary</Badge>\r
          <Badge variant="success" style="solid">Success</Badge>\r
          <Badge variant="warning" style="solid">Warning</Badge>\r
          <Badge variant="destructive" style="solid">Destructive</Badge>\r
          <Badge variant="info" style="solid">Info</Badge>\r
        </div>\r
      </div>\r
      <div>\r
        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/40 mb-3">Outline</h3>\r
        <div className="flex flex-wrap gap-2">\r
          <Badge variant="default" style="outline">Default</Badge>\r
          <Badge variant="primary" style="outline">Primary</Badge>\r
          <Badge variant="success" style="outline">Success</Badge>\r
          <Badge variant="warning" style="outline">Warning</Badge>\r
          <Badge variant="destructive" style="outline">Destructive</Badge>\r
          <Badge variant="info" style="outline">Info</Badge>\r
        </div>\r
      </div>\r
      <div>\r
        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/40 mb-3">Subtle</h3>\r
        <div className="flex flex-wrap gap-2">\r
          <Badge variant="default" style="subtle">Default</Badge>\r
          <Badge variant="primary" style="subtle">Primary</Badge>\r
          <Badge variant="success" style="subtle">Success</Badge>\r
          <Badge variant="warning" style="subtle">Warning</Badge>\r
          <Badge variant="destructive" style="subtle">Destructive</Badge>\r
          <Badge variant="info" style="subtle">Info</Badge>\r
        </div>\r
      </div>\r
      <div>\r
        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/40 mb-3">Shapes & Sizes</h3>\r
        <div className="flex flex-wrap items-center gap-3">\r
          <Badge variant="primary" shape="rounded" size="sm">Rounded SM</Badge>\r
          <Badge variant="primary" shape="rounded" size="md">Rounded MD</Badge>\r
          <Badge variant="primary" shape="pill" size="sm">Pill SM</Badge>\r
          <Badge variant="primary" shape="pill" size="md">Pill MD</Badge>\r
        </div>\r
      </div>\r
      <div>\r
        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/40 mb-3">With Icons</h3>\r
        <div className="flex flex-wrap gap-2">\r
          <Badge variant="success" icon={<span className="w-1.5 h-1.5 rounded-full bg-current" />}>Active</Badge>\r
          <Badge variant="destructive" icon={<span className="w-1.5 h-1.5 rounded-full bg-current" />}>Failed</Badge>\r
          <Badge variant="info" uppercase>UPPERCASE</Badge>\r
        </div>\r
      </div>\r
    </div>
}`,...s.parameters?.docs?.source}}};const l=["Variants"];export{s as Variants,l as __namedExportsOrder,d as default};
