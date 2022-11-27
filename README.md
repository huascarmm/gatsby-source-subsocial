## **How to use in gatsby**

#### Step 1: Create a gatsby project or use in a template

You can use the plugin in a template or new project, must be a gatsby project.

#### Step 2: Install plugin

you have to install the plugin:

```
//npm
npm i -S gatsby-source-subsocial

//yarn
yarn add gatsby-source-subsocial
```

#### Step 3: Setup gatsby-config.js

Setup the file with these params:

    phraseSecret,
    substrateNodeUrl,
    ipfsNodeUrl,
    spaceIds,
    addressAccount

- substrateNodeUrl: subsocial websocket
- ipfsNodeUrl : ipfs url
- spaceIds : Array of spaces you want to show
- addressAccount : posts from address you want to show
- phraseSecret: your address passPhrase

For example

```
{
	resolve: `gatsby-source-subsocial`,
	options: {
    substrateNodeUrl: `wss://para.f3joule.space`,
    ipfsNodeUrl: `https://crustwebsites.net`,
    spaceIds: ["10497"],
    addressAccount: "3qrRD1nbHj5u8cRsJBd1mEm9JGM9jwfzKGQgQwx1ztuigZub",  //you can use env vars process.env.ADDRESS_ACCOUNT,
    phraseSecret: "hello this is a passphrase of my address" //you can use env vars process.env.PHRASE_SECRET
	},
},
```

#### Step 4: GraphQl config and requests in components

Go to you graphql project, usually in http://localhost:8000/\_\_\_graphql
Check this data:

- AllPostsSubsocial/edge/nodes: Here you can see the spaceId posts
- AllMySpacesSubsocial/edge/nodes: Here you can your account spaceIds

#### Step 5: Render your data

Copy the graphQl structure request, then add to your component.

Usually, for posts is:

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

## ** Project demo**

[https://github.com/huascarmm/subsocial-gatsby-example](https://github.com/huascarmm/subsocial-gatsby-example)
