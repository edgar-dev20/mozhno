import{i as e}from"./preload-helper-B45gAKPr.js";import{t}from"./jsx-runtime-BBQGix-2.js";import{n,t as r}from"./ReachRules-D-OEA6HV.js";var i,a,o,s,c,l,u;e((()=>{n(),i=t(),{within:a,expect:o}=__STORYBOOK_MODULE_TEST__,s={title:`App/Flags/ReachRules`,component:r,tags:[`autodocs`],parameters:{layout:`centered`},decorators:[e=>(0,i.jsx)(`div`,{style:{width:400},className:`rounded-2xl border border-border bg-popover p-4`,children:(0,i.jsx)(e,{})})]},c={args:{sources:[{key:`custom`,kind:`custom`,name:`Пользовательское`,conditions:[{field:`country`,operator:`in`,values:[`RU`,`KZ`,`BY`]},{field:`app_version`,operator:`gte`,contextType:`semver`,values:[`2.4.0`]}]},{key:`seg-1`,kind:`segment`,name:`Бета-пользователи`,color:`#2d9484`,icon:`Rocket`,conditions:[{field:`plan`,operator:`eq`,values:[`pro`]}]},{key:`seg-2`,kind:`segment`,name:`Внутренние сотрудники`,color:`#6d5ae0`,icon:`Users`,conditions:[]}]},play:async({canvasElement:e})=>{let t=a(e);await o(t.getByText(`Пользовательское`)).toBeInTheDocument(),await o(t.getByText(`Бета-пользователи`)).toBeInTheDocument(),await o(t.getByText(`Внутренние сотрудники`)).toBeInTheDocument()}},l={args:{sources:[{key:`custom`,kind:`custom`,name:`Пользовательское`,conditions:[{field:`country`,operator:`in`,values:[`RU`,`KZ`,`BY`,`AM`,`GE`,`UZ`]},{field:`email`,operator:`contains`,values:[`@mozhno.dev`]}]},{key:`seg-3`,kind:`segment`,name:`Клиенты Pro`,color:`#c08140`,icon:`Crown`,conditions:[{field:`region`,operator:`in`,values:[`EU`,`US`]}]}]}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    sources: [{
      key: 'custom',
      kind: 'custom',
      name: 'Пользовательское',
      conditions: [{
        field: 'country',
        operator: 'in',
        values: ['RU', 'KZ', 'BY']
      }, {
        field: 'app_version',
        operator: 'gte',
        contextType: 'semver',
        values: ['2.4.0']
      }]
    }, {
      key: 'seg-1',
      kind: 'segment',
      name: 'Бета-пользователи',
      color: '#2d9484',
      icon: 'Rocket',
      conditions: [{
        field: 'plan',
        operator: 'eq',
        values: ['pro']
      }]
    }, {
      key: 'seg-2',
      kind: 'segment',
      name: 'Внутренние сотрудники',
      color: '#6d5ae0',
      icon: 'Users',
      conditions: []
    }]
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Пользовательское')).toBeInTheDocument();
    await expect(canvas.getByText('Бета-пользователи')).toBeInTheDocument();
    await expect(canvas.getByText('Внутренние сотрудники')).toBeInTheDocument();
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    sources: [{
      key: 'custom',
      kind: 'custom',
      name: 'Пользовательское',
      conditions: [{
        field: 'country',
        operator: 'in',
        values: ['RU', 'KZ', 'BY', 'AM', 'GE', 'UZ']
      }, {
        field: 'email',
        operator: 'contains',
        values: ['@mozhno.dev']
      }]
    }, {
      key: 'seg-3',
      kind: 'segment',
      name: 'Клиенты Pro',
      color: '#c08140',
      icon: 'Crown',
      conditions: [{
        field: 'region',
        operator: 'in',
        values: ['EU', 'US']
      }]
    }]
  }
}`,...l.parameters?.docs?.source}}},u=[`CustomAndSegments`,`ManyValues`]}))();export{c as CustomAndSegments,l as ManyValues,u as __namedExportsOrder,s as default};