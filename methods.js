const { SubsocialApi, generateCrustAuthToken } = require("@subsocial/api");

/**
 * function to set data within node gatsby
 * 
 * @param {*} item data object
 * @param {*} typeNode name or type to node
 */
const pushNode = (item, typeNode) => {
    const nodeMeta = {
        ...item.content,
        id: createNodeId(`${item.struct.id}`),
        parent: null,
        children: [],
        internal: {
            type: typeNode || nodeName,
            contentDigest: createContentDigest(item),
            content: JSON.stringify({
                ...item.content,
                id: item.struct.contentId,
            }),
        },
    };

    const node = Object.assign({}, nodeMeta, item);
    createNode(node);
};

const subsocial_api = async ({ substrateNodeUrl, ipfsNodeUrl, phraseSecret }) => {
    const api_local = await SubsocialApi.create({
        substrateNodeUrl,
        ipfsNodeUrl,
    });

    if (!phraseSecret) return new Error("phraseSecret not found");

    const authHeader = generateCrustAuthToken(phraseSecret);

    // Data can come from anywhere, but for now create it manually
    api_local.ipfs.setWriteHeaders({
        authorization: "Basic " + authHeader,
    });

    return api_local
}

/**
 * posts by spaceId
 * 
 * @param {*} spaceId 
 * @returns 
 */
const postBySpaceId = async ({ api, spaceId }) => {
    const postIds = await api.blockchain.postIdsBySpaceId(spaceId);
    const posts = await api.base.findPosts({ ids: postIds });
    return posts;
};

module.exports = { pushNode, subsocial_api, postBySpaceId };


// /**
//  * space By Owner
//  * 
//  * @param {*} accountId 
//  * @param {*} callback function to set spaceIds list how params 
//  * @returns 
//  */
// const spaceByOwner = async (accountId, callback) => {
//     const spaceIds = await api.blockchain.spaceIdsByOwner(accountId);
//     if (callback) callback(spaceIds);
//     return api.base.findSpaces({ ids: spaceIds });
// };

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