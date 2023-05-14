import { createSubsocialApi, getAllDataOfSpace, pushNode } from "./methods";
import { ConfigTypes } from "./types";
import { SourceNodesArgs } from "gatsby";

exports.sourceNodes = async (
  { actions, createNodeId, createContentDigest }: SourceNodesArgs,
  { substrateNodeUrl, ipfsNodeUrl, spaceIds, seedPhrase }: ConfigTypes
) => {
  const api = await createSubsocialApi({
    substrateNodeUrl,
    ipfsNodeUrl,
    seedPhrase,
  });

  for (const spaceId of spaceIds) {
    const { space, completePosts } = await getAllDataOfSpace(api, spaceId);
    if (!space) throw new Error("Space not found");
    pushNode(
      api,
      space,
      completePosts,
      actions,
      createNodeId,
      createContentDigest
    );
  }
};
