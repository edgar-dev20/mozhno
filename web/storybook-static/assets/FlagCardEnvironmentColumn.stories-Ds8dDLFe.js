import{i as e}from"./preload-helper-B45gAKPr.js";import{n as t,t as n}from"./FlagCardEnvironmentColumn-D-Yg8r_4.js";var r,i,a,o,s,c;e((()=>{t(),{fn:r}=__STORYBOOK_MODULE_TEST__,i={key:`new-checkout`,name:`New Checkout Flow`,description:``,flagType:`boolean`,tags:[],flagId:1,environments:{1:{enabled:!0,percentage:50,segmentIds:[],strategyId:null,contextDefinitionId:null,contextValuesJson:null,lastUsedAt:null}},archived:!1,createdAt:`2026-01-15T10:30:00Z`,createdBy:`Anna Lee`,archivedBy:null,archivedAt:null},a={title:`App/Flags/FlagCardEnvironmentColumn`,component:n,tags:[`autodocs`]},o={args:{env:{id:1,name:`Production`},flag:i,segments:[],sparkBuckets:[],onOpenEnvironment:r(),onToggleFlag:r(),onMetricsClick:r()}},s={args:{env:{id:2,name:`Staging`},flag:i,segments:[],sparkBuckets:[],onOpenEnvironment:r(),onToggleFlag:r(),onMetricsClick:r()}},o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    env: {
      id: 1,
      name: 'Production'
    },
    flag: MOCK_FLAG,
    segments: [],
    sparkBuckets: [],
    onOpenEnvironment: fn(),
    onToggleFlag: fn(),
    onMetricsClick: fn()
  }
}`,...o.parameters?.docs?.source}}},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    env: {
      id: 2,
      name: 'Staging'
    },
    flag: MOCK_FLAG,
    segments: [],
    sparkBuckets: [],
    onOpenEnvironment: fn(),
    onToggleFlag: fn(),
    onMetricsClick: fn()
  }
}`,...s.parameters?.docs?.source}}},c=[`Production`,`Staging`]}))();export{o as Production,s as Staging,c as __namedExportsOrder,a as default};