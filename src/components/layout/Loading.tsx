import React from 'react'

export default function Loading() {
    return (
        <section className="section">
        <div className="container">
            <h3 className="is-title">Loading...</h3>
            <progress className="progress is-small is-primary" max="100">15%</progress> 
        </div>
        </section>
    )
}
