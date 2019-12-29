import React from 'react'

export default function Header(props) {
    return (
        <header>
            <h1 className="title is-centered">{props.header}</h1>
        </header>
    )
}
