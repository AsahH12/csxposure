'use client'
import React, { useEffect, useState } from 'react';
import { db } from '../../../firebaseconfig';
import { doc, getDoc, collection, query, getDocs, orderBy, serverTimestamp } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Sidebar from '../../Components/sidebar';
import Footer from '../../Components/footer';
import { addDoc } from 'firebase/firestore';


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

const DiscussionPost: React.FC<{ params: Promise<DiscussionParams> }> = ({ params }) => {
    const [postData, setPostData] = useState<DiscussionPostProps | null>(null);
    const [comments, setComments] = useState<{ name: string; text: string; userId: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState("");
    const [userName, setUserName] = useState("");
    const [id, setId] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false); // Track user authentication state

    const auth = getAuth();

    useEffect(() => {
        const fetchParams = async () => {
            const resolvedParams = await params;
            setId(resolvedParams.id); // Set the id state after unwrapping the promise
        };

        fetchParams();
    }, [params]);

    useEffect(() => {
        if (!id) return;

        const fetchPostData = async () => {
            try {
                const docRef = doc(db, "discussionPosts", id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setPostData(docSnap.data() as DiscussionPostProps);
                } else {
                    console.error("Post not found!");
                }
            } catch (error) {
                console.error("Error fetching post data:", error);
            } finally {
                setLoading(false);
            }
        };

        const fetchComments = async () => {
            try {
                const commentsRef = collection(db, "discussionPosts", id!, "comments");
                const q = query(commentsRef, orderBy("createdAt", "asc")); // Ensure comments are ordered by creation time
                const querySnapshot = await getDocs(q);

                const commentsList = querySnapshot.docs.map((doc) => doc.data() as { name: string; text: string; userId: string });
                setComments(commentsList); // Update the comments state with fetched comments
            } catch (error) {
                console.error("Error fetching comments:", error);
            }
        };

        fetchPostData();
        fetchComments();
    }, [id]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userRef = doc(db, "users", user.uid);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    const userData = userSnap.data();
                    const firstName = userData?.details?.profileData?.firstName;
                    const lastName = userData?.details?.profileData?.lastName;
                    setUserName(`${firstName} ${lastName}`);
                } else {
                    setUserName(user.displayName || "Anonymous");
                }

                setIsAuthenticated(true); // User is authenticated
            } else {
                setUserName(""); // Reset userName if no user is logged in
                setIsAuthenticated(false); // User is not authenticated
            }
        });

        return () => unsubscribe();
    }, [auth]);

    const handleAddComment = async () => {
        if (!newComment.trim()) {
            alert("Comment cannot be empty.");
            return;
        }

        if (!isAuthenticated) {
            alert("You must be logged in to comment.");
            return;
        }

        try {
            const commentsRef = collection(db, "discussionPosts", id!, "comments");
            await addDoc(commentsRef, {
                name: userName,
                text: newComment,
                userId: auth.currentUser?.uid,
                createdAt: serverTimestamp()
            });

            // Update UI immediately by adding the comment locally
            setComments((prevComments) => [
                ...prevComments,
                { name: userName, text: newComment, userId: auth.currentUser?.uid! }
            ]);
            setNewComment(""); // Clear input
        } catch (error) {
            console.error("Error adding comment:", error);
        }
    };

    return (
        <div style={{ display: 'flex' }}>
            <Sidebar />
            <div style={{ flexGrow: 1, padding: '20px' }}>
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <>
                        {/* Title & Description Centered at the Top */}
                        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                            <h1>{postData?.title || 'Discussion Title'}</h1>
                            <p>{postData?.description || 'Description of the discussion post.'}</p>
                            <p><strong>Created by:</strong> {postData?.createdBy}</p>
                            <p><strong>Posted on:</strong> {postData?.createdAt?.toDate().toLocaleString()}</p>
                        </div>

                        {/* Add Comment Section */}
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

                        {/* Display Comments */}
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
                                                marginBottom: '5px'
                                            }}
                                            onClick={() => alert(`Clicked on ${comment.name}'s profile`)} // Replace with desired functionality
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

