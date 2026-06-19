import{j as a}from"./jsx-runtime-D_zvdyIk.js";import{r as I}from"./iframe-DP-2tj83.js";import"./preload-helper-Ct5FWWRu.js";const u="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg==";function o(l){const[c,d]=I.useState(!1),m=()=>{d(!0)},{src:r,alt:g,style:t,className:i,...n}=l;return c?a.jsx("div",{className:`inline-block bg-gray-100 text-center align-middle ${i??""}`,style:t,children:a.jsx("div",{className:"flex items-center justify-center w-full h-full",children:a.jsx("img",{src:u,alt:"Error loading image",...n,"data-original-url":r})})}):a.jsx("img",{src:r,alt:g,className:i,style:t,...n,onError:m})}o.__docgenInfo={description:"",methods:[],displayName:"ImageWithFallback"};const b={title:"App/ImageWithFallback",component:o,tags:["autodocs"],parameters:{layout:"centered"}},e={args:{src:"https://github.com/shadcn.png",alt:"Avatar",className:"size-16 rounded-full"}},s={args:{src:"/nonexistent.png",alt:"Missing",className:"size-16 rounded-full bg-muted"}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  args: {
    src: "https://github.com/shadcn.png",
    alt: "Avatar",
    className: "size-16 rounded-full"
  }
}`,...e.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    src: "/nonexistent.png",
    alt: "Missing",
    className: "size-16 rounded-full bg-muted"
  }
}`,...s.parameters?.docs?.source}}};const h=["WithImage","Fallback"];export{s as Fallback,e as WithImage,h as __namedExportsOrder,b as default};
