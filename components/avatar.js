import { useEffect, useState } from 'react'
import { supabase } from '../utils/supabase-client'
import LoadingDots from '@/components/ui/LoadingDots';

export default function Avatar({ url, size, onUpload }) {
  const [avatarUrl, setAvatarUrl] = useState(null)
  const [avatarStatus, setAvatarStatus] = useState(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (url) downloadImage(url)
    if (!url) setAvatarStatus('Missing')
  }, [url])

  async function downloadImage(path) {
    try {
      const { data, error } = await supabase.storage.from('avatars').download(path)
      if (error) {
        throw error
      }
      const url = URL.createObjectURL(data)
      setAvatarUrl(url)
    } catch (error) {
      console.log('Error downloading image: ', error.message)
    } finally {
      setAvatarStatus('Exists')
    }
  }


  async function uploadAvatar(event) {
    try {
      setUploading(true)

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.')
      }

      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      let { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      onUpload(filePath)
    } catch (error) {
      alert(error.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
         {avatarStatus == 'Exists' ? 
        (<img
        className="avatar image m-auto"
        src={avatarUrl}
        alt="Avatar"
        />)
        : avatarStatus == 'Missing' ? 
        (<img
        className="avatar image m-auto"
        src='img/default_avatar.png'
        alt="Avatar"
        />)
        : 
        (<div className="flex avatar image m-auto justify-center">
        <LoadingDots /> 
        </div>)
      }
      {/* {avatarUrl ? (
        <img
          className="avatar image m-auto"
          src={avatarUrl}
          alt="Avatar"
          style={{ height: size, width: size }}
        />
      ) : (
        <img className="avatar image m-auto" src='img/default_avatar.png' style={{ height: size, width: size }}/>
      )} */}
      <div className="" style={{ width: size }}>
        <label className="font-bold button primary block cursor-pointer py-2 rounded bg-emerald-500 mt-6 w-1/2 md:w-full lg:w-1/2 mx-auto" htmlFor="single">
          {uploading ? 'Uploading ...' : 'Personalize ✨'}
        </label>
        <input
          style={{
            visibility: 'hidden',
            position: 'absolute',
          }}
          type="file"
          id="single"
          accept="image/*"
          onChange={uploadAvatar}
          disabled={uploading}
        />
      </div>
    </div>
  )
}