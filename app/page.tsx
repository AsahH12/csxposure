'use client';
import {useRouter} from 'next/navigation'
const Page1: React.FC = () => {
  const router = useRouter();
  const navigateToPageSignUPTemp = () => {
    router.push('/SignUp');
  };

  return (
    <div className='p-4 text-center'>
      <h1 className='text-2xl font-bold'>Page 1
        <button 
        onClick={navigateToPageSignUPTemp}
        className='mt-4 bg blue-500 text-white py-2 px-4 rounded-lg'>
          Go To Page 2
        </button>
      </h1>
    </div>
  );
};
export default Page1;
