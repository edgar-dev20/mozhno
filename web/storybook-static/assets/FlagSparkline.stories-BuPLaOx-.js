import{j as a}from"./jsx-runtime-D_zvdyIk.js";import{F as p,S as d}from"./FlagSparkline-Cca4Lf4K.js";import"./iframe-DP-2tj83.js";import"./preload-helper-Ct5FWWRu.js";import"./proxy-P4gg3xAH.js";const{within:l,expect:i}=__STORYBOOK_MODULE_TEST__,m=Array.from({length:48},(r,e)=>({trueCount:Math.round(20+15*Math.sin(e/48*Math.PI*2)+Math.random()*10),falseCount:Math.round(5+8*Math.cos(e/48*Math.PI*2+1)+Math.random()*5)})),h=Array.from({length:24},()=>({trueCount:Math.round(30+Math.random()*10),falseCount:Math.round(10+Math.random()*5)})),u=[],v={title:"Charts/FlagSparkline",component:p,tags:["autodocs"]},t={args:{data:m},play:async({canvasElement:r})=>{const e=l(r);await i(e.getByRole("img",{name:"Sparkline chart"})).toBeInTheDocument()}},n={args:{data:m,height:120}},s={args:{data:h}},o={args:{data:u},play:async({canvasElement:r})=>{const e=l(r);await i(e.getByText("—")).toBeInTheDocument()}},c={render:()=>a.jsxs("div",{className:"space-y-6 max-w-lg",children:[a.jsxs("div",{className:"p-4 rounded-xl bg-card border border-border",children:[a.jsx("span",{className:"text-xs text-muted-foreground/50 uppercase tracking-wider",children:"Placeholder (loading)"}),a.jsx(d,{height:56})]}),a.jsxs("div",{className:"p-4 rounded-xl bg-card border border-border",children:[a.jsx("span",{className:"text-xs text-muted-foreground/50 uppercase tracking-wider",children:"Placeholder (tall)"}),a.jsx(d,{height:120})]})]})};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    data: SAMPLE_DATA
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("img", {
      name: "Sparkline chart"
    })).toBeInTheDocument();
  }
}`,...t.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    data: SAMPLE_DATA,
    height: 120
  }
}`,...n.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    data: FLAT_DATA
  }
}`,...s.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    data: EMPTY_DATA
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("—")).toBeInTheDocument();
  }
}`,...o.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: () => <div className="space-y-6 max-w-lg">\r
      <div className="p-4 rounded-xl bg-card border border-border">\r
        <span className="text-xs text-muted-foreground/50 uppercase tracking-wider">Placeholder (loading)</span>\r
        <SparklinePlaceholder height={56} />\r
      </div>\r
      <div className="p-4 rounded-xl bg-card border border-border">\r
        <span className="text-xs text-muted-foreground/50 uppercase tracking-wider">Placeholder (tall)</span>\r
        <SparklinePlaceholder height={120} />\r
      </div>\r
    </div>
}`,...c.parameters?.docs?.source}}};const y=["WithData","TallSparkline","FlatData","Empty","Placeholder"];export{o as Empty,s as FlatData,c as Placeholder,n as TallSparkline,t as WithData,y as __namedExportsOrder,v as default};
