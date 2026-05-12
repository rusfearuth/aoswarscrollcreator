import React, { useRef } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store/store";
import { applySnapshot } from "../SavedCards/SavedCardsHooks";
import { WarscrollSnapshot } from "../SavedCards/SavedCardsSlice";

export const ImportData = () => {
  const dispatch = useDispatch<AppDispatch>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const fileContent = e.target?.result as string;
        if (!fileContent) {
          console.error("File content is empty");
          return;
        }
        const data = JSON.parse(fileContent) as Partial<WarscrollSnapshot>;
        applySnapshot(dispatch, data);

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } catch (error) {
        console.error("Error parsing JSON:", error);
      }
    };
    reader.readAsText(file);
  };

  const importData = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return { importData, fileInputRef, handleFileChange };
};
