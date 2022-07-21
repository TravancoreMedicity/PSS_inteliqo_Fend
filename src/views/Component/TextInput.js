import React from 'react'

const TextInput = (props) => {

    const { type, id, Placeholder, value, classname, changeTextValue, name, disabled, max, min, style } = props;

    return (
        <div>
            <input
                type={type}
                className={classname}
                id={id}
                placeholder={Placeholder}
                aria-label=".form-control-sm"
                value={value}
                autoComplete="off"
                onChange={changeTextValue}
                name={name}
                disabled={disabled}
                max={max}
                min={min}
                style={{ ...style }}
            />
        </div>
    )
}

export default TextInput
