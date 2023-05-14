import { PostData } from "@subsocial/api/types";
export type ConfigTypes = {
  substrateNodeUrl: string;
  ipfsNodeUrl: string;
  spaceIds: string;
  seedPhrase: string;
};

export type CompletePost = PostData & {
  replies: PostData[];
};
