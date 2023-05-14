import showdown from "showdown";
import { SubsocialApi, generateCrustAuthToken } from "@subsocial/api";
import { AnySpaceId, SpaceData } from "@subsocial/api/types";
import { CompletePost } from "./types";

export const createSubsocialApi = async ({
  substrateNodeUrl,
  ipfsNodeUrl,
  seedPhrase,
}: {
  substrateNodeUrl: string;
  ipfsNodeUrl: string;
  seedPhrase: string;
}): Promise<SubsocialApi> => {
  try {
    const api_local = await SubsocialApi.create({
      substrateNodeUrl,
      ipfsNodeUrl,
    });
    if (!seedPhrase) throw new Error("PhraseSecret not found");

    const authHeader = generateCrustAuthToken(seedPhrase);

    api_local.ipfs.setWriteHeaders({
      authorization: "Basic " + authHeader,
    });
    return api_local;
  } catch (error: any) {
    throw new Error("Error while building Subsocial API: " + error.message);
  }
};

export const getAllDataOfSpace = async (
  api: SubsocialApi,
  spaceId: AnySpaceId
) => {
  try {
    const space = await api.findSpace({ id: spaceId });
    if (!space) throw new Error("Space not found");
    const postIds = await api.blockchain.postIdsBySpaceId(spaceId);
    let posts = await api.findPosts({ ids: postIds });
    let completePosts: CompletePost[] = [];
    for (const i in posts) {
      const replyIds = await api.blockchain.getReplyIdsByPostId(posts[i].id);
      const replies = await api.findPublicPosts(replyIds);
      completePosts.push({ ...posts[i], replies });
    }
    return { space, completePosts };
  } catch (error: any) {
    throw new Error(
      "Error while fetching data from Subsocial API: " + error.message
    );
  }
};

export const pushNode = async (
  api: SubsocialApi,
  space: SpaceData,
  posts: CompletePost[],
  actions: { createNode: any },
  createNodeId: (arg0: string) => any,
  createContentDigest: (arg0: SpaceData) => any
) => {
  const { createNode } = actions;
  const post_with_comments_as_child_node = await posts.map(async (post) => {
    const children = await subNodes(
      api,
      createContentDigest,
      createNodeId,
      post.id,
      post.replies
    );
    const post_w = await subNode(
      api,
      createContentDigest,
      createNodeId,
      `subsocial-space-${space.id}`,
      { struct: post.struct, content: post.content, id: post.id },
      children
    );
    return post_w;
  });
  post_with_comments_as_child_node.forEach((post) => {
    console.log("post 1", post);
  });
  const node = {
    id: createNodeId(`subsocial-space-${space.id}`),
    parent: null,
    children: [], //post_with_comments_as_child_node,
    struct: space.struct,
    content: space.content,
    internal: {
      type: "SpacesSubsocial",
      contentDigest: createContentDigest(space),
    },
  };
  createNode(node);
};

export const subNodes = async (
  api: SubsocialApi,
  createContentDigest: any,
  createNodeId: any,
  parentId: String,
  elements: any[],
  children = []
) => {
  return await elements
    .filter((element) => !element.struct.hidden)
    .map(async (element: any) => {
      return await subNode(
        api,
        createContentDigest,
        createNodeId,
        parentId,
        element,
        children
      );
    });
};

export const subNode = async (
  api: SubsocialApi,
  createContentDigest: (arg0: any) => any,
  createNodeId: (arg0: any) => any,
  parentId: String,
  element: { struct: any; content: any; id: any },
  children: any[] = []
) => {
  const {
    createdAtTime,
    isUpdated,
    upvotesCount,
    downvotesCount,
    isRegularPost,
    isSharedPost,
  } = element.struct;

  const { body, summary, image } = element.content;

  const profile = await getProfile(api, element.struct.ownerId);
  const type = element.struct.isComment ? "Comment" : "BlogPost";
  const node = {
    parent: parentId,
    id: createNodeId(element.id),
    children,
    author: profile.content,
    content: {
      ...element.content,
      body: markdownToHtml(body),
      summary: markdownToHtml(summary),
      mainImage: getImageFromId(image),
    },
    struct: {
      createdAtTime,
      isUpdated,
      upvotesCount,
      downvotesCount,
      isRegularPost,
      isSharedPost,
    },
    internal: {
      type,
      contentDigest: createContentDigest(element.content),
    },
  };
  console.log("node", node);
  return node;
};

const getProfile = async (
  api: SubsocialApi,
  accountId: string
): Promise<SpaceData> => {
  const profile = await api.findProfileSpace(accountId);
  if (!profile) return {} as SpaceData;
  return profile;
};

const markdownToHtml = (markdown: string) => {
  const converter = new showdown.Converter();
  return converter.makeHtml(markdown);
};

const getImageFromId = (imageId: string) =>
  `https://ipfs.subsocial.network/ipfs/${imageId}`;
