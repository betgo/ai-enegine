interface NumberFieldProps {
  label: string;
  min: number;
  value: number;
  onChange(value: number): void;
}

export function NumberField({ label, min, value, onChange }: NumberFieldProps) {
  return (
    <label className="number-field">
      <span>{label}</span>
      <input
        min={min}
        step={1}
        type="number"
        value={value}
        onChange={(event) => {
          const nextValue = event.currentTarget.valueAsNumber;
          onChange(Number.isFinite(nextValue) ? nextValue : 0);
        }}
      />
    </label>
  );
}
