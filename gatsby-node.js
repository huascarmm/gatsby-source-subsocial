const { pushNode, subsocial_api, postBySpaceId } = require("./methods")
exports.sourceNodes = async (
  { actions, createNodeId, createContentDigest },
  {
    nodeName,
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
    let posts = [];
    listSpaces.map(async (space) => {
      const spacePosts = await postBySpaceId({ api, space });
      spacePosts.map(post => { posts.push(post) });
    });
    pushNode(posts, 'postsSubsocial');

  } catch (error) {

    throw error

  }
};
