const { ApolloServer, gql } = require('apollo-server');
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const typeDefs = gql`
  type User {
    id: Int
    email: String
    firstName: String
    lastName: String
  }

  type Post {
    id: Int
    author: User!
    comments: [Post]!
    content: String!
    # createdAt: Date
    # updatedAt: Date
  }

  input CreateOnePostInput {
    authorId: Int!
    content: String!
  }

  input UpdateOnePostInput {
    postId: Int!
    content: String
  }

  type Query {
    getOnePost(id: Int!): Post
    getAllPost: [Post]!
  }

  type Mutation {
    createOnePost(input: CreateOnePostInput!): Post
    updateOnePost(input: UpdateOnePostInput): Post
    deleteOnePost(id: Int!): Boolean
  }`

const resolvers = {
  Query : {
    getOnePost: (_, { id }) => prisma.post.findUnique({
      where: { id },
      include: { author: true }
    }),
    getAllPost: () => prisma.post.findMany({
      include: { author: true }
    }),
  },
  Mutation: {
    createOnePost: (_, { input: { authorId, content } }) => prisma.post.create({
        data: {
          content,
          author: {
            connect: { id: authorId }
          }
        },
        include: { author: true }
      }),
    updateOnePost: (_, { input: { postId, content } }) => prisma.post.update({
        where: { id: postId },
        data: { content },
        include: { author: true }
      }),
    deleteOnePost: async (_, { id }) => {
      await prisma.post.delete({
        where: { id }
      })

      return true
    },
  }
}

const server = new ApolloServer({ typeDefs, resolvers })

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
})