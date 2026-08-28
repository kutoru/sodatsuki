import { useEffect, useRef } from "react";
import { Field } from "../types";
import { useStore } from "./useStore";

import "codemirror/lib/codemirror.css";
import "codemirror/theme/monokai.css";
import "codemirror/mode/htmlmixed/htmlmixed";
import "codemirror/addon/fold/xml-fold";
import "codemirror/addon/edit/matchtags";

import CodeMirror from "codemirror";

export const useCodeEditor = (
  field: Field,
  fieldValue: string,
  setFieldValue: (fieldValue: string) => void,
) => {
  const setCodeEditorRefreshCallback = useStore(
    (state) => state.setCodeEditorRefreshCallback,
  );

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
      viewportMargin: Infinity,
      lineWiseCopyCut: false,
      mode: "text/html",
      value: fieldValue,
    });

    setCodeEditorRefreshCallback(field, () => editor.current?.refresh());

    const change = (
      instance: CodeMirror.Editor,
      _changeObj: CodeMirror.EditorChange,
    ) => {
      setFieldValue(instance.getValue());
    };

    const blur = (instance: CodeMirror.Editor, _event: FocusEvent) => {
      instance.setCursor(instance.lineCount(), 0, { scroll: false });
      setFieldValue(instance.getValue().trim());
    };

    editor.current.on("change", change);
    editor.current.on("blur", blur);
  }, []);

  useEffect(() => {
    const identical = editor.current?.getValue() === fieldValue;

    if (editor.current && !identical) {
      editor.current.setValue(fieldValue);
    }
  }, [fieldValue]);

  return { editorParent: parent };
};
