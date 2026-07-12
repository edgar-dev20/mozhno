import{i as e}from"./preload-helper-B45gAKPr.js";import{t}from"./jsx-runtime-BBQGix-2.js";import{a as n,i as r,n as i,o as a,r as o,t as s}from"./select-BPA4gds6.js";function c({placeholder:e=`Select...`,disabled:t=!1}){return(0,l.jsxs)(s,{disabled:t,children:[(0,l.jsx)(r,{className:`w-[200px]`,children:(0,l.jsx)(n,{placeholder:e})}),(0,l.jsx)(i,{children:h.map(e=>(0,l.jsx)(o,{value:e,children:e},e))})]})}var l,u,d,f,p,m,h,g,_,v,y,b;e((()=>{a(),l=t(),{userEvent:u,within:d,expect:f,screen:p}=__STORYBOOK_MODULE_TEST__,m={title:`UI/Select`,component:s,tags:[`autodocs`]},h=[`Option A`,`Option B`,`Option C`,`Option D`],g={render:()=>(0,l.jsx)(c,{})},_={render:()=>(0,l.jsx)(c,{disabled:!0})},v={render:()=>(0,l.jsxs)(s,{defaultValue:`Option B`,children:[(0,l.jsx)(r,{className:`w-[200px]`,children:(0,l.jsx)(n,{})}),(0,l.jsx)(i,{children:h.map(e=>(0,l.jsx)(o,{value:e,children:e},e))})]})},y={render:()=>(0,l.jsx)(c,{placeholder:`Open me`}),play:async({canvasElement:e})=>{let t=d(e);await u.click(t.getByRole(`combobox`)),await f(p.getByText(`Option A`)).toBeVisible()}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => <SelectDemo />
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: () => <SelectDemo disabled />
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: () => <Select defaultValue="Option B">\r
      <SelectTrigger className="w-[200px]">\r
        <SelectValue />\r
      </SelectTrigger>\r
      <SelectContent>\r
        {OPTIONS.map(o => <SelectItem key={o} value={o}>\r
            {o}\r
          </SelectItem>)}\r
      </SelectContent>\r
    </Select>
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => <SelectDemo placeholder="Open me" />,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('combobox'));
    await expect(screen.getByText('Option A')).toBeVisible();
  }
}`,...y.parameters?.docs?.source}}},b=[`Default`,`Disabled`,`WithDefaultValue`,`OpenSelect`]}))();export{g as Default,_ as Disabled,y as OpenSelect,v as WithDefaultValue,b as __namedExportsOrder,m as default};