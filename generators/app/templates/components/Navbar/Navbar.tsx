import * as React from 'react'
import { Link } from '../'

import './styles.scss'

type INavbarProps = {
  router: {
    asPath: string
  }
  links?: Array<{
    primary: {
      text: string
      url: string
    }
  }>
  lang: string
}

const Navbar = (props: INavbarProps) => {
  return (
    <div>
      <nav>{/*
        <Link url={`/${props.lang}`}></Link>
        */}</nav>
    </div>
  )
}

export default Navbar
