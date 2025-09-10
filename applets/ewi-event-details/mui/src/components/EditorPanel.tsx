import React from "react";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import { ConfigurableCard } from "@smbc/mui-components";
import type { CardMenuItem } from "@smbc/mui-components";
import {
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  FormatBold as FormatBoldIcon,
  FormatItalic as FormatItalicIcon,
  FormatUnderlined as FormatUnderlinedIcon,
  FormatListBulleted as FormatListBulletedIcon,
  FormatListNumbered as FormatListNumberedIcon,
  Code as CodeIcon,
  FormatQuote as FormatQuoteIcon,
} from "@mui/icons-material";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import CharacterCount from "@tiptap/extension-character-count";

interface EditorPanelProps {
  isMaximized: boolean;
  onToggleMaximize: () => void;
}

const MenuButton: React.FC<{
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}> = ({ onClick, active, disabled, title, children }) => (
  <Tooltip title={title}>
    <IconButton
      onClick={onClick}
      disabled={disabled}
      size="small"
      sx={{
        color: active ? "primary.main" : "text.secondary",
        backgroundColor: active ? "action.selected" : "transparent",
        "&:hover": {
          backgroundColor: "action.hover",
        },
      }}
    >
      {children}
    </IconButton>
  </Tooltip>
);

export const EditorPanel: React.FC<EditorPanelProps> = ({
  isMaximized,
  onToggleMaximize,
}) => {
  const editorMenuItems: CardMenuItem[] = [
    {
      label: "Clear Content",
      onClick: () => editor?.commands.clearContent(),
    },
    {
      label: "Export as Markdown",
      onClick: () => console.log("Export markdown"),
    },
    {
      label: "Import",
      onClick: () => console.log("Import content"),
    },
  ];

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Start typing your notes here...",
      }),
      Highlight,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      CharacterCount.configure({
        limit: 10000,
      }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class: "tiptap-editor",
      },
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <ConfigurableCard
      title="Notes"
      menuItems={editorMenuItems}
      sx={{
        flex: 1,
        width: "100%",
        display: "flex",
        flexDirection: "column",
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
      }}
      contentSx={{
        p: 0,
        flex: 1,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          p: 1,
          pt: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <MenuButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive("bold")}
            title="Bold (Cmd+B)"
          >
            <FormatBoldIcon fontSize="small" />
          </MenuButton>

          <MenuButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive("italic")}
            title="Italic (Cmd+I)"
          >
            <FormatItalicIcon fontSize="small" />
          </MenuButton>

          <MenuButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            active={editor.isActive("strike")}
            title="Strikethrough"
          >
            <FormatUnderlinedIcon fontSize="small" />
          </MenuButton>

          <Box sx={{ width: 1, height: 24, bgcolor: "divider", mx: 0.5 }} />

          <MenuButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive("bulletList")}
            title="Bullet List"
          >
            <FormatListBulletedIcon fontSize="small" />
          </MenuButton>

          <MenuButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive("orderedList")}
            title="Numbered List"
          >
            <FormatListNumberedIcon fontSize="small" />
          </MenuButton>

          <MenuButton
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            active={editor.isActive("taskList")}
            title="Task List"
          >
            <FormatListBulletedIcon fontSize="small" />
          </MenuButton>

          <Box sx={{ width: 1, height: 24, bgcolor: "divider", mx: 0.5 }} />

          <MenuButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            active={editor.isActive("codeBlock")}
            title="Code Block"
          >
            <CodeIcon fontSize="small" />
          </MenuButton>

          <MenuButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive("blockquote")}
            title="Quote"
          >
            <FormatQuoteIcon fontSize="small" />
          </MenuButton>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="caption" color="text.secondary">
            {editor.storage.characterCount.characters()}/10000 characters
          </Typography>

          <Tooltip title={isMaximized ? "Exit Fullscreen" : "Enter Fullscreen"}>
            <IconButton onClick={onToggleMaximize} size="small">
              {isMaximized ? <FullscreenExitIcon /> : <FullscreenIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          p: 3,
          "& .tiptap-editor": {
            outline: "none",
            color: "text.primary",
            fontFamily: "inherit",
            "& > *": {
              marginBottom: "1em",
            },
            "& p.is-editor-empty:first-child::before": {
              color: "text.disabled",
              content: "attr(data-placeholder)",
              float: "left",
              height: 0,
              pointerEvents: "none",
            },
            "& ul, & ol": {
              paddingLeft: "1.5em",
            },
            "& li": {
              marginBottom: "0.25em",
            },
            "& blockquote": {
              borderLeft: "3px solid",
              borderColor: "divider",
              paddingLeft: "1em",
              marginLeft: 0,
              fontStyle: "italic",
              color: "text.secondary",
            },
            "& pre": {
              backgroundColor: "action.hover",
              borderRadius: 1,
              padding: "1em",
              fontFamily: "monospace",
              fontSize: "0.9em",
              overflow: "auto",
              border: "1px solid",
              borderColor: "divider",
            },
            "& code": {
              backgroundColor: "action.hover",
              borderRadius: "3px",
              padding: "0.2em 0.4em",
              fontFamily: "monospace",
              fontSize: "0.9em",
              border: "1px solid",
              borderColor: "divider",
            },
            "& mark": {
              backgroundColor: "warning.light",
              color: "warning.contrastText",
              padding: "0.125em 0",
            },
            "& h1, & h2, & h3, & h4, & h5, & h6": {
              color: "text.primary",
              fontWeight: "medium",
            },
            '& ul[data-type="taskList"]': {
              listStyle: "none",
              padding: 0,
              "& li": {
                display: "flex",
                alignItems: "flex-start",
                "& > label": {
                  flex: "0 0 auto",
                  marginRight: "0.5em",
                  userSelect: "none",
                },
                "& > div": {
                  flex: "1 1 auto",
                },
              },
            },
          },
        }}
      >
        <EditorContent editor={editor} />
      </Box>
    </ConfigurableCard>
  );
};
