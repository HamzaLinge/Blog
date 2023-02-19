import { gql } from "@apollo/client";

export const CREATE_POST = gql`
  mutation createPost($postInput: PostInput!) {
    createPost(postInput: $postInput) {
      _id
    }
  }
`;

export const GET_POSTS = gql`
  query getPosts {
    getPosts {
      _id
      title
      story
      user {
        _id
        firstName
        lastName
        photo {
          filename
          contentType
          data
        }
      }
      picture {
        filename
        contentType
        data
      }
    }
  }
`;

export const DELETE_POST = gql`
  mutation deletePost($idPost: ID!) {
    deletePost(idPost: $idPost) {
      _id
    }
  }
`;
