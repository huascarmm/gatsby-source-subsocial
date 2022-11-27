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

- substrateNodeUrl: subsocial websocket
- ipfsNodeUrl : ipfs url
- spaceIds : Array of spaces you want to show
- addressAccount : posts from address you want to show
- phraseSecret: your address passPhrase

For example

```js
{
	resolve: `gatsby-source-subsocial`,
	options: {
    substrateNodeUrl: `wss://para.f3joule.space`,
    ipfsNodeUrl: `https://crustwebsites.net`,
    spaceIds: ["10497"],
    addressAccount: "3qrRD1nbHj5u8cRsJBd1mEm9JGM9jwfzKGQgQwx1ztuigZub",  //you can use env vars process.env.ADDRESS_ACCOUNT,
    phraseSecret: "hello this is a passphrase of my address" //you can use env vars process.env.PHRASE_SECRET
	},
}
```

You can check your spaceIds in ` http://localhost:8000/___graphql`

- Go to menu: Graphiql Explorer -> choose: AllMySpacesSubsocial/edge/nodes

#### Step 4: GraphQl config and requests in components

Go to you graphql project, usually in `http://localhost:8000/___graphql`
Check this data:

- Go to menu: Graphiql Explorer -> choose: AllPostsSubsocial/nodes: Here you can choose posts field to format query

#### Step 5: Render your data

Copy the graphQl structure request, then add to your component.

Usually, the format for posts is:

```js
...
export const query = graphql`
  query {
    allPostsSubsocial {
      nodes {
        content {
          body
          image
          title
          tags
        }
      }
    }
  }
`
```

## Project demo

[https://github.com/huascarmm/subsocial-gatsby-example](https://github.com/huascarmm/subsocial-gatsby-example)
