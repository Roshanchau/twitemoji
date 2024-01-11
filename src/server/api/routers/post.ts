import { clerkClient } from "@clerk/nextjs";
import type { User } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";

const filterUserForClient=(user:User)=>{
  return{
    id: user.id,
    username: user.username,
    profileImageUrl: user.profileImageUrl,
  };
}

import { Ratelimit } from "@upstash/ratelimit"; // for deno: see above
import { Redis } from "@upstash/redis"; // see below for cloudflare and fastly adapters

// Create a new ratelimiter, that allows 3 requests per 1 min.
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 m"),
  analytics: true,
  prefix: "@upstash/ratelimit",
});

export const postRouter = createTRPCRouter({

  getAll: publicProcedure.query(async({ ctx }) => {
    const posts= await ctx.db.post.findMany({
      take: 100,
      orderBy:[{createdAt: "desc"}]
    });
    // console.log(posts);

    const users=(await clerkClient.users.getUserList({
      userId: posts.map((post)=> post.authorId),
      limit: 100,
    })
    ).map(filterUserForClient);
    // console.log(users);

    return posts.map((post)=>{
      const author=users.find((user)=>user.id===post.authorId);

      if(!author)
        throw new TRPCError({
          code:"INTERNAL_SERVER_ERROR",
          message:"Author for post not found"
        })

      return{
        post,
        author
      }
    });
  }),

  create: privateProcedure
  // validating input using zod.
    .input(
      z.object({
        content:z.string().emoji("please insert emoji's only!!").min(1).max(280),
      })
    )
    .mutation(async({ctx, input})=>{
      const authorId=ctx.currentUser;

      const {success}=await ratelimit.limit(authorId);

      if(!success) throw new TRPCError({code:"TOO_MANY_REQUESTS"})

      const post=await ctx.db.post.create({
        data:{
          authorId,
          content:input.content,
        }
      })
      return post;
    })
});
