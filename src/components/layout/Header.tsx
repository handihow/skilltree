import React from 'react'

interface IHeaderProps {
    header: string;
}

export default function Header(props: IHeaderProps) {
    return (
        <header>
            <h1 className="title is-centered">{props.header}</h1>
        </header>
    )
}
