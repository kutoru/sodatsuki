import { useEffect, useRef } from "react";

import "codemirror/lib/codemirror.css";
import "codemirror/theme/monokai.css";
import "codemirror/mode/htmlmixed/htmlmixed";
import "codemirror/addon/fold/xml-fold";
import "codemirror/addon/edit/matchtags";

import CodeMirror from "codemirror";

export const useCodeEditor = (
  field: string,
  fieldValue: string,
  setFieldValue: (fieldValue: string) => void,
) => {
  const parent = useRef<HTMLDivElement>(null);
  const display = useRef<HTMLDivElement>(null);
  const editor = useRef<CodeMirror.Editor>(null);

  const setDisplayValue = (value: string) => {
    if (display.current) {
      display.current.innerHTML = value || `${field}...`;
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
      tabindex: 0,
      viewportMargin: Infinity,
      lineWiseCopyCut: false,
      mode: "text/html",
      value: fieldValue,
      undoDepth: 0,
    });

    setDisplayValue(fieldValue);

    const change = (
      instance: CodeMirror.Editor,
      changeObj: CodeMirror.EditorChange,
    ) => {
      console.log("change", instance.getValue(), changeObj);

      setDisplayValue(instance.getValue());
    };

    const blur = (instance: CodeMirror.Editor, event: FocusEvent) => {
      console.log("blur", instance, event);
      instance.setCursor(0);
      setFieldValue(instance.getValue());
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
