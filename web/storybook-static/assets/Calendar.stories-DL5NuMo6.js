import{c as e,i as t}from"./preload-helper-B45gAKPr.js";import{V as n}from"./iframe-CdpC400m.js";import{t as r}from"./jsx-runtime-BBQGix-2.js";import{n as i,t as a}from"./calendar-Bwmd8YW5.js";function o({defaultValue:e}){let[t,n]=(0,s.useState)(e);return(0,c.jsx)(a,{mode:`single`,selected:t,onSelect:n})}var s,c,l,u,d,f,p,m,h;t((()=>{i(),s=e(n(),1),c=r(),{userEvent:l,within:u}=__STORYBOOK_MODULE_TEST__,d={title:`UI/Calendar`,component:a,tags:[`autodocs`]},f={render:()=>(0,c.jsx)(o,{})},p={render:()=>(0,c.jsx)(o,{defaultValue:new Date(2026,5,15)})},m={render:()=>(0,c.jsx)(o,{}),play:async({canvasElement:e})=>{let t=u(e).getAllByRole(`gridcell`).find(e=>!e.hasAttribute(`data-selected`)&&!e.hasAttribute(`disabled`));t&&await l.click(t)}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: () => <CalendarDemo />
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => <CalendarDemo defaultValue={new Date(2026, 5, 15)} />
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <CalendarDemo />,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const dayCells = canvas.getAllByRole('gridcell');
    const target = dayCells.find(b => !b.hasAttribute('data-selected') && !b.hasAttribute('disabled'));
    if (target) {
      await userEvent.click(target);
    }
  }
}`,...m.parameters?.docs?.source}}},h=[`Default`,`WithSelectedDate`,`SelectDate`]}))();export{f as Default,m as SelectDate,p as WithSelectedDate,h as __namedExportsOrder,d as default};