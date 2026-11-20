import theme from './theme.js';
import { markupFor } from './render-preview.js';

export default {
  parameters: {
    layout: 'fullscreen',
    docs: {
      theme,
      /* Each story on a docs page gets its own frame, so a component's
         styles and scripts cannot reach its neighbours. */
      story: { inline: false, height: '560px' },
      /* The Code tab beside Accessibility, and "Show code" under each
         story on a docs page, show that variant's markup. It is read
         from the component's preview page, so it is never out of date. */
      codePanel: true,
      source: {
        language: 'html',
        transform: async (code, context) => {
          const from = context && context.parameters && context.parameters.rbccm;
          if (!from) return code;
          try { return await markupFor(from); } catch (err) { return '<!-- The markup could not be read: ' + err.message + ' -->'; }
        }
      },
      toc: { headingSelector: 'h2, h3' }
    },
    options: {
      storySort: {
        order: [
          'Welcome', 'Catalog', 'Getting Started',
          'Foundations', ['Colours', 'Typography', 'Layout and Naming'],
          'Components', ['Heroes and Intros', 'Cards and Features', 'Insights and Lists', 'People', 'Actions and Forms', 'Utilities', 'Page Templates'], 'Pages'
        ]
      }
    },
    a11y: { test: 'todo' },
    controls: { expanded: true, sort: 'none' }
  }
};
