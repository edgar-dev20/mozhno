import{c as e,i as t}from"./preload-helper-B45gAKPr.js";import{V as n}from"./iframe-CdpC400m.js";import{t as r}from"./jsx-runtime-BBQGix-2.js";import{pn as i}from"./lucide-react-Dw50eDdj.js";import{t as a}from"./icons-BLhiJp-6.js";import{i as o,t as s}from"./i18n-CNx_J3e1.js";import{d as c,f as l,h as u,m as d,n as f,p}from"./operators-Dnve1sBq.js";import{n as m,t as h}from"./ReachRules-D-OEA6HV.js";function g(e,t,n){if(!e)return[];try{let r=JSON.parse(e);return Array.isArray(r)?r.map(e=>{let r,i,a;typeof e==`object`&&e&&`op`in e?(r=e.cd??e.contextDefId??t??0,i=e.op??p.EQ,a=e.val??String(e.value??``)):(r=t??0,i=p.IN,a=String(e));let o=Array.isArray(n)?n.find(e=>e.id===r):void 0;return{contextDefId:r,operator:l(o?.type,i)?i:f(o?.type),value:a}}):[]}catch{return[]}}var _=t((()=>{c(),d()}));function v({percentage:e,segmentIds:t,contextDefinitionId:n,contextValuesJson:r,segments:a,contexts:s}){let c=o(),l=Math.max(0,Math.min(100,e??100)),d=(0,y.useMemo)(()=>{let e=[],i=g(r,n,s);i.length>0&&e.push({key:`custom`,kind:`custom`,name:c(`flags.customSource`),conditions:i.map(e=>{let t=s.find(t=>t.id===e.contextDefId),n=String(e.value??``),r=u(e.operator)?n.split(`,`).map(e=>e.trim()).filter(Boolean):n?[n]:[];return{field:t?.name??t?.key??c(`flags.activateContext`),operator:e.operator,contextType:t?.type,values:r}})});for(let n of t){let t=a.find(e=>e.id===n);t&&e.push({key:`seg-${t.id}`,kind:`segment`,name:t.name,color:t.color,icon:t.icon,conditions:(t.context??[]).map(e=>{let t=s.find(t=>t.id===e.contextDefinitionId);return{field:t?.name??c(`flags.activateContext`),operator:e.operator??p.IN,contextType:t?.type,values:(e.contextValues??``).split(`,`).map(e=>e.trim()).filter(Boolean)}})})}return e},[r,n,s,t,a,c]),f=d.length>0,m=l>=100&&!f;return(0,b.jsxs)(`div`,{className:`space-y-4`,children:[(0,b.jsxs)(`div`,{className:`flex items-center gap-4 rounded-xl border border-border bg-secondary/50 p-3.5`,children:[(0,b.jsxs)(`div`,{className:`relative shrink-0`,style:{width:64,height:64},children:[(0,b.jsxs)(`svg`,{viewBox:`0 0 36 36`,width:64,height:64,"aria-hidden":!0,children:[(0,b.jsx)(`circle`,{cx:`18`,cy:`18`,r:`15.9155`,fill:`none`,stroke:`var(--color-muted)`,strokeWidth:`3.5`}),(0,b.jsx)(`circle`,{cx:`18`,cy:`18`,r:`15.9155`,fill:`none`,stroke:`var(--color-brand)`,strokeWidth:`3.5`,strokeLinecap:`round`,strokeDasharray:`${l} 100`,transform:`rotate(-90 18 18)`})]}),(0,b.jsxs)(`span`,{className:`absolute inset-0 grid place-items-center text-body-sm font-bold tabular-nums`,children:[l,`%`]})]}),(0,b.jsxs)(`div`,{className:`min-w-0`,children:[(0,b.jsx)(`div`,{className:`text-body-sm font-semibold text-foreground`,children:m?c(`flags.activateReachEveryone`):c(`flags.activateReachPercent`,{pct:String(l)})}),!m&&(0,b.jsx)(`div`,{className:`text-caption text-muted-foreground mt-0.5`,children:c(f?`flags.activateReachRules`:`flags.activateReachAll`)})]})]}),f&&(0,b.jsxs)(`div`,{children:[(0,b.jsxs)(`div`,{className:`flex items-center gap-2 mb-2`,children:[(0,b.jsx)(i,{size:11,className:`text-muted-foreground/70`}),(0,b.jsxs)(`span`,{className:`text-caption font-semibold text-muted-foreground/70`,children:[c(`flags.activateRules`),` · `,d.length]}),(0,b.jsx)(`span`,{className:`h-px flex-1 bg-border`})]}),(0,b.jsx)(`div`,{className:`max-h-[42vh] overflow-y-auto -mr-1 pr-1`,children:(0,b.jsx)(h,{sources:d})})]})]})}var y,b,x=t((()=>{y=e(n(),1),_(),d(),a(),m(),s(),b=r(),v.__docgenInfo={description:`Reach-focused summary shown before enabling a flag in an environment that
requires activation approval: rollout ring + the reach rules (segments and
custom conditions) rendered with the shared {@link ReachRules} so it stays in
sync with the environment detail panel.`,methods:[],displayName:`ActivationConfirmDetails`,props:{percentage:{required:!0,tsType:{name:`number`},description:``},segmentIds:{required:!0,tsType:{name:`Array`,elements:[{name:`number`}],raw:`number[]`},description:``},contextDefinitionId:{required:!0,tsType:{name:`union`,raw:`number | null`,elements:[{name:`number`},{name:`null`}]},description:``},contextValuesJson:{required:!0,tsType:{name:`union`,raw:`string | null`,elements:[{name:`string`},{name:`null`}]},description:``},segments:{required:!0,tsType:{name:`Array`,elements:[{name:`SegmentResponse`}],raw:`SegmentResponse[]`},description:``},contexts:{required:!0,tsType:{name:`Array`,elements:[{name:`ContextDefinition`}],raw:`ContextDefinition[]`},description:``}}}})),S,C,w,T,E,D,O,k,A,j,M;t((()=>{x(),S=r(),C=(e,t,n,r,i=``,a=[])=>({id:e,projectId:1,name:t,description:i,icon:n,color:r,context:a,createdAt:`2025-01-01T00:00:00Z`}),w=[C(1,`Бета-пользователи`,`Rocket`,`#2d9484`,`раннее тестирование`,[{contextDefinitionId:12,operator:`eq`,contextValues:`pro`},{contextDefinitionId:14,operator:`lt`,contextValues:`2024-01-01`}]),C(2,`Внутренние сотрудники`,`Users`,`#6d5ae0`,`команда Mozhno`,[{contextDefinitionId:13,operator:`eq`,contextValues:`admin`}]),C(3,`Клиенты Pro`,`Crown`,`#c08140`,`платный тариф`,[{contextDefinitionId:10,operator:`in`,contextValues:`EU,US`}]),C(4,`QA-инженеры`,`Bug`,`#5a82a0`,`тестирование релизов`),C(5,`Ранний доступ`,`Star`,`#c05a52`,`early access`),C(6,`VIP-клиенты`,`Gem`,`#b89430`,`высокий LTV`),C(7,`Разработчики`,`Code`,`#4a8c5e`,`API-интеграторы`),C(8,`Маркетинг`,`Target`,`#9a4860`,`кампании`)],T=(e,t,n=`string`)=>({id:e,projectId:1,name:t,key:t,type:n,createdBy:null,description:``,isStrict:!1,validValues:[],createdAt:`2025-01-01T00:00:00Z`}),E=[T(10,`country`),T(11,`app_version`,`semver`),T(12,`plan`),T(13,`role`),T(14,`signup_date`,`time`),T(15,`email`)],D={title:`App/Flags/ActivationConfirmDetails`,component:v,tags:[`autodocs`],parameters:{layout:`centered`},decorators:[e=>(0,S.jsx)(`div`,{style:{width:440},className:`rounded-2xl border border-border bg-popover p-5`,children:(0,S.jsx)(e,{})})]},O={args:{percentage:25,segmentIds:[1,2,3],contextDefinitionId:null,contextValuesJson:JSON.stringify([{cd:10,op:`in`,val:`RU,KZ,BY`},{cd:11,op:`gte`,val:`2.4.0`}]),segments:w,contexts:E}},k={args:{percentage:60,segmentIds:[1,2,3,4,5,6,7,8],contextDefinitionId:null,contextValuesJson:JSON.stringify([{cd:10,op:`in`,val:`RU,KZ,BY,AM,GE,UZ,KG`},{cd:11,op:`gte`,val:`2.4.0`},{cd:12,op:`eq`,val:`pro`},{cd:13,op:`not_in`,val:`guest,anonymous`},{cd:14,op:`lt`,val:`2024-01-01`},{cd:15,op:`contains`,val:`@mozhno.dev`}]),segments:w,contexts:E}},A={args:{percentage:100,segmentIds:[],contextDefinitionId:null,contextValuesJson:null,segments:w,contexts:E}},j={args:{percentage:100,segmentIds:[],contextDefinitionId:null,contextValuesJson:JSON.stringify([{cd:12,op:`eq`,val:`pro`}]),segments:w,contexts:E}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    percentage: 25,
    segmentIds: [1, 2, 3],
    contextDefinitionId: null,
    contextValuesJson: JSON.stringify([{
      cd: 10,
      op: 'in',
      val: 'RU,KZ,BY'
    }, {
      cd: 11,
      op: 'gte',
      val: '2.4.0'
    }]),
    segments: SEGMENTS,
    contexts: CONTEXTS
  }
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    percentage: 60,
    segmentIds: [1, 2, 3, 4, 5, 6, 7, 8],
    contextDefinitionId: null,
    contextValuesJson: JSON.stringify([{
      cd: 10,
      op: 'in',
      val: 'RU,KZ,BY,AM,GE,UZ,KG'
    }, {
      cd: 11,
      op: 'gte',
      val: '2.4.0'
    }, {
      cd: 12,
      op: 'eq',
      val: 'pro'
    }, {
      cd: 13,
      op: 'not_in',
      val: 'guest,anonymous'
    }, {
      cd: 14,
      op: 'lt',
      val: '2024-01-01'
    }, {
      cd: 15,
      op: 'contains',
      val: '@mozhno.dev'
    }]),
    segments: SEGMENTS,
    contexts: CONTEXTS
  }
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    percentage: 100,
    segmentIds: [],
    contextDefinitionId: null,
    contextValuesJson: null,
    segments: SEGMENTS,
    contexts: CONTEXTS
  }
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  args: {
    percentage: 100,
    segmentIds: [],
    contextDefinitionId: null,
    contextValuesJson: JSON.stringify([{
      cd: 12,
      op: 'eq',
      val: 'pro'
    }]),
    segments: SEGMENTS,
    contexts: CONTEXTS
  }
}`,...j.parameters?.docs?.source}}},M=[`Typical`,`ManySegmentsAndConditions`,`Everyone`,`ConditionsOnly`]}))();export{j as ConditionsOnly,A as Everyone,k as ManySegmentsAndConditions,O as Typical,M as __namedExportsOrder,D as default};