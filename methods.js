"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.subNode = exports.subNodes = exports.pushNode = exports.getAllDataOfSpace = exports.createSubsocialApi = void 0;
const showdown_1 = __importDefault(require("showdown"));
const api_1 = require("@subsocial/api");
const createSubsocialApi = ({ substrateNodeUrl, ipfsNodeUrl, seedPhrase, }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const api_local = yield api_1.SubsocialApi.create({
            substrateNodeUrl,
            ipfsNodeUrl,
        });
        if (!seedPhrase)
            throw new Error("PhraseSecret not found");
        const authHeader = (0, api_1.generateCrustAuthToken)(seedPhrase);
        api_local.ipfs.setWriteHeaders({
            authorization: "Basic " + authHeader,
        });
        return api_local;
    }
    catch (error) {
        throw new Error("Error while building Subsocial API: " + error.message);
    }
});
exports.createSubsocialApi = createSubsocialApi;
const getAllDataOfSpace = (api, spaceId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const space = yield api.findSpace({ id: spaceId });
        if (!space)
            throw new Error("Space not found");
        const postIds = yield api.blockchain.postIdsBySpaceId(spaceId);
        let posts = yield api.findPosts({ ids: postIds });
        let completePosts = [];
        for (const i in posts) {
            const replyIds = yield api.blockchain.getReplyIdsByPostId(posts[i].id);
            const replies = yield api.findPublicPosts(replyIds);
            completePosts.push(Object.assign(Object.assign({}, posts[i]), { replies }));
        }
        return { space, completePosts };
    }
    catch (error) {
        throw new Error("Error while fetching data from Subsocial API: " + error.message);
    }
});
exports.getAllDataOfSpace = getAllDataOfSpace;
const pushNode = (api, space, posts, actions, createNodeId, createContentDigest) => __awaiter(void 0, void 0, void 0, function* () {
    const { createNode } = actions;
    const post_with_comments_as_child_node = yield posts.map((post) => __awaiter(void 0, void 0, void 0, function* () {
        const children = yield (0, exports.subNodes)(api, createContentDigest, createNodeId, post.id, post.replies);
        const post_w = yield (0, exports.subNode)(api, createContentDigest, createNodeId, `subsocial-space-${space.id}`, { struct: post.struct, content: post.content, id: post.id }, children);
        return post_w;
    }));
    post_with_comments_as_child_node.forEach((post) => {
        console.log("post 1", post);
    });
    const node = {
        id: createNodeId(`subsocial-space-${space.id}`),
        parent: null,
        children: [],
        struct: space.struct,
        content: space.content,
        internal: {
            type: "SpacesSubsocial",
            contentDigest: createContentDigest(space),
        },
    };
    createNode(node);
});
exports.pushNode = pushNode;
const subNodes = (api, createContentDigest, createNodeId, parentId, elements, children = []) => __awaiter(void 0, void 0, void 0, function* () {
    return yield elements
        .filter((element) => !element.struct.hidden)
        .map((element) => __awaiter(void 0, void 0, void 0, function* () {
        return yield (0, exports.subNode)(api, createContentDigest, createNodeId, parentId, element, children);
    }));
});
exports.subNodes = subNodes;
const subNode = (api, createContentDigest, createNodeId, parentId, element, children = []) => __awaiter(void 0, void 0, void 0, function* () {
    const { createdAtTime, isUpdated, upvotesCount, downvotesCount, isRegularPost, isSharedPost, } = element.struct;
    const { body, summary, image } = element.content;
    const profile = yield getProfile(api, element.struct.ownerId);
    const type = element.struct.isComment ? "Comment" : "BlogPost";
    const node = {
        parent: parentId,
        id: createNodeId(element.id),
        children,
        author: profile.content,
        content: Object.assign(Object.assign({}, element.content), { body: markdownToHtml(body), summary: markdownToHtml(summary), mainImage: getImageFromId(image) }),
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
});
exports.subNode = subNode;
const getProfile = (api, accountId) => __awaiter(void 0, void 0, void 0, function* () {
    const profile = yield api.findProfileSpace(accountId);
    if (!profile)
        return {};
    return profile;
});
const markdownToHtml = (markdown) => {
    const converter = new showdown_1.default.Converter();
    return converter.makeHtml(markdown);
};
const getImageFromId = (imageId) => `https://ipfs.subsocial.network/ipfs/${imageId}`;
