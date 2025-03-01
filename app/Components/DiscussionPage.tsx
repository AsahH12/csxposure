'use client'
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { db } from '../../firebaseconfig';
import { doc, getDoc, collection, query, getDocs, orderBy, serverTimestamp } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Sidebar from './sidebar';
import Footer from './footer';
import { addDoc } from 'firebase/firestore';

const DiscussionPost = () => {
    const searchParams = useSearchParams();
    const id = searchParams.get('id'); // Get the ID from URL query

    const [postData, setPostData] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState("");
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const auth = getAuth();

    useEffect(() => {
        if (!id) {
            console.error("No ID found in URL");
            setLoading(false);
            return;
        }

        const fetchPostData = async () => {
            try {
                const docRef = doc(db, "discussionPosts", id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setPostData(docSnap.data());
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
                                name = `${profileData.firstName || ""} ${profileData.lastName || ""}`.trim() || "Anonymous";
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
                userName = `${profileData.firstName || ""} ${profileData.lastName || ""}`.trim() || "Anonymous";
            }

            const commentsRef = collection(db, "discussionPosts", id, "comments");
            await addDoc(commentsRef, {
                name: userName,
                text: newComment,
                userId,
                createdAt: serverTimestamp(),
            });

            setComments((prevComments) => [...prevComments, { name: userName, text: newComment, userId }]);
            setNewComment("");
        } catch (error) {
            console.error("Error adding comment:", error);
        }
    };

    return (
        <div style={{ display: 'flex' }}>
            <Sidebar onNameSearchChange={() => {}} onSchoolChange={() => {}} onGraduatedChange={() => {}} />
            <div style={{ flexGrow: 1, padding: '20px' }}>
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <>
                        {postData ? (
                            <>
                                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                                    <h1>{postData.title || 'Discussion Title'}</h1>
                                    <p>{postData.description || 'Description of the discussion post.'}</p>
                                    <p><strong>Created by:</strong> {postData.createdBy || 'Anonymous'}</p>
                                    <p><strong>Posted on:</strong> {postData.createdAt?.toDate().toLocaleString() || 'N/A'}</p>
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
                                                    onClick={() => window.location.href = `/StudentProfilePage?userId=${comment.userId}`}
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
                        ) : (
                            <p>Discussion post not found.</p>
                        )}
                    </>
                )}
                <Footer />
            </div>
        </div>
    );
};

export default DiscussionPost;
