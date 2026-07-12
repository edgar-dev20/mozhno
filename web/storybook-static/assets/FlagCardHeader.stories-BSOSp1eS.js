import{i as e}from"./preload-helper-B45gAKPr.js";import{n as t,t as n}from"./FlagCardHeader-HVYI-mHb.js";var r,i,a,o,s,c,l,u;e((()=>{t(),{fn:r}=__STORYBOOK_MODULE_TEST__,i={key:`new-checkout`,name:`New Checkout Flow`,description:`Enable the new checkout experience`,flagType:`boolean`,tags:[{tagId:1,tagName:`frontend`,tagColor:``,value:``},{tagId:2,tagName:`checkout`,tagColor:``,value:``}],flagId:1,environments:{1:{enabled:!0,percentage:50,segmentIds:[],strategyId:null,contextDefinitionId:null,contextValuesJson:null,lastUsedAt:null}},archived:!1,createdAt:`2026-01-15`,createdBy:`Anna`,archivedBy:null,archivedAt:null},a=[{id:1,name:`Production`},{id:2,name:`Staging`}],o={title:`App/Flags/FlagCardHeader`,component:n,tags:[`autodocs`]},s={args:{flag:i,expanded:!1,environments:a,tags:[],onToggleExpand:r(),onToggleFlag:r()}},c={args:{flag:i,expanded:!0,environments:a,tags:[],onToggleExpand:r(),onToggleFlag:r()}},l={args:{flag:{...i,archived:!0},expanded:!1,environments:a,tags:[],onToggleExpand:r(),onToggleFlag:r()}},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    flag: MOCK_FLAG,
    expanded: false,
    environments: MOCK_ENVS,
    tags: [],
    onToggleExpand: fn(),
    onToggleFlag: fn()
  }
}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    flag: MOCK_FLAG,
    expanded: true,
    environments: MOCK_ENVS,
    tags: [],
    onToggleExpand: fn(),
    onToggleFlag: fn()
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    flag: {
      ...MOCK_FLAG,
      archived: true
    },
    expanded: false,
    environments: MOCK_ENVS,
    tags: [],
    onToggleExpand: fn(),
    onToggleFlag: fn()
  }
}`,...l.parameters?.docs?.source}}},u=[`Collapsed`,`Expanded`,`Archived`]}))();export{l as Archived,s as Collapsed,c as Expanded,u as __namedExportsOrder,o as default};