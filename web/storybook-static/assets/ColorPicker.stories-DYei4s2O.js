import{c as e,i as t}from"./preload-helper-B45gAKPr.js";import{V as n}from"./iframe-CdpC400m.js";import{t as r}from"./jsx-runtime-BBQGix-2.js";import{sn as i}from"./lucide-react-Dw50eDdj.js";import{t as a}from"./icons-BLhiJp-6.js";import{n as o,t as s}from"./ColorPicker-k6QecZli.js";var c,l,u,d,f,p,m,h;t((()=>{c=e(n(),1),o(),a(),l=r(),u={title:`Shared/ColorPicker`,component:s,tags:[`autodocs`],parameters:{layout:`padded`}},d={render:function(){let[e,t]=(0,c.useState)(`#2d9484`);return(0,l.jsx)(`div`,{className:`max-w-md`,children:(0,l.jsx)(s,{value:e,onChange:t})})}},f={render:function(){let[e,t]=(0,c.useState)(`#c08140`);return(0,l.jsx)(`div`,{className:`max-w-md`,children:(0,l.jsx)(s,{value:e,onChange:t,icon:(0,l.jsx)(i,{size:20,className:`text-primary-foreground`}),previewName:`Production`})})}},p={render:function(){let[e,t]=(0,c.useState)(`#6d5ae0`);return(0,l.jsx)(`div`,{className:`max-w-md`,children:(0,l.jsx)(s,{value:e,onChange:t,icon:(0,l.jsx)(i,{size:20,className:`text-primary-foreground`}),previewPlaceholder:`No name set`})})}},m={globals:{theme:`dark`},render:function(){let[e,t]=(0,c.useState)(`#3db8a5`);return(0,l.jsx)(`div`,{className:`max-w-md`,children:(0,l.jsx)(s,{value:e,onChange:t})})}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: function DefaultRender() {
    const [color, setColor] = useState('#2d9484');
    return <div className="max-w-md">\r
        <ColorPicker value={color} onChange={setColor} />\r
      </div>;
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: function NamedRender() {
    const [color, setColor] = useState('#c08140');
    return <div className="max-w-md">\r
        <ColorPicker value={color} onChange={setColor} icon={<Globe size={20} className="text-primary-foreground" />} previewName="Production" />\r
      </div>;
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: function EmptyRender() {
    const [color, setColor] = useState('#6d5ae0');
    return <div className="max-w-md">\r
        <ColorPicker value={color} onChange={setColor} icon={<Globe size={20} className="text-primary-foreground" />} previewPlaceholder="No name set" />\r
      </div>;
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  globals: {
    theme: 'dark'
  },
  render: function DarkRender() {
    const [color, setColor] = useState('#3db8a5');
    return <div className="max-w-md">\r
        <ColorPicker value={color} onChange={setColor} />\r
      </div>;
  }
}`,...m.parameters?.docs?.source}}},h=[`Default`,`WithNamedPreview`,`EmptyPreview`,`DarkTheme`]}))();export{m as DarkTheme,d as Default,p as EmptyPreview,f as WithNamedPreview,h as __namedExportsOrder,u as default};