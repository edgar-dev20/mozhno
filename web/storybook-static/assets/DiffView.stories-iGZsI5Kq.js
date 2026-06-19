import{D as s}from"./DiffView-BrKXYSM-.js";import"./jsx-runtime-D_zvdyIk.js";import"./iframe-DP-2tj83.js";import"./preload-helper-Ct5FWWRu.js";import"./index-BoGZsUNS.js";import"./proxy-P4gg3xAH.js";const g={title:"Components/DiffView",component:s,parameters:{layout:"padded"}},o=[{field:"name",label:"Name",before:"Old flag",after:"New flag",group:"General"},{field:"description",label:"Description",before:"Old description",after:"New description",group:"General"},{field:"percentage",label:"Rollout percentage",before:"50%",after:"75%",group:"Strategy"},{field:"constraint-1",label:"Targeting rule",before:'country IN ["US"]',after:'country IN ["US", "CA"]',group:"Constraints"},{field:"constraint-2",label:"Targeting rule (removed)",before:'platform IN ["ios"]',after:"",group:"Constraints"},{field:"constraint-3",label:"Targeting rule (added)",before:"",after:'version >= "2.0"',group:"Constraints"}],e={args:{changes:o}},r={args:{changes:[o[0]]}},a={args:{changes:[]}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  args: {
    changes: sampleChanges
  }
}`,...e.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    changes: [sampleChanges[0]]
  }
}`,...r.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    changes: []
  }
}`,...a.parameters?.docs?.source}}};const m=["WithGroups","SingleChange","Empty"];export{a as Empty,r as SingleChange,e as WithGroups,m as __namedExportsOrder,g as default};
