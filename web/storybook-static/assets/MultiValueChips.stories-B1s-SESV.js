import{c as e,i as t}from"./preload-helper-B45gAKPr.js";import{V as n}from"./iframe-CdpC400m.js";import{t as r}from"./jsx-runtime-BBQGix-2.js";import{n as i,t as a}from"./MultiValueChips-dvBAFAb6.js";function o(){let[e,t]=(0,l.useState)([]);return(0,u.jsx)(a,{values:e,onChange:t})}function s(){let[e,t]=(0,l.useState)([`US`,`CA`,`UK`]);return(0,u.jsx)(a,{values:e,onChange:t})}function c(){let[e,t]=(0,l.useState)([`US`]);return(0,u.jsx)(a,{values:e,onChange:t,validValues:[`US`,`CA`,`UK`,`DE`,`FR`]})}var l,u,d,f,p,m,h,g,_,v;t((()=>{i(),l=e(n(),1),u=r(),{userEvent:d,within:f,expect:p}=__STORYBOOK_MODULE_TEST__,m={title:`App/Flags/MultiValueChips`,component:a,tags:[`autodocs`]},h={render:o,play:async({canvasElement:e})=>{let t=f(e).getByRole(`textbox`);await p(t).toBeInTheDocument(),await d.type(t,`FR`),await d.keyboard(`{Enter}`)}},g={render:s,play:async({canvasElement:e})=>{let t=f(e);await p(t.getByText(`US`)).toBeInTheDocument(),await p(t.getByText(`CA`)).toBeInTheDocument(),await p(t.getByText(`UK`)).toBeInTheDocument()}},_={render:c},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: EmptyRender,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox');
    await expect(input).toBeInTheDocument();
    await userEvent.type(input, 'FR');
    await userEvent.keyboard('{Enter}');
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: WithValuesRender,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('US')).toBeInTheDocument();
    await expect(canvas.getByText('CA')).toBeInTheDocument();
    await expect(canvas.getByText('UK')).toBeInTheDocument();
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: WithValidValuesRender
}`,..._.parameters?.docs?.source}}},v=[`Empty`,`WithValues`,`WithValidValues`]}))();export{h as Empty,_ as WithValidValues,g as WithValues,v as __namedExportsOrder,m as default};