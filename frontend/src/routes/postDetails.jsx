import React, { useContext, useEffect, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { useNavigate, useParams } from "react-router-dom";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";

import {
  DELETED_POST_SUB,
  GET_POST_BY_ID,
  GET_POSTS,
  TOGGLE_LIKE_POST,
  TOGGLED_LIKE_POST_SUB,
  UPDATED_POST_SUB,
} from "../gql/post.jsx";
import ErrorGraphQL from "../components/ErrorGraphQL";
import Avatar from "../components/Avatar.jsx";
import TextEditor from "../components/TextEditor/TextEditor.jsx";
import SkeletonPostDetails from "../components/Skeleton/SkeletonPostDetails.jsx";
import Comments from "../components/Comments/Comments.jsx";
import { UserContext } from "../context/userContext.jsx";
import OptionsPostDetails from "../components/Post/OptionsPostDetails.jsx";
import OvalLoader from "../components/OvalLoader.jsx";
import apolloClient from "../config/apollo-client.jsx";

function PostDetails() {
  const { postId } = useParams();

  const userContext = useContext(UserContext);

  const navigate = useNavigate();

  const [optimisticLike, setOptimisticLike] = useState(false);

  const [loadingDeletingPost, setLoadingDeletingPost] = useState(false);

  const {
    subscribeToMore,
    data: dataPost,
    loading: loadingPost,
    error: errorPost,
  } = useQuery(GET_POST_BY_ID, { variables: { idPost: postId } });

  const [toggleLikePost, { loading: loadingToggleLikePost }] =
    useMutation(TOGGLE_LIKE_POST);

  async function handleToggleLikePost() {
    setOptimisticLike((prev) => !prev);
    try {
      await toggleLikePost({
        variables: { idPost: postId, idUser: userContext?.user._id },
      });
    } catch (errorToggleLikePost) {
      console.log(errorToggleLikePost);
    }
  }

  function subscribeToToggledLikePost() {
    subscribeToMore({
      document: TOGGLED_LIKE_POST_SUB,
      variables: { idPost: postId },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        const { _id: idUserToggledLike } =
          subscriptionData.data.toggledLikePost;
        const copyLikes = Array.isArray(prev.getPostById.likes)
          ? [...prev.getPostById.likes]
          : [];
        if (copyLikes.find(({ _id }) => _id === idUserToggledLike)) {
          setOptimisticLike(false);
          copyLikes.splice(
            copyLikes.findIndex(({ _id }) => _id === idUserToggledLike),
            1
          );
        } else {
          setOptimisticLike(true);
          copyLikes.push({ __typename: "User", _id: idUserToggledLike });
        }
        return Object.assign({}, prev, {
          getPostById: {
            ...prev.getPostById,
            likes: copyLikes,
          },
        });
      },
    });
  }

  function subscribeToDeletedPost() {
    subscribeToMore({
      document: DELETED_POST_SUB,
      variables: { idPost: postId },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        const idDeletedPost = subscriptionData.data.deletedPost._id;
        apolloClient.cache.updateQuery({ query: GET_POSTS }, (dataCache) => {
          if (!dataCache?.getPosts) return { getPosts: [] };
          const filteredPosts = dataCache.getPosts.filter(
            (post) => post._id !== idDeletedPost
          );
          return { getPosts: filteredPosts };
        });
        Object.assign({}, prev, {
          getPostById: undefined,
        });
      },
    });
  }

  function subscribeToUpdatedPost() {
    subscribeToMore({
      document: UPDATED_POST_SUB,
      variables: { idPost: postId },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        const postUpdated = subscriptionData.data.updatedPost;
        return Object.assign({}, prev, {
          getPostById: postUpdated,
        });
      },
    });
  }

  useEffect(() => {
    subscribeToDeletedPost();
    subscribeToToggledLikePost();
    subscribeToUpdatedPost();
  }, []);

  useEffect(() => {
    if (
      dataPost?.getPostById.likes.findIndex(
        (like) => like?._id === userContext?.user._id
      ) === -1
    ) {
      setOptimisticLike(false);
    } else {
      setOptimisticLike(true);
    }
  }, [dataPost]);

  if (loadingPost)
    return (
      <div className={"my-2 min-h-screen w-full max-w-2xl"}>
        <SkeletonPostDetails />
      </div>
    );

  if (errorPost) return <ErrorGraphQL errorGraphQL={errorPost} />;

  const post = dataPost.getPostById;

  return (
    <div
      className={
        "relative my-2 flex min-h-screen w-full max-w-2xl flex-col gap-y-2"
      }
      data-testid={`post-details-test`}
    >
      <h1>This is the post details page</h1>
      <div className={"flex w-full items-center justify-between px-2"}>
        <div className={"flex items-center gap-x-2"}>
          <Avatar {...post.user.photo} />
          <p className={"font-semibold"}>
            {post.user.firstName.charAt(0).toUpperCase() +
              post.user.firstName.substring(1)}{" "}
            {post.user.lastName.toUpperCase()}
          </p>
        </div>
        {userContext ? (
          <div className={"flex items-center gap-x-2"}>
            <div
              className={`rounded-lg p-1 hover:cursor-pointer hover:bg-gray-100 ${
                loadingToggleLikePost
                  ? "pointer-events-none"
                  : "pointer-events-auto"
              }`}
              data-testid={"button-toggleLikePost"}
              onClick={handleToggleLikePost}
            >
              {!optimisticLike ? (
                <AiOutlineHeart className={"h-6 w-6 text-red-800"} />
              ) : (
                <AiFillHeart className={"h-6 w-6 text-red-800"} />
              )}
            </div>
            {userContext.user._id === post.user._id ? (
              loadingDeletingPost ? (
                <OvalLoader />
              ) : (
                <OptionsPostDetails
                  idPost={postId}
                  setLoadingDeletingPost={setLoadingDeletingPost}
                />
              )
            ) : undefined}
          </div>
        ) : undefined}
      </div>
      <div className={"relative w-full overflow-hidden"}>
        <img
          src={`data:${post.picture.contentType};base64,${post.picture.data}`}
          alt={post.picture.filename}
          className={"rounded"}
        />
      </div>
      <p className={"text-center text-2xl font-semibold"}>{post.title}</p>
      <div className={"mx-2 shadow"}>
        <TextEditor readOnly={true} initValue={post.story} />
      </div>
      <div className={"mx-2 flex items-center gap-x-2 self-end text-sm italic"}>
        <p>{post.likes.length} Likes</p>
        <p>{post.comments.length} Comments</p>
      </div>
      <div className={"mt-2 mb-4 flex items-center gap-x-4 self-center"}>
        <span className={"h-1 w-1 rounded-full bg-gray-600"}></span>
        <span className={"h-1 w-1 rounded-full bg-gray-600"}></span>
        <span className={"h-1 w-1 rounded-full bg-gray-600"}></span>
      </div>
      <Comments idPost={post._id} />
    </div>
  );
}

export default PostDetails;
