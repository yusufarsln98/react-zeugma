# Introducing the react-zeugma SKILL.md for AI Coding Assistants

`react-zeugma` is a recursive, drag-and-drop dashboard layout engine for React. It combines the tree-based, arbitrary splitting capabilities of `react-mosaic` with the declarative, state-driven API model of `react-grid-layout`, built on top of `@dnd-kit/core`.

To build flexible layouts, developers use three core concepts:

1. **The Layout Tree (`TreeNode`)**: A recursive binary tree structure where branches are splits (`SplitNode`) and leaves are panels (`PaneNode`).
2. **The Layout Controller (`useZeugma`)**: A React hook that manages the active layout state, resizing, fullscreen zoom toggling, and locking mechanism.
3. **Compound Components (`<Zeugma>`, `<Pane>`)**: Render layers that translate the layout state into physical DOM elements, resizer drag handles, and drag-and-drop drop zones.

To solve this, you can add a `SKILL.md` file to your project workspace. This file acts as a structured prompt/knowledge resource that guides AI coding assistants to write bug-free code with `react-zeugma`.

You can view and download the complete `SKILL.md` file and explore the `/llms.txt` standard index in the [AI Integration](/docs#skill-md) section of our documentation.

### Setup Instructions:

1. Create a `SKILL.md` file in your `.agents/skills/react-zeugma/` or `.cursor/rules/` directory.
2. Download or copy the contents from the [AI Integration](/docs#skill-md) section of the documentation (or fetch `https://www.react-zeugma.com/llms.txt` for raw LLM ingestion) and paste them into the file.
