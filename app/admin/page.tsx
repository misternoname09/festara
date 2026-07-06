import { redirect } from 'next/navigation';
import { fetchAdminData } from './actions';
import AdminClient from './AdminClient';

export default async function AdminPage() {
  let data;
  try {
    data = await fetchAdminData();
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      redirect('/'); // Redirect non-admins to home page
    }
    // Handle other errors if necessary, but throwing might be fine for error boundary
    throw error;
  }

  return (
    <AdminClient 
      initialUsers={data.users} 
      initialTransactions={data.transactions} 
      stats={data.stats} 
    />
  );
}
