import{i as e}from"./preload-helper-B45gAKPr.js";import{t}from"./jsx-runtime-BBQGix-2.js";import{i as n,n as r,r as i,t as a}from"./popover-C1qqfAKH.js";import{n as o,t as s}from"./label-B7np1VYM.js";import{n as c,t as l}from"./input-AmHFZmeF.js";function u(){return(0,d.jsxs)(a,{children:[(0,d.jsx)(i,{className:`inline-flex items-center px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium`,children:`Open Popover`}),(0,d.jsx)(r,{className:`w-80`,children:(0,d.jsxs)(`div`,{className:`grid gap-4`,children:[(0,d.jsx)(`h4`,{className:`font-medium leading-none`,children:`Dimensions`}),(0,d.jsx)(`p`,{className:`text-xs text-muted-foreground`,children:`Set the dimensions for the layer.`}),(0,d.jsxs)(`div`,{className:`grid grid-cols-3 items-center gap-4`,children:[(0,d.jsx)(s,{htmlFor:`width`,children:`Width`}),(0,d.jsx)(l,{id:`width`,defaultValue:`100%`,className:`col-span-2 h-8`})]})]})})]})}var d,f,p,m,h,g,_,v,y;e((()=>{n(),o(),c(),d=t(),{userEvent:f,within:p,expect:m,screen:h}=__STORYBOOK_MODULE_TEST__,g={title:`UI/Popover`,component:a,tags:[`autodocs`]},_={render:()=>(0,d.jsx)(u,{}),play:async({canvasElement:e})=>{let t=p(e);await f.click(t.getByRole(`button`,{name:`Open Popover`})),await m(h.getByText(`Dimensions`)).toBeVisible()}},v={render:()=>(0,d.jsx)(u,{})},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: () => <PopoverDemo />,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', {
      name: 'Open Popover'
    }));
    await expect(screen.getByText('Dimensions')).toBeVisible();
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: () => <PopoverDemo />
}`,...v.parameters?.docs?.source}}},y=[`Default`,`CloseOnEscape`]}))();export{v as CloseOnEscape,_ as Default,y as __namedExportsOrder,g as default};