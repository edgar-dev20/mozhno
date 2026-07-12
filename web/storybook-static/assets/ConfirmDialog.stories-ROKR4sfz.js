import{c as e,i as t}from"./preload-helper-B45gAKPr.js";import{V as n}from"./iframe-CdpC400m.js";import{t as r}from"./jsx-runtime-BBQGix-2.js";import{D as i,T as a,Zt as o}from"./lucide-react-Dw50eDdj.js";import{t as s}from"./icons-BLhiJp-6.js";import{n as c,t as l}from"./utils-4UQB1yx_.js";import{i as u,t as d}from"./i18n-CNx_J3e1.js";import{t as f}from"./shared-Cf9mHzGo.js";import{t as p}from"./GradientButton-BKXQUskM.js";import{a as m,c as h,i as g,o as _,r as v,s as y,t as b,u as x}from"./alert-dialog-DoeJNRE4.js";import{n as S,t as C}from"./input-AmHFZmeF.js";function w({open:e,onOpenChange:t,title:n,description:r,confirmLabel:i=`common.delete`,cancelLabel:o=`common.cancel`,variant:s=`destructive`,onConfirm:c,loading:d=!1,children:f,wide:x=!1,confirmPhrase:S,icon:w}){let k=u(),A=(0,T.useId)(),[j,M]=(0,T.useState)(``),N=e=>{e||M(``),t(e)},P=O[s],F=s===`destructive`&&!!S,I=F&&j.trim()!==(S??``).trim(),L=d||I,R=e=>(0,E.jsx)(v,{className:e,children:k(o)}),z=(0,E.jsx)(p,{variant:D[s],size:`md`,loading:d,disabled:L,onClick:c,className:`text-body-sm`,children:k(i)});return f?(0,E.jsx)(b,{open:e,onOpenChange:N,children:(0,E.jsxs)(g,{className:x?`sm:max-w-3xl`:`sm:max-w-md`,children:[(0,E.jsxs)(y,{className:`gap-1.5 p-0 pb-5`,children:[(0,E.jsx)(h,{className:`text-h2 font-semibold text-foreground leading-tight`,children:n}),r&&(0,E.jsx)(m,{className:`text-body-sm text-muted-foreground leading-relaxed`,children:r})]}),(0,E.jsx)(`div`,{className:`min-w-0 overflow-hidden`,children:f}),(0,E.jsxs)(_,{className:`-mx-6 -mb-6 px-6 pt-4 pb-6 border-t border-border bg-secondary/50 rounded-b-xl gap-3 flex-row justify-end items-center`,children:[R(`h-9 px-4 gap-2 text-body-sm font-semibold text-foreground/80 bg-card border border-border rounded-lg hover:bg-accent hover:text-foreground transition-colors mt-0`),z]})]})}):s===`destructive`?(0,E.jsx)(b,{open:e,onOpenChange:N,children:(0,E.jsxs)(g,{className:`sm:max-w-md gap-0`,children:[(0,E.jsx)(y,{className:`gap-0 p-0`,children:(0,E.jsxs)(`div`,{className:`flex items-start gap-4`,children:[(0,E.jsx)(`span`,{className:`flex size-10 shrink-0 items-center justify-center rounded-lg border border-destructive/25 bg-destructive/10 text-destructive`,children:w??(0,E.jsx)(P,{className:`size-5`})}),(0,E.jsxs)(`div`,{className:`min-w-0 flex-1 space-y-1.5 pt-0.5`,children:[(0,E.jsx)(h,{className:`text-h3 font-semibold text-foreground leading-heading`,children:n}),r&&(0,E.jsx)(m,{className:`text-body-sm text-muted-foreground leading-body`,children:r})]})]})}),(0,E.jsxs)(`div`,{className:`mt-5 space-y-4`,children:[(0,E.jsxs)(`div`,{className:`flex items-start gap-2.5 rounded-lg border border-destructive/15 bg-destructive/5 px-3.5 py-2.5`,children:[(0,E.jsx)(a,{className:`mt-0.5 size-4 shrink-0 text-destructive`}),(0,E.jsx)(`p`,{className:`text-caption leading-caption text-foreground/90`,children:k(`common.confirmDelete.irreversible`)})]}),F&&(0,E.jsxs)(`div`,{className:`space-y-2`,children:[(0,E.jsxs)(`label`,{htmlFor:A,className:`block text-body-sm text-muted-foreground leading-body`,children:[k(`common.confirmDelete.promptBefore`),` `,(0,E.jsx)(`code`,{className:`mx-0.5 rounded bg-muted px-1.5 py-0.5 font-mono text-caption font-bold text-foreground`,children:S}),` `,k(`common.confirmDelete.promptAfter`)]}),(0,E.jsx)(C,{id:A,value:j,onChange:e=>M(e.target.value),placeholder:S,autoComplete:`off`,autoCapitalize:`off`,spellCheck:!1,className:`font-mono`})]})]}),(0,E.jsxs)(_,{className:`mt-5 pt-4 border-t border-border gap-3 flex-row justify-end items-center`,children:[R(`mt-0 h-9 px-4 gap-2 text-body-sm font-semibold text-foreground/80 bg-card border border-border rounded-lg hover:bg-accent hover:text-foreground transition-colors`),z]})]})}):(0,E.jsx)(b,{open:e,onOpenChange:N,children:(0,E.jsxs)(g,{className:`sm:max-w-sm gap-0 p-5`,children:[(0,E.jsxs)(y,{className:`gap-2 p-0`,children:[(0,E.jsxs)(`div`,{className:`flex items-center gap-2.5`,children:[(0,E.jsx)(`span`,{className:l(`flex size-7 shrink-0 items-center justify-center rounded-md border`,s===`warning`?`border-warning/20 bg-warning/10 text-warning`:`border-primary/20 bg-primary/10 text-primary`),children:w??(0,E.jsx)(P,{className:`size-4`})}),(0,E.jsx)(h,{className:`text-h3 font-semibold text-foreground leading-heading`,children:n})]}),r&&(0,E.jsx)(m,{className:`text-body-sm text-muted-foreground leading-body`,children:r})]}),(0,E.jsxs)(_,{className:`mt-5 gap-2 flex-row justify-end items-center`,children:[R(`mt-0 h-9 px-3 gap-2 text-body-sm font-semibold text-muted-foreground bg-transparent border-transparent shadow-none rounded-lg hover:bg-accent hover:text-foreground transition-colors`),z]})]})})}var T,E,D,O,k=t((()=>{T=e(n(),1),d(),f(),s(),S(),c(),x(),E=r(),D={destructive:`danger`,warning:`warning`,default:`primary`},O={destructive:i,warning:a,default:o},w.__docgenInfo={description:``,methods:[],displayName:`ConfirmDialog`,props:{open:{required:!0,tsType:{name:`boolean`},description:``},onOpenChange:{required:!0,tsType:{name:`signature`,type:`function`,raw:`(open: boolean) => void`,signature:{arguments:[{type:{name:`boolean`},name:`open`}],return:{name:`void`}}},description:``},title:{required:!0,tsType:{name:`string`},description:``},description:{required:!1,tsType:{name:`string`},description:``},confirmLabel:{required:!1,tsType:{name:`string`},description:``,defaultValue:{value:`'common.delete'`,computed:!1}},cancelLabel:{required:!1,tsType:{name:`string`},description:``,defaultValue:{value:`'common.cancel'`,computed:!1}},variant:{required:!1,tsType:{name:`union`,raw:`'destructive' | 'default' | 'warning'`,elements:[{name:`literal`,value:`'destructive'`},{name:`literal`,value:`'default'`},{name:`literal`,value:`'warning'`}]},description:``,defaultValue:{value:`'destructive'`,computed:!1}},onConfirm:{required:!0,tsType:{name:`signature`,type:`function`,raw:`() => void`,signature:{arguments:[],return:{name:`void`}}},description:``},loading:{required:!1,tsType:{name:`boolean`},description:``,defaultValue:{value:`false`,computed:!1}},children:{required:!1,tsType:{name:`ReactReactNode`,raw:`React.ReactNode`},description:``},wide:{required:!1,tsType:{name:`boolean`},description:``,defaultValue:{value:`false`,computed:!1}},confirmPhrase:{required:!1,tsType:{name:`string`},description:``},icon:{required:!1,tsType:{name:`ReactReactNode`,raw:`React.ReactNode`},description:``}}}})),A,j,M,N,P,F,I,L,R,z,B,V,H,U;t((()=>{k(),A=e(n(),1),j=r(),{fn:M,userEvent:N,within:P,expect:F}=__STORYBOOK_MODULE_TEST__,I={title:`App/ConfirmDialog`,component:w,tags:[`autodocs`],parameters:{layout:`centered`},decorators:[e=>{let[t,n]=(0,A.useState)(!0);return(0,j.jsx)(e,{args:{open:t,onOpenChange:n}})}]},L={args:{title:`Удалить фича-флаг?`,description:`Флаг «checkout-v2» и все связанные правила будут удалены без возможности восстановления.`,variant:`destructive`,confirmLabel:`Удалить`,confirmPhrase:`checkout-v2`,onConfirm:M()},play:async({canvasElement:e,args:t})=>{let n=P(e),r=n.getByRole(`button`,{name:/Удалить/i});await F(r).toBeDisabled();let i=n.getByRole(`textbox`);await N.type(i,`checkout-v2`),await F(r).toBeEnabled(),await N.click(r),await F(t.onConfirm).toHaveBeenCalledTimes(1)}},R={args:{title:`Удалить элемент?`,description:`Это действие затронет связанные данные.`,variant:`destructive`,confirmLabel:`Удалить`,onConfirm:M()},play:async({canvasElement:e,args:t})=>{let n=P(e).getByRole(`button`,{name:/Удалить/i});await F(n).toBeEnabled(),await N.click(n),await F(t.onConfirm).toHaveBeenCalledTimes(1)}},z={args:{title:`Архивировать флаг?`,description:`Флаг «checkout-v2» переместится в архив. Вы сможете восстановить его позже.`,variant:`default`,confirmLabel:`Архивировать`,onConfirm:M()},play:async({canvasElement:e,args:t})=>{let n=P(e);await N.click(n.getByRole(`button`,{name:/Архивировать/i})),await F(t.onConfirm).toHaveBeenCalledTimes(1)}},B={args:{title:`Сбросить пароль?`,description:`Пользователю придёт письмо со ссылкой для сброса пароля. Текущая сессия завершится.`,variant:`warning`,confirmLabel:`Сбросить пароль`,onConfirm:M()}},V={args:{title:`Удаление…`,description:`Пожалуйста, подождите, идёт удаление флага.`,variant:`destructive`,confirmLabel:`Удалить`,confirmPhrase:`checkout-v2`,loading:!0,onConfirm:M()}},H={args:{title:`Подтвердите изменения`,description:`Проверьте детали перед применением.`,variant:`default`,confirmLabel:`Применить`,onConfirm:M(),children:(0,j.jsx)(`div`,{className:`rounded-lg border border-border bg-secondary/50 p-4 text-body-sm text-muted-foreground`,children:`Здесь может быть произвольный контент — сводка, диф или предпросмотр.`})}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  args: {
    title: 'Удалить фича-флаг?',
    description: 'Флаг «checkout-v2» и все связанные правила будут удалены без возможности восстановления.',
    variant: 'destructive',
    confirmLabel: 'Удалить',
    confirmPhrase: 'checkout-v2',
    onConfirm: fn()
  },
  play: async ({
    canvasElement,
    args
  }) => {
    const canvas = within(canvasElement);
    const confirmBtn = canvas.getByRole('button', {
      name: /Удалить/i
    });
    await expect(confirmBtn).toBeDisabled();
    const input = canvas.getByRole('textbox');
    await userEvent.type(input, 'checkout-v2');
    await expect(confirmBtn).toBeEnabled();
    await userEvent.click(confirmBtn);
    await expect(args.onConfirm).toHaveBeenCalledTimes(1);
  }
}`,...L.parameters?.docs?.source}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  args: {
    title: 'Удалить элемент?',
    description: 'Это действие затронет связанные данные.',
    variant: 'destructive',
    confirmLabel: 'Удалить',
    onConfirm: fn()
  },
  play: async ({
    canvasElement,
    args
  }) => {
    const canvas = within(canvasElement);
    const confirmBtn = canvas.getByRole('button', {
      name: /Удалить/i
    });
    await expect(confirmBtn).toBeEnabled();
    await userEvent.click(confirmBtn);
    await expect(args.onConfirm).toHaveBeenCalledTimes(1);
  }
}`,...R.parameters?.docs?.source}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  args: {
    title: 'Архивировать флаг?',
    description: 'Флаг «checkout-v2» переместится в архив. Вы сможете восстановить его позже.',
    variant: 'default',
    confirmLabel: 'Архивировать',
    onConfirm: fn()
  },
  play: async ({
    canvasElement,
    args
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', {
      name: /Архивировать/i
    }));
    await expect(args.onConfirm).toHaveBeenCalledTimes(1);
  }
}`,...z.parameters?.docs?.source}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  args: {
    title: 'Сбросить пароль?',
    description: 'Пользователю придёт письмо со ссылкой для сброса пароля. Текущая сессия завершится.',
    variant: 'warning',
    confirmLabel: 'Сбросить пароль',
    onConfirm: fn()
  }
}`,...B.parameters?.docs?.source}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  args: {
    title: 'Удаление…',
    description: 'Пожалуйста, подождите, идёт удаление флага.',
    variant: 'destructive',
    confirmLabel: 'Удалить',
    confirmPhrase: 'checkout-v2',
    loading: true,
    onConfirm: fn()
  }
}`,...V.parameters?.docs?.source}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  args: {
    title: 'Подтвердите изменения',
    description: 'Проверьте детали перед применением.',
    variant: 'default',
    confirmLabel: 'Применить',
    onConfirm: fn(),
    children: <div className="rounded-lg border border-border bg-secondary/50 p-4 text-body-sm text-muted-foreground">\r
        Здесь может быть произвольный контент — сводка, диф или предпросмотр.\r
      </div>
  }
}`,...H.parameters?.docs?.source}}},U=[`Destructive`,`DestructiveNoPhrase`,`Default`,`Warning`,`Loading`,`WithRichContent`]}))();export{z as Default,L as Destructive,R as DestructiveNoPhrase,V as Loading,B as Warning,H as WithRichContent,U as __namedExportsOrder,I as default};