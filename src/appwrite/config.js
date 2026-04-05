import conf from '../conf/conf.js';
import { Client, ID, Databases, Storage, Query } from "appwrite";

export class Service {
    client = new Client();
    databases;
    bucket;

    constructor() {
        this.client
            .setEndpoint(conf.appwriteUrl)
            .setProject(conf.appwriteProjectId);
        this.databases = new Databases(this.client);
        this.bucket = new Storage(this.client);
    }

    async createPost({ title, slug, content, featuredImage, status, userId, authorName }) {
        try {
            return await this.databases.createDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                slug,
                {
                    title,
                    content,
                    featuredImage,
                    status,
                    userId,
                    authorName,
                }
            )
        } catch (error) {
            console.log("Appwrite serive :: createPost :: error", error);
        }
    }

    async updatePost(slug, { title, content, featuredImage, status }) {
        try {
            return await this.databases.updateDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                slug,
                {
                    title,
                    content,
                    featuredImage,
                    status,

                }
            )
        } catch (error) {
            console.log("Appwrite serive :: updatePost :: error", error);
        }
    }

    async deletePost(slug) {
        try {
            await this.databases.deleteDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                slug

            )
            return true
        } catch (error) {
            console.log("Appwrite serive :: deletePost :: error", error);
            return false
        }
    }

    async getPost(slug) {
        try {
            return await this.databases.getDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                slug

            )
        } catch (error) {
            console.log("Appwrite serive :: getPost :: error", error);
            return false
        }
    }

    async getPosts(queries = [Query.equal("status", "active")]) {
        try {
            return await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                queries,


            )
        } catch (error) {
            console.log("Appwrite serive :: getPosts :: error", error);
            return false
        }
    }

    // profiles

    async createProfile(userId, name) {
        try {
            return await this.databases.createDocument(
                conf.appwriteDatabaseId,
                conf.appwriteProfilesCollectionId,
                ID.unique(),
                {
                    userId,
                    name
                }
            );
        } catch (error) {
            console.log("Appwrite service :: createProfile :: error", error);
            return false;
        }
    }

    async getUserProfile(userId) {
        try {
            if (!userId) return null;
            const profiles = await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteProfilesCollectionId,
                [
                    Query.equal("userId", userId)
                ]
            );
            return profiles.documents.length > 0 ? profiles.documents[0] : null;
        } catch (error) {
            console.log("Appwrite service :: getUserProfile :: error", error);
            return null;
        }
    }

    async getProfileByUserId(userId) {
        return this.getUserProfile(userId);
    }

    async searchProfiles(searchTerm) {
        try {
            const term = searchTerm?.trim();

            if (!term) {
                return {
                    total: 0,
                    documents: [],
                };
            }

            return await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteProfilesCollectionId,
                [
                    Query.search("name", term),
                    Query.limit(10),
                ]
            );
        } catch (error) {
            console.log("Appwrite service :: searchProfiles :: error", error);
            return {
                total: 0,
                documents: [],
            };
        }
    }

    async getPostsByUser(userId, status = "active") {
        try {
            if (!userId) {
                return {
                    total: 0,
                    documents: [],
                };
            }

            const queries = [Query.equal("userId", userId)];

            if (status) {
                queries.push(Query.equal("status", status));
            }

            queries.push(Query.orderDesc("$createdAt"));

            return await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                queries
            );
        } catch (error) {
            console.log("Appwrite service :: getPostsByUser :: error", error);
            return {
                total: 0,
                documents: [],
            };
        }
    }

    // likes and follows

    async toggleLike(slug, userId, currentLikes = []) {
        try {
            const hasLiked = currentLikes.includes(userId);
            const newLikes = hasLiked
                ? currentLikes.filter(id => id !== userId)
                : [...currentLikes, userId];

            return await this.databases.updateDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                slug,
                {
                    likes: newLikes
                }
            );
        } catch (error) {
            console.log("Appwrite service :: toggleLike :: error", error);
            return false;
        }
    }

    async toggleFollow(followerId, followingId) {
        try {
            // First check if already following
            const existingFollows = await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteFollowsCollectionId,
                [
                    Query.equal("followerId", followerId),
                    Query.equal("followingId", followingId)
                ]
            );

            if (existingFollows.documents.length > 0) {
                // Unfollow
                await this.databases.deleteDocument(
                    conf.appwriteDatabaseId,
                    conf.appwriteFollowsCollectionId,
                    existingFollows.documents[0].$id
                );
                return { status: "unfollowed" };
            } else {
                // Follow
                await this.databases.createDocument(
                    conf.appwriteDatabaseId,
                    conf.appwriteFollowsCollectionId,
                    ID.unique(),
                    {
                        followerId,
                        followingId
                    }
                );
                return { status: "followed" };
            }
        } catch (error) {
            console.log("Appwrite service :: toggleFollow :: error", error);
            return false;
        }
    }

    async getFollowStatus(followerId, followingId) {
        try {
            if (!followerId || !followingId) return false;
            const existingFollows = await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteFollowsCollectionId,
                [
                    Query.equal("followerId", followerId),
                    Query.equal("followingId", followingId)
                ]
            );
            return existingFollows.documents.length > 0;
        } catch (error) {
            console.log("Appwrite service :: getFollowStatus :: error", error);
            return false;
        }
    }

    // file upload service

    async uploadFile(file) {
        try {
            return await this.bucket.createFile(
                conf.appwriteBucketId,
                ID.unique(),
                file
            )
        } catch (error) {
            console.log("Appwrite serive :: uploadFile :: error", error);
            return false
        }
    }

    async deleteFile(fileId) {
        try {
            await this.bucket.deleteFile(
                conf.appwriteBucketId,
                fileId
            )
            return true
        } catch (error) {
            console.log("Appwrite serive :: deleteFile :: error", error);
            return false
        }
    }

    getFilePreview(fileId) {
        // Changed to getFileView instead of getFilePreview because current Appwrite Free-Tier 
        // plans block the /preview endpoint (throws HTTP 403 Image transformations blocked error).
        const filePreview = this.bucket.getFileView(
            conf.appwriteBucketId,
            fileId
        );
        // Extracts the primitive string URL safely whether the SDK returns a URL object or a raw string
        return filePreview.href ? filePreview.href : String(filePreview);
    }
}


const service = new Service()
export default service
