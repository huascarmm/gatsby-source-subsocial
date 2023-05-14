import { createSubsocialApi, getAllDataOfSpace, pushNode } from "./methods";
import { ConfigTypes } from "./types";
import { SourceNodesArgs } from "gatsby";

exports.sourceNodes = (
  { actions, createNodeId, createContentDigest }: SourceNodesArgs,
  { substrateNodeUrl, ipfsNodeUrl, spaceIds, seedPhrase }: ConfigTypes
) => {
  try {
    const api = createSubsocialApi({
      substrateNodeUrl,
      ipfsNodeUrl,
      seedPhrase,
    }).then((api) => {
      for (const spaceId of spaceIds) {
        getAllDataOfSpace(api, spaceId).then(({ space, completePosts }) => {
          if (!space) throw new Error("Space not found");
          pushNode(
            api,
            space,
            completePosts,
            actions,
            createNodeId,
            createContentDigest
          );
        });
      }
    });
  } catch (error: any) {
    throw new Error("Error global: " + error.message);
  }
};
