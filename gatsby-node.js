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
    let promises = []
    for (space of listSpaces) {
      promises.push(postsBySpaceId({ api, spaceId: space.id }))
    }
    const requests = await Promise.all(promises);
    const posts = requests.reduce((acum, curr) => acum.concat(curr), []).map(({ content }) => content);
    pushNode(posts, 'postsSubsocial');

  } catch (error) {

    throw error

  }
};
