import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Link } from 'react-router-dom'

export default function MenuLinkItem({
  index,
  title,
  tooltip,
  icon,
  link,
}) {
  return (
    <li key={index}><Link href="# " className="pl-0 pt-0 has-text-centered has-text-dark" to={link}>
        <div className="icon has-tooltip-right has-tooltip-primary" data-tooltip={tooltip}>
        <FontAwesomeIcon icon={icon} />
        </div>
        <div className="is-size-7">{title}</div></Link>
    </li>
  )
}