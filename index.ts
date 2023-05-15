import { SpaceData } from "@subsocial/api/types";
import { createSubsocialApi, getAllDataOfSpace, pushNode } from "./methods";

async function main(
  substrateNodeUrl: string,
  ipfsNodeUrl: string,
  spaceIds: string[],
  seedPhrase: string
) {
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

  const createNodeId = (id: string) => id;
  const createContentDigest = (id: SpaceData) => id;
  const actions = {
    createNode: (node: any) => null,
  };

  for (const { space, completePosts } of spaceData) {
    console.log("Size", completePosts.length);

    pushNode(space, completePosts, actions, createNodeId, createContentDigest);
  }
}

main(
  "wss://para.f3joule.space",
  "https://ipfs.subsocial.network",
  ["10497"],
  "power team beyond begin parade vendor leopard accident key gym lecture hammer"
);
