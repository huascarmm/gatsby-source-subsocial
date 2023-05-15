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
function main(substrateNodeUrl, ipfsNodeUrl, spaceIds, seedPhrase) {
    return __awaiter(this, void 0, void 0, function* () {
        const api = yield (0, methods_1.createSubsocialApi)({
            substrateNodeUrl,
            ipfsNodeUrl,
            seedPhrase,
        });
        let spaceDataPromises = [];
        for (const spaceId of spaceIds) {
            spaceDataPromises.push((0, methods_1.getAllDataOfSpace)(api, spaceId));
        }
        const spaceData = yield Promise.all(spaceDataPromises);
        const createNodeId = (id) => id;
        const createContentDigest = (id) => id;
        const actions = {
            createNode: (node) => null,
        };
        for (const { space, completePosts } of spaceData) {
            console.log("Size", completePosts.length);
            (0, methods_1.pushNode)(space, completePosts, actions, createNodeId, createContentDigest);
        }
    });
}
main("wss://para.f3joule.space", "https://ipfs.subsocial.network", ["10497"], "power team beyond begin parade vendor leopard accident key gym lecture hammer");
