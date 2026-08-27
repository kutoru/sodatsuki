import { useEffect, useRef } from "react";
import { Field } from "../types";

import "codemirror/lib/codemirror.css";
import "codemirror/theme/monokai.css";
import "codemirror/mode/htmlmixed/htmlmixed";
import "codemirror/addon/fold/xml-fold";
import "codemirror/addon/edit/matchtags";

import CodeMirror from "codemirror";
import { useStore } from "./useStore";

export const useCodeEditor = (
  field: Field,
  fieldValue: string,
  setFieldValue: (fieldValue: string) => void,
) => {
  const setCodeEditorRefreshCallback = useStore(
    (state) => state.setCodeEditorRefreshCallback,
  );

  const parent = useRef<HTMLDivElement>(null);
  const display = useRef<HTMLDivElement>(null);
  const editor = useRef<CodeMirror.Editor>(null);

  const setDisplayValue = (value: string) => {
    if (!display.current) {
      return;
    }

    if (value.trim()) {
      display.current.innerHTML = value;
      display.current.classList.remove("text-gray-400/75", "italic");
    } else {
      display.current.innerHTML = `${field}...`;
      display.current.classList.add("text-gray-400/75", "italic");
    }
  };

  useEffect(() => {
    if (!parent.current || !display.current || editor.current) {
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

    setDisplayValue(fieldValue);

    setCodeEditorRefreshCallback(field, () => editor.current?.refresh());

    const change = (
      instance: CodeMirror.Editor,
      changeObj: CodeMirror.EditorChange,
    ) => {
      console.log("change", instance.getValue(), changeObj);

      setDisplayValue(instance.getValue());
    };

    const blur = (instance: CodeMirror.Editor, event: FocusEvent) => {
      console.log("blur", instance, event);

      instance.setCursor(instance.lineCount(), 0, { scroll: false });
      setFieldValue(instance.getValue().trim());
    };

    editor.current.on("change", change);
    editor.current.on("blur", blur);
  }, []);

  useEffect(() => {
    const identical = editor.current?.getValue() === fieldValue;
    console.log("identical", editor.current?.getValue(), fieldValue, identical);

    if (editor.current && !identical) {
      console.log("effect update");

      editor.current.setValue(fieldValue);
      setDisplayValue(fieldValue);
    }
  }, [fieldValue]);

  return { editorParent: parent, displayElement: display };
};
