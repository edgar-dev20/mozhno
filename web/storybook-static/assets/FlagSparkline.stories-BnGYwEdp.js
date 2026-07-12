import{i as e}from"./preload-helper-B45gAKPr.js";import{t}from"./jsx-runtime-BBQGix-2.js";import{n,r,t as i}from"./FlagSparkline-DsQZS_Il.js";var a,o,s,c,l,u,d,f,p,m,h,g,_;e((()=>{r(),a=t(),{within:o,expect:s}=__STORYBOOK_MODULE_TEST__,c=Array.from({length:48},(e,t)=>({trueCount:Math.round(20+15*Math.sin(t/48*Math.PI*2)+Math.random()*10),falseCount:Math.round(5+8*Math.cos(t/48*Math.PI*2+1)+Math.random()*5)})),l=Array.from({length:24},()=>({trueCount:Math.round(30+Math.random()*10),falseCount:Math.round(10+Math.random()*5)})),u=[],d={title:`App/Flags/FlagSparkline`,component:i,tags:[`autodocs`]},f={args:{data:c},play:async({canvasElement:e})=>{await s(o(e).getByRole(`img`,{name:`Sparkline chart`})).toBeInTheDocument()}},p={args:{data:c,height:120}},m={args:{data:l}},h={args:{data:u},play:async({canvasElement:e})=>{await s(o(e).getByText(`—`)).toBeInTheDocument()}},g={render:()=>(0,a.jsxs)(`div`,{className:`space-y-6 max-w-lg`,children:[(0,a.jsxs)(`div`,{className:`p-4 rounded-xl bg-card border border-border`,children:[(0,a.jsx)(`span`,{className:`text-xs text-muted-foreground/50 uppercase tracking-wider`,children:`Placeholder (loading)`}),(0,a.jsx)(n,{height:56})]}),(0,a.jsxs)(`div`,{className:`p-4 rounded-xl bg-card border border-border`,children:[(0,a.jsx)(`span`,{className:`text-xs text-muted-foreground/50 uppercase tracking-wider`,children:`Placeholder (tall)`}),(0,a.jsx)(n,{height:120})]})]})},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    data: SAMPLE_DATA
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('img', {
      name: 'Sparkline chart'
    })).toBeInTheDocument();
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    data: SAMPLE_DATA,
    height: 120
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    data: FLAT_DATA
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    data: EMPTY_DATA
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('—')).toBeInTheDocument();
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => <div className="space-y-6 max-w-lg">\r
      <div className="p-4 rounded-xl bg-card border border-border">\r
        <span className="text-xs text-muted-foreground/50 uppercase tracking-wider">\r
          Placeholder (loading)\r
        </span>\r
        <SparklinePlaceholder height={56} />\r
      </div>\r
      <div className="p-4 rounded-xl bg-card border border-border">\r
        <span className="text-xs text-muted-foreground/50 uppercase tracking-wider">\r
          Placeholder (tall)\r
        </span>\r
        <SparklinePlaceholder height={120} />\r
      </div>\r
    </div>
}`,...g.parameters?.docs?.source}}},_=[`WithData`,`TallSparkline`,`FlatData`,`Empty`,`Placeholder`]}))();export{h as Empty,m as FlatData,g as Placeholder,p as TallSparkline,f as WithData,_ as __namedExportsOrder,d as default};