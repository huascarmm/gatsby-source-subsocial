const { pushNode, subsocial_api, postsBySpaceId, spacesByAddress } = require("./methods");

exports.sourceNodes = async (
  { actions, createNodeId, createContentDigest },
  {
    phraseSecret,
    substrateNodeUrl,
    ipfsNodeUrl,
    spaceIds,
    addressAccount
  }
) => {

  try {

    const api = await subsocial_api({ substrateNodeUrl, ipfsNodeUrl, phraseSecret });
    const listSpaces = await api.findPublicSpaces(spaceIds);
    let promises = []
    for (space of listSpaces) {
      promises.push(postsBySpaceId({ api, spaceId: space.id }))
    }
    const requests = await Promise.all(promises);
    const posts = requests.reduce((acum, curr) => acum.concat(curr), []);
    for (post of posts) {
      pushNode({ actions, item: post, nodeName: 'PostsSubsocial', createNodeId, createContentDigest });
    }

    const mySpaces = await spacesByAddress({ api, addressAccount });
    for (space of mySpaces) {
      pushNode({ actions, item: space, nodeName: 'SpacesSubsocial', createNodeId, createContentDigest });
    }

  } catch (error) {

    throw error

  }
};
