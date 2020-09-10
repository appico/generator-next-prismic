import * as React from 'react'

import { Layout, ContentBlock, LazyImg<% if (baseComponents.includes('Demo')) { %>, Demo<% } %> } from '../../components'

import { asArray } from '../../utils'

import './styles.scss'

interface IPageProps {
  tags
  navbar
  footer
  body
  
  // Some generic components
  cookie_message
  langFix
}

const Page = ({
  tags = [],
  navbar,
  footer,
  body: blocks = [],
  langFix,

  // Some generic components
  ...rest
}: IPageProps) => {
  // Some generic data for some pages (server filters them)
  const genericItems = {
    ...rest,
    tags
  }

  const getComponentExtras = componentName => {
    return {}
  }

  return (
    <Layout
      navbar={navbar}
      footer={footer}
      lang={langFix}
      cookie_message={rest.cookie_message}

    >
      <% if (baseComponents.includes('ContentBlocks')) { %>{blocks.map((item, index) => {
        const { slice_type } = item
        const componentName = slice_type
          ? slice_type.charAt(0).toUpperCase() + slice_type.slice(1)
          : null

        const componentExtras = getComponentExtras(componentName)

        return (
          <ContentBlock
            key={slice_type + index}
            tag={componentName}
            lang={langFix}
            {...item}
            {...genericItems}
            {...componentExtras}
          />
        )
      })}
      <% } %>

      <% if (baseComponents.includes('Demo')) { %>{/* To be removed when starting project */}
      <Demo 
        lang={langFix}
        <% if (baseComponents.includes('Form')) { %>addForm<% } %>
        <% if (baseComponents.includes('GoogleMap')) { %>addGMaps<% } %>
      />
      {/* --- */}<% } %>
    </Layout>
  )
}

export default Page
