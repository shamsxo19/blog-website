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

    async createPost({ title, slug, content, featuredImage, status, userId, authorName, visibility = "public" }) {
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
                    visibility,
                }
            )
        } catch (error) {
            console.log("Appwrite serive :: createPost :: error", error);
        }
    }

    async updatePost(slug, { title, content, featuredImage, status, visibility }) {
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
                    visibility,
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

    async getPublicPosts(limit = 25) {
        try {
            return await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                [
                    Query.equal("status", "active"),
                    Query.equal("visibility", "public"),
                    Query.orderDesc("$createdAt"),
                    Query.limit(limit),
                ]
            );
        } catch (error) {
            console.log("Appwrite service :: getPublicPosts :: error", error);
            return { total: 0, documents: [] };
        }
    }

    async searchPostsByTitle(searchTerm) {
        try {
            const term = searchTerm?.trim();
            if (!term) return { total: 0, documents: [] };

            return await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                [
                    Query.equal("status", "active"),
                    Query.equal("visibility", "public"),
                    Query.search("title", term),
                    Query.limit(25),
                ]
            );
        } catch (error) {
            console.log("Appwrite service :: searchPostsByTitle :: error", error);
            return { total: 0, documents: [] };
        }
    }

    async getFollowingFeedPosts(currentUserId) {
        try {
            if (!currentUserId) return { total: 0, documents: [] };

            // 1. Get list of users this person follows
            const follows = await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteFollowsCollectionId,
                [
                    Query.equal("followerId", currentUserId),
                    Query.limit(100)
                ]
            );

            if (follows.total === 0) return { total: 0, documents: [] };

            const followingIds = follows.documents.map(doc => doc.followingId);

            // 2. Fetch active posts from those users
            return await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                [
                    Query.equal("userId", followingIds),
                    Query.equal("status", "active"),
                    Query.orderDesc("$createdAt"),
                    Query.limit(50)
                ]
            );
        } catch (error) {
            console.log("Appwrite service :: getFollowingFeedPosts :: error", error);
            return { total: 0, documents: [] };
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

    async updateProfile(profileId, { aboutMe, profilePic }) {
        try {
            return await this.databases.updateDocument(
                conf.appwriteDatabaseId,
                conf.appwriteProfilesCollectionId,
                profileId,
                {
                    aboutMe,
                    profilePic
                }
            );
        } catch (error) {
            console.log("Appwrite service :: updateProfile :: error", error);
            return false;
        }
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
                    Query.startsWith("name", term),
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

    async getPostsByUser(userId, status = "active", viewerIsFollower = false) {
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

            // If the viewer is not a follower (and it's not their own profile),
            // only show public posts
            if (!viewerIsFollower && status === "active") {
                queries.push(Query.equal("visibility", "public"));
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

    async getFollowerCount(followingId) {
        try {
            if (!followingId) return 0;
            const follows = await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteFollowsCollectionId,
                [
                    Query.equal("followingId", followingId),
                    Query.limit(1) // we only need the total count
                ]
            );
            return follows.total;
        } catch (error) {
            console.log("Appwrite service :: getFollowerCount :: error", error);
            return 0;
        }
    }

    async getFollowingCount(followerId) {
        try {
            if (!followerId) return 0;
            const follows = await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteFollowsCollectionId,
                [
                    Query.equal("followerId", followerId),
                    Query.limit(1)
                ]
            );
            return follows.total;
        } catch (error) {
            console.log("Appwrite service :: getFollowingCount :: error", error);
            return 0;
        }
    }

    async getFollowersList(userId) {
        try {
            // 1. Get all follow documents where followingId matches the target user
            const follows = await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteFollowsCollectionId,
                [
                    Query.equal("followingId", userId),
                    Query.limit(100)
                ]
            );

            if (follows.total === 0) return [];

            const followerIds = follows.documents.map(doc => doc.followerId);

            // 2. Fetch profiles for all those followers
            const profilesResp = await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteProfilesCollectionId,
                [
                    Query.equal("userId", followerIds),
                    Query.limit(100)
                ]
            );

            return profilesResp.documents;
        } catch (error) {
            console.log("Appwrite service :: getFollowersList :: error", error);
            return [];
        }
    }

    async getFollowingList(userId) {
        try {
            // 1. Get all follow documents where followerId matches the target user
            const follows = await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteFollowsCollectionId,
                [
                    Query.equal("followerId", userId),
                    Query.limit(100)
                ]
            );

            if (follows.total === 0) return [];

            const followingIds = follows.documents.map(doc => doc.followingId);

            // 2. Fetch profiles for all those following targets
            const profilesResp = await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteProfilesCollectionId,
                [
                    Query.equal("userId", followingIds),
                    Query.limit(100)
                ]
            );

            return profilesResp.documents;
        } catch (error) {
            console.log("Appwrite service :: getFollowingList :: error", error);
            return [];
        }
    }

    // comments service

    async addComment({ postId, userId, userName, content }) {
        try {
            return await this.databases.createDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCommentsCollectionId,
                ID.unique(),
                {
                    postId,
                    userId,
                    userName,
                    content
                }
            );
        } catch (error) {
            console.log("Appwrite service :: addComment :: error", error);
            return false;
        }
    }

    async getComments(postId) {
        try {
            if (!postId) return [];
            const result = await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteCommentsCollectionId,
                [
                    Query.equal("postId", postId),
                    Query.orderDesc("$createdAt"),
                    Query.limit(50)
                ]
            );
            return result.documents;
        } catch (error) {
            console.log("Appwrite service :: getComments :: error", error);
            return [];
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
