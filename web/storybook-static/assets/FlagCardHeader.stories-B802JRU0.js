import{F as s}from"./FlagCardHeader-CAbU0W54.js";import"./jsx-runtime-D_zvdyIk.js";import"./switch-CJTTjVZ-.js";import"./iframe-DP-2tj83.js";import"./preload-helper-Ct5FWWRu.js";import"./index-Blarl-ku.js";import"./index-DlGP-Ght.js";import"./index-CG7t-1OX.js";import"./index-ZEUw8nZR.js";import"./index-BospHUp7.js";import"./index-Dm9-QcB_.js";import"./index-DLmYvlQ2.js";import"./utils-CNg2SYlS.js";import"./clsx-B-dksMZM.js";import"./chevron-up-CboIev3u.js";import"./createLucideIcon-AY_gplK-.js";import"./chevron-down-BvNauRpD.js";const{fn:r}=__STORYBOOK_MODULE_TEST__,t={key:"new-checkout",name:"New Checkout Flow",description:"Enable the new checkout experience",flagType:"boolean",tags:[{tagId:1,tagName:"frontend",tagValue:""},{tagId:2,tagName:"checkout",tagValue:""}],flagId:1,environments:{1:{enabled:!0,percentage:50,segmentIds:[],strategyId:null,contextDefinitionId:null,contextValuesJson:null,lastUsedAt:null}},archived:!1,createdAt:"2026-01-15",createdBy:"Anna",archivedBy:null,archivedAt:null},o=[{id:1,name:"Production"},{id:2,name:"Staging"}],E={title:"App/Flags/FlagCardHeader",component:s,tags:["autodocs"]},e={args:{flag:t,expanded:!1,environments:o,tags:[],onToggleFlag:r()}},a={args:{flag:t,expanded:!0,environments:o,tags:[],onToggleFlag:r()}},n={args:{flag:{...t,archived:!0},expanded:!1,environments:o,tags:[],onToggleFlag:r()}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  args: {
    flag: MOCK_FLAG,
    expanded: false,
    environments: MOCK_ENVS,
    tags: [],
    onToggleFlag: fn()
  }
}`,...e.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    flag: MOCK_FLAG,
    expanded: true,
    environments: MOCK_ENVS,
    tags: [],
    onToggleFlag: fn()
  }
}`,...a.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    flag: {
      ...MOCK_FLAG,
      archived: true
    },
    expanded: false,
    environments: MOCK_ENVS,
    tags: [],
    onToggleFlag: fn()
  }
}`,...n.parameters?.docs?.source}}};const S=["Collapsed","Expanded","Archived"];export{n as Archived,e as Collapsed,a as Expanded,S as __namedExportsOrder,E as default};
