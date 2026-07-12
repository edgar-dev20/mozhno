import{i as e}from"./preload-helper-B45gAKPr.js";import{t}from"./jsx-runtime-BBQGix-2.js";import{n,t as r}from"./Badge-6TPVxxPx.js";var i,a,o,s;e((()=>{n(),i=t(),a={title:`Shared/Badge`,component:r,tags:[`autodocs`],args:{children:`Label`},argTypes:{variant:{options:[`default`,`primary`,`secondary`,`success`,`warning`,`destructive`,`info`],control:{type:`select`}},style:{options:[`solid`,`outline`,`subtle`],control:{type:`select`}},shape:{options:[`rounded`,`pill`],control:{type:`select`}},size:{options:[`sm`,`md`],control:{type:`select`}}}},o={render:()=>(0,i.jsxs)(`div`,{className:`space-y-6 p-4`,children:[(0,i.jsxs)(`div`,{children:[(0,i.jsx)(`h3`,{className:`text-xs font-semibold uppercase tracking-widest text-muted-foreground/40 mb-3`,children:`Solid`}),(0,i.jsxs)(`div`,{className:`flex flex-wrap gap-2`,children:[(0,i.jsx)(r,{variant:`default`,style:`solid`,children:`Default`}),(0,i.jsx)(r,{variant:`primary`,style:`solid`,children:`Primary`}),(0,i.jsx)(r,{variant:`success`,style:`solid`,children:`Success`}),(0,i.jsx)(r,{variant:`warning`,style:`solid`,children:`Warning`}),(0,i.jsx)(r,{variant:`destructive`,style:`solid`,children:`Destructive`}),(0,i.jsx)(r,{variant:`info`,style:`solid`,children:`Info`})]})]}),(0,i.jsxs)(`div`,{children:[(0,i.jsx)(`h3`,{className:`text-xs font-semibold uppercase tracking-widest text-muted-foreground/40 mb-3`,children:`Outline`}),(0,i.jsxs)(`div`,{className:`flex flex-wrap gap-2`,children:[(0,i.jsx)(r,{variant:`default`,style:`outline`,children:`Default`}),(0,i.jsx)(r,{variant:`primary`,style:`outline`,children:`Primary`}),(0,i.jsx)(r,{variant:`success`,style:`outline`,children:`Success`}),(0,i.jsx)(r,{variant:`warning`,style:`outline`,children:`Warning`}),(0,i.jsx)(r,{variant:`destructive`,style:`outline`,children:`Destructive`}),(0,i.jsx)(r,{variant:`info`,style:`outline`,children:`Info`})]})]}),(0,i.jsxs)(`div`,{children:[(0,i.jsx)(`h3`,{className:`text-xs font-semibold uppercase tracking-widest text-muted-foreground/40 mb-3`,children:`Subtle`}),(0,i.jsxs)(`div`,{className:`flex flex-wrap gap-2`,children:[(0,i.jsx)(r,{variant:`default`,style:`subtle`,children:`Default`}),(0,i.jsx)(r,{variant:`primary`,style:`subtle`,children:`Primary`}),(0,i.jsx)(r,{variant:`success`,style:`subtle`,children:`Success`}),(0,i.jsx)(r,{variant:`warning`,style:`subtle`,children:`Warning`}),(0,i.jsx)(r,{variant:`destructive`,style:`subtle`,children:`Destructive`}),(0,i.jsx)(r,{variant:`info`,style:`subtle`,children:`Info`})]})]}),(0,i.jsxs)(`div`,{children:[(0,i.jsx)(`h3`,{className:`text-xs font-semibold uppercase tracking-widest text-muted-foreground/40 mb-3`,children:`Shapes & Sizes`}),(0,i.jsxs)(`div`,{className:`flex flex-wrap items-center gap-3`,children:[(0,i.jsx)(r,{variant:`primary`,shape:`rounded`,size:`sm`,children:`Rounded SM`}),(0,i.jsx)(r,{variant:`primary`,shape:`rounded`,size:`md`,children:`Rounded MD`}),(0,i.jsx)(r,{variant:`primary`,shape:`pill`,size:`sm`,children:`Pill SM`}),(0,i.jsx)(r,{variant:`primary`,shape:`pill`,size:`md`,children:`Pill MD`})]})]}),(0,i.jsxs)(`div`,{children:[(0,i.jsx)(`h3`,{className:`text-xs font-semibold uppercase tracking-widest text-muted-foreground/40 mb-3`,children:`With Icons`}),(0,i.jsxs)(`div`,{className:`flex flex-wrap gap-2`,children:[(0,i.jsx)(r,{variant:`success`,icon:(0,i.jsx)(`span`,{className:`w-1.5 h-1.5 rounded-full bg-current`}),children:`Active`}),(0,i.jsx)(r,{variant:`destructive`,icon:(0,i.jsx)(`span`,{className:`w-1.5 h-1.5 rounded-full bg-current`}),children:`Failed`}),(0,i.jsx)(r,{variant:`info`,uppercase:!0,children:`UPPERCASE`})]})]})]})},o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: () => <div className="space-y-6 p-4">\r
      <div>\r
        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/40 mb-3">\r
          Solid\r
        </h3>\r
        <div className="flex flex-wrap gap-2">\r
          <Badge variant="default" style="solid">\r
            Default\r
          </Badge>\r
          <Badge variant="primary" style="solid">\r
            Primary\r
          </Badge>\r
          <Badge variant="success" style="solid">\r
            Success\r
          </Badge>\r
          <Badge variant="warning" style="solid">\r
            Warning\r
          </Badge>\r
          <Badge variant="destructive" style="solid">\r
            Destructive\r
          </Badge>\r
          <Badge variant="info" style="solid">\r
            Info\r
          </Badge>\r
        </div>\r
      </div>\r
      <div>\r
        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/40 mb-3">\r
          Outline\r
        </h3>\r
        <div className="flex flex-wrap gap-2">\r
          <Badge variant="default" style="outline">\r
            Default\r
          </Badge>\r
          <Badge variant="primary" style="outline">\r
            Primary\r
          </Badge>\r
          <Badge variant="success" style="outline">\r
            Success\r
          </Badge>\r
          <Badge variant="warning" style="outline">\r
            Warning\r
          </Badge>\r
          <Badge variant="destructive" style="outline">\r
            Destructive\r
          </Badge>\r
          <Badge variant="info" style="outline">\r
            Info\r
          </Badge>\r
        </div>\r
      </div>\r
      <div>\r
        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/40 mb-3">\r
          Subtle\r
        </h3>\r
        <div className="flex flex-wrap gap-2">\r
          <Badge variant="default" style="subtle">\r
            Default\r
          </Badge>\r
          <Badge variant="primary" style="subtle">\r
            Primary\r
          </Badge>\r
          <Badge variant="success" style="subtle">\r
            Success\r
          </Badge>\r
          <Badge variant="warning" style="subtle">\r
            Warning\r
          </Badge>\r
          <Badge variant="destructive" style="subtle">\r
            Destructive\r
          </Badge>\r
          <Badge variant="info" style="subtle">\r
            Info\r
          </Badge>\r
        </div>\r
      </div>\r
      <div>\r
        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/40 mb-3">\r
          Shapes & Sizes\r
        </h3>\r
        <div className="flex flex-wrap items-center gap-3">\r
          <Badge variant="primary" shape="rounded" size="sm">\r
            Rounded SM\r
          </Badge>\r
          <Badge variant="primary" shape="rounded" size="md">\r
            Rounded MD\r
          </Badge>\r
          <Badge variant="primary" shape="pill" size="sm">\r
            Pill SM\r
          </Badge>\r
          <Badge variant="primary" shape="pill" size="md">\r
            Pill MD\r
          </Badge>\r
        </div>\r
      </div>\r
      <div>\r
        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/40 mb-3">\r
          With Icons\r
        </h3>\r
        <div className="flex flex-wrap gap-2">\r
          <Badge variant="success" icon={<span className="w-1.5 h-1.5 rounded-full bg-current" />}>\r
            Active\r
          </Badge>\r
          <Badge variant="destructive" icon={<span className="w-1.5 h-1.5 rounded-full bg-current" />}>\r
            Failed\r
          </Badge>\r
          <Badge variant="info" uppercase>\r
            UPPERCASE\r
          </Badge>\r
        </div>\r
      </div>\r
    </div>
}`,...o.parameters?.docs?.source}}},s=[`Variants`]}))();export{o as Variants,s as __namedExportsOrder,a as default};