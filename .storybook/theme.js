/* RBC look for the Storybook chrome and the docs pages. */
import { create } from 'storybook/theming/create';

export default create({
  base: 'light',
  brandTitle: 'RBCCM Components',
  brandUrl: './',
  brandTarget: '_self',

  fontBase: 'Roboto, Arial, sans-serif',
  fontCode: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',

  colorPrimary: '#003168',
  colorSecondary: '#0051A5',

  appBg: '#F4F7FB',
  appContentBg: '#FFFFFF',
  appPreviewBg: '#FFFFFF',
  appBorderColor: '#E0E0E0',
  appBorderRadius: 8,

  textColor: '#252525',
  textInverseColor: '#FFFFFF',
  textMutedColor: '#494949',

  barBg: '#FFFFFF',
  barTextColor: '#494949',
  barHoverColor: '#0051A5',
  barSelectedColor: '#0051A5',

  buttonBg: '#FFFFFF',
  buttonBorder: '#D7D7D7',
  booleanBg: '#E7EEF1',
  booleanSelectedBg: '#FFFFFF',

  inputBg: '#FFFFFF',
  inputBorder: '#D7D7D7',
  inputTextColor: '#252525',
  inputBorderRadius: 8
});
