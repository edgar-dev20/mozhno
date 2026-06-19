import{j as S}from"./jsx-runtime-D_zvdyIk.js";import{r as i,d as O}from"./iframe-DP-2tj83.js";import"./index-ZEUw8nZR.js";import{c as H}from"./utils-CNg2SYlS.js";import{c as $}from"./index-B8k91cqS.js";import"./preload-helper-Ct5FWWRu.js";import"./index-BospHUp7.js";import"./clsx-B-dksMZM.js";function j(t,e,{checkForDefaultPrevented:n=!0}={}){return function(o){if(t?.(o),n===!1||!o.defaultPrevented)return e?.(o)}}var k=globalThis?.document?i.useLayoutEffect:()=>{},D=O[" useInsertionEffect ".trim().toString()]||k;function I({prop:t,defaultProp:e,onChange:n=()=>{},caller:a}){const[o,r,s]=N({defaultProp:e,onChange:n}),c=t!==void 0,l=c?t:o;{const u=i.useRef(t!==void 0);i.useEffect(()=>{const d=u.current;d!==c&&console.warn(`${a} is changing from ${d?"controlled":"uncontrolled"} to ${c?"controlled":"uncontrolled"}. Components should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled value for the lifetime of the component.`),u.current=c},[c,a])}const m=i.useCallback(u=>{if(c){const d=L(u)?u(t):u;d!==t&&s.current?.(d)}else r(u)},[c,t,r,s]);return[l,m]}function N({defaultProp:t,onChange:e}){const[n,a]=i.useState(t),o=i.useRef(n),r=i.useRef(e);return D(()=>{r.current=e},[e]),i.useEffect(()=>{o.current!==n&&(r.current?.(n),o.current=n)},[n,o]),[n,a,r]}function L(t){return typeof t=="function"}function P(t,e){if(typeof t=="function")return t(e);t!=null&&(t.current=e)}function V(...t){return e=>{let n=!1;const a=t.map(o=>{const r=P(o,e);return!n&&typeof r=="function"&&(n=!0),r});if(n)return()=>{for(let o=0;o<a.length;o++){const r=a[o];typeof r=="function"?r():P(t[o],null)}}}}function z(...t){return i.useCallback(V(...t),t)}function W(t){const e=i.forwardRef((n,a)=>{let{children:o,...r}=n,s=null,c=!1;const l=[];_(o)&&typeof b=="function"&&(o=b(o._payload)),i.Children.forEach(o,v=>{if(Z(v)){c=!0;const p=v;let g="child"in p.props?p.props.child:p.props.children;_(g)&&typeof b=="function"&&(g=b(g._payload)),s=U(p,g),l.push(s?.props?.children)}else l.push(v)}),s?s=i.cloneElement(s,void 0,l):!c&&i.Children.count(o)===1&&i.isValidElement(o)&&(s=o);const m=s?M(s):void 0,u=z(a,m);if(!s){if(o||o===0)throw new Error(c?J(t):G(t));return o}const d=Y(r,s.props??{});return s.type!==i.Fragment&&(d.ref=a?u:m),i.cloneElement(s,d)});return e.displayName=`${t}.Slot`,e}var F=Symbol.for("radix.slottable"),U=(t,e)=>{if("child"in t.props){const n=t.props.child;return i.isValidElement(n)?i.cloneElement(n,void 0,t.props.children(n.props.children)):null}return i.isValidElement(e)?e:null};function Y(t,e){const n={...e};for(const a in e){const o=t[a],r=e[a];/^on[A-Z]/.test(a)?o&&r?n[a]=(...c)=>{const l=r(...c);return o(...c),l}:o&&(n[a]=o):a==="style"?n[a]={...o,...r}:a==="className"&&(n[a]=[o,r].filter(Boolean).join(" "))}return{...t,...n}}function M(t){let e=Object.getOwnPropertyDescriptor(t.props,"ref")?.get,n=e&&"isReactWarning"in e&&e.isReactWarning;return n?t.ref:(e=Object.getOwnPropertyDescriptor(t,"ref")?.get,n=e&&"isReactWarning"in e&&e.isReactWarning,n?t.props.ref:t.props.ref||t.ref)}function Z(t){return i.isValidElement(t)&&typeof t.type=="function"&&"__radixId"in t.type&&t.type.__radixId===F}var K=Symbol.for("react.lazy");function _(t){return t!=null&&typeof t=="object"&&"$$typeof"in t&&t.$$typeof===K&&"_payload"in t&&q(t._payload)}function q(t){return typeof t=="object"&&t!==null&&"then"in t}var G=t=>`${t} failed to slot onto its children. Expected a single React element child or \`Slottable\`.`,J=t=>`${t} failed to slot onto its \`Slottable\`. Expected \`Slottable\` to receive a single React element child.`,b=O[" use ".trim().toString()],Q=["a","button","div","form","h2","h3","img","input","label","li","nav","ol","p","select","span","svg","ul"],X=Q.reduce((t,e)=>{const n=W(`Primitive.${e}`),a=i.forwardRef((o,r)=>{const{asChild:s,...c}=o,l=s?n:e;return typeof window<"u"&&(window[Symbol.for("radix-ui")]=!0),S.jsx(l,{...c,ref:r})});return a.displayName=`Primitive.${e}`,{...t,[e]:a}},{}),A="Toggle",T=i.forwardRef((t,e)=>{const{pressed:n,defaultPressed:a,onPressedChange:o,...r}=t,[s,c]=I({prop:n,onChange:o,defaultProp:a??!1,caller:A});return S.jsx(X.button,{type:"button","aria-pressed":s,"data-state":s?"on":"off","data-disabled":t.disabled?"":void 0,...r,ref:e,onClick:j(t.onClick,()=>{t.disabled||c(!s)})})});T.displayName=A;var tt=T;const et=$("inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium hover:bg-muted hover:text-muted-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none transition-[color,box-shadow] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive whitespace-nowrap",{variants:{variant:{default:"bg-transparent",outline:"border border-input bg-transparent hover:bg-accent hover:text-accent-foreground"},size:{default:"h-9 px-2 min-w-9",sm:"h-8 px-1.5 min-w-8",lg:"h-10 px-2.5 min-w-10"}},defaultVariants:{variant:"default",size:"default"}});function B({className:t,variant:e,size:n,...a}){return S.jsx(tt,{"data-slot":"toggle",className:H(et({variant:e,size:n,className:t})),...a})}B.__docgenInfo={description:"",methods:[],displayName:"Toggle"};const{userEvent:C,within:x,expect:f}=__STORYBOOK_MODULE_TEST__,ut={title:"UI/Toggle",component:B,tags:["autodocs"]},y={play:async({canvasElement:t})=>{const e=x(t);await f(e.getByRole("button")).toHaveAttribute("data-state","off")}},h={args:{defaultPressed:!0},play:async({canvasElement:t})=>{const e=x(t);await f(e.getByRole("button")).toHaveAttribute("data-state","on")}},E={play:async({canvasElement:t})=>{const n=x(t).getByRole("button");await f(n).toHaveAttribute("data-state","off"),await C.click(n),await f(n).toHaveAttribute("data-state","on"),await C.click(n),await f(n).toHaveAttribute("data-state","off")}},w={args:{disabled:!0},play:async({canvasElement:t})=>{const e=x(t);await f(e.getByRole("button")).toBeDisabled()}},R={args:{variant:"outline"}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button")).toHaveAttribute("data-state", "off");
  }
}`,...y.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    defaultPressed: true
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button")).toHaveAttribute("data-state", "on");
  }
}`,...h.parameters?.docs?.source}}};E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const btn = canvas.getByRole("button");
    await expect(btn).toHaveAttribute("data-state", "off");
    await userEvent.click(btn);
    await expect(btn).toHaveAttribute("data-state", "on");
    await userEvent.click(btn);
    await expect(btn).toHaveAttribute("data-state", "off");
  }
}`,...E.parameters?.docs?.source}}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button")).toBeDisabled();
  }
}`,...w.parameters?.docs?.source}}};R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "outline"
  }
}`,...R.parameters?.docs?.source}}};const dt=["Off","On","Press","Disabled","Outline"];export{w as Disabled,y as Off,h as On,R as Outline,E as Press,dt as __namedExportsOrder,ut as default};
