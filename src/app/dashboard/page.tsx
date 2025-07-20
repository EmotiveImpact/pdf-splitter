import { redirect } from 'next/navigation';

export default async function Dashboard() {
  // Temporarily disable auth for demo
  // const session = await auth();

  // if (!session?.user) {
  //   return redirect('/');
  // } else {
  redirect('/dashboard/overview');
  // }
}
