import React from 'react'

export default function CloseButton({ YouCanPassAnyProps, closeToast }) {
    return (
        <button className="delete" onClick={closeToast}></button>
    )
}
