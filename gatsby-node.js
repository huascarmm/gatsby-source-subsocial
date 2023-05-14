"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const methods_1 = require("./methods");
exports.sourceNodes = ({ actions, createNodeId, createContentDigest }, { substrateNodeUrl, ipfsNodeUrl, spaceIds, seedPhrase }) => {
    try {
        const api = (0, methods_1.createSubsocialApi)({
            substrateNodeUrl,
            ipfsNodeUrl,
            seedPhrase,
        }).then((api) => {
            for (const spaceId of spaceIds) {
                (0, methods_1.getAllDataOfSpace)(api, spaceId).then(({ space, completePosts }) => {
                    if (!space)
                        throw new Error("Space not found");
                    (0, methods_1.pushNode)(api, space, completePosts, actions, createNodeId, createContentDigest);
                });
            }
        });
    }
    catch (error) {
        throw new Error("Error global: " + error.message);
    }
};
