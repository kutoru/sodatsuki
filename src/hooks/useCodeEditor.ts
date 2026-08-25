import { useEffect, useRef } from "react";
import { CodeJar } from "codejar";
import prismjs from "prismjs";
import { minimalEditor, basicEditor } from "prism-code-editor/setups";
import "prism-code-editor/prism/languages/markup";
import { matchTags } from "prism-code-editor/match-tags";
import { matchBrackets } from "prism-code-editor/match-brackets";
import { highlightBracketPairs } from "prism-code-editor/highlight-brackets";
import { PrismEditor } from "prism-code-editor";

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

// export const useCodeEditor = (initialText: string) => {
//   const parent = useRef<HTMLDivElement>(null);
//   const editor = useRef<PrismEditor>(null);

//   useEffect(() => {
//     if (!parent.current || editor.current) {
//       return;
//     }

//     editor.current = basicEditor(parent.current, {
//       language: "html",
//       theme: "github-dark",
//       lineNumbers: false,
//       value: initialText,
//       wordWrap: true,
//     });

//     editor.current.addExtensions(matchTags());
//     editor.current.addExtensions(matchBrackets());
//     editor.current.addExtensions(highlightBracketPairs());

//     // parent.current.classList.add("language-html");
//     // jar.current = CodeJar(
//     //   parent.current,
//     //   (e) => prismjs.highlightElement(e),
//     //   {},
//     // );
//     // jar.current.updateCode(initialText);
//   }, []);

//   return { parent, editor };
// };
