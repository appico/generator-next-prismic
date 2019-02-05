import * as React from 'react'
const { Link } = require('../../server/routes')

import { connect } from 'react-redux'
import { withRouter } from 'next/router'

import { menuOpen, menuClose } from '../../store/actions/ui'

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
  ui: {
    menuOpened
  }

  menuOpen: () => void
  menuClose: () => void
}

class Navbar extends React.Component<INavbarProps> {
  toggleMenu() {
    if (this.props.ui.menuOpened) return this.closeMenu()
    return this.openMenu()
  }

  openMenu() {
    this.props.menuOpen()
  }

  closeMenu() {
    this.props.menuClose()
  }

  render() {
    const { ui, lang } = this.props
    const isMenuVisible = ui.menuOpened

    return (
      <div>
        <nav>
          <Link route={`/${lang}`}>
            <a>Home page</a>
          </Link>
        </nav>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  ui: state.ui
})

const mapDispatchToProps = dispatch => ({
  menuOpen: () => dispatch(menuOpen()),
  menuClose: () => dispatch(menuClose())
})

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(Navbar)
)