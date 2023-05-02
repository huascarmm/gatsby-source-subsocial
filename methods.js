const { SubsocialApi, generateCrustAuthToken } = require("@subsocial/api");

/**
 * function to set data within node gatsby
 * 
 * @param {*} item data object
 * @param {*} nodeName name or type to node
 */
const pushNode = ({ actions, item, nodeName, createNodeId, createContentDigest }) => {
    const { createNode } = actions;
    const node = {
        ...item,
        ...item.content,
        id: createNodeId(`${item.struct.id}`),
        parent: null,
        children: [],
        internal: {
            type: nodeName,
            contentDigest: createContentDigest(item),
            content: JSON.stringify({ ...item.content, id: item.struct.contentId }),
        },
    };
    createNode(node);
};

const createSubsocialApi = async ({ substrateNodeUrl, ipfsNodeUrl, phraseSecret }) => {
    if (!phraseSecret) throw new Error("phraseSecret not found");

    const api = await SubsocialApi.create({ substrateNodeUrl, ipfsNodeUrl });
    const authHeader = generateCrustAuthToken(phraseSecret);
    api.ipfs.setWriteHeaders({ authorization: "Basic " + authHeader });

    return api;
}

const getPostsBySpaceId = async ({ api, spaceId }) => {
    const postIds = await api.blockchain.postIdsBySpaceId(spaceId);
    return await api.base.findPosts({ ids: postIds });
};

const getSpacesByAddress = async ({ api, addressAccount }) => {
    const spaceIds = await api.blockchain.spaceIdsByOwner(addressAccount);
    return await api.findPublicSpaces(spaceIds);
}
module.exports = { pushNode, createSubsocialApi, getPostsBySpaceId, getSpacesByAddress };

// module.exports = { pushNode, subsocial_api, postsBySpaceId, spacesByAddress };

// /**
//  * spaces by profile accounts
//  * 
//  * @param {*} accountIds 
//  * @returns 
//  */
// const spacesByProfileAccounts = (accountIds) => {  // future implementation
//     return Array.isArray(accountIds)
//         ? api.base.findProfileSpaces(accountIds)
//         : api.base.findProfileSpace(accountIds);
// };

// // verifica si se pasa addressAccount
// if (addressAccount) {
//     // Busca espacios publicos en subsocial y luego seran agregados como nodos a gatsby
//     spaceByOwner(addressAccount, (spaceIds) => {
//         spaceIds.forEach(spaceId => {
//             postBySpaceId(spaceId).then(posts => {
//                 posts.forEach(post => {
//                     pushNode(post, 'PostsSubsocial');
//                 })
//             })
//         })

//     }).then(spaces => {
//         spaces.forEach(space => {
//             pushNode(space, 'SpacesSubsocial')
//         })
//     })
// }