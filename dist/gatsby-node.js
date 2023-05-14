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
Object.defineProperty(exports, "__esModule", { value: true });
const methods_1 = require("./methods");
exports.sourceNodes = ({ actions, createNodeId, createContentDigest }, { substrateNodeUrl, ipfsNodeUrl, spaceIds, seedPhrase }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const api = yield (0, methods_1.createSubsocialApi)({
            substrateNodeUrl,
            ipfsNodeUrl,
            seedPhrase,
        });
        for (const spaceId of spaceIds) {
            const { space, completePosts } = yield (0, methods_1.getAllDataOfSpace)(api, spaceId);
            if (!space)
                throw new Error("Space not found");
            (0, methods_1.pushNode)(api, space, completePosts, actions, createNodeId, createContentDigest);
        }
    }
    catch (error) {
        throw new Error("Error global: " + error.message);
    }
});
