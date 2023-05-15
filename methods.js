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
    var _a;
    try {
        //getting sapace with profile
        const nativeSpace = yield api.findSpace({ id: spaceId });
        if (!nativeSpace)
            throw new Error("Space not found");
        const spaceProfile = yield getProfile(api, nativeSpace.struct.ownerId);
        const space = Object.assign(Object.assign({}, nativeSpace), { author: (_a = spaceProfile.content) !== null && _a !== void 0 ? _a : {} });
        const postIds = yield api.blockchain.postIdsBySpaceId(spaceId);
        let posts = yield api.findPosts({ ids: postIds });
        const completePosts = yield completePostsGetter(posts, api);
        return { space, completePosts };
    }
    catch (error) {
        throw new Error("Error while fetching data from Subsocial API: " + error.message);
    }
});
exports.getAllDataOfSpace = getAllDataOfSpace;
const completePostsGetter = (posts, api) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    let completePosts = [];
    for (const i in posts) {
        const replyIds = yield api.blockchain.getReplyIdsByPostId(posts[i].id);
        const nativeReplies = yield api.findPublicPosts(replyIds);
        const replies = yield Promise.all(nativeReplies
            .filter((reply) => !reply.struct.hidden)
            .map((reply) => __awaiter(void 0, void 0, void 0, function* () {
            var _c;
            return Object.assign(Object.assign({}, reply), { author: (_c = (yield getProfile(api, reply.struct.ownerId)).content) !== null && _c !== void 0 ? _c : {} });
        })));
        const author = (_b = (yield getProfile(api, posts[i].struct.ownerId)).content) !== null && _b !== void 0 ? _b : {};
        completePosts.push(Object.assign(Object.assign({}, posts[i]), { replies, author }));
    }
    return completePosts;
});
const pushNode = (space, posts, actions, createNodeId, createContentDigest) => __awaiter(void 0, void 0, void 0, function* () {
    const { createNode } = actions;
    const post_with_comments_as_child_node = posts.map((post) => {
        const children = (0, exports.subNodes)(createContentDigest, createNodeId, post.id, post.replies);
        const post_w = (0, exports.subNode)(createContentDigest, createNodeId, `subsocial-space-${space.id}`, post, children);
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
});
exports.pushNode = pushNode;
const subNodes = (createContentDigest, createNodeId, parentId, elements, children = []) => {
    return elements
        .filter((element) => !element.struct.hidden)
        .map((element) => {
        return (0, exports.subNode)(createContentDigest, createNodeId, parentId, element, children);
    });
};
exports.subNodes = subNodes;
const subNode = (createContentDigest, createNodeId, parentId, element, children = []) => {
    var _a;
    const { createdAtTime, isUpdated, upvotesCount, downvotesCount, isRegularPost, isSharedPost, } = element.struct;
    const content = (_a = element.content) !== null && _a !== void 0 ? _a : { body: "", summary: "", image: "" };
    const { body, summary, image } = content;
    const type = element.struct.isComment ? "Comment" : "BlogPost";
    const node = {
        parent: parentId,
        id: createNodeId(element.id),
        children,
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
        author: element.author,
    };
    return node;
};
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
