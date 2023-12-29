import Head from "next/head";
import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { api } from "~/utils/api";

const CreatePostWizard=()=>{
  const {user}=useUser();
  console.log(user);
  if(!user) return null;

  return(
    <div className="flex w-full gap-3">
      <img src={user.profileImageUrl} alt="profile image"
      className="h-14 w-14 rounded-full"
      />
      <input placeholder="Type some emoji's!!"
      className="bg-transparent grow outline-none"/>
    </div>
  )
}

export default function Home() {
  const user = useUser();
  const { data , isLoading } = api.post.getAll.useQuery();

  if(isLoading){
    return(<div>....loading</div>)
  }

  if(!data){
    return(<div>something went wrong..</div>)
  }

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen justify-center">
        <div className="h-full w-full border-x border-slate-400 md:max-w-2xl">
          <div className="flex border-b border-slate-400 p-4">
            {!user.isSignedIn && (
              <div className="flex justify-center">
                <SignInButton />
              </div>
            )}
            {!!user.isSignedIn && <CreatePostWizard />}
          </div>
          <div className="flex flex-col">
            {[...data, ...data].map(({post ,author}) => <div
             className="border-b border-slate-400 p-8"
            key={post.id}>{post.content}</div>)}
          </div>
        </div>
      </main>
    </>
  );
}
