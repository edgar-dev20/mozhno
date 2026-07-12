import{c as e,i as t}from"./preload-helper-B45gAKPr.js";import{V as n}from"./iframe-CdpC400m.js";import{t as r}from"./jsx-runtime-BBQGix-2.js";import{r as i,t as a}from"./DateRangePicker-DfmtBCn_.js";function o(e){let[t,n]=(0,s.useState)(null),[r,i]=(0,s.useState)(null);return(0,c.jsx)(a,{from:t,to:r,onChange:(e,t)=>{n(e??null),i(t??null)},placeholder:`Select date range`,...e})}var s,c,l,u,d,f,p,m,h;t((()=>{s=e(n(),1),i(),c=r(),{within:l,expect:u}=__STORYBOOK_MODULE_TEST__,d={title:`Shared/DateRangePicker`,component:a,tags:[`autodocs`]},f={render:()=>(0,c.jsx)(o,{}),play:async({canvasElement:e})=>{await u(l(e).getByRole(`button`,{name:/Select date range/i})).toBeInTheDocument()}},p={render:()=>(0,c.jsx)(o,{presets:!0})},m={render:()=>{function e(){let[e,t]=(0,s.useState)(new Date(2026,5,1)),[n,r]=(0,s.useState)(new Date(2026,5,15));return(0,c.jsx)(a,{from:e,to:n,onChange:(e,n)=>{t(e??null),r(n??null)},placeholder:`Select date range`})}return(0,c.jsx)(e,{})}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: () => <Demo />,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', {
      name: /Select date range/i
    })).toBeInTheDocument();
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => <Demo presets />
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => {
    function D() {
      const [f, sf] = useState<Date | null>(new Date(2026, 5, 1));
      const [t, st] = useState<Date | null>(new Date(2026, 5, 15));
      return <DateRangePicker from={f} to={t} onChange={(ff, tt) => {
        sf(ff ?? null);
        st(tt ?? null);
      }} placeholder="Select date range" />;
    }
    return <D />;
  }
}`,...m.parameters?.docs?.source}}},h=[`Default`,`WithPresets`,`WithRange`]}))();export{f as Default,p as WithPresets,m as WithRange,h as __namedExportsOrder,d as default};