import { createSubsocialApi, getAllDataOfSpace, pushNode } from "./methods";
import { ConfigTypes } from "./types";
import { SourceNodesArgs } from "gatsby";

exports.sourceNodes = async (
  { actions, createNodeId, createContentDigest }: SourceNodesArgs,
  { substrateNodeUrl, ipfsNodeUrl, spaceIds, seedPhrase }: ConfigTypes
) => {
  try {
    const api = await createSubsocialApi({
      substrateNodeUrl,
      ipfsNodeUrl,
      seedPhrase,
    });

    let spaceDataPromises = [];
    for (const spaceId of spaceIds) {
      spaceDataPromises.push(getAllDataOfSpace(api, spaceId));
    }
    const spaceData = await Promise.all(spaceDataPromises);
    for (const { space, completePosts } of spaceData) {
      console.log("Size 1", completePosts.length);
      pushNode(
        space,
        completePosts,
        actions,
        createNodeId,
        createContentDigest
      );
    }
  } catch (error: any) {
    throw new Error("Error global: " + error.message);
  }
};
