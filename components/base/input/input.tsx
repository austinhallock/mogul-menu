import {
  classKebab,
  LabelPrimitive,
  legend,
  Observable,
  ObservableComputed,
  React,
  useStyleSheet,
} from "../../../deps.ts";
import stylesheet from "./input.scss.js";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value$: Observable<string>;
  error$?: ObservableComputed<string>;
  placeholder?: string;
  label?: string;
  css?: React.CSSProperties;
}

export default function Input(
  { value$, error$, placeholder, label, css, ...props }: InputProps,
) {
  useStyleSheet(stylesheet);
  return (
    <div
      className={`c-legend-input ${
        classKebab({
          hasError: !!error$?.get(),
        })
      }`}
    >
      {label && <LabelPrimitive.Root htmlFor="input" className="label">{label}
      </LabelPrimitive.Root>}
      <legend.input
        style={css}
        placeholder={placeholder}
        id="input"
        value$={value$}
        {...props}
      />
    </div>
  );
}
