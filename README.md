## **How to use in gatsby**

#### Step1: Create a gatsby project or use in a template

You can use the plugin in a template or new project, only must be a gatsby project.

#### Step1: Setup gatsby-config.js

Setup the file with these params:

- substrateNodeUrl: subsocial websocket
- ipfsNodeUrl : ipfs url
- recommendedSpaceIds : Array of spaces you want to show
- addressAccount : posts from address you want to show

For example

```
{
	resolve: `gatsby-source-subsocial`,
	options: {
    substrateNodeUrl: `wss://para.f3joule.space`,
    ipfsNodeUrl: `https://crustwebsites.net`,
    spaceIds: ["10497"],
    addressAccount: "3qrRD1nbHj5u8cRsJBd1mEm9JGM9jwfzKGQgQwx1vvuigZub",
	},
},
```

#### Step2: GraphQl requests in components

You have to build your query and make graphql requests according your render requirements

For example:

```js
...
export const query = graphql`
  query {
    allSpacesSubsocial {
      edges {
        node {
          id
          content {
            name
            tags
            about
            email
            image
            links
            summary
            isShowMore
          }
        }
      }
    }
  }
`
```

#### Step3: Render your data

According query, render the posts

## ** Project demo**

[https://github.com/huascarmm/subsocial-gatsby-example](https://github.com/huascarmm/subsocial-gatsby-example)
