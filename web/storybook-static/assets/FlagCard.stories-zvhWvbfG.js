import{j as t}from"./jsx-runtime-D_zvdyIk.js";import{F as c}from"./FlagCardHeader-CAbU0W54.js";import{F as f}from"./FlagCardDetail-Ds8LsTHc.js";import{m as l}from"./proxy-P4gg3xAH.js";import{A as y}from"./index-ZoMgrOc5.js";import"./switch-CJTTjVZ-.js";import"./iframe-DP-2tj83.js";import"./preload-helper-Ct5FWWRu.js";import"./index-Blarl-ku.js";import"./index-DlGP-Ght.js";import"./index-CG7t-1OX.js";import"./index-ZEUw8nZR.js";import"./index-BospHUp7.js";import"./index-Dm9-QcB_.js";import"./index-DLmYvlQ2.js";import"./utils-CNg2SYlS.js";import"./clsx-B-dksMZM.js";import"./chevron-up-CboIev3u.js";import"./createLucideIcon-AY_gplK-.js";import"./chevron-down-BvNauRpD.js";import"./index-BoGZsUNS.js";import"./SectionHeader-CGpfFRTS.js";import"./EmptyState-D6H92AVS.js";import"./GradientButton-CH27CBnR.js";import"./index-B8k91cqS.js";import"./Card-p5k8IdW-.js";import"./plus-M3bQo8hz.js";import"./ColorBar-Dz6RbBbm.js";import"./color-DjGOQL3E.js";import"./FormField-5ubgD184.js";import"./SearchInput-DBiqj737.js";import"./search-CbAQyNKi.js";import"./DatePicker-Bn8rFz8w.js";import"./popover-jhuUCevL.js";import"./index-DFfz4Q0N.js";import"./index-bFwMlmfo.js";import"./index-BPFNws8-.js";import"./index-CAMMQXT4.js";import"./calendar-_LRDj-JW.js";import"./chevron-left-m3ZujCZM.js";import"./chevron-right-BszEaZmS.js";import"./dateLocales-7Y0nwtkZ.js";import"./ru-CA6g3apw.js";import"./calendar-DJxXczvZ.js";import"./x-mVRyscNr.js";import"./DateRangePicker-BjuGUhGC.js";import"./LoadingState-DhbSnyiM.js";import"./CardHeader-DxlzLXP5.js";import"./Hairline-3ylQqLyH.js";import"./StatusDot-B8L_v5mr.js";import"./TruncatedCopyTooltip-C6ZYFc_M.js";import"./tooltip-BkUNj6rz.js";import"./index-BGuRCeEQ.js";import"./check-w802uh_q.js";import"./copy-I_eZ0fxo.js";import"./ErrorBox-CeCAW9tj.js";import"./circle-alert-DivrImM0.js";import"./Badge-DHKv_eig.js";import"./ColorIcon-DtgF2SOA.js";import"./Wordmark-CThe34m0.js";import"./StatusIcon-Cp4fgCyv.js";import"./SkipLink-BsMpcwYy.js";import"./LazyPage-DF0IvSKX.js";import"./PageLoader-BAu-Rpx6.js";import"./DateTimePicker-BCv2yTZg.js";import"./clock-TUdZCYQg.js";import"./triangle-alert-DeGeZbCT.js";import"./format-Cgt4hbEb.js";import"./FlagCardEnvironmentColumn-DCHStfXV.js";import"./SegmentIcon-DkQ9sSdM.js";import"./users-Blla5i7Y.js";import"./archive-f7qCrrWa.js";import"./file-text-Ch9szPu4.js";import"./sun-BHuuSRr3.js";import"./server-CBC0kTHP.js";import"./circle-CZnpOI8P.js";import"./clipboard-DtvrHRJL.js";import"./code-xml-BWZ4wfzk.js";import"./info-CJ0-4IMJ.js";import"./log-out-CjRHivA-.js";import"./rocket-CDwC8TfS.js";import"./settings-0Gj3fZ64.js";import"./shield-off-DsZXNDhR.js";import"./trash-2-BR5abm66.js";import"./user-BmLmKehU.js";import"./webhook-gK1zpDJW.js";import"./zap-JWc6svXc.js";import"./FlagSparkline-Cca4Lf4K.js";function d(n){const{flag:r,expanded:g,onToggleExpand:u}=n;return t.jsxs(l.div,{initial:{opacity:0,y:12},animate:{opacity:1,y:0},exit:{opacity:0,x:-20},transition:{duration:.2},layout:!0,className:`group bg-card rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden ${r.archived?"opacity-50 grayscale-[0.3]":""}`,id:`flag-card-${r.key}`,children:[t.jsx("div",{className:"flex gap-2 sm:gap-4 px-3 sm:px-4 py-2 sm:py-3 cursor-pointer",onClick:u,children:t.jsx(c,{flag:r,expanded:g,environments:n.environments,tags:n.tags,onToggleFlag:n.onToggleFlag})}),t.jsx(y,{initial:!1,children:g&&t.jsx(l.div,{initial:{height:0,opacity:0},animate:{height:"auto",opacity:1},exit:{height:0,opacity:0},transition:{duration:.25,ease:"easeInOut"},className:"overflow-hidden",children:t.jsx(f,{flag:r,environments:n.environments,segments:n.segments,tags:n.tags,sparklineData:n.sparklineData,onOpenGeneral:n.onOpenGeneral,onOpenEnvironment:n.onOpenEnvironment,onToggleFlag:n.onToggleFlag,onMetricsClick:n.onMetricsClick})})})]},r.key)}d.__docgenInfo={description:"",methods:[],displayName:"FlagCard",props:{flag:{required:!0,tsType:{name:"FlagView"},description:""},expanded:{required:!0,tsType:{name:"boolean"},description:""},onToggleExpand:{required:!0,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:""},onOpenGeneral:{required:!0,tsType:{name:"signature",type:"function",raw:"(flag: FlagView) => void",signature:{arguments:[{type:{name:"FlagView"},name:"flag"}],return:{name:"void"}}},description:""},onOpenEnvironment:{required:!0,tsType:{name:"signature",type:"function",raw:"(flag: FlagView, envId: number) => void",signature:{arguments:[{type:{name:"FlagView"},name:"flag"},{type:{name:"number"},name:"envId"}],return:{name:"void"}}},description:""},onToggleFlag:{required:!0,tsType:{name:"signature",type:"function",raw:"(flag: FlagView, envId: number) => void",signature:{arguments:[{type:{name:"FlagView"},name:"flag"},{type:{name:"number"},name:"envId"}],return:{name:"void"}}},description:""},onMetricsClick:{required:!0,tsType:{name:"signature",type:"function",raw:"(flagId: number, flagName: string, envId: number) => void",signature:{arguments:[{type:{name:"number"},name:"flagId"},{type:{name:"string"},name:"flagName"},{type:{name:"number"},name:"envId"}],return:{name:"void"}}},description:""},environments:{required:!0,tsType:{name:"Array",elements:[{name:"signature",type:"object",raw:"{ id: number; name: string }",signature:{properties:[{key:"id",value:{name:"number",required:!0}},{key:"name",value:{name:"string",required:!0}}]}}],raw:"{ id: number; name: string }[]"},description:""},segments:{required:!0,tsType:{name:"Array",elements:[{name:"SegmentResponse"}],raw:"SegmentResponse[]"},description:""},tags:{required:!0,tsType:{name:"Array",elements:[{name:"TagType"}],raw:"TagType[]"},description:""},sparklineData:{required:!0,tsType:{name:"Map",elements:[{name:"string"},{name:"Array",elements:[{name:"signature",type:"object",raw:"{ trueCount: number; falseCount: number; timeBucket: string }",signature:{properties:[{key:"trueCount",value:{name:"number",required:!0}},{key:"falseCount",value:{name:"number",required:!0}},{key:"timeBucket",value:{name:"string",required:!0}}]}}],raw:"{ trueCount: number; falseCount: number; timeBucket: string }[]"}],raw:"Map<string, { trueCount: number; falseCount: number; timeBucket: string }[]>"},description:""}}};const{fn:e}=__STORYBOOK_MODULE_TEST__,m={key:"new-checkout",name:"New Checkout Flow",description:"Enable the new checkout experience for selected users",flagType:"boolean",tags:[{tagId:1,tagName:"frontend",tagValue:""},{tagId:2,tagName:"checkout",tagValue:""}],flagId:1,environments:{1:{enabled:!0,percentage:50,segmentIds:[],strategyId:null,contextDefinitionId:null,contextValuesJson:null,lastUsedAt:null},2:{enabled:!1,percentage:0,segmentIds:[],strategyId:null,contextDefinitionId:null,contextValuesJson:null,lastUsedAt:null}},archived:!1,createdAt:"2026-01-15T10:30:00Z",createdBy:"Anna Lee",archivedBy:null,archivedAt:null},s=[{id:1,name:"Production"},{id:2,name:"Staging"}],p=new Map,Qe={title:"App/FlagCard",component:d,tags:["autodocs"]},a={args:{flag:m,expanded:!1,onToggleExpand:e(),onOpenGeneral:e(),onOpenEnvironment:e(),onToggleFlag:e(),onMetricsClick:e(),environments:s,segments:[],tags:[],sparklineData:p}},i={args:{flag:m,expanded:!0,onToggleExpand:e(),onOpenGeneral:e(),onOpenEnvironment:e(),onToggleFlag:e(),onMetricsClick:e(),environments:s,segments:[],tags:[],sparklineData:p}},o={args:{flag:{...m,archived:!0},expanded:!1,onToggleExpand:e(),onOpenGeneral:e(),onOpenEnvironment:e(),onToggleFlag:e(),onMetricsClick:e(),environments:s,segments:[],tags:[],sparklineData:p}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
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
  }
}`,...a.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
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
  }
}`,...i.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
}`,...o.parameters?.docs?.source}}};const We=["ActiveFlag","Expanded","Archived"];export{a as ActiveFlag,o as Archived,i as Expanded,We as __namedExportsOrder,Qe as default};
