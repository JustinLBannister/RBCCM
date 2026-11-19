import theme from './theme.js';

export default {
  parameters: {
    layout: 'fullscreen',
    docs: {
      theme,
      /* Each story on a docs page gets its own frame, so a component's
         styles and scripts cannot reach its neighbours. */
      story: { inline: false, height: '560px' },
      toc: { headingSelector: 'h2, h3' }
    },
    options: {
      storySort: {
        order: [
          'Welcome', 'Getting Started',
          'Foundations', ['Colours', 'Typography', 'Layout and Naming'],
          'Components', 'Pages'
        ]
      }
    },
    a11y: { test: 'todo' },
    controls: { expanded: true, sort: 'none' }
  }
};
