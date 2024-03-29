import React from 'react';
import cn from 'classnames';
import s from './Input.module.css';

const Input = (props) => {
  const { className, variant, children, onChange, ...rest } = props;

  const rootClassName = cn(s.root, {[s.dailies]: variant === 'dailies'}, className);

  const handleOnChange = (e) => {
    if (onChange) {
      onChange(e.target.value);
    }
    return null;
  };

  return (
    <label>
      <input
        className={rootClassName}
        onChange={handleOnChange}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="on"
        spellCheck="on"
        {...rest}
      />
    </label>
  );
};

export default Input;
