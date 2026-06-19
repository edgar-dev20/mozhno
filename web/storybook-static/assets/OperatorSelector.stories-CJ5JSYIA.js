import{j as s}from"./jsx-runtime-D_zvdyIk.js";import{r as l}from"./iframe-DP-2tj83.js";import{O as o}from"./OperatorSelector-bHzo7ixV.js";import"./preload-helper-Ct5FWWRu.js";import"./operators-BlP0D0Tj.js";import"./index-BoGZsUNS.js";const n=[{value:"eq",label:"Equals"},{value:"ne",label:"Not Equals"},{value:"in",label:"In",multi:!0},{value:"notIn",label:"Not In",multi:!0},{value:"contains",label:"Contains"}],p=[{value:"eq",label:"Equals"},{value:"ne",label:"Not Equals"},{value:"gt",label:"Greater Than"},{value:"gte",label:"Greater or Equal"},{value:"lt",label:"Less Than"},{value:"lte",label:"Less or Equal"}],b={title:"App/OperatorSelector",component:o,tags:["autodocs"]},e={render:()=>{const[t,a]=l.useState("eq");return s.jsx(o,{availableOps:n,currentOperator:t,onSelect:a})}},r={render:()=>{const[t,a]=l.useState("gt");return s.jsx(o,{availableOps:p,currentOperator:t,onSelect:a})}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [op, setOp] = useState("eq");
    return <OperatorSelector availableOps={STRING_OPS} currentOperator={op} onSelect={setOp} />;
  }
}`,...e.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [op, setOp] = useState("gt");
    return <OperatorSelector availableOps={COMPARABLE_OPS} currentOperator={op} onSelect={setOp} />;
  }
}`,...r.parameters?.docs?.source}}};const v=["StringOps","ComparableOps"];export{r as ComparableOps,e as StringOps,v as __namedExportsOrder,b as default};
