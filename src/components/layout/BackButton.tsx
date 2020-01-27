import React from 'react';
import { useHistory } from 'react-router-dom'

export default function BackButton() {
  let history = useHistory()
  return (
    <button type="button" className="button" onClick={() => history.goBack()}>
      Back
    </button>
  )
}