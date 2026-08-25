import { useEffect, useRef } from "react";

import "codemirror/lib/codemirror.css";
import "codemirror/addon/fold/foldgutter.css";
import "codemirror/theme/monokai.css";
import "codemirror/mode/htmlmixed/htmlmixed";
import "codemirror/mode/stex/stex";
import "codemirror/addon/fold/foldcode";
import "codemirror/addon/fold/foldgutter";
import "codemirror/addon/fold/xml-fold";
import "codemirror/addon/edit/matchtags";
import "codemirror/addon/edit/closetag";
import "codemirror/addon/display/placeholder";

import CodeMirror from "codemirror";

export const useCodeEditor = (initialText: string) => {
  const parent = useRef<HTMLDivElement>(null);
  const editor = useRef<CodeMirror.Editor>(null);

  useEffect(() => {
    if (!parent.current || editor.current) {
      return;
    }

    editor.current = CodeMirror(parent.current, {
      theme: "monokai",
      lineWrapping: true,
      matchTags: { bothTags: true },
      extraKeys: { Tab: false, "Shift-Tab": false },
      tabindex: 0,
      viewportMargin: Infinity,
      lineWiseCopyCut: false,
      mode: "text/html",
      value: initialText,
    });
  }, []);

  return { parent, editor };
};
