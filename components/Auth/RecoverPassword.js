import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/utils/supabase-client';

const RecoverPassword = ({ token, setRecoveryToken }) => {
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });
  const router = useRouter();

  const handleNewPassword = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage({});

    const { error } = await supabase.auth.api.updateUser(token, {password: newPassword});
    if (error) {
      setMessage({ type: 'error', content: error.message });
    } else {
      setMessage({
        type: 'note',
        content: 'Password Updated! Redirecting...'
      });
      
      router.replace('/player');
    }    
    setLoading(false);
  };

  return (
    <div className="flex justify-center height-screen-helper">
      <div className="flex flex-col justify-between max-w-lg p-3 m-auto w-80 ">
        <div className="flex justify-center pb-12 ">
          <img src="MWF-icon.svg" width="64px" height="64px" />
        </div>

        <form
          onSubmit={handleNewPassword}
          className="animate-fade-in-up flex flex-col space-y-4"
        >
          {message.content && (
            <div
              className={`${
                message.type === 'error' ? 'text-pink' : 'text-green'
              } border ${
                message.type === 'error' ? 'border-pink' : 'border-green'
              } p-3`}
            >
              {message.content}
            </div>
          )}
          <Input
            type="password"
            placeholder="New Password"
            onChange={setNewPassword}
          />
          <div className="pt-2 w-full flex flex-col">
            <Button
              variant="prominent"
              type="submit"
              loading={loading}
              disabled={loading || !newPassword.length}
            >
              Update Password
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecoverPassword;
