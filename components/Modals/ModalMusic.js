import Draggable from "react-draggable"
import { useState, useEffect } from 'react';
import Input from "../ui/Input";
import Button from "../ui/Button";

export default function ModalMusic({ visibility, setVisibility, mobileDevice }) {
  const [size, setSize] = useState('small');
  const [musicType, setMusicType] = useState(false);
  const [spotify_link, setSpotify_Link] = useState('playlist/3Wb4dvCtALxofNy5SFYvfS');
  const [spotify_temp_link, setSpotify_Temp_Link] = useState(null);

  async function checkSpotifyLink(tempLink){
    if(tempLink){
      if(tempLink.includes('open.spotify.com/')){
        const url = tempLink;
        const url2 = url.split('com/')[1];
        setSpotify_Link(url2);
      }
    } else {
      setSpotify_Link('playlist/3Wb4dvCtALxofNy5SFYvfS')
    }
  }

  return (
    <div className={`w-screen ${visibility ? '' : 'hidden'}`}>
      <div className="fixed z-50 w-full h-0 px-5">
        <Draggable
          handle=".handle"
          defaultPosition={{ x: 0, y: 25 }}
          scale={1}>
          <div className={`${mobileDevice ? 'opacity-100' : 'opacity-20'} hover:opacity-100 inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl sm:my-8 sm:align-middle ${size == 'large' ? 'w-1/2' : size == 'medium' ? 'w-1/3' : 'w-full md:w-1/4'}`}>
            <div className="handle bg-gradient-to-r from-emerald-500 to-blue-500 h-5 cursor-move" />
            <div className="bg-gray-50 px-4 py-3 flex justify-between items-center flex-row">
              <div>
                <button type="button" onClick={() => setMusicType(!musicType)} className={`inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 ${musicType ? 'bg-indigo-500 text-white fas fa-bars' : 'fab fa-deezer bg-white text-gray-700 hover:bg-gray-50'} font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 w-auto sm:text-sm`} />
              </div>
              <div className="flex flex-row items-center">
                <div className={`${mobileDevice ? 'hidden' : ''}`}>

                  <button type="button" onClick={() => setSize('small')} className="fas fa-mobile-alt mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm" />
                  <button type="button" onClick={() => setSize('medium')} className="fas fa-tablet-alt mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm" />
                  <button type="button" onClick={() => setSize('large')} className="fas fa-laptop mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm" />

                </div>
                <button onClick={() => setVisibility(false)} type="button" className="fas fa-minus inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ml-3 w-auto text-sm" />
              </div>
            </div>
            <iframe className="w-full" src={`https://open.spotify.com/embed/${spotify_link}?theme=0`} width="100%" height={musicType ? 380 : 80} frameBorder="0" allowFullScreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>
            <div className="grid grid-cols-4 gap-2 bg-black py-2 px-2"><div className="col-span-3">
              <Input className="font-semibold rounded h-full"
              placeholder="Enter A Spotify URL" 
              onChange={setSpotify_Temp_Link}
              value={spotify_temp_link || ''}/></div>
              <Button
                className="w-full h-full"
                variant="incognito"
                type="submit"
                onClick={()=>checkSpotifyLink(spotify_temp_link)}
              >
                Go
              </Button></div>
          </div>
        </Draggable>
      </div></div>

  );
}
