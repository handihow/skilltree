import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export default function MenuItem({
  index,
  title,
  tooltip,
  icon,
  clicked,
  isActive
}) {
  return (
    <li key={index}><a href="# " className="pl-0 pt-0 has-text-centered has-text-dark" onClick={clicked}>
        <div className="icon has-tooltip-right has-tooltip-primary" data-tooltip={isActive ? 'Click again to close editor' : tooltip}>
        <FontAwesomeIcon icon={icon} />
        </div>
        <div className="is-size-7">{isActive ? 'Close' : title}</div></a>
    </li>
  )
}