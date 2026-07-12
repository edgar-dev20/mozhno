import{i as e}from"./preload-helper-B45gAKPr.js";import{t}from"./jsx-runtime-BBQGix-2.js";import{a as n,r}from"./tooltip-BZCLYzA8.js";import{n as i,t as a}from"./InfoTip-CH5NV9d9.js";var o,s,c,l,u,d,f,p,m,h,g;e((()=>{i(),n(),o=t(),{within:s,expect:c}=__STORYBOOK_MODULE_TEST__,l={title:`Shared/InfoTip`,component:a,tags:[`autodocs`],decorators:[e=>(0,o.jsx)(r,{children:(0,o.jsx)(e,{})})],args:{text:`This metric shows the total count of evaluations.`}},u={play:async({canvasElement:e})=>{await c(s(e).getByRole(`button`)).toBeInTheDocument()}},d={args:{side:`top`}},f={args:{side:`bottom`}},p={args:{text:`This value represents the total number of feature flag evaluations performed across all environments in the last 30 days. Higher values indicate more active usage.`}},m={args:{size:16}},h={args:{className:`text-warning/60 hover:text-warning`}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const btn = canvas.getByRole('button');
    await expect(btn).toBeInTheDocument();
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    side: 'top'
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    side: 'bottom'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    text: 'This value represents the total number of feature flag evaluations performed across all environments in the last 30 days. Higher values indicate more active usage.'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    size: 16
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    className: 'text-warning/60 hover:text-warning'
  }
}`,...h.parameters?.docs?.source}}},g=[`Default`,`TopSide`,`BottomSide`,`LongText`,`CustomSize`,`CustomClass`]}))();export{f as BottomSide,h as CustomClass,m as CustomSize,u as Default,p as LongText,d as TopSide,g as __namedExportsOrder,l as default};