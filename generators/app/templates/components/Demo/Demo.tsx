import * as React from 'react'

import { LazyImg, Transform } from '../'

type TDemoProps = {
  lang: string
}

import './styles.scss'

const Demo = ({
  lang
}: TDemoProps) => (<div className="generator-demo-content">
      <p>
        Welcome to your new project with <b>React/Next.js and Prismic</b>!
        <br />
        <small>Demo component on <b>Page.tsx</b>. Let's remove it</small>
      </p>
      <Transform from={[0, 0, 1.35, -15]} delay={350}>
        <LazyImg
          src="/static/images/demo-illustration.svg"
          alt="Demo illustration"
          spaceHolderFix={65.8}
          style={{
            width: '350px',
            marginBottom: '20px'
          }}
        />
      </Transform>
    </div>)

export default Demo
