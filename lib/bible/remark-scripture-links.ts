import type { Parent, Root, Text } from 'mdast';
import { visit } from 'unist-util-visit';
import { findScriptureReferences } from './scripture-reference-utils';

interface LinkNode {
  type: 'link';
  url: string;
  title: null;
  children: Text[];
}

export function remarkScriptureLinks() {
  return (tree: Root) => {
    // Transform plain text references into link nodes at AST level so they work
    // consistently in paragraphs, lists, blockquotes, and table cells.
    visit(tree, 'text', (node: Text, index, parent) => {
      if (typeof index !== 'number' || !parent) return;
      if (parent.type === 'link' || parent.type === 'linkReference') return;

      const matches = findScriptureReferences(node.value);
      if (matches.length === 0) return;

      const nextNodes: Array<Text | LinkNode> = [];
      let lastIndex = 0;

      for (const match of matches) {
        if (match.start > lastIndex) {
          nextNodes.push({
            type: 'text',
            value: node.value.slice(lastIndex, match.start),
          });
        }

        nextNodes.push({
          type: 'link',
          url: `bible://${encodeURIComponent(match.reference)}`,
          title: null,
          children: [
            {
              type: 'text',
              value: node.value.slice(match.start, match.end),
            },
          ],
        });

        lastIndex = match.end;
      }

      if (lastIndex < node.value.length) {
        nextNodes.push({
          type: 'text',
          value: node.value.slice(lastIndex),
        });
      }

      const mutableParent = parent as Parent;
      mutableParent.children.splice(index, 1, ...nextNodes);
    });
  };
}
