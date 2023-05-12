// CellEditor.tsx
import React, { useState, useEffect } from "react";

interface CellEditorProps {
  value: any;
  onCommit: (value: any) => void;
}

export const CellEditor: React.FC<CellEditorProps> = ({
  value: initialValue,
  onCommit,
}) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  const handleBlur = () => {
    onCommit(value);
  };

  return <input value={value} onChange={handleChange} onBlur={handleBlur} />;
};
