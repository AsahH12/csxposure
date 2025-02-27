'use client';
import React, { useEffect, useState } from 'react';
import { db } from '../../../firebaseconfig';
import { doc, getDoc, collection, query, getDocs, orderBy, serverTimestamp } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Sidebar from '../../Components/sidebar';
import Footer from '../../Components/footer';
import { addDoc } from 'firebase/firestore';
import './Discussion.module.css';

interface DiscussionPostProps {
    title?: string;
    description?: string;
    createdBy?: string;
    createdAt?: any;
    comments?: { name: string; text: string; userId: string }[];
}

interface DiscussionParams {
    id: string;
}

const handleProfileClick = async (userId: string | null) => {
    if (!userId) {
        alert("User profile not found.");
        return;
    }

    try {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const userData = userSnap.data();
            const userType = userData.userType;

            console.log("User Id Clicked on:", userId, "User Type:", userType);

            if (userType === "student") {
                window.location.href = `/StudentProfilePage?userId=${userId}`;
            } if(userType === "business") {
                window.location.href = `/BusinessProfilePage?userId=${userId}`;
            }
        } else {
            alert("User profile not found.");
        }
    } catch (error) {
        console.error("Error fetching user profile:", error);
        alert("Error loading profile. Please try again.");
    }
};

const DiscussionPost: React.FC<{ params: Promise<DiscussionParams> }> = ({ params }) => {
    const [postData, setPostData] = useState<DiscussionPostProps | null>(null);
    const [comments, setComments] = useState<{ name: string; text: string; userId: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState("");
    const [id, setId] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const auth = getAuth();

    useEffect(() => {
        const fetchParams = async () => {
            const resolvedParams = await params;
            setId(resolvedParams.id);
        };
        fetchParams();
    }, [params]);

    useEffect(() => {
        if (!id) return;

        const fetchPostData = async () => {
            try {
                const docRef = doc(db, "discussionPosts", id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) setPostData(docSnap.data() as DiscussionPostProps);
                else console.error("Post not found!");
            } catch (error) {
                console.error("Error fetching post data:", error);
            } finally {
                setLoading(false);
            }
        };

        const fetchComments = async () => {
            try {
                const commentsRef = collection(db, "discussionPosts", id, "comments");
                const q = query(commentsRef, orderBy("createdAt", "asc"));
                const querySnapshot = await getDocs(q);

                const commentsList = await Promise.all(
                    querySnapshot.docs.map(async (commentDoc) => {
                        const data = commentDoc.data();
                        let name = "Anonymous";

                        if (data.userId) {
                            const profileRef = doc(db, "users", data.userId, "details", "profileData");
                            const profileSnap = await getDoc(profileRef);

                            if (profileSnap.exists()) {
                                const profileData = profileSnap.data();
                                const firstName = profileData?.firstName ?? "";
                                const lastName = profileData?.lastName ?? "";
                                name = `${firstName} ${lastName}`.trim() || "Anonymous";
                            }
                        }

                        return { name, text: data.text, userId: data.userId };
                    })
                );

                setComments(commentsList);
            } catch (error) {
                console.error("Error fetching comments:", error);
            }
        };

        fetchPostData();
        fetchComments();
    }, [id]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setIsAuthenticated(!!user);
        });

        return () => unsubscribe();
    }, [auth]);

    const handleAddComment = async () => {
        if (!newComment.trim()) return alert("Comment cannot be empty.");
        if (!isAuthenticated) return alert("You must be logged in to comment.");

        try {
            const userId = auth.currentUser?.uid;
            if (!userId) throw new Error("User ID not found.");

            const profileRef = doc(db, "users", userId, "details", "profileData");
            const profileSnap = await getDoc(profileRef);
            let userName = "Anonymous";

            if (profileSnap.exists()) {
                const profileData = profileSnap.data();
                const firstName = profileData?.firstName ?? "";
                const lastName = profileData?.lastName ?? "";
                userName = `${firstName} ${lastName}`.trim() || "Anonymous";
            }

            const commentsRef = collection(db, "discussionPosts", id!, "comments");
            await addDoc(commentsRef, {
                name: userName,
                text: newComment,
                userId,
                createdAt: serverTimestamp(),
            });

            setComments((prevComments) => [
                ...prevComments,
                { name: userName, text: newComment, userId },
            ]);
            setNewComment("");
        } catch (error) {
            console.error("Error adding comment:", error);
        }
    };

    return (
        <div style={{ display: 'flex' }}>
            <Sidebar onNameSearchChange={() => {}} onSchoolChange={() => {} } onGraduatedChange={() => {} }/>
            <div style={{ flexGrow: 1, padding: '20px' }}>
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <>
                        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                            <h1>{postData?.title || 'Discussion Title'}</h1>
                            <p>{postData?.description || 'Description of the discussion post.'}</p>
                            <p><strong>Created by:</strong> {postData?.createdBy || 'Anonymous'}</p>
                            <p><strong>Posted on:</strong> {postData?.createdAt?.toDate().toLocaleString() || 'N/A'}</p>
                        </div>

                        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                            <textarea
                                placeholder="Add a comment..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                style={{ width: '100%', height: '80px', marginBottom: '10px', padding: '8px' }}
                            />
                            <button onClick={handleAddComment} style={{ width: '100%', padding: '10px' }}>
                                Add Comment
                            </button>
                        </div>

                        <div style={{ marginTop: '20px', maxWidth: '600px', margin: '0 auto' }}>
                            <h3>Comments</h3>
                            {comments.length > 0 ? (
                                comments.map((comment, index) => (
                                    <div key={index} style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>
                                        <button
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: 'blue',
                                                fontSize: '16px',
                                                cursor: 'pointer',
                                                padding: '0',
                                                textAlign: 'left',
                                                marginBottom: '5px',
                                            }}
                                            onClick={() => handleProfileClick(comment.userId)}
                                            >
                                            <strong>{comment.name}</strong>
                                        </button>
                                        <p>{comment.text}</p>
                                    </div>
                                ))
                            ) : (
                                <p>No comments yet.</p>
                            )}
                        </div>
                    </>
                )}
                <Footer />
            </div>
        </div>
    );
};

export default DiscussionPost;
