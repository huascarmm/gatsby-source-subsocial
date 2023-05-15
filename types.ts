import {
  PostContent,
  PostData,
  PostStruct,
  SpaceContent,
  SpaceData,
} from "@subsocial/api/types";
export type ConfigTypes = {
  substrateNodeUrl: string;
  ipfsNodeUrl: string;
  spaceIds: string;
  seedPhrase: string;
};

export type CompletePost = PostData & {
  replies: {
    author: SpaceContent | {};
    id: string;
    struct: PostStruct;
    content?: PostContent | undefined;
  }[];
  author: SpaceContent | {};
};

export type Space = SpaceData & { author: SpaceContent | {} };
