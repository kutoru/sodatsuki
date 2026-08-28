import { useEffect, useRef } from "react";
import { Field } from "../types";
import { useStore } from "./useStore";
import { convertFileSrc } from "@tauri-apps/api/core";

import "codemirror/lib/codemirror.css";
import "codemirror/theme/monokai.css";
import "codemirror/mode/htmlmixed/htmlmixed";
import "codemirror/addon/fold/xml-fold";
import "codemirror/addon/edit/matchtags";

import CodeMirror from "codemirror";

const formatFieldPreview = (fieldValue: string) => {
  const mediaPath = useStore.getState().anki.mediaPath;
  if (!mediaPath) {
    return fieldValue;
  }

  const soundMatches = Array.from(fieldValue.matchAll(/\[sound:(.*)\]/g));
  const imageMatches = Array.from(fieldValue.matchAll(/img.*src="(.*)"/g));

  if (fieldValue.startsWith("[") || fieldValue.startsWith("<")) {
    console.log(fieldValue, soundMatches, imageMatches);
  }

  imageMatches.forEach(([, file]) => {
    const src = mediaPath + "/" + file;
    fieldValue = fieldValue.replace(file, convertFileSrc(src));
  });

  return fieldValue;
};

export const useCodeEditor = (
  field: Field,
  fieldValue: string,
  setFieldValue: (fieldValue: string) => void,
) => {
  const setCodeEditorRefreshCallback = useStore(
    (state) => state.setCodeEditorRefreshCallback,
  );

  const parent = useRef<HTMLDivElement>(null);
  const preview = useRef<HTMLDivElement>(null);
  const editor = useRef<CodeMirror.Editor>(null);

  const setDisplayValue = (value: string) => {
    if (!preview.current) {
      return;
    }

    if (value.trim()) {
      preview.current.innerHTML = formatFieldPreview(value);
      preview.current.classList.remove("text-gray-400/75", "italic");
    } else {
      preview.current.innerHTML = `${field}...`;
      preview.current.classList.add("text-gray-400/75", "italic");
    }
  };

  useEffect(() => {
    if (!parent.current || !preview.current || editor.current) {
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
      _changeObj: CodeMirror.EditorChange,
    ) => {
      setDisplayValue(instance.getValue());
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
      setDisplayValue(fieldValue);
    }
  }, [fieldValue]);

  return { editorParent: parent, previewElement: preview };
};
