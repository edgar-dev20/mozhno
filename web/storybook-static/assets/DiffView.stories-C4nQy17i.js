import{i as e}from"./preload-helper-B45gAKPr.js";import{n as t,t as n}from"./DiffView-BUDldGju.js";var r,i,a,o,s,c;e((()=>{t(),r={title:`App/DiffView`,component:n,tags:[`autodocs`],parameters:{layout:`padded`}},i=[{field:`name`,label:`Name`,before:`Old flag`,after:`New flag`,group:`General`},{field:`description`,label:`Description`,before:`Old description`,after:`New description`,group:`General`},{field:`percentage`,label:`Rollout percentage`,before:`50%`,after:`75%`,group:`Strategy`},{field:`constraint-1`,label:`Targeting rule`,before:`country IN ["US"]`,after:`country IN ["US", "CA"]`,group:`Constraints`},{field:`constraint-2`,label:`Targeting rule (removed)`,before:`platform IN ["ios"]`,after:``,group:`Constraints`},{field:`constraint-3`,label:`Targeting rule (added)`,before:``,after:`version >= "2.0"`,group:`Constraints`}],a={args:{changes:i}},o={args:{changes:[i[0]]}},s={args:{changes:[]}},a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    changes: sampleChanges
  }
}`,...a.parameters?.docs?.source}}},o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    changes: [sampleChanges[0]]
  }
}`,...o.parameters?.docs?.source}}},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    changes: []
  }
}`,...s.parameters?.docs?.source}}},c=[`WithGroups`,`SingleChange`,`Empty`]}))();export{s as Empty,o as SingleChange,a as WithGroups,c as __namedExportsOrder,r as default};