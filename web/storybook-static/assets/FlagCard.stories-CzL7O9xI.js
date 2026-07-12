import{c as e,i as t}from"./preload-helper-B45gAKPr.js";import{V as n}from"./iframe-CdpC400m.js";import{t as r}from"./jsx-runtime-BBQGix-2.js";import{n as i,r as a,t as o}from"./react-XGT-EfdR.js";import{n as s,t as c}from"./FlagCardHeader-HVYI-mHb.js";import{n as l,t as u}from"./FlagCardDetail-Dy1cHWs6.js";var d,f,p,m=t((()=>{d=e(n(),1),o(),s(),l(),f=r(),p=(0,d.memo)(function(e){let{flag:t,expanded:n,onToggleExpand:r}=e,o=(0,d.useCallback)(()=>r(t.key),[r,t.key]);return(0,f.jsxs)(i.div,{initial:{opacity:0,y:12},animate:{opacity:1,y:0},exit:{opacity:0,x:-20},transition:{duration:.2},layout:!0,className:`group bg-card rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden ${t.archived?`opacity-50 grayscale-[0.3]`:``}`,id:`flag-card-${t.key}`,children:[(0,f.jsx)(`div`,{className:`flex items-center gap-1.5 sm:gap-4 px-2 sm:px-4 py-2 sm:py-3`,children:(0,f.jsx)(c,{flag:t,expanded:n,onToggleExpand:o,environments:e.environments,tags:e.tags,onToggleFlag:e.onToggleFlag})}),(0,f.jsx)(a,{initial:!1,children:n&&(0,f.jsx)(i.div,{id:`flag-card-detail-${t.key}`,role:`region`,"aria-labelledby":`flag-card-header-${t.key}`,initial:{height:0,opacity:0},animate:{height:`auto`,opacity:1},exit:{height:0,opacity:0},transition:{duration:.25,ease:`easeInOut`},className:`overflow-hidden`,children:(0,f.jsx)(u,{flag:t,environments:e.environments,segments:e.segments,tags:e.tags,sparklineData:e.sparklineData,onOpenGeneral:e.onOpenGeneral,onOpenEnvironment:e.onOpenEnvironment,onToggleFlag:e.onToggleFlag,onMetricsClick:e.onMetricsClick})})})]},t.key)}),p.__docgenInfo={description:``,methods:[],displayName:`FlagCard`,props:{flag:{required:!0,tsType:{name:`FlagView`},description:``},expanded:{required:!0,tsType:{name:`boolean`},description:``},onToggleExpand:{required:!0,tsType:{name:`signature`,type:`function`,raw:`(key: string) => void`,signature:{arguments:[{type:{name:`string`},name:`key`}],return:{name:`void`}}},description:``},onOpenGeneral:{required:!0,tsType:{name:`signature`,type:`function`,raw:`(flag: FlagView) => void`,signature:{arguments:[{type:{name:`FlagView`},name:`flag`}],return:{name:`void`}}},description:``},onOpenEnvironment:{required:!0,tsType:{name:`signature`,type:`function`,raw:`(flag: FlagView, envId: number) => void`,signature:{arguments:[{type:{name:`FlagView`},name:`flag`},{type:{name:`number`},name:`envId`}],return:{name:`void`}}},description:``},onToggleFlag:{required:!0,tsType:{name:`signature`,type:`function`,raw:`(flag: FlagView, envId: number) => void`,signature:{arguments:[{type:{name:`FlagView`},name:`flag`},{type:{name:`number`},name:`envId`}],return:{name:`void`}}},description:``},onMetricsClick:{required:!0,tsType:{name:`signature`,type:`function`,raw:`(flagId: number, flagName: string, envId: number) => void`,signature:{arguments:[{type:{name:`number`},name:`flagId`},{type:{name:`string`},name:`flagName`},{type:{name:`number`},name:`envId`}],return:{name:`void`}}},description:``},environments:{required:!0,tsType:{name:`Array`,elements:[{name:`signature`,type:`object`,raw:`{ id: number; name: string }`,signature:{properties:[{key:`id`,value:{name:`number`,required:!0}},{key:`name`,value:{name:`string`,required:!0}}]}}],raw:`{ id: number; name: string }[]`},description:``},segments:{required:!0,tsType:{name:`Array`,elements:[{name:`SegmentResponse`}],raw:`SegmentResponse[]`},description:``},tags:{required:!0,tsType:{name:`Array`,elements:[{name:`TagType`}],raw:`TagType[]`},description:``},sparklineData:{required:!0,tsType:{name:`Map`,elements:[{name:`string`},{name:`Array`,elements:[{name:`signature`,type:`object`,raw:`{ trueCount: number; falseCount: number; timeBucket: string }`,signature:{properties:[{key:`trueCount`,value:{name:`number`,required:!0}},{key:`falseCount`,value:{name:`number`,required:!0}},{key:`timeBucket`,value:{name:`string`,required:!0}}]}}],raw:`{ trueCount: number; falseCount: number; timeBucket: string }[]`}],raw:`Map<string, { trueCount: number; falseCount: number; timeBucket: string }[]>`},description:``}}}})),h,g,_,v,y,b,x,S,C,w,T,E;t((()=>{m(),{fn:h,userEvent:g,within:_,expect:v}=__STORYBOOK_MODULE_TEST__,y={key:`new-checkout`,name:`New Checkout Flow`,description:`Enable the new checkout experience for selected users`,flagType:`boolean`,tags:[{tagId:1,tagName:`frontend`,tagColor:``,value:``},{tagId:2,tagName:`checkout`,tagColor:``,value:``}],flagId:1,environments:{1:{enabled:!0,percentage:50,segmentIds:[],strategyId:null,contextDefinitionId:null,contextValuesJson:null,lastUsedAt:null},2:{enabled:!1,percentage:0,segmentIds:[],strategyId:null,contextDefinitionId:null,contextValuesJson:null,lastUsedAt:null}},archived:!1,createdAt:`2026-01-15T10:30:00Z`,createdBy:`Anna Lee`,archivedBy:null,archivedAt:null},b=[{id:1,name:`Production`},{id:2,name:`Staging`}],x=new Map,S={title:`App/Flags/FlagCard`,component:p,tags:[`autodocs`]},C={args:{flag:y,expanded:!1,onToggleExpand:h(),onOpenGeneral:h(),onOpenEnvironment:h(),onToggleFlag:h(),onMetricsClick:h(),environments:b,segments:[],tags:[],sparklineData:x},play:async({canvasElement:e,args:t})=>{let n=_(e).getByRole(`button`,{name:/new-checkout/i});await v(n).toBeInTheDocument(),await g.click(n),await v(t.onToggleExpand).toHaveBeenCalledWith(`new-checkout`)}},w={args:{flag:y,expanded:!0,onToggleExpand:h(),onOpenGeneral:h(),onOpenEnvironment:h(),onToggleFlag:h(),onMetricsClick:h(),environments:b,segments:[],tags:[],sparklineData:x},play:async({canvasElement:e})=>{await v(_(e).getByRole(`region`)).toBeInTheDocument()}},T={args:{flag:{...y,archived:!0},expanded:!1,onToggleExpand:h(),onOpenGeneral:h(),onOpenEnvironment:h(),onToggleFlag:h(),onMetricsClick:h(),environments:b,segments:[],tags:[],sparklineData:x}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    flag: MOCK_FLAG,
    expanded: false,
    onToggleExpand: fn(),
    onOpenGeneral: fn(),
    onOpenEnvironment: fn(),
    onToggleFlag: fn(),
    onMetricsClick: fn(),
    environments: MOCK_ENVIRONMENTS,
    segments: [],
    tags: [],
    sparklineData: MOCK_SPARKLINE
  },
  play: async ({
    canvasElement,
    args
  }) => {
    const canvas = within(canvasElement);
    const toggleBtn = canvas.getByRole('button', {
      name: /new-checkout/i
    });
    await expect(toggleBtn).toBeInTheDocument();
    await userEvent.click(toggleBtn);
    await expect(args.onToggleExpand).toHaveBeenCalledWith('new-checkout');
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    flag: MOCK_FLAG,
    expanded: true,
    onToggleExpand: fn(),
    onOpenGeneral: fn(),
    onOpenEnvironment: fn(),
    onToggleFlag: fn(),
    onMetricsClick: fn(),
    environments: MOCK_ENVIRONMENTS,
    segments: [],
    tags: [],
    sparklineData: MOCK_SPARKLINE
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const detail = canvas.getByRole('region');
    await expect(detail).toBeInTheDocument();
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    flag: {
      ...MOCK_FLAG,
      archived: true
    },
    expanded: false,
    onToggleExpand: fn(),
    onOpenGeneral: fn(),
    onOpenEnvironment: fn(),
    onToggleFlag: fn(),
    onMetricsClick: fn(),
    environments: MOCK_ENVIRONMENTS,
    segments: [],
    tags: [],
    sparklineData: MOCK_SPARKLINE
  }
}`,...T.parameters?.docs?.source}}},E=[`ActiveFlag`,`Expanded`,`Archived`]}))();export{C as ActiveFlag,T as Archived,w as Expanded,E as __namedExportsOrder,S as default};