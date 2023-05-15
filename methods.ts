import showdown from "showdown";
import { SubsocialApi, generateCrustAuthToken } from "@subsocial/api";
import { AnySpaceId, PostData, SpaceData } from "@subsocial/api/types";
import { CompletePost, Space } from "./types";

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
    //getting sapace with profile
    const nativeSpace = await api.findSpace({ id: spaceId });
    if (!nativeSpace) throw new Error("Space not found");
    const spaceProfile = await getProfile(api, nativeSpace.struct.ownerId);
    const space: Space = {
      ...nativeSpace,
      author: spaceProfile.content ?? {},
    };

    const postIds = await api.blockchain.postIdsBySpaceId(spaceId);
    let posts = await api.findPosts({ ids: postIds });
    const completePosts = await completePostsGetter(posts, api);

    return { space, completePosts };
  } catch (error: any) {
    throw new Error(
      "Error while fetching data from Subsocial API: " + error.message
    );
  }
};

const completePostsGetter = async (
  posts: PostData[],
  api: SubsocialApi
): Promise<CompletePost[]> => {
  let completePosts: CompletePost[] = [];
  for (const i in posts) {
    const replyIds = await api.blockchain.getReplyIdsByPostId(posts[i].id);
    const nativeReplies = await api.findPublicPosts(replyIds);
    const replies = await Promise.all(
      nativeReplies
        .filter((reply) => !reply.struct.hidden)
        .map(async (reply) => {
          return {
            ...reply,
            author: (await getProfile(api, reply.struct.ownerId)).content ?? {},
          };
        })
    );

    const author =
      (await getProfile(api, posts[i].struct.ownerId)).content ?? {};

    completePosts.push({ ...posts[i], replies, author });
  }

  return completePosts;
};

export const pushNode = async (
  space: Space,
  posts: CompletePost[],
  actions: { createNode: any },
  createNodeId: (arg0: string) => any,
  createContentDigest: (arg0: SpaceData) => any
) => {
  const { createNode } = actions;
  const post_with_comments_as_child_node = posts.map((post) => {
    const children = subNodes(
      createContentDigest,
      createNodeId,
      post.id,
      post.replies
    );

    const post_w = subNode(
      createContentDigest,
      createNodeId,
      `subsocial-space-${space.id}`,
      post,
      children
    );

    return post_w;
  });

  const node = {
    id: createNodeId(`subsocial-space-${space.id}`),
    parent: null,
    children: post_with_comments_as_child_node,
    struct: space.struct,
    content: space.content,
    author: space.author,
    internal: {
      type: "SpacesSubsocial",
      contentDigest: createContentDigest(space),
    },
  };
  createNode(node);
};

export const subNodes = (
  createContentDigest: any,
  createNodeId: any,
  parentId: String,
  elements: any[],
  children = []
) => {
  return elements
    .filter((element) => !element.struct.hidden)
    .map((element: any) => {
      return subNode(
        createContentDigest,
        createNodeId,
        parentId,
        element,
        children
      );
    });
};

export const subNode = (
  createContentDigest: (arg0: any) => any,
  createNodeId: (arg0: any) => any,
  parentId: String,
  element: CompletePost,
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

  const content = element.content ?? { body: "", summary: "", image: "" };
  const { body, summary, image } = content;

  const type = element.struct.isComment ? "Comment" : "BlogPost";
  const node = {
    parent: parentId,
    id: createNodeId(element.id),
    children,
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
    author: element.author,
  };
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
