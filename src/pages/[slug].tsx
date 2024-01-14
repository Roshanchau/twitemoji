import { type NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";

const ProfilePage: NextPage = () => {
  const {data, isLoading}=api.profile.getUserByusername.useQuery({
    username:"roshanchau",
  })
  if(isLoading) return <div>loading....</div>;

  if(!data) return <div>404</div>;
  console.log(data)

  return (
    <>
      <Head>
        <title>Profile</title>
      </Head>
      <main className="flex h-screen justify-center">
        <div>{data.username}</div>
      </main>
    </>
  );
};

export default ProfilePage;
